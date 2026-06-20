"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { logAdminAction } from "./audit";
import { getAdminResource, type AdminField, type AdminResource } from "./resources";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: string): string | null {
  return value ? value : null;
}

function parseNumber(value: string, required: boolean): number | null {
  if (!value) {
    if (required) throw new Error("Zorunlu sayısal alan boş bırakılamaz.");
    return null;
  }
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed)) throw new Error("Geçerli bir sayı gir.");
  return parsed;
}

function parseJson(value: string): Json {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed === undefined) throw new Error();
    return parsed as Json;
  } catch {
    throw new Error("JSON alanı geçerli değil.");
  }
}

function parseArray(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

function parseDateTime(value: string): string | null {
  if (!value) return null;
  const localDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)
    ? `${value}${value.length === 16 ? ":00" : ""}+03:00`
    : value;
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime())) throw new Error("Tarih veya saat geçerli değil.");
  return date.toISOString();
}

function parseField(field: AdminField, formData: FormData): unknown {
  const raw = textValue(formData, field.name);

  if (field.required && field.type !== "checkbox" && !raw) {
    throw new Error(`${field.label} zorunlu.`);
  }

  switch (field.type) {
    case "checkbox":
      return formData.get(field.name) === "on";
    case "number":
      return parseNumber(raw, Boolean(field.required));
    case "money": {
      const number = parseNumber(raw, Boolean(field.required));
      return number === null ? null : Math.round(number * 100);
    }
    case "json":
      return parseJson(raw);
    case "string-array":
      return parseArray(raw);
    case "datetime":
      return parseDateTime(raw);
    case "url":
      if (!raw) return field.nullable ? null : "";
      try {
        const url = new URL(raw);
        if (url.protocol !== "https:") throw new Error();
      } catch {
        throw new Error(`${field.label} HTTPS ile başlayan geçerli bir bağlantı olmalı.`);
      }
      return raw;
    case "foreign":
    case "text":
    case "textarea":
    case "select":
      return field.nullable ? nullableText(raw) : raw;
  }
}

function makePayload(resource: AdminResource, formData: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of resource.fields) {
    payload[field.name] = parseField(field, formData);
  }
  return payload;
}

function safeMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.slice(0, 240);
  return "İşlem tamamlanamadı.";
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
    const payload = makePayload(resource, formData);
    const supabase = await createClient();

    if (id) {
      const { data, error } = await supabase
        .from(resource.table)
        .update(payload as never)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      const row = data as unknown as Record<string, unknown>;
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
      const { data, error } = await supabase
        .from(resource.table)
        .insert(payload as never)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      const row = data as unknown as Record<string, unknown>;
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
    destination = resourcePath(resource.key, {
      error: safeMessage(error),
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
    const patch: Record<string, unknown> = {};
    if (resource.activeField) patch[resource.activeField] = false;
    if (resource.statusField) patch[resource.statusField] = "archived";
    if (!Object.keys(patch).length) throw new Error("Bu kayıt pasife alınamıyor.");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from(resource.table)
      .update(patch as never)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const row = data as unknown as Record<string, unknown>;
    await logAdminAction({
      actorId: admin.userId,
      action: "archive",
      entityType: resource.table,
      entityId: id,
      entityLabel: recordLabel(resource, row),
    });
    destination = resourcePath(resource.key, { notice: "Kayıt pasife alındı / arşivlendi." });
  } catch (error) {
    destination = resourcePath(resource.key, { error: safeMessage(error), edit: id });
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
    const { data, error: readError } = await supabase.from(resource.table).select("*").eq("id", id).single();
    if (readError) throw new Error(readError.message);
    const row = data as unknown as Record<string, unknown>;
    if (!isTestRecord(resource, row)) {
      throw new Error("Yalnız TEST_ adı veya test- slug öneki taşıyan kayıtlar kalıcı silinebilir.");
    }

    const { error } = await supabase.from(resource.table).delete().eq("id", id);
    if (error) throw new Error(error.message);
    await logAdminAction({
      actorId: admin.userId,
      action: "delete_test",
      entityType: resource.table,
      entityId: id,
      entityLabel: recordLabel(resource, row),
    });
    destination = resourcePath(resource.key, { notice: "TEST kaydı kalıcı olarak silindi." });
  } catch (error) {
    destination = resourcePath(resource.key, { error: safeMessage(error), edit: id });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/manage/${resource.key}`);
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  redirect(destination);
}
