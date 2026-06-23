import "server-only";

import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type AdminAuditInput = {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Json;
};

async function writeAdminAction(
  input: AdminAuditInput,
): Promise<string | null> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("admin_activity_logs")
    .insert({
      actor_id: input.actorId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      entity_label: input.entityLabel ?? null,
      metadata: input.metadata ?? {},
    });

  return error?.message ?? null;
}

/**
 * Ana işlemi engellemeyen audit kaydı.
 *
 * Kritik olmayan ve geriye dönük uyumluluğun korunması gereken
 * mevcut admin akışlarında kullanılmaya devam eder.
 */
export async function logAdminAction(
  input: AdminAuditInput,
): Promise<boolean> {
  const errorMessage = await writeAdminAction(input);

  if (errorMessage) {
    console.error(
      "Admin audit log kaydedilemedi",
      errorMessage,
    );

    return false;
  }

  return true;
}

/**
 * Audit kaydı oluşmadan devam etmemesi gereken hassas işlemler için kullanılır.
 *
 * Audit yazılamazsa hata fırlatır ve çağıran işlem erişimi durdurmalıdır.
 */
export async function requireAdminActionLog(
  input: AdminAuditInput,
): Promise<void> {
  const errorMessage = await writeAdminAction(input);

  if (!errorMessage) {
    return;
  }

  console.error(
    "Zorunlu admin audit log kaydedilemedi",
    errorMessage,
  );

  throw new Error("ADMIN_AUDIT_WRITE_FAILED");
}