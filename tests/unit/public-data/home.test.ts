import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    throw new Error("TEST_ Supabase bağlantısı yok");
  },
}));

import { getHomePublicData } from "@/lib/public-data/home";

describe("getHomePublicData fallback", () => {
  it("bağlantı hatasında ana sayfayı boş bırakmaz", async () => {
    const result = await getHomePublicData();

    expect(result.source).toBe("fallback");
    expect(result.data.hero.title.length).toBeGreaterThanOrEqual(2);
    expect(result.data.menuBranches.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain("Ana sayfa verisi");
  });
});
