"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Status = Database["public"]["Enums"]["job_application_status"];

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

export async function updateApplicationAction(formData: FormData): Promise<never> {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as Status;
  const adminNotes = text(formData, "admin_notes");
  let destination: string;

  try {
    if (!id || !allowedStatuses.has(status)) throw new Error("Geçersiz başvuru güncellemesi.");
    if (adminNotes.length > 5000) throw new Error("Admin notu en fazla 5000 karakter olabilir.");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_applications")
      .update({ status, admin_notes: adminNotes || null })
      .eq("id", id)
      .eq("privacy_status", "active")
      .select("full_name")
      .single();
    if (error) throw new Error(error.message);

    await logAdminAction({
      actorId: admin.userId,
      action: "application_update",
      entityType: "job_applications",
      entityId: id,
      entityLabel: data.full_name,
      metadata: { status },
    });
    destination = `/admin/applications?edit=${id}&notice=${encodeURIComponent("Başvuru güncellendi.")}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Başvuru güncellenemedi.";
    destination = `/admin/applications?edit=${id}&error=${encodeURIComponent(message)}`;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  redirect(destination);
}

export async function anonymizeApplicationAction(formData: FormData): Promise<never> {
  await requireAdmin();
  const id = text(formData, "id");
  const confirmation = text(formData, "confirmation");
  let destination: string;

  try {
    if (!id) throw new Error("Başvuru bulunamadı.");
    if (confirmation !== "ANONIMLESTIR") {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Başvuru anonimleştirilemedi.";
    destination = `/admin/applications?edit=${id}&error=${encodeURIComponent(message)}`;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  redirect(destination);
}
