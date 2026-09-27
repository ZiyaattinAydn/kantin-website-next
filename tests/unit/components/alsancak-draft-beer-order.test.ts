import { describe, expect, it } from "vitest";
import { sortAlsancakDraftBeers } from "@/lib/menu/alsancak-draft-beer-order";

describe("Alsancak fıçı bira sırası", () => {
  it("Supabase ters veya karışık sıra döndürse de Efes, Becks, Stella gösterir", () => {
    const rows = [
      { name: "Stella Artois", price: 105 },
      { name: "Becks", price: 100 },
      { name: "Efes Pilsen", price: 95 },
    ];
    expect(sortAlsancakDraftBeers(rows).map(({ name }) => name)).toEqual([
      "Efes Pilsen",
      "Becks",
      "Stella Artois",
    ]);
    expect(rows[0].name).toBe("Stella Artois");
  });

  it("bilinmeyen yeni ürünleri sona ekler ve fiyatları değiştirmez", () => {
    const rows = [
      { name: "Yeni Bira", price: 123 },
      { name: "Becks", price: 100 },
      { name: "Efes Pilsen", price: 95 },
      { name: "Stella Artois", price: 105 },
    ];
    expect(sortAlsancakDraftBeers(rows)).toEqual([
      rows[2], rows[1], rows[3], rows[0],
    ]);
  });
});
