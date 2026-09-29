import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    throw new Error("TEST_ Supabase bağlantısı yok");
  },
}));

import { getMenuPublicData } from "@/lib/public-data/menu";

describe("getMenuPublicData fallback", () => {
  it("Alsancak'ta peynir ve detaylı bira salatalarını, güncel fiyatları ve diğer menüleri korur", async () => {
    const result = await getMenuPublicData();
    const data = result.data;

    expect(data.alsancakDraftBeers.map((item) => item.name)).toEqual([
      "Efes Pilsen",
      "Becks",
      "Stella Artois",
    ]);
    expect(data.alsancakOvenItems.map((item) => item.name)).toEqual([
      "Ballı Jambon Sandviç",
      "Pretzel",
    ]);
    expect(data.alsancakDeliItems.some((item) => item.name === "Bira Salatalar")).toBe(false);
    expect(data.cheesePortions.feature.price).toBe("₺200");
    expect(data.cheesePortions.options.map((item) => item.name)).toEqual([
      "Tulum Peyniri",
      "Eski Kaşar Peyniri",
      "Karışık Küp Peynir",
    ]);
    expect(data.cheesePortions.prices).toEqual([
      { label: "Yarım", price: "₺75" },
      { label: "Tam", price: "₺150" },
    ]);
    expect(data.beerSalads.map((item) => item.name)).toEqual([
      "Pasta Fredda",
      "Patates Salata",
    ]);
    expect(data.beerSalads.every((item) =>
      item.prices.some((price) => price.label === "Tam" && price.price === "₺200")
      && item.prices.some((price) => price.label === "Yarım" && price.price === "₺100")
    )).toBe(true);

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
