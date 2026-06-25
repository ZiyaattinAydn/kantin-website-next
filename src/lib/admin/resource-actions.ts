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
import { assertAdminDeleteNotBlocked } from "./resource-delete";
import { getAdminResource, type AdminResource } from "./resources";
import {
  ADMIN_VISIBILITY_CONFIRMATIONS,
  requiredAdminVisibilityConfirmation,
} from "./visibility";

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


function immutableUpdateFields(resource: AdminResource) {
  return resource.fields.filter((field) => field.immutableOnUpdate);
}

function serializeAdminFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "on" : null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function withImmutableUpdateValues(
  resource: AdminResource,
  formData: FormData,
  current: Record<string, unknown>,
): FormData {
  const protectedFormData = new FormData();
  formData.forEach((value, key) => protectedFormData.append(key, value));

  for (const field of immutableUpdateFields(resource)) {
    protectedFormData.delete(field.name);
    const serialized = serializeAdminFieldValue(current[field.name]);
    if (serialized !== null) protectedFormData.set(field.name, serialized);
  }

  return protectedFormData;
}

function assertDatabaseAudit(resource: AdminResource): void {
  if (!DATABASE_AUDITED_TABLES.has(resource.table)) {
    throw new Error("Bu yönetim alanı için güvenli kayıt yapılandırması eksik.");
  }
}

function adminVisibilityState(
  resource: AdminResource,
  values: Record<string, unknown>,
) {
  return {
    hasActiveField: Boolean(resource.activeField),
    hasStatusField: Boolean(resource.statusField),
    active: resource.activeField ? values[resource.activeField] === true : true,
    status: resource.statusField ? String(values[resource.statusField] ?? "") : "",
  };
}

function assertVisibilityConfirmation(
  resource: AdminResource,
  formData: FormData,
  nextValues: Record<string, unknown>,
  currentValues: Record<string, unknown> | null,
): void {
  const requiredPhrase = requiredAdminVisibilityConfirmation({
    isCreate: currentValues === null,
    current: currentValues ? adminVisibilityState(resource, currentValues) : null,
    next: adminVisibilityState(resource, nextValues),
  });

  if (!requiredPhrase) return;
  if (textValue(formData, "_visibility_confirm") === requiredPhrase) return;

  const action = requiredPhrase === ADMIN_VISIBILITY_CONFIRMATIONS.publish
    ? "yayına alma"
    : "ziyaretçiden gizleme";
  throw new Error(
    `${action} onayı doğrulanamadı. İşlemi panelden yeniden başlatıp “${requiredPhrase}” yazarak onayla.`,
  );
}


export async function saveAdminResource(formData: FormData): Promise<never> {
  const resourceKey = textValue(formData, "_resource");
  const id = textValue(formData, "_id");
  const resource = getAdminResource(resourceKey);
  if (!resource) redirect("/admin?error=Geçersiz yönetim modülü.");

  await requireAdmin();
  let destination: string;

  try {
    assertDatabaseAudit(resource);

    if (id) {
      const needsCurrent = Boolean(
        resource.orderScopeFields?.length ||
        immutableUpdateFields(resource).length ||
        resource.activeField ||
        resource.statusField,
      );
      const supabase = await createClient();
      const current = needsCurrent
        ? await readAdminRow(supabase, resource.table, id)
        : null;
      const protectedFormData = current
        ? withImmutableUpdateValues(resource, formData, current)
        : formData;
      const payload = parseAdminResourcePayload(resource, protectedFormData);
      assertVisibilityConfirmation(resource, formData, payload, current);

      if (current && resource.orderScopeFields?.length) {
        const scopeChanged = resource.orderScopeFields.some(
          (field) => current[field] !== payload[field],
        );
        if (scopeChanged) {
          // -1 değeri DB trigger'ına yeni kapsamın son sırasını transaction içinde hesaplatır.
          payload[resource.orderField] = -1;
        }
      }

      await updateAdminRow(supabase, resource.table, id, payload);
      destination = resourcePath(resource.key, { notice: "Kayıt güncellendi." });
    } else {
      if (!resource.allowCreate) throw new Error("Bu modülde yeni kayıt oluşturma kapalı.");
      const payload = parseAdminResourcePayload(resource, formData);
      assertVisibilityConfirmation(resource, formData, payload, null);
      const supabase = await createClient();
      // Sıra kullanıcıdan alınmaz. DB trigger'ı aynı kapsam için advisory lock altında
      // son sırayı hesaplar; böylece eşzamanlı eklemeler aynı değeri alamaz.
      payload[resource.orderField] = -1;
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
    redirect("/admin?error=Geçersiz arşivleme isteği.");
  }

  await requireAdmin();
  let destination: string;

  try {
    if (textValue(formData, "_confirm") !== ADMIN_VISIBILITY_CONFIRMATIONS.hide) {
      throw new Error(
        `Pasife alma onayı doğrulanamadı. İşlemi panelden yeniden başlatıp “${ADMIN_VISIBILITY_CONFIRMATIONS.hide}” yazarak onayla.`,
      );
    }

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

function isAdminResourceInactive(
  resource: AdminResource,
  row: Record<string, unknown>,
): boolean {
  const inactiveByFlag = resource.activeField
    ? row[resource.activeField] === false
    : false;
  const inactiveByStatus = resource.statusField
    ? row[resource.statusField] === "archived"
    : false;
  return inactiveByFlag || inactiveByStatus;
}

export async function deleteAdminResource(formData: FormData): Promise<never> {
  const resourceKey = textValue(formData, "_resource");
  const id = textValue(formData, "_id");
  const resource = getAdminResource(resourceKey);
  if (!resource || !id || !resource.allowHardDelete) {
    redirect("/admin?error=Kalıcı silme bu modülde kapalı.");
  }

  await requireAdmin();
  let destination: string;

  try {
    if (textValue(formData, "_confirm") !== "KALICI SİL") {
      throw new Error("Kalıcı silme onayı doğrulanamadı. İşlemi ekrandaki kalıcı silme düğmesinden yeniden başlat.");
    }

    assertDatabaseAudit(resource);
    const supabase = await createClient();
    const row = await readAdminRow(supabase, resource.table, id);
    if (!isAdminResourceInactive(resource, row)) {
      throw new Error("Kalıcı silmeden önce kaydı pasife almalı veya arşivlemelisin.");
    }

    await assertAdminDeleteNotBlocked(supabase, resource, id);
    await deleteAdminRow(supabase, resource.table, id);
    destination = resourcePath(resource.key, { notice: "Kayıt ve ona ait alt bağlantılar kalıcı olarak silindi." });
  } catch (error) {
    destination = resourcePath(resource.key, { error: adminActionError(error).message, edit: id });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/manage/${resource.key}`);
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}
