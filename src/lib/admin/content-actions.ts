"use server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import {
  withHeroImage,
  applyContentChanges,
  editableContentFields,
  blockLabels,
  settingLabels,
  contentColumns,
  contentSnapshot,
  type ContentRecord,
  type ContentSnapshot,
} from "./content-model";
import { getAdminResource } from "./resources";
import { parseAdminResourcePayload } from "./resource-validation";
import { assertUuid } from "./pricing";
import { loadMediaChoices } from "./media-choices";
import { recordSystemEvent } from "./system-logs";
type ContentResult =
  | { ok: true; message: string; snapshot: ContentSnapshot }
  | { ok: false; message: string; conflict?: ContentSnapshot };
export async function saveContentRecord(input: {
  id: string;
  table: string;
  updated_at: string;
  changes: { path: (string | number)[]; value: unknown }[];
  confirmed?: string;
  status?: string;
  is_active?: boolean;
}): Promise<ContentResult> {
  const admin = await requireAdmin();
  let latest: ContentSnapshot | undefined;
  try {
    assertUuid(input.id, "İçerik");
    if (
      !["content_blocks", "site_settings", "site_pages", "branches"].includes(
        input.table,
      )
    )
      throw new Error("invalid_content_payload");
    const c: SupabaseClient = await createClient();
    const columns: string =
      contentColumns[input.table as ContentRecord["table"]];
    const { data, error } = await c
      .from(input.table as "content_blocks")
      .select(columns)
      .eq("id", input.id)
      .single();
    if (error) throw error;
    const row = data as unknown as Record<string, Json>;

    if (input.table === "content_blocks" && !blockLabels[String(row.key)])
      throw new Error("invalid_content_payload");
    if (
      input.table === "site_settings" &&
      (!settingLabels[String(row.key)] || row.is_public !== true)
    )
      throw new Error("invalid_content_payload");
    latest = contentSnapshot(input.table as ContentRecord["table"], row);
    if (row.updated_at !== input.updated_at) throw { code: "40001" };
    const status = input.status ?? String(row.status);
    const isActive = input.is_active ?? row.is_active;
    if (
      !["draft", "published", "archived"].includes(status) ||
      typeof isActive !== "boolean"
    )
      throw new Error("invalid_content_payload");
    if (
      (status !== row.status || isActive !== row.is_active) &&
      input.confirmed !== "EVET"
    )
      throw new Error("visibility_confirmation_required");
    let current: Json;
    if (input.table === "content_blocks") {
      const { data: page, error: pageError } = await c
        .from("site_pages")
        .select("slug")
        .eq("id", String(row.page_id))
        .single();
      if (pageError) throw pageError;
      current =
        row.key === "hero" && page.slug === "home"
          ? withHeroImage(row.content)
          : row.content;
    } else if (input.table === "site_settings") current = row.value;
    else {
      const fields =
        input.table === "site_pages"
          ? ["title", "seo_title", "seo_description"]
          : [
              "name",
              "short_description",
              "address_line",
              "district",
              "city",
              "maps_url",
              "phone",
              "public_email",
              "features",
              "opening_hours",
            ];
      current = Object.fromEntries(
        fields.map((k) => [k, row[k] ?? ""]),
      ) as Json;
    }
    const allowed = editableContentFields(current);
    if (!Array.isArray(input.changes) || input.changes.length > 500)
      throw new Error("invalid_content_payload");
    if (
      input.table === "site_settings" &&
      row.key === "sections.visibility" &&
      input.confirmed !== "EVET"
    )
      throw new Error("visibility_confirmation_required");
    const changes = new Map(
      input.changes.map((change) => [JSON.stringify(change.path), change]),
    );
    if (
      changes.size !== input.changes.length ||
      input.changes.some(
        (ch) =>
          !allowed.some(
            (f) => JSON.stringify(f.path) === JSON.stringify(ch.path),
          ),
      )
    )
      throw new Error("invalid_content_payload");
    // Omitted fields keep their database values. Branch editors cannot drop other branch content.
    const complete = allowed.map(
      (f) =>
        changes.get(JSON.stringify(f.path)) ?? { path: f.path, value: f.value },
    );
    const mediaIds = input.changes.flatMap((ch) =>
      typeof ch.value === "string" && ch.value.startsWith("media:")
        ? [ch.value.slice(6)]
        : [],
    );
    const media = mediaIds.length ? await loadMediaChoices(mediaIds) : [];
    const next = applyContentChanges(
      current,
      complete,
      new Map(media.map((m) => [m.id, m.url])),
    );
    const patch =
      input.table === "content_blocks"
        ? { content: next }
        : input.table === "site_settings"
          ? { value: next }
          : next;
    // Reuse existing per-resource validation instead of bypassing its JSON/email/URL rules.
    const resource = getAdminResource(input.table.replaceAll("_", "-"));
    if (!resource) throw new Error("invalid_content_payload");
    const merged: Record<string, Json> = {
      ...row,
      ...(patch as Record<string, Json>),
      status,
      is_active: isActive,
    };
    const form = new FormData();
    for (const field of resource.fields) {
      const value = merged[field.name];
      if (field.type === "checkbox") {
        if (value === true) form.set(field.name, "on");
      } else if (field.type === "json")
        form.set(field.name, JSON.stringify(value ?? {}));
      else if (field.type === "string-array")
        form.set(field.name, Array.isArray(value) ? value.join("\n") : "");
      else if (value !== null && value !== undefined)
        form.set(field.name, String(value));
    }
    parseAdminResourcePayload(resource, form);
    const result = await c
      .from(input.table as "content_blocks")
      .update({
        ...(patch as Record<string, Json>),
        status: status as "draft" | "published" | "archived",
        is_active: isActive,
      })
      .eq("id", input.id)
      .eq("updated_at", input.updated_at)
      .select(columns)
      .single();
    if (result.error || !result.data) {
      if (!result.data && (!result.error || result.error.code === "PGRST116")) {
        const fresh = await c
          .from(input.table as "content_blocks")
          .select(columns)
          .eq("id", input.id)
          .single();
        latest = fresh.data
          ? contentSnapshot(
              input.table as ContentRecord["table"],
              fresh.data as unknown as Record<string, unknown>,
            )
          : undefined;
        throw { code: "40001" };
      }
      throw result.error;
    }
    ["/admin/site", "/", "/menu", "/events"].forEach((path) =>
      revalidatePath(path),
    );
    return {
      ok: true,
      message: "Site içeriği kaydedildi.",
      snapshot: contentSnapshot(
        input.table as ContentRecord["table"],
        result.data as unknown as Record<string, unknown>,
      ),
    };
  } catch (error) {
    await recordSystemEvent({
      actorId: admin.userId,
      route: "/admin/site",
      operation: "save",
      entityType: input.table,
      entityId: input.id,
      error,
    });
    return {
      ok: false,
      conflict:
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "40001"
          ? latest
          : undefined,
      message:
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "40001"
          ? "İçerik başka bir işlemle değişti. Güncel kayıt alındı; değişiklikleriniz korundu. Kontrol edip yeniden kaydedin."
          : "Site içeriği kaydedilemedi. Alanları kontrol edip tekrar deneyin.",
    };
  }
}
