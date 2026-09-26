import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    throw new Error("TEST_ Supabase bağlantısı yok");
  },
}));

import { getMenuPublicData } from "@/lib/public-data/menu";

describe("getMenuPublicData fallback", () => {
  it("yeni Alsancak basılı menüsünde olmayan ürünleri fallback içinde göstermez", async () => {
    const result = await getMenuPublicData();
    const data = result.data;

    expect(data.alsancakDraftBeers.map((item) => item.name)).toEqual([
      "Becks",
      "Stella Artois",
      "Efes Pilsen",
    ]);
    expect(data.alsancakOvenItems.map((item) => item.name)).toEqual([
      "Ballı Jambon Sandviç",
      "Pretzel",
    ]);
    expect(data.alsancakDeliItems.some((item) => item.name === "Bira Salatalar" && item.price === "₺200")).toBe(true);
    expect(data.cheesePortions.options).toEqual([]);
    expect(data.beerSalads).toEqual([]);
    // Güncel görsellerin kapsamı dışında kalan bölümler aynen korunur.
    expect(data.coffeeGroups[0].items.some((item) => item.name === "Espresso")).toBe(true);
    expect(data.atakentHotItems.some((item) => item.name === "Tavuk Pane")).toBe(true);
  });

  it("bağlantı hatasında menü içeriğini korur", async () => {
    const result = await getMenuPublicData();

    expect(result.source).toBe("fallback");
    expect(result.data.hasMenuData).toBe(true);
    expect(result.data.branchOptions.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain("Menü verisi");
  });
});
