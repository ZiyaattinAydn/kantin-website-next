"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getAdminResource } from "./resources";
import { supportsAdminRevisionHistory } from "./revisions";
import { ADMIN_REVISION_RESTORE_CONFIRMATION } from "./revision-constants";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function resourcePath(resourceKey: string, params?: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/admin/manage/${resourceKey}${search.size ? `?${search.toString()}` : ""}`;
}

function restoreErrorMessage(error: unknown): string {
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "";

  if (message.includes("Sürüm geri yükleme onayı doğrulanamadı")) return message;
  if (message.includes("revision_not_found")) return "Seçilen sürüm artık bulunamıyor.";
  if (message.includes("revision_target_mismatch")) return "Seçilen sürüm bu kayda ait değil.";
  if (message.includes("revision_not_restorable")) return "Bu geçmiş kaydı geri yüklenebilir bir sürüm değil.";
  if (message.includes("revision_restore_not_supported")) return "Bu kayıt türünde sürüm geri yükleme desteklenmiyor.";
  if (message.includes("revision_target_not_found")) return "Geri yüklenecek ana kayıt artık bulunamıyor.";
  if (message.includes("revision_already_current")) return "Kayıt zaten seçilen sürümdeki değerlerle aynı.";
  if (message.includes("admin_required") || message.includes("permission denied")) {
    return "Bu işlem için aktif yönetici yetkisi gerekiyor.";
  }

  return "Seçilen sürüm geri yüklenemedi. Kayıt değiştirilmedi.";
}

export async function restoreAdminResourceRevision(formData: FormData): Promise<never> {
  const resourceKey = textValue(formData, "_resource");
  const entityId = textValue(formData, "_id");
  const revisionId = textValue(formData, "_revision_id");
  const resource = getAdminResource(resourceKey);

  if (!resource || !supportsAdminRevisionHistory(resource) || !entityId || !revisionId) {
    redirect("/admin?error=Geçersiz sürüm geri yükleme isteği.");
  }

  await requireAdmin();
  let destination: string;

  try {
    if (textValue(formData, "_confirm") !== ADMIN_REVISION_RESTORE_CONFIRMATION) {
      throw new Error(
        `Sürüm geri yükleme onayı doğrulanamadı. İşlemi panelden yeniden başlatıp “${ADMIN_REVISION_RESTORE_CONFIRMATION}” yazarak onayla.`,
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("restore_admin_record_revision", {
      p_revision_id: revisionId,
      p_expected_entity_type: resource.table,
      p_expected_entity_id: entityId,
    });

    if (error) throw error;

    destination = resourcePath(resource.key, {
      notice: "Önceki sürüm geri yüklendi. İşlem yeni bir sürüm olarak kaydedildi.",
      edit: entityId,
    });
  } catch (error) {
    destination = resourcePath(resource.key, {
      error: restoreErrorMessage(error),
      edit: entityId,
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/manage/${resource.key}`);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}
