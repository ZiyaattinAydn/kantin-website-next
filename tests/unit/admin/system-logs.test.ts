import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({ client: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: m.client }));
import { sanitizeSystemEvent } from "@/lib/admin/log-safety";
import { recordSystemEvent, loadSystemHealth } from "@/lib/admin/system-logs";
import { friendlyAdminError } from "@/lib/admin/user-error";
beforeEach(() => vi.clearAllMocks());
describe("technical log privacy", () => {
  it("omits all raw details, PII, secrets and stack traces", () => {
    const s = sanitizeSystemEvent({
      route: "/admin/menu?token=SECRET",
      operation: "save",
      entityType: "menu_items",
      error: {
        code: "23505",
        message: "email=private@example.test",
        details: "cookie=SECRET",
        stack: "STACK",
        token: "SECRET",
      },
    });
    expect(s.route).toBe("/admin/menu");
    expect(s.error_code).toBe("23505");
    expect(JSON.stringify(s)).not.toMatch(/SECRET|private@|STACK|cookie/);
  });
  it("rejects arbitrary codes and context strings", () => {
    const s = sanitizeSystemEvent({
      route: "/admin/private@example.test",
      operation: "secret-value",
      entityType: "secret-value",
      entityId: "secret-value",
      error: { code: "SECRET" },
    });
    expect(s).toMatchObject({
      route: "/admin",
      operation: "save",
      entity_type: "system",
      entity_id: null,
      error_code: "UNKNOWN",
    });
  });
  it("uses the database current actor and a closed RPC payload", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    m.client.mockResolvedValue({ rpc });
    await recordSystemEvent({
      route: "/admin/menu",
      operation: "save",
      error: new Error("SECRET"),
    });
    expect(rpc).toHaveBeenCalledWith(
      "record_admin_system_event",
      expect.objectContaining({ p_error_code: "UNKNOWN" }),
    );
    expect(JSON.stringify(rpc.mock.calls)).not.toContain("SECRET");
  });
  it("does not throw when logging is unavailable and keeps fallback output safe", async () => {
    m.client.mockRejectedValue(new Error("SECRET"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await expect(
      recordSystemEvent({
        route: "/admin/menu",
        operation: "save",
        error: new Error("SECRET"),
      }),
    ).resolves.toBeUndefined();
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("SECRET");
  });
  it("does not report healthy when logs cannot be read", async () => {
    m.client.mockRejectedValue(new Error("offline"));
    expect(await loadSystemHealth()).toEqual({ count: null });
  });
  it("does not expose arbitrary errors to users", () => {
    expect(friendlyAdminError(new Error("api_key=SECRET"))).not.toContain(
      "SECRET",
    );
  });
});
