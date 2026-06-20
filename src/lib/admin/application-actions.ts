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
