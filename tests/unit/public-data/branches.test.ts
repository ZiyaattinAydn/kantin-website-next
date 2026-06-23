import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPublicClient: vi.fn(),
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: mocks.createPublicClient,
}));

import {
  getPublicBranchRows,
  PUBLIC_BRANCH_COLUMNS,
} from "@/lib/public-data/branches";

describe("ortak public şube sorgusu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("yalnız gerekli şube kolonlarını sıralı olarak sorgular", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: "TEST_branch",
          slug: "alsancak",
          code: "ALS",
          name: "TEST_ Şube",
          address_line: "TEST_ Adres",
          district: "Konak",
          city: "İzmir",
          maps_url: "https://maps.example/test",
          short_description: "TEST_ Açıklama",
          phone: null,
          public_email: null,
          opening_hours: {},
          features: [],
          is_active: true,
          sort_order: 1,
        },
      ],
      error: null,
    });

    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));

    mocks.createPublicClient.mockReturnValue({ from });

    const result = await getPublicBranchRows();

    expect(from).toHaveBeenCalledWith("branches");
    expect(select).toHaveBeenCalledWith(PUBLIC_BRANCH_COLUMNS);
    expect(order).toHaveBeenCalledWith("sort_order");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "TEST_branch",
      slug: "alsancak",
      name: "TEST_ Şube",
    });
  });

  it("Supabase hatasını gizlemez", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: "TEST_ şube sorgusu başarısız",
      },
    });

    mocks.createPublicClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({ order })),
      })),
    });

    await expect(getPublicBranchRows()).rejects.toMatchObject({
      message: "TEST_ şube sorgusu başarısız",
    });
  });
});