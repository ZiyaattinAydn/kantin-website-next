import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  ADMIN_PAGE_SIZE,
  adminPageRange,
  createAdminPagination,
} from "./pagination";
import type { AdminResource } from "./resources";

function isAdminRow(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function adminRows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isAdminRow) : [];
}

function uniqueColumnList(columns: readonly string[]): string {
  return [...new Set(columns)].join(",");
}

function resourceListColumns(resource: AdminResource): string {
  // Inline açılır düzenleme alanları her satırın tam kaydına ihtiyaç duyar.
  // Yalnız görünür kolonları değil, form alanlarını da tek sorguda getiririz.
  return uniqueColumnList([
    "id",
    resource.orderField,
    ...resource.listFields,
    ...resource.fields.map((field) => field.name),
    "updated_at",
  ]);
}

function resourceRecordColumns(resource: AdminResource): string {
  return uniqueColumnList([
    "id",
    ...resource.fields.map((field) => field.name),
  ]);
}

export async function loadAdminResourceRows(
  resource: AdminResource,
  { page, search }: { page: number; search: string },
) {
  const supabase: SupabaseClient = await createClient();
  const { from, to } = adminPageRange(page);

  let query = supabase
    .from(resource.table)
    .select(resourceListColumns(resource), { count: "exact" });

  if (search && resource.searchFields.length) {
    const filter = resource.searchFields
      .map((field) => `${field}.ilike.%${search}%`)
      .join(",");

    query = query.or(filter);
  }

  const { data, error, count } = await query
    .order(resource.orderField, { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: adminRows(data),
    pagination: createAdminPagination(
      count ?? 0,
      page,
      ADMIN_PAGE_SIZE,
    ),
  };
}

export async function loadAdminResourceRecord(
  resource: AdminResource,
  id: string,
) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from(resource.table)
    .select(resourceRecordColumns(resource))
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return isAdminRow(data) ? data : null;
}