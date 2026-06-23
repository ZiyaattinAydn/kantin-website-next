import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPublicClient: vi.fn(),
  getPublicBranchRows: vi.fn(),
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: mocks.createPublicClient,
}));

vi.mock("@/lib/public-data/branches", () => ({
  getPublicBranchRows: mocks.getPublicBranchRows,
}));

vi.mock("@/lib/public-data/helpers", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/public-data/helpers")>();
  return {
    ...original,
    getPageBlocks: vi.fn().mockResolvedValue(new Map()),
  };
});

import { getMenuPublicData } from "@/lib/public-data/menu";

describe("dinamik menü şubeleri", () => {
  it("üçüncü şube ve yeni kategoriyi slug sabiti olmadan public modele taşır", async () => {
    mocks.getPublicBranchRows.mockResolvedValue([{
      id: "00000000-0000-4000-8000-000000000301",
      slug: "bostanli",
      code: "BOS",
      name: "TEST_ Bostanlı",
      address_line: "TEST_ Adres",
      district: "Bostanlı",
      city: "İzmir",
      maps_url: "https://maps.example/bostanli",
      short_description: "TEST_ Üçüncü şube menüsü",
      phone: null,
      public_email: null,
      opening_hours: {},
      features: ["TEST_ Bahçe"],
      is_active: true,
      sort_order: 3,
    }]);

    const tableResults = {
      menu_categories: {
        data: [{
          id: "00000000-0000-4000-8000-000000000302",
          slug: "test-yeni-kategori",
          name: "TEST_ Yeni kategori",
          description: "TEST_ Dinamik kategori",
          display_type: "cards",
          metadata: {},
          sort_order: 1,
        }],
        error: null,
      },
      menu_category_branches: {
        data: [{
          category_id: "00000000-0000-4000-8000-000000000302",
          branch_id: "00000000-0000-4000-8000-000000000301",
          display_name: "TEST_ Şubeye özel kategori",
          description: null,
          sort_order: 1,
        }],
        error: null,
      },
      menu_items: {
        data: [{
          id: "00000000-0000-4000-8000-000000000303",
          category_id: "00000000-0000-4000-8000-000000000302",
          slug: "test-urun",
          name: "TEST_ Ürün",
          description: "TEST_ Ürün açıklaması",
          detail: null,
          highlight_text: null,
          allergen_text: null,
          badges: [],
          image_media_id: null,
          metadata: {},
          sort_order: 1,
        }],
        error: null,
      },
      menu_item_branches: {
        data: [{
          id: "00000000-0000-4000-8000-000000000304",
          menu_item_id: "00000000-0000-4000-8000-000000000303",
          branch_id: "00000000-0000-4000-8000-000000000301",
          price_cents: 12500,
          price_label: null,
          price_note: null,
          availability_note: "TEST_ Akşam servisi",
          sort_order: 1,
        }],
        error: null,
      },
      menu_item_variants: { data: [], error: null },
    };

    const from = vi.fn((table: keyof typeof tableResults) => ({
      select: () => ({
        order: async () => tableResults[table],
      }),
    }));
    mocks.createPublicClient.mockReturnValue({ from });

    const result = await getMenuPublicData();

    expect(result.source).toBe("supabase");
    expect(result.data.branchOptions).toEqual([
      expect.objectContaining({
        id: "bostanli",
        code: "BOS",
        label: "TEST_ Bostanlı",
      }),
    ]);
    expect(result.data.branches[0]).toMatchObject({
      slug: "bostanli",
      categories: [{
        slug: "test-yeni-kategori",
        name: "TEST_ Şubeye özel kategori",
        displayType: "cards",
        items: [{
          slug: "test-urun",
          price: "₺125",
          availabilityNote: "TEST_ Akşam servisi",
        }],
      }],
    });
  });
});
