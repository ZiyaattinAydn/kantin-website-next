import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { loadAdminOptions } from "@/lib/admin/options";

describe("admin medya seçenekleri", () => {
  beforeEach(() => vi.clearAllMocks());

  it("yalnız aktif ve yayındaki görselleri sorgular", async () => {
    const builder = {
      eq: vi.fn(),
      order: vi.fn().mockResolvedValue({
        data: [{
          id: "TEST_media",
          title: "TEST_ Aktif medya",
          alt_text: "TEST_ alt",
          local_path: null,
          object_path: "TEST.webp",
          source: "storage",
        }],
      }),
    };
    builder.eq.mockReturnValue(builder);
    const select = vi.fn(() => builder);
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    const result = await loadAdminOptions(["media"]);

    expect(builder.eq).toHaveBeenNthCalledWith(1, "kind", "image");
    expect(builder.eq).toHaveBeenNthCalledWith(2, "is_active", true);
    expect(builder.eq).toHaveBeenNthCalledWith(3, "status", "published");
    expect(result.media).toEqual([
      { value: "TEST_media", label: "TEST_ Aktif medya" },
    ]);
  });
});
