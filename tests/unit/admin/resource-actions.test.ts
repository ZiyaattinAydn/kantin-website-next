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

import {
  deleteAdminResource,
  saveAdminResource,
} from "@/lib/admin/resource-actions";

function createInsertClient(maxSort: number | null = null) {
  let inserted: Record<string, unknown> | undefined;
  const orderEq = vi.fn();
  const maybeSingle = vi.fn().mockResolvedValue({
    data: maxSort === null ? null : { sort_order: maxSort },
    error: null,
  });
  const orderQuery = {
    order: vi.fn(),
    limit: vi.fn(),
    eq: orderEq,
    is: vi.fn(),
    maybeSingle,
  };
  orderQuery.order.mockReturnValue(orderQuery);
  orderQuery.limit.mockReturnValue(orderQuery);
  orderQuery.eq.mockReturnValue(orderQuery);
  orderQuery.is.mockReturnValue(orderQuery);

  const insert = vi.fn((payload: Record<string, unknown>) => {
    inserted = payload;
    return {
      select: () => ({
        single: async () => ({
          data: { id: "44444444-4444-4444-8444-444444444444", ...payload },
          error: null,
        }),
      }),
    };
  });

  const select = vi.fn((columns: string) => {
    if (columns === "sort_order") return orderQuery;
    throw new Error(`Beklenmeyen select: ${columns}`);
  });

  return {
    client: { from: vi.fn(() => ({ select, insert })) },
    getInserted: () => inserted,
    orderEq,
    select,
  };
}

describe("admin resource actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({
      userId: "TEST_admin",
      role: "admin",
    });
  });

  it("yeni kaydın sırasını kullanıcıdan istemeden kapsam içinde otomatik belirler", async () => {
    const { client, getInserted, orderEq } = createInsertClient(20);
    mocks.createClient.mockResolvedValue(client);

    const formData = new FormData();
    formData.set("_resource", "menu-item-branches");
    formData.set("menu_item_id", "11111111-1111-4111-8111-111111111111");
    formData.set("branch_id", "22222222-2222-4222-8222-222222222222");
    formData.set("price_cents", "12,34");
    formData.set("price_label", "TEST_fiyat");
    formData.set("is_active", "on");
    formData.set("sort_order", "999");

    await expect(saveAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/menu-item-branches?notice=",
    );

    expect(orderEq).toHaveBeenCalledWith(
      "branch_id",
      "22222222-2222-4222-8222-222222222222",
    );
    expect(getInserted()).toMatchObject({
      price_cents: 1234,
      is_active: true,
      sort_order: 30,
    });
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
  });

  it("boş listede ilk kayda otomatik sıfır sırasını verir", async () => {
    const { client, getInserted } = createInsertClient(null);
    mocks.createClient.mockResolvedValue(client);

    const formData = new FormData();
    formData.set("_resource", "site-settings");
    formData.set("key", "TEST_setting");
    formData.set("value", '{"enabled":true}');
    formData.set("description", "TEST site ayarı");
    formData.set("is_public", "on");
    formData.set("status", "draft");
    formData.set("is_active", "on");

    await expect(saveAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/site-settings?notice=",
    );

    expect(getInserted()).toMatchObject({
      key: "TEST_setting",
      value: { enabled: true },
      sort_order: 0,
    });
  });

  it("kayıt başka bir gruba taşındığında yeni grubun sırasını otomatik verir", async () => {
    const updateSingle = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111" },
      error: null,
    });
    const updateSelect = vi.fn(() => ({ single: updateSingle }));
    const updateEq = vi.fn(() => ({ select: updateSelect }));
    const update = vi.fn(() => ({ eq: updateEq }));

    const orderQuery = {
      order: vi.fn(),
      limit: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { sort_order: 10 }, error: null }),
    };
    orderQuery.order.mockReturnValue(orderQuery);
    orderQuery.limit.mockReturnValue(orderQuery);
    orderQuery.eq.mockReturnValue(orderQuery);

    const readSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        category_id: "22222222-2222-4222-8222-222222222222",
      },
      error: null,
    });
    const readEq = vi.fn(() => ({ single: readSingle }));
    const select = vi.fn((columns: string) => {
      if (columns === "*") return { eq: readEq };
      if (columns === "sort_order") return orderQuery;
      throw new Error(`Beklenmeyen select: ${columns}`);
    });

    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({ select, update })),
    });

    const formData = new FormData();
    formData.set("_resource", "menu-items");
    formData.set("_id", "11111111-1111-4111-8111-111111111111");
    formData.set("category_id", "33333333-3333-4333-8333-333333333333");
    formData.set("name", "TEST_ Ürün");
    formData.set("slug", "test-urun");
    formData.set("status", "draft");
    formData.set("is_active", "on");

    await expect(saveAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/menu-items?notice=",
    );

    expect(orderQuery.eq).toHaveBeenCalledWith(
      "category_id",
      "33333333-3333-4333-8333-333333333333",
    );
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      category_id: "33333333-3333-4333-8333-333333333333",
      sort_order: 20,
    }));
  });

  it("geçersiz JSON'u veritabanına gitmeden reddeder", async () => {
    const formData = new FormData();
    formData.set("_resource", "content-blocks");
    formData.set("page_id", "33333333-3333-4333-8333-333333333333");
    formData.set("key", "TEST_block");
    formData.set("block_type", "hero");
    formData.set("content", "{gecersiz");
    formData.set("status", "draft");

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

    await expect(saveAdminResource(formData)).rejects.toThrow(/field=slug/);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("aktif kaydın kalıcı silinmesini reddeder", async () => {
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const deleteMethod = vi.fn(() => ({ eq: deleteEq }));
    const single = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111", is_active: true, status: "published" },
      error: null,
    });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({ select, delete: deleteMethod })),
    });

    const formData = new FormData();
    formData.set("_resource", "menu-items");
    formData.set("_id", "11111111-1111-4111-8111-111111111111");

    await expect(deleteAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/menu-items?error=",
    );
    expect(deleteMethod).not.toHaveBeenCalled();
  });

  it("pasif ürün kaydını siler; alt bağlantıların temizliğini DB cascade'e bırakır", async () => {
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const deleteMethod = vi.fn(() => ({ eq: deleteEq }));
    const single = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111", is_active: false, status: "archived" },
      error: null,
    });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select, delete: deleteMethod }));
    mocks.createClient.mockResolvedValue({ from });

    const formData = new FormData();
    formData.set("_resource", "menu-items");
    formData.set("_id", "11111111-1111-4111-8111-111111111111");

    await expect(deleteAdminResource(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/menu-items?notice=",
    );
    expect(from).toHaveBeenCalledWith("menu_items");
    expect(deleteEq).toHaveBeenCalledWith(
      "id",
      "11111111-1111-4111-8111-111111111111",
    );
    expect(from).not.toHaveBeenCalledWith("menu_categories");
  });
});
