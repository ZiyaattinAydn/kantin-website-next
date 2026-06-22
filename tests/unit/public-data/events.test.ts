import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => {
    throw new Error("TEST_ Supabase bağlantısı yok");
  },
}));

import { getEventPublicData } from "@/lib/public-data/events";

describe("getEventPublicData fallback", () => {
  it("bağlantı hatasında şube bilgilerini koruyup etkinlikleri boş döndürür", async () => {
    const result = await getEventPublicData();

    expect(result.source).toBe("fallback");
    expect(result.data.events).toEqual([]);
    expect(result.data.branchLabels.alsancak).toBeTruthy();
    expect(result.issues[0]).toContain("Etkinlik verisi");
  });
});
