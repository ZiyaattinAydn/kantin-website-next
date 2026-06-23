import "server-only";

import type { Json } from "@/lib/supabase/database.types";
import {
  BODY_SCALES,
  CARD_DENSITIES,
  COLOR_PRESETS,
  FONT_PRESETS,
  HEADING_SCALES,
  HOME_SECTION_KEYS,
} from "@/lib/theme/settings";
import type { AdminField, AdminResource } from "./resources";

export type AdminMutationPayload = Record<string, Json>;

export type AdminActionIssue =
  | { code: string; field: string; kind: "validation"; message: string }
  | { code: "operation_failed"; kind: "operation"; message: string };

export class AdminValidationError extends Error {
  readonly code: string;
  readonly field: string;

  constructor(field: string, message: string, code = "invalid_value") {
    super(message);
    this.name = "AdminValidationError";
    this.field = field;
    this.code = code;
  }
}

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function fail(field: AdminField, message: string, code?: string): never {
  throw new AdminValidationError(field.name, message, code);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf(value: unknown, allowed: readonly string[]): value is string {
  return typeof value === "string" && allowed.includes(value);
}

function validateJsonSafety(value: unknown, field: AdminField, depth = 0): asserts value is Json {
  if (depth > 10) fail(field, `${field.label} en fazla 10 seviye iç içe olabilir.`, "json_depth");

  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return;
  }

  if (Array.isArray(value)) {
    if (value.length > 100) fail(field, `${field.label} en fazla 100 öğe içerebilir.`, "json_items");
    value.forEach((item) => validateJsonSafety(item, field, depth + 1));
    return;
  }

  if (!isRecord(value)) fail(field, `${field.label} desteklenmeyen bir JSON değeri içeriyor.`, "json_type");
  const entries = Object.entries(value);
  if (entries.length > 100) fail(field, `${field.label} en fazla 100 anahtar içerebilir.`, "json_keys");

  for (const [key, child] of entries) {
    if (["__proto__", "prototype", "constructor"].includes(key)) {
      fail(field, `${field.label} güvenli olmayan bir anahtar içeriyor.`, "json_key");
    }
    validateJsonSafety(child, field, depth + 1);
  }
}

function requireRecord(value: unknown, field: AdminField): Record<string, unknown> {
  if (!isRecord(value)) fail(field, `${field.label} bir JSON nesnesi olmalı.`, "json_shape");
  return value;
}

function requireString(record: Record<string, unknown>, key: string, field: AdminField): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    fail(field, `${field.label} içinde “${key}” metin olmalı.`, "json_shape");
  }
  return value.trim();
}

function validateOpeningHours(value: unknown, field: AdminField): void {
  const record = requireRecord(value, field);
  for (const key of ["notice", "note"] as const) {
    if (record[key] !== undefined && typeof record[key] !== "string") {
      fail(field, `${field.label} içindeki “${key}” metin olmalı.`, "json_shape");
    }
  }
  if (record.items === undefined) return;
  if (!Array.isArray(record.items)) {
    fail(field, `${field.label} içindeki “items” bir liste olmalı.`, "json_shape");
  }
  for (const item of record.items) {
    if (typeof item === "string" && item.trim()) continue;
    if (!isRecord(item)) fail(field, `${field.label} satırları metin veya nesne olmalı.`, "json_shape");
    const label = typeof item.label === "string" ? item.label : item.day;
    const hours = typeof item.hours === "string" ? item.hours : item.value;
    if (typeof label !== "string" || !label.trim() || typeof hours !== "string" || !hours.trim()) {
      fail(field, `${field.label} satırlarında gün ve saat metni bulunmalı.`, "json_shape");
    }
  }
}

function validateThemeSettings(value: unknown, field: AdminField): void {
  const record = requireRecord(value, field);
  const choices: ReadonlyArray<[string, readonly string[]]> = [
    ["fontPreset", FONT_PRESETS],
    ["colorPreset", COLOR_PRESETS],
    ["headingScale", HEADING_SCALES],
    ["bodyScale", BODY_SCALES],
    ["cardDensity", CARD_DENSITIES],
  ];
  for (const [key, allowed] of choices) {
    if (!isOneOf(record[key], allowed)) {
      fail(field, `${field.label} içindeki “${key}” izin verilen değerlerden biri olmalı.`, "json_shape");
    }
  }
  const order = record.homeSectionOrder;
  if (!Array.isArray(order) || order.length !== HOME_SECTION_KEYS.length) {
    fail(field, `${field.label} tüm ana sayfa bölümlerini bir kez sıralamalı.`, "json_shape");
  }
  if (new Set(order).size !== HOME_SECTION_KEYS.length || order.some((item) => !isOneOf(item, HOME_SECTION_KEYS))) {
    fail(field, `${field.label} geçersiz veya tekrarlanan bölüm içeriyor.`, "json_shape");
  }
}

