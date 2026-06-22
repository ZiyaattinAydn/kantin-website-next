import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    throw new Error("TEST_ Supabase bağlantısı yok");
  },
}));

import { getMenuPublicData } from "@/lib/public-data/menu";

describe("getMenuPublicData fallback", () => {
  it("bağlantı hatasında menü içeriğini korur", async () => {
    const result = await getMenuPublicData();

    expect(result.source).toBe("fallback");
    expect(result.data.hasMenuData).toBe(true);
    expect(result.data.branchOptions.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain("Menü verisi");
  });
});
