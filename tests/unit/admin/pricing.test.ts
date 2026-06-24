import { describe, expect, it } from "vitest";
import {
  assertUuid,
  formatTryPriceInput,
  hasMissingBranchPrice,
  hasPublicPlacementInBranchScope,
  parseTryPrice,
  pricingResultPath,
  resolveBranchDisplayPrice,
  resolveProductMenuState,
  safePricingReturnPath,
} from "@/lib/admin/pricing";

describe("admin fiyat yardımcıları", () => {
  it("Türkçe ondalık fiyatı kuruşa çevirir", () => {
    expect(parseTryPrice("85")).toBe(8500);
    expect(parseTryPrice("85,50")).toBe(8550);
    expect(parseTryPrice(" ₺ 99.90 ")).toBe(9990);
    expect(parseTryPrice("", true)).toBeNull();
  });

  it("geçersiz veya negatif fiyatı reddeder", () => {
    expect(() => parseTryPrice("-1")).toThrow("85 veya 85,50");
    expect(() => parseTryPrice("12,345")).toThrow("85 veya 85,50");
    expect(() => parseTryPrice("")).toThrow("Fiyat zorunlu");
  });

  it("kuruş değerini form girdisine uygun biçimler", () => {
    expect(formatTryPriceInput(8500)).toBe("85");
    expect(formatTryPriceInput(8550)).toBe("85,50");
    expect(formatTryPriceInput(null)).toBe("");
  });


  it("şube özetinde aktif fiyatlar arasından en yüksek olanı gösterir", () => {
    expect(
      resolveBranchDisplayPrice(
        { id: "price-a", price_cents: null },
        [
          { menu_item_branch_id: "price-a", label: "33 cl", price_cents: 23000, is_active: true },
          { menu_item_branch_id: "price-a", label: "50 cl", price_cents: 25000, is_active: true },
          { menu_item_branch_id: "price-a", label: "Pasif", price_cents: 99900, is_active: false },
        ],
      ),
    ).toEqual({ priceCents: 25000, source: "variant", variantLabel: "50 cl" });

    expect(
      resolveBranchDisplayPrice(
        { id: "price-b", price_cents: 24000 },
        [],
      ),
    ).toEqual({ priceCents: 24000, source: "branch", variantLabel: null });
  });

  it("şube filtresinde yalnız görüntülenen şubelerin menü bağlantısını dikkate alır", () => {
    const placements = [
      { branch_id: "alsancak", isPublic: true },
      { branch_id: "atakent", isPublic: false },
    ];

    expect(
      hasPublicPlacementInBranchScope(
        placements,
        ["atakent"],
        (placement) => placement.isPublic,
      ),
    ).toBe(false);

    expect(
      hasPublicPlacementInBranchScope(
        placements,
        ["alsancak"],
        (placement) => placement.isPublic,
      ),
    ).toBe(true);
  });

  it("ürün yalnız gerçekten public menüdeyse Yayında gösterir", () => {
    expect(resolveProductMenuState({
      productStatus: "published",
      productIsActive: true,
      categoryIsPublic: true,
      hasPublicBranchPlacement: true,
    })).toEqual({ label: "Yayında", tone: "live" });

    expect(resolveProductMenuState({
      productStatus: "published",
      productIsActive: true,
      categoryIsPublic: true,
      hasPublicBranchPlacement: false,
    })).toEqual({ label: "Menüde değil", tone: "unlisted" });

    expect(resolveProductMenuState({
      productStatus: "published",
      productIsActive: true,
      categoryIsPublic: false,
      hasPublicBranchPlacement: true,
    })).toEqual({ label: "Menüde değil", tone: "unlisted" });

    expect(resolveProductMenuState({
      productStatus: "draft",
      productIsActive: true,
      categoryIsPublic: true,
      hasPublicBranchPlacement: true,
    })).toEqual({ label: "Taslak", tone: "passive" });
  });

  it("yalnız UUID ve güvenli pricing dönüş yolunu kabul eder", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(assertUuid(id, "Ürün")).toBe(id);
    expect(() => assertUuid("TEST_item", "Ürün")).toThrow("Ürün geçersiz");
    expect(
      safePricingReturnPath("/admin/pricing?q=latte&category=TEST&unknown=drop"),
    ).toBe("/admin/pricing?q=latte&category=TEST");
    expect(safePricingReturnPath("https://example.com/admin/pricing")).toBe(
      "/admin/pricing",
    );
  });


  it("fiyatı eksik ürün filtresini ana veya aktif varyant fiyatına göre hesaplar", () => {
    const prices = [
      { id: "price-a", menu_item_id: "item-1", branch_id: "branch-a", price_cents: 8500 },
      { id: "price-b", menu_item_id: "item-1", branch_id: "branch-b", price_cents: null },
      { id: "price-c", menu_item_id: "item-2", branch_id: "branch-b", price_cents: 9000 },
    ];
    const variants = [
      { menu_item_branch_id: "price-b", price_cents: 23000, is_active: true },
      { menu_item_branch_id: "price-b", price_cents: 25000, is_active: true },
    ];

    expect(hasMissingBranchPrice("item-1", ["branch-a"], prices, variants)).toBe(false);
    expect(hasMissingBranchPrice("item-1", ["branch-a", "branch-b"], prices, variants)).toBe(false);
    expect(hasMissingBranchPrice("item-2", ["branch-a", "branch-b"], prices, variants)).toBe(true);
    expect(hasMissingBranchPrice("item-1", ["branch-a", "branch-b"], prices, [])).toBe(true);
  });

  it("sonuç mesajını mevcut filtreleri bozmadan ekler", () => {
    expect(pricingResultPath("/admin/pricing?q=latte&page=2", "notice", "Tamam"))
      .toBe("/admin/pricing?q=latte&page=2&notice=Tamam");
  });
});
