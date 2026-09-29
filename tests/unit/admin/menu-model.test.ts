import { describe, it, expect } from "vitest";
import { menuSlug, parseMenuPayload } from "@/lib/admin/menu-model";
const branch = "22222222-2222-4222-8222-222222222222",
  category = "33333333-3333-4333-8333-333333333333";
export function productPayload() {
  return {
    name: "TEST_Çıtır Ürün",
    category_id: category,
    description: "Açıklama",
    image_media_id: "",
    status: "draft",
    is_active: true,
    branches: [
      {
        id: branch,
        price: "85,50",
        is_active: true,
        variants: [{ label: "TEST_50 cl", price: "215", is_active: true }],
      },
    ],
  };
}
describe("unified menu input", () => {
  it("normalizes Turkish names, prices and optional images", () => {
    const p = parseMenuPayload(productPayload());
    expect(menuSlug("Çıtır Şiş İçecek")).toBe("citir-sis-icecek");
    expect(p.branches[0].price_cents).toBe(8550);
    expect(p.branches[0].variants[0].price_cents).toBe(21500);
    expect(p.image_media_id).toBeNull();
  });
  it("rejects missing branches and malformed prices before writing", () => {
    expect(() =>
      parseMenuPayload({ ...productPayload(), branches: [] }),
    ).toThrow("şube");
    const p = productPayload();
    p.branches[0].price = "12,345";
    expect(() => parseMenuPayload(p)).toThrow("85,50");
  });
  it("rejects invalid foreign IDs and oversized options", () => {
    expect(() =>
      parseMenuPayload({ ...productPayload(), category_id: "bad" }),
    ).toThrow();
    const p = productPayload();
    p.branches[0].variants = Array.from({ length: 31 }, () => ({
      label: "TEST_Option",
      price: "10",
      is_active: true,
    }));
    expect(() => parseMenuPayload(p)).toThrow();
  });
});
