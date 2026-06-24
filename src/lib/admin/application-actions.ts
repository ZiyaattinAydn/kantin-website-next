"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Status = Database["public"]["Enums"]["job_application_status"];
type AdminSupabaseClient = SupabaseClient<Database>;

const ANONYMIZE_CONFIRMATION = "ANONIMLESTIR";
const DRY_RUN_INTENT = "dry_run";

const allowedStatuses = new Set<Status>([
  "new",
  "reviewing",
  "contacted",
  "rejected",
  "hired",
  "archived",
]);

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function previewApplicationAnonymization(
  supabase: AdminSupabaseClient,
  id: string,
): Promise<string> {
  const { data: application, error: applicationError } = await supabase
    .from("job_applications")
    .select("id, status, privacy_status, cv_media_id")
    .eq("id", id)
    .maybeSingle();

  if (applicationError) throw new Error(applicationError.message);
  if (!application) throw new Error("Başvuru bulunamadı.");

  if (application.privacy_status === "anonymized") {
    return "Dry-run: Başvuru zaten anonimleştirilmiş; gerçek işlem yapılmadı.";
  }

  if (application.status !== "archived") {
    throw new Error("Dry-run: Anonimleştirme için başvuru önce Arşiv durumuna alınmalı.");
  }

  if (application.cv_media_id) {
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("id, source, kind, bucket_name, object_path")
      .eq("id", application.cv_media_id)
      .maybeSingle();

    if (mediaError) throw new Error(mediaError.message);
    if (!media) throw new Error("Dry-run: CV medya kaydı bulunamadı.");
    if (
      media.source !== "storage" ||
      media.kind !== "document" ||
      media.bucket_name !== "career-cvs" ||
      !media.object_path
    ) {
      throw new Error("Dry-run: CV Storage bağlantısı güvenli değil; gerçek işlem durdurulmalı.");
    }
  }

  if (application.privacy_status === "anonymization_pending") {
    return "Dry-run başarılı: Bekleyen anonimleştirme devam ettirilebilir; gerçek işlem yapılmadı.";
  }

  return application.cv_media_id
    ? "Dry-run başarılı: Arşivli başvuru ve CV bağlantısı anonimleştirme için uygun; gerçek işlem yapılmadı."
    : "Dry-run başarılı: Arşivli başvuruda CV bağlantısı yok; yalnız DB anonimleştirme adımı çalışacak. Gerçek işlem yapılmadı.";
}

export async function updateApplicationAction(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as Status;
  const adminNotes = text(formData, "admin_notes");
  let destination: string;

  try {
    if (!id || !allowedStatuses.has(status)) throw new Error("Geçersiz başvuru güncellemesi.");
    if (adminNotes.length > 5000) throw new Error("Admin notu en fazla 5000 karakter olabilir.");

    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("update_job_application_admin", {
        p_application_id: id,
        p_status: status,
        p_admin_notes: adminNotes || null,
      })
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Başvuru güvenli biçimde kaydedilemedi.");
    }
    destination = `/admin/applications?edit=${id}&notice=${encodeURIComponent("Başvuru güncellendi.")}#application-${id}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Başvuru güncellenemedi.";
    destination = `/admin/applications?edit=${id}&error=${encodeURIComponent(message)}#application-${id}`;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  redirect(destination);
}

export async function anonymizeApplicationAction(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  const intent = text(formData, "_intent");
  const confirmation = text(formData, "confirmation");
  let destination: string;

  try {
    if (!id) throw new Error("Başvuru bulunamadı.");

    if (intent === DRY_RUN_INTENT) {
      const supabase = await createClient();
      const notice = await previewApplicationAnonymization(supabase, id);
      destination = `/admin/applications?edit=${id}&notice=${encodeURIComponent(notice)}#application-${id}`;
    } else {
      if (confirmation !== ANONYMIZE_CONFIRMATION) {
        throw new Error("Onay alanına ANONIMLESTIR yazılmalı.");
      }

      const supabase = await createClient();
      const { data: beginRow, error: beginError } = await supabase
        .rpc("begin_job_application_anonymization", { p_application_id: id })
        .single();
      if (beginError || !beginRow) {
        throw new Error(beginError?.message || "Anonimleştirme başlatılamadı.");
      }

      const hasStorageReference = Boolean(beginRow.bucket_name || beginRow.object_path);
      if (hasStorageReference) {
        if (beginRow.bucket_name !== "career-cvs" || !beginRow.object_path) {
          await supabase.rpc("cancel_job_application_anonymization", {
            p_application_id: id,
            p_reason: "invalid_cv_storage_reference",
          });
          throw new Error("CV Storage bağlantısı güvenli değil; işlem durduruldu.");
        }

        const { error: removeError } = await supabase.storage
          .from(beginRow.bucket_name)
          .remove([beginRow.object_path]);
        if (removeError) {
          const { error: cancelError } = await supabase.rpc(
            "cancel_job_application_anonymization",
            {
              p_application_id: id,
              p_reason: "cv_storage_delete_failed",
            },
          );
          if (cancelError) {
            throw new Error("CV silinemedi ve anonimleştirme kilidi geri alınamadı; işlemi tekrar dene.");
          }
          throw new Error("CV Storage dosyası silinemedi; başvuru değiştirilmedi.");
        }
      }

      const { data: completed, error: completeError } = await supabase.rpc(
        "complete_job_application_anonymization",
        { p_application_id: id },
      );
      if (completeError || completed !== true) {
        throw new Error(
          "CV silindi ancak anonimleştirme tamamlanamadı. Başvuru beklemede; işlemi tekrar çalıştır.",
        );
      }

      destination = "/admin/applications?notice=" + encodeURIComponent(
        "CV silindi ve başvuru geri döndürülemez biçimde anonimleştirildi.",
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Başvuru anonimleştirilemedi.";
    destination = `/admin/applications?edit=${id}&error=${encodeURIComponent(message)}#application-${id}`;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  redirect(destination);
}
