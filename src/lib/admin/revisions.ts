import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import type { AdminResource } from "./resources";

const ADMIN_REVISION_LIMIT = 20;

export type AdminRecordRevision = {
  id: string;
  actorId: string | null;
  operation: "insert" | "update" | "delete";
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  changedFields: string[];
  createdAt: string;
};

type RevisionRow = {
  id: string;
  actor_id: string | null;
  operation: "insert" | "update" | "delete";
  before_data: Json | null;
  after_data: Json | null;
  changed_fields: Json;
  created_at: string;
};

function jsonObject(value: Json | null): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function fieldNames(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export function supportsAdminRevisionHistory(resource: AdminResource): boolean {
  return resource.revisionHistory === true;
}

export async function loadAdminRecordRevisions(
  resource: AdminResource,
  entityId: string,
): Promise<AdminRecordRevision[]> {
  if (!supportsAdminRevisionHistory(resource) || !entityId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_record_revisions")
    .select("id,actor_id,operation,before_data,after_data,changed_fields,created_at")
    .eq("entity_type", resource.table)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(ADMIN_REVISION_LIMIT);

  if (error) throw new Error("Sürüm geçmişi okunamadı.");

  return ((data ?? []) as RevisionRow[]).map((row) => ({
    id: row.id,
    actorId: row.actor_id,
    operation: row.operation,
    beforeData: jsonObject(row.before_data),
    afterData: jsonObject(row.after_data),
    changedFields: fieldNames(row.changed_fields),
    createdAt: row.created_at,
  }));
}
