"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { loadMediaUsageMap } from "@/lib/admin/media-usage";
import { createClient } from "@/lib/supabase/server";
import {
  PUBLIC_IMAGE_BUCKETS,
  validateStorageFile,
  type StorageBucket,
} from "@/lib/supabase/storage";
import type { Database } from "@/lib/supabase/database.types";

type ContentStatus = Database["public"]["Enums"]["content_status"];

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function message(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 220) : "Medya işlemi tamamlanamadı.";
}

function mediaPath(params?: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/admin/media${search.size ? `?${search.toString()}` : ""}`;
}

function extension(name: string) {
  return name.split(".").pop()?.toLowerCase() || "bin";
}

function isMissingStorageObjectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    status?: number;
    statusCode?: number | string;
    message?: string;
    error?: string;
  };
  const status = Number(candidate.statusCode ?? candidate.status);
  const details = `${candidate.message ?? ""} ${candidate.error ?? ""}`.toLowerCase();

  return status === 404 || details.includes("not found") || details.includes("not_found");
}

function parseStatus(value: string): ContentStatus {
  if (value === "draft" || value === "published" || value === "archived") return value;
  throw new Error("Geçersiz medya yayın durumu.");
}

function parseSortOrder(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("Medya sırası sıfır veya daha büyük bir tam sayı olmalı.");
  }
  return parsed;
}

function revalidateMediaSurfaces() {
  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  revalidatePath("/careers");
}

export async function uploadAdminMedia(formData: FormData): Promise<never> {
  await requireAdmin();
  let destination: string;

  try {
    const fileValue = formData.get("file");
    if (!(fileValue instanceof File)) throw new Error("Yüklenecek görsel seçilmedi.");

    const bucket = text(formData, "bucket") as StorageBucket;
    if (!PUBLIC_IMAGE_BUCKETS.includes(bucket as (typeof PUBLIC_IMAGE_BUCKETS)[number])) {
      throw new Error("Geçersiz medya bucket seçimi.");
    }

    const validation = validateStorageFile(fileValue, bucket);
    if (!validation.ok) throw new Error(validation.message);

    const title = text(formData, "title");
    const altText = text(formData, "alt_text");
    if (!title || !altText) throw new Error("Medya adı ve alt metin zorunlu.");

    const year = new Date().getUTCFullYear();
    const objectPath = `admin/${year}/${crypto.randomUUID()}.${extension(fileValue.name)}`;
    const supabase = await createClient();
    const storageBucket = supabase.storage.from(bucket);
    const { error: uploadError } = await storageBucket.upload(objectPath, fileValue, {
      cacheControl: "3600",
      contentType: fileValue.type,
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: mediaId, error: recordError } = await supabase.rpc(
      "create_admin_media_record",
      {
        p_bucket_name: bucket,
        p_object_path: objectPath,
        p_title: title,
        p_alt_text: altText,
        p_mime_type: fileValue.type,
        p_size_bytes: fileValue.size,
      },
    );

    if (recordError || !mediaId) {
      const { error: cleanupError } = await storageBucket.remove([objectPath]);
      if (cleanupError) {
        throw new Error(
          "Medya DB kaydı oluşturulamadı ve yüklenen Storage nesnesi temizlenemedi.",
        );
      }
      throw new Error(recordError?.message || "Medya DB kaydı oluşturulamadı.");
    }

    destination = mediaPath({ notice: "Görsel başarıyla yüklendi." });
  } catch (error) {
    destination = mediaPath({ error: message(error) });
  }

  revalidateMediaSurfaces();
  redirect(destination);
}

export async function updateAdminMedia(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  let destination: string;

  try {
    if (!id) throw new Error("Medya kaydı bulunamadı.");

    const title = text(formData, "title");
    const altText = text(formData, "alt_text");
    if (!title || !altText) throw new Error("Medya adı ve alt metin zorunlu.");
    if (title.length > 180) throw new Error("Medya adı en fazla 180 karakter olabilir.");
    if (altText.length > 500) throw new Error("Alt metin en fazla 500 karakter olabilir.");

    const status = parseStatus(text(formData, "status"));
    const isActive = status === "published" && formData.get("is_active") === "on";
    const sortOrder = parseSortOrder(text(formData, "sort_order"));
    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("update_admin_media_metadata", {
        p_media_id: id,
        p_title: title,
        p_alt_text: altText,
        p_status: status,
        p_is_active: isActive,
        p_sort_order: sortOrder,
      })
      .single();

    if (error || !data) throw new Error(error?.message || "Medya ayarları güncellenemedi.");
    destination = mediaPath({ edit: id, notice: "Medya ayarları güncellendi." });
  } catch (error) {
    destination = mediaPath({ edit: id, error: message(error) });
  }

  revalidateMediaSurfaces();
  redirect(destination);
}

export async function archiveAdminMedia(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  let destination: string;

  try {
    if (!id) throw new Error("Medya kaydı bulunamadı.");
    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("set_admin_media_state", {
        p_media_id: id,
        p_action: "media_archive",
      })
      .single();
    if (error || !data) throw new Error(error?.message || "Medya arşivlenemedi.");

    destination = mediaPath({ notice: "Medya arşivlendi ve public görünümlerden kaldırıldı." });
  } catch (error) {
    destination = mediaPath({ error: message(error) });
  }

  revalidateMediaSurfaces();
  redirect(destination);
}

export async function restoreAdminMedia(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  let destination: string;

  try {
    if (!id) throw new Error("Medya kaydı bulunamadı.");
    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("set_admin_media_state", {
        p_media_id: id,
        p_action: "media_restore",
      })
      .single();
    if (error || !data) throw new Error(error?.message || "Medya geri alınamadı.");

    destination = mediaPath({ notice: "Medya yeniden yayına alındı." });
  } catch (error) {
    destination = mediaPath({ error: message(error) });
  }

  revalidateMediaSurfaces();
  redirect(destination);
}

export async function deleteAdminMedia(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  let destination: string;

  try {
    if (!id) throw new Error("Medya kaydı bulunamadı.");
    const supabase = await createClient();
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select(
        "id, source, kind, title, bucket_name, object_path, external_url, local_path, status, is_active",
      )
      .eq("id", id)
      .single();
    if (mediaError || !media) throw new Error(mediaError?.message || "Medya kaydı bulunamadı.");

    if (media.source !== "storage" || media.kind !== "image" || !media.bucket_name || !media.object_path) {
      throw new Error("Kalıcı silme yalnız Storage üzerinde bulunan görseller için kullanılabilir.");
    }
    if (media.status !== "archived" || media.is_active) {
      throw new Error("Kalıcı silmeden önce medya arşivlenmeli.");
    }

    const usages = (await loadMediaUsageMap(supabase, [media])).get(id) ?? [];
    if (usages.length) {
      throw new Error("Bu medya bir içerikte kullanılıyor; kalıcı silmeden önce bağlantıları kaldır.");
    }

    const { data: prepared, error: prepareError } = await supabase
      .rpc("begin_admin_media_delete", { p_media_id: id })
      .single();
    if (prepareError || !prepared) {
      throw new Error(prepareError?.message || "Medya silme işlemi hazırlanamadı.");
    }

    const { error: removeError } = await supabase.storage
      .from(prepared.bucket_name)
      .remove([prepared.object_path]);

    if (removeError && !isMissingStorageObjectError(removeError)) {
      const { error: cancelError } = await supabase.rpc("cancel_admin_media_delete", {
        p_media_id: id,
        p_reason: "storage_delete_failed",
      });

      if (cancelError) {
        throw new Error(
          "Storage nesnesi silinemedi ve bekleyen silme işareti temizlenemedi; kayıt arşivde kaldı.",
        );
      }

      throw new Error("Storage nesnesi silinemedi; medya kaydı arşivde korundu.");
    }

    const { data: completed, error: completeError } = await supabase.rpc(
      "complete_admin_media_delete",
      { p_media_id: id },
    );
    if (completeError || completed !== true) {
      throw new Error(
        "Storage nesnesi silindi ancak DB kaydı tamamlanamadı; arşiv kaydında silme bekliyor işareti bırakıldı.",
      );
    }

    destination = mediaPath({ notice: "Görsel Storage ve veritabanından kalıcı olarak silindi." });
  } catch (error) {
    destination = mediaPath({ error: message(error) });
  }

  revalidateMediaSurfaces();
  redirect(destination);
}
