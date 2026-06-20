import { notFound } from "next/navigation";
import AdminResourceEditor from "@/components/admin/crud/AdminResourceEditor";
import { firstString } from "@/lib/admin/format";
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
    notice?: string | string[];
    error?: string | string[];
  }>;
};

export default async function AdminResourcePage({ params, searchParams }: PageProps) {
  const [route, query] = await Promise.all([params, searchParams]);
  const resource = getAdminResource(route.resource);
  if (!resource) notFound();

  const editId = firstString(query.edit);
  const sources = resource.fields.flatMap((field) => field.optionSource ? [field.optionSource] : []);
  const [rows, record, options] = await Promise.all([
    loadAdminResourceRows(resource),
    editId ? loadAdminResourceRecord(resource, editId) : Promise.resolve(null),
    loadAdminOptions(sources),
  ]);

  return (
    <AdminResourceEditor
      error={firstString(query.error)}
      notice={firstString(query.notice)}
      options={options}
      record={record}
      resource={resource}
      rows={rows}
      search={firstString(query.q) ?? ""}
      showNew={firstString(query.new) === "1"}
    />
  );
}
