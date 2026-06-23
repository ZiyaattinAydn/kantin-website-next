import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  },
}));

vi.mock("@/lib/auth/admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { saveAdminResource } from "@/lib/admin/resource-actions";

describe("saveAdminResource", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireAdmin.mockResolvedValue({
      userId: "TEST_admin",
      role: "admin",
    });
  });

  it("para ve checkbox alanlarını veritabanı payload'una dönüştürür", async () => {
    let inserted: Record<string, unknown> | undefined;

    mocks.createClient.mockResolvedValue({
      from: () => ({
        insert: (payload: Record<string, unknown>) => {
          inserted = payload;

          return {
            select: () => ({
              single: async () => ({
                data: {
                  id: "TEST_row",
                  ...payload,
                },
                error: null,
              }),
            }),
          };
        },
      }),
    });

    const formData = new FormData();

    formData.set("_resource", "menu-item-branches");
    formData.set(
      "menu_item_id",
      "11111111-1111-4111-8111-111111111111",
    );
    formData.set(
      "branch_id",
      "22222222-2222-4222-8222-222222222222",
    );
    formData.set("price_cents", "12,34");
    formData.set("price_label", "TEST_fiyat");
    formData.set("is_active", "on");
    formData.set("sort_order", "2");

    await expect(saveAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/menu-item-branches?notice=",
    );

    expect(inserted).toMatchObject({
      price_cents: 1234,
      is_active: true,
      sort_order: 2,
    });

    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
  });

  it("geçersiz JSON'u veritabanına gitmeden reddeder", async () => {
    const formData = new FormData();

    formData.set("_resource", "content-blocks");
    formData.set(
      "page_id",
      "33333333-3333-4333-8333-333333333333",
    );
    formData.set("key", "TEST_block");
    formData.set("block_type", "hero");
    formData.set("content", "{gecersiz");
    formData.set("status", "draft");
    formData.set("sort_order", "0");

    await expect(saveAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/content-blocks?error=",
    );

    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("doğrulama hatasını alan adıyla geri taşır", async () => {
    const formData = new FormData();

    formData.set("_resource", "menu-categories");
    formData.set("name", "TEST_ Kategori");
    formData.set("slug", "Geçersiz Slug");
    formData.set("display_type", "cards");
    formData.set("status", "draft");
    formData.set("sort_order", "0");

    await expect(
      saveAdminResource(formData),
    ).rejects.toThrow(/field=slug/);

    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("site ayarı yazımını DB trigger audit akışına bırakır", async () => {
    let inserted: Record<string, unknown> | undefined;

    mocks.createClient.mockResolvedValue({
      from: () => ({
        insert: (payload: Record<string, unknown>) => {
          inserted = payload;

          return {
            select: () => ({
              single: async () => ({
                data: {
                  id: "44444444-4444-4444-8444-444444444444",
                  ...payload,
                },
                error: null,
              }),
            }),
          };
        },
      }),
    });

    const formData = new FormData();

    formData.set("_resource", "site-settings");
    formData.set("key", "TEST_setting");
    formData.set("value", '{"enabled":true}');
    formData.set("description", "TEST site ayarı");
    formData.set("is_public", "on");
    formData.set("status", "draft");
    formData.set("is_active", "on");
    formData.set("sort_order", "99");

    await expect(saveAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/site-settings?notice=",
    );

    expect(inserted).toMatchObject({
      key: "TEST_setting",
      value: {
        enabled: true,
      },
      description: "TEST site ayarı",
      is_public: true,
      status: "draft",
      is_active: true,
      sort_order: 99,
    });

  });
});
