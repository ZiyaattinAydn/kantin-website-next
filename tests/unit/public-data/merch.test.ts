import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    throw new Error("TEST_ Supabase bağlantısı yok");
  },
}));

import { getMenuMerchPublicData } from "@/lib/public-data/merch";

describe("getMenuMerchPublicData fallback", () => {
  it("menü rotası için etkinlik/Instagram sorgusuna ihtiyaç duymadan fallback döner", async () => {
    const result = await getMenuMerchPublicData();

    expect(result.source).toBe("fallback");
    expect(result.data.merchProducts.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain("Merch verisi");
  });
});
