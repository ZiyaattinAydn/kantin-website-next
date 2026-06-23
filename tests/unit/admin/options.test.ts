import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  ADMIN_OPTION_LIMIT,
  loadAdminOptions,
} from "@/lib/admin/options";

describe("admin seçenekleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("yalnız aktif ve yayındaki görselleri sınırlı olarak sorgular", async () => {
    const builder = {
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "TEST_media",
            title: "TEST_ Aktif medya",
            alt_text: "TEST_ alt",
            local_path: null,
            object_path: "TEST.webp",
            source: "storage",
          },
        ],
        error: null,
      }),
    };

    builder.eq.mockReturnValue(builder);
    builder.order.mockReturnValue(builder);

    const select = vi.fn(() => builder);

    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        select,
      })),
    });

    const result = await loadAdminOptions(["media"]);

    expect(builder.eq).toHaveBeenNthCalledWith(
      1,
      "kind",
      "image",
    );

    expect(builder.eq).toHaveBeenNthCalledWith(
      2,
      "is_active",
      true,
    );

    expect(builder.eq).toHaveBeenNthCalledWith(
      3,
      "status",
      "published",
    );

    expect(builder.limit).toHaveBeenCalledWith(
      ADMIN_OPTION_LIMIT,
    );

    expect(result.media).toEqual([
      {
        value: "TEST_media",
        label: "TEST_ Aktif medya",
      },
    ]);
  });

  it("aynı seçenek kaynağını yalnız bir kez sorgular", async () => {
    const builder = {
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "TEST_branch",
            name: "TEST_ Şube",
            code: "TEST",
          },
        ],
        error: null,
      }),
    };

    builder.order.mockReturnValue(builder);

    const select = vi.fn(() => builder);
    const from = vi.fn(() => ({ select }));

    mocks.createClient.mockResolvedValue({
      from,
    });

    const result = await loadAdminOptions([
      "branches",
      "branches",
    ]);

    expect(from).toHaveBeenCalledTimes(1);

    expect(result.branches).toEqual([
      {
        value: "TEST_branch",
        label: "TEST_ Şube (TEST)",
      },
    ]);
  });

  it("Supabase seçeneği yüklenemezse hatayı gizlemez", async () => {
    const builder = {
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: "TEST_ seçenek sorgusu başarısız",
        },
      }),
    };

    builder.order.mockReturnValue(builder);

    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => builder),
      })),
    });

    await expect(
      loadAdminOptions(["categories"]),
    ).rejects.toThrow(
      "TEST_ seçenek sorgusu başarısız",
    );
  });
});