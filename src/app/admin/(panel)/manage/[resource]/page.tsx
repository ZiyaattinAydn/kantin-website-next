import { managementDestination } from "@/lib/admin/management-routing";
import { loadAllAdminRows } from "@/lib/admin/menu-data";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/admin/pricing";
import { notFound, redirect } from "next/navigation";
import AdminResourceEditor from "@/components/admin/crud/AdminResourceEditor";
import { firstString } from "@/lib/admin/format";
import { normaliseAdminSearch, parseAdminPage } from "@/lib/admin/pagination";
import { loadAdminOptions } from "@/lib/admin/options";
import { loadAdminDeleteImpact } from "@/lib/admin/resource-delete";
import {
  includeSelectedAdminRow,
  loadAdminResourceRecord,
  loadAdminResourceRows,
} from "@/lib/admin/resource-data";
import { getAdminResource } from "@/lib/admin/resources";
import { loadAdminRecordRevisions } from "@/lib/admin/revisions";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined> & {
  edit?: string | string[];
  new?: string | string[];
  q?: string | string[];
  page?: string | string[];
  notice?: string | string[];
  error?: string | string[];
  field?: string | string[];
};

type PageProps = {
  params: Promise<{ resource: string }>;
  searchParams: Promise<SearchParams>;
};

function prefilledRecord(
  query: SearchParams,
  fieldNames: readonly string[],
): Record<string, unknown> | null {
  const values: Record<string, unknown> = {};

  for (const fieldName of fieldNames) {
    const raw = firstString(query[`prefill_${fieldName}`]);
    if (raw === undefined) continue;
    values[fieldName] = raw;
  }

  return Object.keys(values).length ? values : null;
}

export default async function AdminResourcePage({
  params,
  searchParams,
}: PageProps) {
  const [route, query] = await Promise.all([params, searchParams]);
  const resource = getAdminResource(route.resource);
  if (!resource) notFound();

  const flat = Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, firstString(value)]),
  );
  let ownerId: string | undefined;
  const ownerFields: Record<string, string> = {
    "menu-category-branches": "category_id",
    "menu-item-branches": "menu_item_id",
    "menu-item-variants": "menu_item_branch_id",
    "event-branches": "event_id",
    "merch-product-branches": "merch_product_id",
  };
  if (ownerFields[resource.key] && isUuid(flat.edit)) {
    const client = await createClient();
    const field = ownerFields[resource.key];
    const { data } = await client
      .from(resource.table)
      .select("*")
      .eq("id", flat.edit)
      .maybeSingle();
    ownerId = data
      ? String((data as Record<string, unknown>)[field] ?? "")
      : "";
    if (resource.key === "menu-item-variants" && ownerId) {
      const { data: link } = await client
        .from("menu_item_branches")
        .select("menu_item_id")
        .eq("id", ownerId)
        .maybeSingle();
      ownerId = link?.menu_item_id ?? "";
    }
  }
  if (
    ["site-pages", "site-settings", "content-blocks"].includes(resource.key) &&
    isUuid(flat.edit)
  ) {
    const client = await createClient();
    const { data } = await client
      .from(resource.table)
      .select("*")
      .eq("id", flat.edit)
      .maybeSingle();
    const item = data as Record<string, unknown> | null;
    if (resource.key === "site-settings") flat.section = "settings";
    if (resource.key === "site-pages" && item?.slug === "events")
      flat.section = "events";
    if (
      resource.key === "content-blocks" &&
      String(item?.key).startsWith("memories")
    )
      flat.section = "memories";
  }
  const destination = managementDestination(resource.key, flat, ownerId);
  if (destination) redirect(destination);
  const editId = firstString(query.edit);
  const search = normaliseAdminSearch(firstString(query.q));
  const page = parseAdminPage(firstString(query.page));
  const sources = resource.fields.flatMap((field) =>
    field.optionSource ? [field.optionSource] : [],
  );
  if (resource.key === "events") sources.push("branches");
  const prefill = prefilledRecord(
    query,
    resource.fields.map((field) => field.name),
  );
  const [list, record, options, deleteImpact, revisions] = await Promise.all([
    loadAdminResourceRows(resource, { page, search }),
    editId ? loadAdminResourceRecord(resource, editId) : Promise.resolve(null),
    loadAdminOptions(sources),
    editId ? loadAdminDeleteImpact(resource, editId) : Promise.resolve(null),
    editId ? loadAdminRecordRevisions(resource, editId) : Promise.resolve([]),
  ]);

  const rows = includeSelectedAdminRow(list.rows, record);
  if (resource.key === "events") {
    const links = await loadAllAdminRows<{
      id: string;
      event_id: string;
      branch_id: string;
      is_active: boolean;
      updated_at: string;
    }>(await createClient(), "event_branches");
    for (const row of rows) {
      row._branch_ids = links
        .filter((l) => l.event_id === row.id && l.is_active)
        .map((l) => l.branch_id);
      row._branch_snapshot = links
        .filter((l) => l.event_id === row.id)
        .map((l) => ({ id: l.id, updated_at: l.updated_at }));
    }
    if (record) {
      const row = rows.find((row) => row.id === record.id);
      record._branch_ids = row?._branch_ids;
      record._branch_snapshot = row?._branch_snapshot;
    }
  }

  return (
    <AdminResourceEditor
      deleteImpact={deleteImpact}
      error={firstString(query.error)}
      errorField={firstString(query.field)}
      notice={firstString(query.notice)}
      options={options}
      pagination={list.pagination}
      prefill={prefill}
      record={record}
      resource={resource}
      revisions={revisions}
      rows={rows}
      search={search}
      showNew={firstString(query.new) === "1" || Boolean(prefill)}
    />
  );
}
