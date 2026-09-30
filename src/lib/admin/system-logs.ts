import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSystemEvent, EXPECTED_LOG_CODES } from "./log-safety";
export async function recordSystemEvent(
  input: Parameters<typeof sanitizeSystemEvent>[0],
): Promise<void> {
  const safe = sanitizeSystemEvent(input);
  try {
    const client: SupabaseClient = await createClient();
    const { error } = await client.rpc("record_admin_system_event", {
      p_route: safe.route,
      p_operation: safe.operation,
      p_entity_type: safe.entity_type,
      p_entity_id: safe.entity_id,
      p_level: safe.level,
      p_error_code: safe.error_code,
      p_request_id: safe.request_id,
    });
    if (!error) return;
  } catch {
    /* Logging must never replace the original result or leak raw exceptions. */
  }
  console.error("admin_system_event_fallback", JSON.stringify(safe));
}
export async function loadSystemHealth(): Promise<{ count: number | null }> {
  try {
    const client: SupabaseClient = await createClient();
    const { count, error } = await client
      .from("admin_system_logs")
      .select("id", { head: true, count: "exact" })
      .gte("created_at", new Date(Date.now() - 86400000).toISOString())
      .in("level", ["error", "critical"])
      .not("error_code", "in", `(${EXPECTED_LOG_CODES.join(",")})`);
    return { count: error ? null : (count ?? 0) };
  } catch {
    return { count: null };
  }
}
