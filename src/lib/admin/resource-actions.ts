"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "./audit";
import {
  deleteAdminRow,
  insertAdminRow,
  readAdminRow,
  updateAdminRow,
} from "./resource-repository";
import {
  adminActionError,
  parseAdminResourcePayload,
  type AdminMutationPayload,
} from "./resource-validation";
import { getAdminResource, type AdminResource } from "./resources";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function resourcePath(resourceKey: string, params?: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/admin/manage/${resourceKey}${search.size ? `?${search.toString()}` : ""}`;
}

function recordLabel(resource: AdminResource, row: Record<string, unknown>): string {
  const value = row[resource.labelField];
  return typeof value === "string" && value.trim() ? value.trim() : resource.singular;
}

function isTestRecord(resource: AdminResource, row: Record<string, unknown>): boolean {
  const fields = resource.testFields ?? [];
  return fields.some((field) => {
    const value = row[field];
    return typeof value === "string" && (/^TEST[_\s-]/i.test(value) || /^test-/i.test(value));
  });
}

export async function saveAdminResource(formData: FormData): Promise<never> {
  const resourceKey = textValue(formData, "_resource");
  const id = textValue(formData, "_id");
  const resource = getAdminResource(resourceKey);
  if (!resource) redirect("/admin?error=Geçersiz yönetim modülü.");

  const admin = await requireAdmin();
  let destination: string;

  try {
    const payload = parseAdminResourcePayload(resource, formData);
    const supabase = await createClient();

    if (id) {
      const row = await updateAdminRow(supabase, resource.table, id, payload);
      await logAdminAction({
        actorId: admin.userId,
        action: "update",
        entityType: resource.table,
        entityId: id,
        entityLabel: recordLabel(resource, row),
      });
      destination = resourcePath(resource.key, { notice: "Kayıt güncellendi." });
    } else {
      if (!resource.allowCreate) throw new Error("Bu modülde yeni kayıt oluşturma kapalı.");
      const row = await insertAdminRow(supabase, resource.table, payload);
      const newId = typeof row.id === "string" ? row.id : null;
      await logAdminAction({
        actorId: admin.userId,
        action: "create",
        entityType: resource.table,
        entityId: newId,
        entityLabel: recordLabel(resource, row),
      });
      destination = resourcePath(resource.key, { notice: "Yeni kayıt oluşturuldu." });
    }
  } catch (error) {
    const actionError = adminActionError(error);
    destination = resourcePath(resource.key, {
      error: actionError.message,
      ...(actionError.kind === "validation" ? { field: actionError.field } : {}),
      ...(id ? { edit: id } : { new: "1" }),
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/manage/${resource.key}`);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}

export async function archiveAdminResource(formData: FormData): Promise<never> {
  const resourceKey = textValue(formData, "_resource");
  const id = textValue(formData, "_id");
  const resource = getAdminResource(resourceKey);
  if (!resource || !id || !resource.allowArchive) redirect("/admin?error=Geçersiz arşivleme isteği.");

  const admin = await requireAdmin();
  let destination: string;

  try {
    const patch: AdminMutationPayload = {};
    if (resource.activeField) patch[resource.activeField] = false;
    if (resource.statusField) patch[resource.statusField] = "archived";
    if (!Object.keys(patch).length) throw new Error("Bu kayıt pasife alınamıyor.");

    const supabase = await createClient();
    const row = await updateAdminRow(supabase, resource.table, id, patch);
    await logAdminAction({
      actorId: admin.userId,
      action: "archive",
      entityType: resource.table,
      entityId: id,
      entityLabel: recordLabel(resource, row),
    });
    destination = resourcePath(resource.key, { notice: "Kayıt pasife alındı / arşivlendi." });
  } catch (error) {
    destination = resourcePath(resource.key, { error: adminActionError(error).message, edit: id });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/manage/${resource.key}`);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}

export async function deleteTestAdminResource(formData: FormData): Promise<never> {
  const resourceKey = textValue(formData, "_resource");
  const id = textValue(formData, "_id");
  const resource = getAdminResource(resourceKey);
  if (!resource || !id || !resource.allowHardDeleteTest) redirect("/admin?error=Kalıcı silme bu modülde kapalı.");

  const admin = await requireAdmin();
  let destination: string;

  try {
    const supabase = await createClient();
    const row = await readAdminRow(supabase, resource.table, id);
    if (!isTestRecord(resource, row)) {
      throw new Error("Yalnız TEST_ adı veya test- slug öneki taşıyan kayıtlar kalıcı silinebilir.");
    }

    await deleteAdminRow(supabase, resource.table, id);
    await logAdminAction({
      actorId: admin.userId,
      action: "delete_test",
      entityType: resource.table,
      entityId: id,
      entityLabel: recordLabel(resource, row),
    });
    destination = resourcePath(resource.key, { notice: "TEST kaydı kalıcı olarak silindi." });
  } catch (error) {
    destination = resourcePath(resource.key, { error: adminActionError(error).message, edit: id });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/manage/${resource.key}`);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}
