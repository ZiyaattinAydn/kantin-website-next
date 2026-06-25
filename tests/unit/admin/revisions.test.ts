import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { loadAdminRecordRevisions, supportsAdminRevisionHistory } from "@/lib/admin/revisions";
import { getAdminResource } from "@/lib/admin/resources";

describe("admin revision data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("yalnız kritik kaynaklarda sürüm geçmişini etkinleştirir", () => {
    const branches = getAdminResource("branches");
    const settings = getAdminResource("site-settings");
    const menuItems = getAdminResource("menu-items");

    if (!branches || !settings || !menuItems) throw new Error("TEST_ resource bulunamadı");

    expect(supportsAdminRevisionHistory(branches)).toBe(true);
    expect(supportsAdminRevisionHistory(settings)).toBe(true);
    expect(supportsAdminRevisionHistory(menuItems)).toBe(false);
  });

  it("kaydın son 20 snapshotını yeni tarihten eskiye yükler", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          actor_id: "22222222-2222-4222-8222-222222222222",
          operation: "update",
          before_data: { id: "record", title: "Önce" },
          after_data: { id: "record", title: "Sonra" },
          changed_fields: ["title", 12, null],
          created_at: "2026-06-25T10:00:00.000Z",
        },
      ],
      error: null,
    });
    const order = vi.fn(() => ({ limit }));
    const secondEq = vi.fn(() => ({ order }));
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const select = vi.fn(() => ({ eq: firstEq }));
    const from = vi.fn(() => ({ select }));
    mocks.createClient.mockResolvedValue({ from });

    const resource = getAdminResource("site-pages");
    if (!resource) throw new Error("TEST_ resource bulunamadı");

    const revisions = await loadAdminRecordRevisions(resource, "record");

    expect(from).toHaveBeenCalledWith("admin_record_revisions");
    expect(firstEq).toHaveBeenCalledWith("entity_type", "site_pages");
    expect(secondEq).toHaveBeenCalledWith("entity_id", "record");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(20);
    expect(revisions).toEqual([
      expect.objectContaining({
        id: "11111111-1111-4111-8111-111111111111",
        changedFields: ["title"],
        beforeData: { id: "record", title: "Önce" },
      }),
    ]);
  });

  it("normal kaynaklarda veritabanına sorgu göndermeden boş geçmiş döndürür", async () => {
    const resource = getAdminResource("menu-items");
    if (!resource) throw new Error("TEST_ resource bulunamadı");

    await expect(loadAdminRecordRevisions(resource, "record")).resolves.toEqual([]);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
