import "server-only";

import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export async function logAdminAction(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Json;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("admin_activity_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    entity_label: input.entityLabel ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("Admin audit log kaydedilemedi", error.message);
  }
}
