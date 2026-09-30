import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ client: vi.fn(), branches: vi.fn() }));
vi.mock("@/lib/supabase/public", () => ({ createPublicClient: m.client }));
vi.mock("@/lib/public-data/branches", () => ({
  getPublicBranchRows: m.branches,
}));
vi.mock("@/lib/public-data/helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/public-data/helpers")>()),
  getPageBlocks: vi.fn().mockResolvedValue(new Map()),
}));
import { getMenuPublicData } from "@/lib/public-data/menu";
const branches = [
  { id: "als", slug: "alsancak", name: "TEST_ALS", code: "ALS", features: [] },
  { id: "ata", slug: "atakent", name: "TEST_ATA", code: "ATA", features: [] },
];
function fixture(visible: string[], parent = true) {
  const categories = [
    {
      id: "food",
      slug: "fritoz",
      name: "TEST_Food",
      display_type: "cards",
      metadata: {},
      sort_order: 10,
    },
  ];
  const table: Record<string, unknown[]> = {
    menu_categories: categories,
    menu_category_branches: parent
      ? visible.map((branch_id) => ({
          category_id: "food",
          branch_id,
          sort_order: 10,
          metadata: {},
        }))
      : [],
    menu_items: [
      {
        id: "item",
        category_id: "food",
        slug: "test-food",
        name: "TEST_Food",
        badges: [],
        metadata: {},
        sort_order: 0,
        image_media_id: null,
      },
    ],
    menu_item_branches: visible.map((branch_id) => ({
      id: `link-${branch_id}`,
      menu_item_id: "item",
      branch_id,
      price_cents: 10000,
      sort_order: 0,
    })),
    menu_item_variants: [],
  };
  m.branches.mockResolvedValue(branches);
  m.client.mockReturnValue({
    from: vi.fn((name: string) => ({
      select: () => ({
        order: async () => ({ data: table[name] ?? [], error: null }),
      }),
    })),
  });
}
beforeEach(() => vi.clearAllMocks());
describe("QA2 intentional menu closure", () => {
  it.each([
    { visible: ["als"] },
    { visible: ["ata"] },
    { visible: [] },
    { visible: ["als", "ata"] },
  ])(
    "only offers branches with effective menu entries: %j",
    async ({ visible }) => {
      fixture(visible);
      const r = await getMenuPublicData();
      expect(r.data.branchOptions.map((o) => o.id)).toEqual(
        visible.map((id) => (id === "als" ? "alsancak" : "atakent")),
      );
      expect(r.source).toBe(visible.length ? "supabase" : "empty");
      expect(r.data.cheesePortions.feature.name).toBe("");
      expect(r.data.cheesePortions.prices).toEqual([]);
      expect(r.data.cheesePortions.options).toEqual([]);
      expect(r.data.beerSalads).toEqual([]);
      expect(r.data.alsancakWine.name).toBe("");
      expect(r.data.atakentDessert.name).toBe("");
      expect(r.data.coffeeGroups.every((g) => !g.items.length)).toBe(true);
    },
  );
  it("does not expose placements when the parent category branch is missing", async () => {
    fixture(["als", "ata"], false);
    const r = await getMenuPublicData();
    expect(r.source).toBe("empty");
    expect(r.data.branches).toEqual([]);
  });
  it("can reopen the same menu without changing child content", async () => {
    fixture([], false);
    expect((await getMenuPublicData()).data.hasMenuData).toBe(false);
    fixture(["als"]);
    expect((await getMenuPublicData()).data.alsancakFryerItems[0].name).toBe(
      "TEST_Food",
    );
  });
  it("keeps query errors distinct from successful empty results", async () => {
    fixture([]);
    expect((await getMenuPublicData()).source).toBe("empty");
    m.client.mockImplementation(() => {
      throw new Error("offline");
    });
    const r = await getMenuPublicData();
    expect(r.source).toBe("fallback");
    expect(r.issues.length).toBeGreaterThan(0);
    expect(r.data.cheesePortions.feature.name).not.toBe("");
  });
});
