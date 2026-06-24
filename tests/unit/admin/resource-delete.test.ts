import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { loadAdminDeleteImpact } from "@/lib/admin/resource-delete";
import { getAdminResource } from "@/lib/admin/resources";

describe("admin silme etkisi", () => {
  it("kategori için engelleyici ürünleri ve silinecek şube bağlantılarını ayrı gösterir", async () => {
    const counts: Record<string, number> = {
      menu_items: 3,
      menu_category_branches: 2,
    };

    const client = {
      from: vi.fn((table: string) => ({
        select: () => ({
          eq: async () => ({ count: counts[table] ?? 0, error: null }),
        }),
      })),
    };

    const resource = getAdminResource("menu-categories");
    expect(resource).not.toBeNull();

    const impact = await loadAdminDeleteImpact(
      resource!,
      "11111111-1111-4111-8111-111111111111",
      client as never,
    );

    expect(impact?.items).toEqual([
      expect.objectContaining({ key: "menu-items", behavior: "block", count: 3 }),
      expect.objectContaining({ key: "menu-category-branches", behavior: "cascade", count: 2 }),
    ]);
  });

  it("kalıcı silmesi korunan kök kaynak için etki sorgusu çalıştırmaz", async () => {
    const client = { from: vi.fn() };
    const resource = getAdminResource("branches");
    expect(resource?.allowHardDelete).toBe(false);
    expect(resource?.hardDeleteProtectionReason).toMatch(/kalıcı silme kapalıdır/i);

    const impact = await loadAdminDeleteImpact(
      resource!,
      "11111111-1111-4111-8111-111111111111",
      client as never,
    );

    expect(impact).toBeNull();
    expect(client.from).not.toHaveBeenCalled();
  });
});