function validateSectionVisibility(value: unknown, field: AdminField): void {
  const record = requireRecord(value, field);
  for (const key of ["homeHero", "branches", "menu", "events", "merch", "memories", "instagram", "careers"]) {
    if (typeof record[key] !== "boolean") {
      fail(field, `${field.label} içindeki “${key}” true veya false olmalı.`, "json_shape");
    }
  }
}

function validateNavigation(value: unknown, field: AdminField, footer: boolean): void {
  if (!Array.isArray(value) || !value.length) {
    fail(field, `${field.label} boş olmayan bir liste olmalı.`, "json_shape");
  }
  for (const entry of value) {
    const record = requireRecord(entry, field);
    if (footer) {
      requireString(record, "title", field);
      if (!Array.isArray(record.links) || !record.links.length) {
        fail(field, `${field.label} gruplarında boş olmayan “links” listesi olmalı.`, "json_shape");
      }
      for (const link of record.links) {
        const linkRecord = requireRecord(link, field);
        requireString(linkRecord, "href", field);
        requireString(linkRecord, "label", field);
        if (linkRecord.external !== undefined && typeof linkRecord.external !== "boolean") {
          fail(field, `${field.label} içindeki “external” true veya false olmalı.`, "json_shape");
        }
      }
    } else {
      requireString(record, "href", field);
      requireString(record, "label", field);
      if (record.exact !== undefined && typeof record.exact !== "boolean") {
        fail(field, `${field.label} içindeki “exact” true veya false olmalı.`, "json_shape");
      }
    }
  }
}

function validateSiteSetting(value: unknown, field: AdminField, formData: FormData): void {
  const key = textValue(formData, "key");
  if (key === "theme.settings") validateThemeSettings(value, field);
  if (key === "sections.visibility") validateSectionVisibility(value, field);
  if (key === "navigation.primary") validateNavigation(value, field, false);
  if (key === "navigation.footer") validateNavigation(value, field, true);
  if (["site.identity", "site.contact", "footer.content"].includes(key)) requireRecord(value, field);
}

function validateResourceJson(
  resource: AdminResource,
  field: AdminField,
  value: unknown,
  formData: FormData,
): void {
  if (resource.key === "branches" && field.name === "opening_hours") validateOpeningHours(value, field);
  if (resource.key === "site-settings" && field.name === "value") validateSiteSetting(value, field, formData);
  if (resource.key === "site-pages" && field.name === "metadata") requireRecord(value, field);
  if (resource.key === "content-blocks" && field.name === "content") requireRecord(value, field);
}

function parseNumber(raw: string, field: AdminField): number | null {
  if (!raw) return null;
  const parsed = Number(raw.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    fail(field, `${field.label} sıfır veya daha büyük geçerli bir sayı olmalı.`, "number");
  }
  return parsed;
}

function parseJson(raw: string, resource: AdminResource, field: AdminField, formData: FormData): Json {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "{}");
  } catch {
    fail(field, `${field.label} geçerli JSON olmalı.`, "json_syntax");
  }
  if (JSON.stringify(parsed).length > 50_000) {
    fail(field, `${field.label} 50 KB sınırını aşıyor.`, "json_size");
  }
  validateJsonSafety(parsed, field);
  validateResourceJson(resource, field, parsed, formData);
  return parsed;
}

function parseArray(raw: string, field: AdminField): string[] {
  const values = [...new Set(raw.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
  if (values.length > 50 || values.some((item) => item.length > 120)) {
    fail(field, `${field.label} en fazla 50 adet, 120 karakterlik değer içerebilir.`, "array_size");
  }
  return values;
}

function parseDateTime(raw: string, field: AdminField): string | null {
  if (!raw) return null;
  const localDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(raw)
    ? `${raw}${raw.length === 16 ? ":00" : ""}+03:00`
    : raw;
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime())) fail(field, `${field.label} geçerli bir tarih ve saat olmalı.`, "datetime");
  return date.toISOString();
}

