"use server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  contentColumns,
  contentSnapshot,
  type ContentRecord,
} from "./content-model";
import { assertUuid } from "./pricing";
import { recordSystemEvent } from "./system-logs";
export type BaselineTarget = {
  entity_type: ContentRecord["table"];
  id: string;
  baseline_key: string;
  updated_at: string;
};
export type BaselineReview = {
  target: BaselineTarget;
  label: string;
  source: string;
  fields: { label: string; before: string; after: string; image?: boolean }[];
};
export async function loadDeliveryBaselineReview(
  scope?: { table: ContentRecord["table"]; id: string },
  includeBranches = false,
) {
  await requireAdmin();
  try {
    if (scope) {
      assertUuid(scope.id, "İçerik");
      if (!Object.keys(contentColumns).includes(scope.table))
        throw new Error("invalid_scope");
    }
    const client: SupabaseClient = await createClient();
    const { data: baselines, error } = await client
      .from("admin_delivery_baselines")
      .select("entity_type,baseline_key,snapshot,source_ref");
    if (error) throw error;
    const pages = await client.from("site_pages").select("id,slug");
    if (pages.error) throw pages.error;
    const pageSlug = new Map((pages.data ?? []).map((p) => [p.id, p.slug]));
    const review: BaselineReview[] = [];
    const tables = scope
      ? [scope.table]
      : ([
          "site_pages",
          "content_blocks",
          "site_settings",
          ...(includeBranches ? ["branches"] : []),
        ] as ContentRecord["table"][]);
    for (const table of tables) {
      const projection: string =
        `${contentColumns[table]},${table === "content_blocks" || table === "site_settings" ? "" : "slug"}`.replace(
          /,$/,
          "",
        );
      let query = client.from(table as string).select(projection);
      if (scope) query = query.eq("id", scope.id);
      if (table === "site_settings") query = query.eq("is_public", true);
      const { data: rows, error } = await query;
      if (error) throw error;
      for (const row of (rows ?? []) as unknown as Record<string, unknown>[]) {
        const key =
          table === "content_blocks"
            ? `${pageSlug.get(String(row.page_id))}/${row.key}`
            : String(row.slug ?? row.key);
        const baseline = (baselines ?? []).find(
          (b) => b.entity_type === table && b.baseline_key === key,
        );
        if (!baseline) continue;
        const before = contentSnapshot(table, row),
          after = contentSnapshot(table, { ...row, ...baseline.snapshot });
        const oldFields = new Map(
          before.fields.map((f) => [JSON.stringify(f.path), f]),
        );
        const fields = after.fields.flatMap((field) => {
          const old = oldFields.get(JSON.stringify(field.path));
          return old?.value === field.value
            ? []
            : [
                {
                  label: field.label,
                  before: String(old?.value ?? ""),
                  after: String(field.value),
                  image: field.kind === "image",
                },
              ];
        });
        if (before.visibility?.status !== after.visibility?.status)
          fields.push({
            label: "Yayın ayarı",
            before: before.visibility?.status ?? "",
            after: after.visibility?.status ?? "",
            image: false,
          });
        if (before.visibility?.is_active !== after.visibility?.is_active)
          fields.push({
            label: "Sitede göster",
            before: before.visibility?.is_active ? "Evet" : "Hayır",
            after: after.visibility?.is_active ? "Evet" : "Hayır",
            image: false,
          });
        // Structural removals must also be visible in the review (e.g. later-added list rows).
        const newPaths = new Set(
          after.fields.map((f) => JSON.stringify(f.path)),
        );
        for (const field of before.fields)
          if (!newPaths.has(JSON.stringify(field.path)))
            fields.push({
              label: field.label,
              before: String(field.value),
              after: "Teslim sürümünde yok",
              image: field.kind === "image",
            });
        if (
          fields.length ||
          JSON.stringify(before.fields) !== JSON.stringify(after.fields)
        )
          review.push({
            target: {
              entity_type: table,
              id: String(row.id),
              baseline_key: key,
              updated_at: String(row.updated_at),
            },
            label: String(row.name ?? row.title ?? key),
            source: baseline.source_ref,
            fields,
          });
      }
    }
    return { ok: true as const, review };
  } catch {
    return {
      ok: false as const,
      message: "Teslim sürümü yüklenemedi. Tekrar deneyin.",
    };
  }
}
export async function restoreDeliveryBaseline(
  targets: BaselineTarget[],
  confirmation: string,
) {
  const admin = await requireAdmin();
  try {
    if (
      confirmation !== "İLK TESLİME DÖN" ||
      !Array.isArray(targets) ||
      !targets.length ||
      targets.length > 500
    )
      throw { code: "22023" };
    for (const target of targets) {
      assertUuid(target.id, "İçerik");
      if (
        !Object.keys(contentColumns).includes(target.entity_type) ||
        !Number.isFinite(Date.parse(target.updated_at))
      )
        throw { code: "22023" };
    }
    const client: SupabaseClient = await createClient();
    const { error } = await client.rpc("restore_admin_delivery_baseline", {
      p_changes: targets,
      p_confirmation: confirmation,
    });
    if (error) throw error;
    [
      "/admin/site",
      "/admin/manage/branches",
      "/",
      "/menu",
      "/events",
      "/careers",
    ].forEach((path) => revalidatePath(path));
    return {
      ok: true as const,
      message:
        "İlk teslim sürümü geri yüklendi. Önceki içerik sürüm geçmişinde korundu.",
    };
  } catch (error) {
    await recordSystemEvent({
      actorId: admin.userId,
      route: "/admin/site",
      operation: "restore",
      entityType: "system",
      error,
    });
    return {
      ok: false as const,
      message:
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "40001"
          ? "İçerik değişti. Kapsamı yeniden inceleyip tekrar deneyin."
          : "Teslim sürümü geri yüklenemedi. Tekrar deneyin.",
    };
  }
}
