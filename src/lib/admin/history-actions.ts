"use server";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminResource } from "./resources";
import { loadAdminRecordRevisions } from "./revisions";
import { assertUuid } from "./pricing";
import { recordSystemEvent } from "./system-logs";
export async function loadManagementHistory(key: string, id: string) {
  await requireAdmin();
  const resource = getAdminResource(key);
  if (!resource?.revisionHistory)
    return { ok: false as const, records: [], resource: null };
  try {
    assertUuid(id, "Kayıt");
    return {
      ok: true as const,
      records: await loadAdminRecordRevisions(resource, id),
      resource,
    };
  } catch (error) {
    await recordSystemEvent({
      route: "/admin/site",
      operation: "read",
      entityType: resource.table,
      entityId: id,
      error,
    });
    return { ok: false as const, records: [], resource: null };
  }
}
