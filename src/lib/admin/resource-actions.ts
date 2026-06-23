"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
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

const DATABASE_AUDITED_TABLES = new Set<AdminResource["table"]>([
  "menu_categories",
  "menu_category_branches",
  "menu_items",
  "menu_item_branches",
  "menu_item_variants",
  "events",
  "event_branches",
  "merch_products",
  "merch_product_branches",
  "instagram_posts",
  "branches",
  "site_settings",
  "site_pages",
  "content_blocks",
]);

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function resourcePath(resourceKey: string, params?: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/admin/manage/${resourceKey}${search.size ? `?${search.toString()}` : ""}`;
}

function adminPath(params?: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/admin${search.size ? `?${search.toString()}` : ""}`;
}

function isTestRecord(resource: AdminResource, row: Record<string, unknown>): boolean {
  const fields = resource.testFields ?? [];
  return fields.some((field) => {
    const value = row[field];
    return typeof value === "string" && (/^TEST[_\s-]/i.test(value) || /^test-/i.test(value));
  });
}

function assertDatabaseAudit(resource: AdminResource): void {
  if (!DATABASE_AUDITED_TABLES.has(resource.table)) {
    throw new Error("Bu yönetim kaynağı için transaction audit yapılandırılmamış.");
  }
}

export async function saveAdminResource(formData: FormData): Promise<never> {
  const resourceKey = textValue(formData, "_resource");
  const id = textValue(formData, "_id");
  const resource = getAdminResource(resourceKey);
  if (!resource) redirect(adminPath({ error: "Geçersiz yönetim modülü." }));

  await requireAdmin();
  let destination: string;

  try {
    assertDatabaseAudit(resource);
    const payload = parseAdminResourcePayload(resource, formData);
    const supabase = await createClient();

    if (id) {
      await updateAdminRow(supabase, resource.table, id, payload);
      destination = resourcePath(resource.key, { notice: "Kayıt güncellendi." });
    } else {
      if (!resource.allowCreate) throw new Error("Bu modülde yeni kayıt oluşturma kapalı.");
      await insertAdminRow(supabase, resource.table, payload);
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
  if (!resource || !id || !resource.allowArchive) {
    redirect(adminPath({ error: "Geçersiz arşivleme isteği." }));
  }

  await requireAdmin();
  let destination: string;

  try {
    assertDatabaseAudit(resource);
    const patch: AdminMutationPayload = {};
    if (resource.activeField) patch[resource.activeField] = false;
    if (resource.statusField) patch[resource.statusField] = "archived";
    if (!Object.keys(patch).length) throw new Error("Bu kayıt pasife alınamıyor.");

    const supabase = await createClient();
    await updateAdminRow(supabase, resource.table, id, patch);
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
  if (!resource || !id || !resource.allowHardDeleteTest) {
    redirect(adminPath({ error: "Kalıcı silme bu modülde kapalı." }));
  }

  await requireAdmin();
  let destination: string;

  try {
    assertDatabaseAudit(resource);
    const supabase = await createClient();
    const row = await readAdminRow(supabase, resource.table, id);
    if (!isTestRecord(resource, row)) {
      throw new Error("Yalnız TEST_ adı veya test- slug öneki taşıyan kayıtlar kalıcı silinebilir.");
    }

    await deleteAdminRow(supabase, resource.table, id);
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