function validateText(raw: string, field: AdminField): void {
  const maxLength = field.type === "textarea" ? 10_000 : 500;
  if (raw.length > maxLength) fail(field, `${field.label} en fazla ${maxLength} karakter olabilir.`, "length");

  if (field.name === "slug" && raw && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw)) {
    fail(field, `${field.label} yalnız küçük harf, sayı ve tire içerebilir.`, "slug");
  }
  if (field.name === "public_email" && raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    fail(field, `${field.label} geçerli bir e-posta adresi olmalı.`, "email");
  }
  if (["key", "block_type"].includes(field.name) && raw && !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(raw)) {
    fail(field, `${field.label} yalnız harf, sayı, nokta, alt çizgi ve tire içerebilir.`, "identifier");
  }
}

function parseField(resource: AdminResource, field: AdminField, formData: FormData): Json {
  const raw = textValue(formData, field.name);
  if (field.required && field.type !== "checkbox" && !raw) {
    fail(field, `${field.label} zorunlu.`, "required");
  }

  switch (field.type) {
    case "checkbox":
      return formData.get(field.name) === "on";
    case "number": {
      const value = parseNumber(raw, field);
      if (value !== null && !Number.isInteger(value)) fail(field, `${field.label} tam sayı olmalı.`, "integer");
      return value;
    }
    case "money": {
      const value = parseNumber(raw, field);
      return value === null ? null : Math.round(value * 100);
    }
    case "json":
      return parseJson(raw, resource, field, formData);
    case "string-array":
      return parseArray(raw, field);
    case "datetime":
      return parseDateTime(raw, field);
    case "url":
      if (!raw) return field.nullable ? null : "";
      try {
        const url = new URL(raw);
        if (url.protocol !== "https:") fail(field, `${field.label} HTTPS ile başlamalı.`, "url");
      } catch (error) {
        if (error instanceof AdminValidationError) throw error;
        fail(field, `${field.label} geçerli bir HTTPS bağlantısı olmalı.`, "url");
      }
      return raw;
    case "select":
      if (raw && field.options && !field.options.some((option) => option.value === raw)) {
        fail(field, `${field.label} için izin verilen bir seçim yap.`, "option");
      }
      validateText(raw, field);
      return field.nullable && !raw ? null : raw;
    case "foreign":
      if (raw && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) {
        fail(field, `${field.label} geçerli bir kayıt seçimi olmalı.`, "foreign_id");
      }
      return field.nullable && !raw ? null : raw;
    case "text":
    case "textarea":
      validateText(raw, field);
      return field.nullable && !raw ? null : raw;
  }
}

function fieldByName(resource: AdminResource, name: string): AdminField {
  const field = resource.fields.find((entry) => entry.name === name);
  if (!field) throw new AdminValidationError(name, "Geçersiz alan.", "invalid_field");
  return field;
}

function isoTime(value: Json): number | null {
  if (typeof value !== "string" || !value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function validateEventsPayload(resource: AdminResource, payload: AdminMutationPayload): void {
  if (resource.key !== "events") return;

  const contentType = payload.content_type === "announcement" ? "announcement" : "event";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const startAt = isoTime(payload.start_at);
  const endAt = isoTime(payload.end_at);
  const publishStartAt = isoTime(payload.publish_start_at);
  const publishEndAt = isoTime(payload.publish_end_at);

  if (contentType === "event") {
    if (!description) fail(fieldByName(resource, "description"), "Etkinlik açıklaması zorunlu.", "required");
    if (startAt === null) fail(fieldByName(resource, "start_at"), "Etkinlik başlangıcı zorunlu.", "required");
  }

  if (startAt !== null && endAt !== null && endAt <= startAt) {
    fail(fieldByName(resource, "end_at"), "Bitiş zamanı başlangıçtan sonra olmalı.", "datetime_order");
  }

  if (publishStartAt !== null && publishEndAt !== null && publishEndAt <= publishStartAt) {
    fail(fieldByName(resource, "publish_end_at"), "Yayın bitişi yayın başlangıcından sonra olmalı.", "datetime_order");
  }
}

export function parseAdminResourcePayload(
  resource: AdminResource,
  formData: FormData,
): AdminMutationPayload {
  const payload: AdminMutationPayload = {};
  for (const field of resource.fields) payload[field.name] = parseField(resource, field, formData);
  validateEventsPayload(resource, payload);
  return payload;
}

export function adminActionError(error: unknown): AdminActionIssue {
  if (error instanceof AdminValidationError) {
    return {
      code: error.code,
      field: error.field,
      kind: "validation",
      message: error.message.slice(0, 240),
    };
  }
  return {
    code: "operation_failed",
    kind: "operation",
    message: error instanceof Error && error.message
      ? error.message.slice(0, 240)
      : "İşlem tamamlanamadı.",
  };
}
