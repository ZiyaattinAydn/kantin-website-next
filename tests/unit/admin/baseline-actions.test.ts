import { beforeEach, describe, it, expect, vi } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  log: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: m.auth }));
vi.mock("@/lib/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/admin/system-logs", () => ({ recordSystemEvent: m.log }));
vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
import {
  restoreDeliveryBaseline,
  loadDeliveryBaselineReview,
} from "@/lib/admin/baseline-actions";
const target = {
  entity_type: "site_settings" as const,
  id: "11111111-1111-4111-8111-111111111111",
  baseline_key: "site.identity",
  updated_at: "2026-09-30T00:00:00Z",
};
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({ userId: target.id });
  m.log.mockResolvedValue(undefined);
});
describe("delivery baseline action boundaries", () => {
  it("requires authorization before any preview or restore", async () => {
    m.auth.mockRejectedValue(new Error("forbidden"));
    await expect(loadDeliveryBaselineReview()).rejects.toThrow("forbidden");
    await expect(
      restoreDeliveryBaseline([target], "İLK TESLİME DÖN"),
    ).rejects.toThrow("forbidden");
    expect(m.client).not.toHaveBeenCalled();
  });
  it("rejects weak confirmation without any database write", async () => {
    expect((await restoreDeliveryBaseline([target], "EVET")).ok).toBe(false);
    expect(m.client).not.toHaveBeenCalled();
  });
  it("sends exact reviewed versions in one atomic restore RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    m.client.mockResolvedValue({ rpc });
    expect(
      (await restoreDeliveryBaseline([target], "İLK TESLİME DÖN")).ok,
    ).toBe(true);
    expect(rpc).toHaveBeenCalledWith("restore_admin_delivery_baseline", {
      p_changes: [target],
      p_confirmation: "İLK TESLİME DÖN",
    });
    expect(m.revalidate).toHaveBeenCalledWith("/admin/site");
  });
  it("keeps a stale restore a visible safe conflict", async () => {
    m.client.mockResolvedValue({
      rpc: vi
        .fn()
        .mockResolvedValue({
          error: { code: "40001", message: "token=SECRET" },
        }),
    });
    const r = await restoreDeliveryBaseline([target], "İLK TESLİME DÖN");
    expect(r).toMatchObject({
      ok: false,
      message: expect.stringContaining("yeniden inceleyip"),
    });
    expect(JSON.stringify(r)).not.toContain("SECRET");
    expect(m.revalidate).not.toHaveBeenCalled();
  });
  it("does not include private tables in a restore scope", async () => {
    const targets = [
      { ...target, entity_type: "job_applications" },
    ] as unknown as Parameters<typeof restoreDeliveryBaseline>[0];
    expect((await restoreDeliveryBaseline(targets, "İLK TESLİME DÖN")).ok).toBe(
      false,
    );
    expect(m.client).not.toHaveBeenCalled();
  });
});
