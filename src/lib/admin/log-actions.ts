"use server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { assertUuid } from "./pricing";
import { recordSystemEvent } from "./system-logs";
import { preserveAdminListPath } from "./result-path";
export async function resolveSystemLog(form: FormData): Promise<never> {
  await requireAdmin();
  let destination = "/admin/logs?notice=Kayıt+güncellendi.";
  try {
    const id = assertUuid(String(form.get("id")), "Kayıt");
    const c: SupabaseClient = await createClient();
    const { error } = await c.rpc("resolve_admin_system_event", {
      p_id: id,
      p_resolved: form.get("resolved") === "true",
    });
    if (error) throw error;
  } catch (error) {
    await recordSystemEvent({
      route: "/admin/logs",
      operation: "resolve",
      error,
    });
    destination = "/admin/logs?error=Kayıt+güncellenemedi.";
  }
  revalidatePath("/admin/logs");
  redirect(preserveAdminListPath(destination, form.get("_return_to")));
}
