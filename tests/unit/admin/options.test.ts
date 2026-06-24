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
  ADMIN_OPTION_PAGE_SIZE,
  loadAdminOptions,
} from "@/lib/admin/options";

describe("admin seçenekleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("200 kayıt sınırı olmadan bütün aktif medya seçeneklerini sayfalayarak yükler", async () => {
    const firstPage = Array.from(
      { length: ADMIN_OPTION_PAGE_SIZE },
      (_, index) => ({
        id: `TEST_media_${index}`,
        title: `TEST_ Medya ${index}`,
        alt_text: null,
        local_path: null,
        object_path: `${index}.webp`,
        source: "storage",
      }),
    );

    const builder = {
      eq: vi.fn(),
      order: vi.fn(),
      range: vi
        .fn()
        .mockResolvedValueOnce({ data: firstPage, error: null })
        .mockResolvedValueOnce({
          data: [
            {
              id: "TEST_media_last",
              title: "TEST_ Son medya",
              alt_text: null,
              local_path: null,
              object_path: "last.webp",
              source: "storage",
            },
          ],
          error: null,
        }),
    };

    builder.eq.mockReturnValue(builder);
    builder.order.mockReturnValue(builder);

    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => builder),
      })),
    });

    const result = await loadAdminOptions(["media"]);

    expect(builder.eq).toHaveBeenNthCalledWith(1, "kind", "image");
    expect(builder.eq).toHaveBeenNthCalledWith(2, "is_active", true);
    expect(builder.eq).toHaveBeenNthCalledWith(3, "status", "published");
    expect(builder.range).toHaveBeenNthCalledWith(
      1,
      0,
      ADMIN_OPTION_PAGE_SIZE - 1,
    );
    expect(builder.range).toHaveBeenNthCalledWith(
      2,
      ADMIN_OPTION_PAGE_SIZE,
      ADMIN_OPTION_PAGE_SIZE * 2 - 1,
    );
    expect(result.media).toHaveLength(ADMIN_OPTION_PAGE_SIZE + 1);
    expect(result.media?.at(-1)).toEqual({
      value: "TEST_media_last",
      label: "TEST_ Son medya",
    });
  });

  it("aynı seçenek kaynağını yalnız bir kez sorgular", async () => {
    const builder = {
      order: vi.fn(),
      range: vi.fn().mockResolvedValue({
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

    mocks.createClient.mockResolvedValue({ from });

    const result = await loadAdminOptions([
      "branches",
      "branches",
    ]);

    expect(from).toHaveBeenCalledTimes(1);
    expect(builder.range).toHaveBeenCalledTimes(1);
    expect(result.branches).toEqual([
      {
        value: "TEST_branch",
        label: "TEST_ Şube (TEST)",
      },
    ]);
  });

  it("Supabase seçenek sayfası yüklenemezse hatayı gizlemez", async () => {
    const builder = {
      order: vi.fn(),
      range: vi.fn().mockResolvedValue({
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
    ).rejects.toThrow("TEST_ seçenek sorgusu başarısız");
  });
});
