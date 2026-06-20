import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminResource } from "./resources";

export async function loadAdminResourceRows(resource: AdminResource) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(resource.table)
    .select("*")
    .order(resource.orderField as never, { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Record<string, unknown>[];
}

export async function loadAdminResourceRecord(resource: AdminResource, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(resource.table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as Record<string, unknown> | null;
}
