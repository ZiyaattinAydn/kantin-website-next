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

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function message(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 220) : "Medya işlemi tamamlanamadı.";
}

function extension(name: string) {
  return name.split(".").pop()?.toLowerCase() || "bin";
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

    destination = "/admin/media?notice=Görsel başarıyla yüklendi.";
  } catch (error) {
    destination = `/admin/media?error=${encodeURIComponent(message(error))}`;
  }

  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}

export async function archiveAdminMedia(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  let destination: string;

  try {
    if (!id) throw new Error("Medya kaydı bulunamadı.");
    const supabase = await createClient();
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("id, title, kind, bucket_name, object_path, external_url, local_path, status, is_active")
      .eq("id", id)
      .single();
    if (mediaError || !media) throw new Error(mediaError?.message || "Medya kaydı bulunamadı.");
    if (!media.is_active || media.status === "archived") {
      throw new Error("Medya kaydı zaten arşivde.");
    }

    const usages = (await loadMediaUsageMap(supabase, [media])).get(id) ?? [];
    if (usages.length) {
      throw new Error(
        `Bu medya ${usages.length} içerikte kullanılıyor. Önce medya kütüphanesindeki kullanım bağlantılarını kaldır.`,
      );
    }

    const { data, error } = await supabase
      .rpc("set_admin_media_state", {
        p_media_id: id,
        p_action: "media_archive",
      })
      .single();
    if (error || !data) throw new Error(error?.message || "Medya arşivlenemedi.");

    destination = "/admin/media?notice=Medya kaydı arşivlendi.";
  } catch (error) {
    destination = `/admin/media?error=${encodeURIComponent(message(error))}`;
  }

  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
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

    destination = "/admin/media?notice=Medya kaydı yeniden yayına alındı.";
  } catch (error) {
    destination = `/admin/media?error=${encodeURIComponent(message(error))}`;
  }

  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}

export async function deleteTestAdminMedia(formData: FormData): Promise<never> {
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
    if (
      media.source !== "storage" ||
      media.kind !== "image" ||
      !media.title ||
      !/^TEST[_\s-]/i.test(media.title)
    ) {
      throw new Error("Yalnız TEST_ adlı Storage görselleri kalıcı silinebilir.");
    }

    const usages = (await loadMediaUsageMap(supabase, [media])).get(id) ?? [];
    if (usages.length) {
      throw new Error("Bu medya bir içerikte kullanılıyor; önce içerik bağlantısını kaldır.");
    }

    const { data: prepared, error: prepareError } = await supabase
      .rpc("begin_test_admin_media_delete", { p_media_id: id })
      .single();
    if (prepareError || !prepared) {
      throw new Error(prepareError?.message || "TEST medya silme işlemi hazırlanamadı.");
    }

    const { error: removeError } = await supabase.storage
      .from(prepared.bucket_name)
      .remove([prepared.object_path]);

    if (removeError) {
      const { error: cancelError } = await supabase.rpc("cancel_test_admin_media_delete", {
        p_media_id: id,
        p_previous_status: prepared.previous_status,
        p_previous_is_active: prepared.previous_is_active,
        p_reason: "storage_delete_failed",
      });

      if (cancelError) {
        throw new Error(
          "Storage nesnesi silinemedi ve medya silme durumu geri alınamadı; işlemi tekrar dene.",
        );
      }

      throw new Error("Storage nesnesi silinemedi; medya kaydı önceki durumuna döndürüldü.");
    }

    const { data: completed, error: completeError } = await supabase.rpc(
      "complete_test_admin_media_delete",
      { p_media_id: id },
    );
    if (completeError || completed !== true) {
      throw new Error(
        "Storage nesnesi silindi ancak medya DB kaydı tamamlanamadı; kayıt arşivde bırakıldı.",
      );
    }

    destination = "/admin/media?notice=TEST görseli kalıcı olarak silindi.";
  } catch (error) {
    destination = `/admin/media?error=${encodeURIComponent(message(error))}`;
  }

  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}
