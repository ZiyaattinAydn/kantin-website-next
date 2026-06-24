import { notFound } from "next/navigation";
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

export default async function AdminResourcePage({ params, searchParams }: PageProps) {
  const [route, query] = await Promise.all([params, searchParams]);
  const resource = getAdminResource(route.resource);
  if (!resource) notFound();

  const editId = firstString(query.edit);
  const search = normaliseAdminSearch(firstString(query.q));
  const page = parseAdminPage(firstString(query.page));
  const sources = resource.fields.flatMap((field) => field.optionSource ? [field.optionSource] : []);
  const prefill = prefilledRecord(query, resource.fields.map((field) => field.name));
  const [list, record, options, deleteImpact] = await Promise.all([
    loadAdminResourceRows(resource, { page, search }),
    editId ? loadAdminResourceRecord(resource, editId) : Promise.resolve(null),
    loadAdminOptions(sources),
    editId ? loadAdminDeleteImpact(resource, editId) : Promise.resolve(null),
  ]);

  const rows = includeSelectedAdminRow(list.rows, record);

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
      rows={rows}
      search={search}
      showNew={firstString(query.new) === "1" || Boolean(prefill)}
    />
  );
}
