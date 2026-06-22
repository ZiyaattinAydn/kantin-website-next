import { notFound } from "next/navigation";
import AdminResourceEditor from "@/components/admin/crud/AdminResourceEditor";
import { firstString } from "@/lib/admin/format";
import { normaliseAdminSearch, parseAdminPage } from "@/lib/admin/pagination";
import { loadAdminOptions } from "@/lib/admin/options";
import { loadAdminResourceRecord, loadAdminResourceRows } from "@/lib/admin/resource-data";
import { getAdminResource } from "@/lib/admin/resources";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{
    edit?: string | string[];
    new?: string | string[];
    q?: string | string[];
    page?: string | string[];
    notice?: string | string[];
    error?: string | string[];
    field?: string | string[];
  }>;
};

export default async function AdminResourcePage({ params, searchParams }: PageProps) {
  const [route, query] = await Promise.all([params, searchParams]);
  const resource = getAdminResource(route.resource);
  if (!resource) notFound();

  const editId = firstString(query.edit);
  const search = normaliseAdminSearch(firstString(query.q));
  const page = parseAdminPage(firstString(query.page));
  const sources = resource.fields.flatMap((field) => field.optionSource ? [field.optionSource] : []);
  const [list, record, options] = await Promise.all([
    loadAdminResourceRows(resource, { page, search }),
    editId ? loadAdminResourceRecord(resource, editId) : Promise.resolve(null),
    loadAdminOptions(sources),
  ]);

  return (
    <AdminResourceEditor
      error={firstString(query.error)}
      errorField={firstString(query.field)}
      notice={firstString(query.notice)}
      options={options}
      pagination={list.pagination}
      record={record}
      resource={resource}
      rows={list.rows}
      search={search}
      showNew={firstString(query.new) === "1"}
    />
  );
}
