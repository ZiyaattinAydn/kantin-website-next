import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    throw new Error("TEST_ Supabase bağlantısı yok");
  },
}));

import { getCommonPublicData } from "@/lib/public-data/common";

describe("getCommonPublicData fallback", () => {
  it("Supabase erişilemezse güvenli statik veriyi döndürür", async () => {
    const result = await getCommonPublicData();

    expect(result.source).toBe("fallback");
    expect(result.data.branches.length).toBeGreaterThan(0);
    expect(result.data.siteIdentity.name).toBeTruthy();
    expect(result.issues[0]).toContain("Ortak site verisi");
  });
});
