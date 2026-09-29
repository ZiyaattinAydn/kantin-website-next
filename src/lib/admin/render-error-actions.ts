"use server";
import { requireAdmin } from "@/lib/auth/admin";
import { recordSystemEvent } from "./system-logs";
export async function reportAdminRenderError(route: string) {
  const admin = await requireAdmin();
  await recordSystemEvent({
    actorId: admin.userId,
    route,
    operation: "read",
    error: { code: "UNKNOWN" },
  });
}
