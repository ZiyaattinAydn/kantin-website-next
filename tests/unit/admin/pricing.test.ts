import { describe, expect, it } from "vitest";
import {
  assertUuid,
  formatTryPriceInput,
  parseTryPrice,
  pricingResultPath,
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

  it("sonuç mesajını mevcut filtreleri bozmadan ekler", () => {
    expect(pricingResultPath("/admin/pricing?q=latte&page=2", "notice", "Tamam"))
      .toBe("/admin/pricing?q=latte&page=2&notice=Tamam");
  });
});
