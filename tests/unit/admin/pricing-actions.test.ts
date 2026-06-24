import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  },
}));

import {
  createAdminBranchPrice,
  saveAdminProductPricing,
  updateAdminBranchPrice,
  updateAdminVariantPrice,
} from "@/lib/admin/pricing-actions";
import { branchPricingField, variantPricingField } from "@/lib/admin/pricing";

const ITEM_ID = "11111111-1111-4111-8111-111111111111";
const BRANCH_ID = "22222222-2222-4222-8222-222222222222";
const PRICE_ID = "33333333-3333-4333-8333-333333333333";
const VARIANT_ID = "44444444-4444-4444-8444-444444444444";
const BRANCH_ID_2 = "55555555-5555-4555-8555-555555555555";
const PRICE_ID_2 = "66666666-6666-4666-8666-666666666666";
const CATEGORY_ID = "77777777-7777-4777-8777-777777777777";

function updateChain(update: ReturnType<typeof vi.fn>) {
  const single = vi.fn().mockResolvedValue({ data: { id: PRICE_ID }, error: null });
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  update.mockReturnValue({ eq });
  return { single, select, eq };
}

describe("birleşik fiyat yönetimi eylemleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "TEST_admin", role: "admin" });
  });

  it("eksik ürün-şube fiyat bağlantısını DB tarafından otomatik sıralanacak biçimde oluşturur", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert }));
    mocks.createClient.mockResolvedValue({ from });
    const formData = new FormData();
    formData.set("menu_item_id", ITEM_ID);
    formData.set("branch_id", BRANCH_ID);
    formData.set("price", "85,50");
    formData.set("price_label", "Porsiyon");
    formData.set("return_to", "/admin/pricing?q=TEST");

    await expect(createAdminBranchPrice(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?q=TEST&notice=",
    );
    expect(insert).toHaveBeenCalledWith({
      menu_item_id: ITEM_ID,
      branch_id: BRANCH_ID,
      price_cents: 8550,
      currency: "TRY",
      price_label: "Porsiyon",
      is_active: true,
      sort_order: -1,
    });
  });

  it("şube fiyatı ve notlarını aynı akışta günceller", async () => {
    const update = vi.fn();
    const chain = updateChain(update);
    const from = vi.fn(() => ({ update }));
    mocks.createClient.mockResolvedValue({ from });
    const formData = new FormData();
    formData.set("id", PRICE_ID);
    formData.set("price", "90");
    formData.set("price_label", "Başlangıç");
    formData.set("price_note", "TEST_ fiyat notu");
    formData.set("availability_note", "TEST_ stok notu");
    formData.set("is_active", "on");
    formData.set("return_to", "/admin/pricing?branch=TEST");

    await expect(updateAdminBranchPrice(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?branch=TEST&notice=",
    );
    expect(update).toHaveBeenCalledWith({
      price_cents: 9000,
      price_label: "Başlangıç",
      price_note: "TEST_ fiyat notu",
      availability_note: "TEST_ stok notu",
      is_active: true,
    });
    expect(chain.eq).toHaveBeenCalledWith("id", PRICE_ID);
  });

  it("boş temel fiyatı null olarak kaydeder", async () => {
    const update = vi.fn();
    updateChain(update);
    mocks.createClient.mockResolvedValue({ from: () => ({ update }) });
    const formData = new FormData();
    formData.set("id", PRICE_ID);
    formData.set("price", "");

    await expect(updateAdminBranchPrice(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?notice=",
    );
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ price_cents: null }));
  });

  it("varyant fiyatını ve aktifliğini günceller", async () => {
    const update = vi.fn();
    const single = vi.fn().mockResolvedValue({ data: { id: VARIANT_ID }, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    update.mockReturnValue({ eq });
    mocks.createClient.mockResolvedValue({ from: () => ({ update }) });
    const formData = new FormData();
    formData.set("id", VARIANT_ID);
    formData.set("price", "125,75");
    formData.set("price_note", "TEST_ büyük boy");
    formData.set("is_active", "on");

    await expect(updateAdminVariantPrice(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?notice=",
    );
    expect(update).toHaveBeenCalledWith({
      price_cents: 12575,
      price_note: "TEST_ büyük boy",
      is_active: true,
    });
    expect(eq).toHaveBeenCalledWith("id", VARIANT_ID);
  });


  it("iki şube fiyatını ve varyantı tek atomik RPC çağrısıyla günceller", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{
        added_branch_price_id: null,
        added_branch_count: 0,
        updated_branch_count: 2,
        updated_variant_count: 1,
        copied_variant_count: 0,
      }],
      error: null,
    });
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ rpc, from });

    const formData = new FormData();
    formData.set("menu_item_id", ITEM_ID);
    formData.set("return_to", "/admin/pricing?q=TEST");
    formData.set(branchPricingField(BRANCH_ID, "record_id"), PRICE_ID);
    formData.set(branchPricingField(BRANCH_ID, "price"), "87,50");
    formData.set(branchPricingField(BRANCH_ID, "price_label"), "Porsiyon");
    formData.set(branchPricingField(BRANCH_ID, "is_active"), "on");
    formData.set(branchPricingField(BRANCH_ID_2, "record_id"), PRICE_ID_2);
    formData.set(branchPricingField(BRANCH_ID_2, "price"), "95");
    formData.set(branchPricingField(BRANCH_ID_2, "is_active"), "on");
    formData.set(variantPricingField(VARIANT_ID, "record_id"), VARIANT_ID);
    formData.set(variantPricingField(VARIANT_ID, "price"), "105,25");
    formData.set(variantPricingField(VARIANT_ID, "price_note"), "TEST_ büyük boy");
    formData.set(variantPricingField(VARIANT_ID, "is_active"), "on");

    await expect(saveAdminProductPricing(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?q=TEST&notice=",
    );

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("save_admin_product_pricing", {
      p_menu_item_id: ITEM_ID,
      p_branch_changes: [
        {
          branch_id: BRANCH_ID,
          record_id: PRICE_ID,
          create_requested: false,
          price_cents: 8750,
          price_label: "Porsiyon",
          price_note: null,
          availability_note: null,
          is_active: true,
          category_id: null,
          copy_variants_from_branch_id: null,
        },
        {
          branch_id: BRANCH_ID_2,
          record_id: PRICE_ID_2,
          create_requested: false,
          price_cents: 9500,
          price_label: null,
          price_note: null,
          availability_note: null,
          is_active: true,
          category_id: null,
          copy_variants_from_branch_id: null,
        },
      ],
      p_variant_changes: [{
        record_id: VARIANT_ID,
        price_cents: 10525,
        price_note: "TEST_ büyük boy",
        is_active: true,
      }],
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("eksik şubeyi atomik RPC ile ekler ve varyant yönetimine yönlendirir", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{
        added_branch_price_id: PRICE_ID,
        added_branch_count: 1,
        updated_branch_count: 0,
        updated_variant_count: 0,
        copied_variant_count: 2,
      }],
      error: null,
    });
    mocks.createClient.mockResolvedValue({ rpc });

    const formData = new FormData();
    formData.set("menu_item_id", ITEM_ID);
    formData.set("return_to", "/admin/pricing?q=TEST");
    formData.set(branchPricingField(BRANCH_ID, "record_id"), "");
    formData.set(branchPricingField(BRANCH_ID, "create"), "on");
    formData.set(branchPricingField(BRANCH_ID, "category_id"), CATEGORY_ID);
    formData.set(branchPricingField(BRANCH_ID, "price"), "245");
    formData.set(branchPricingField(BRANCH_ID, "price_label"), "50 cl");
    formData.set(
      branchPricingField(BRANCH_ID, "copy_variants_from_branch_id"),
      BRANCH_ID_2,
    );

    await expect(saveAdminProductPricing(formData)).rejects.toThrow(
      "REDIRECT:/admin/manage/menu-item-variants?new=1&prefill_menu_item_branch_id=",
    );

    expect(rpc).toHaveBeenCalledWith("save_admin_product_pricing", {
      p_menu_item_id: ITEM_ID,
      p_branch_changes: [{
        branch_id: BRANCH_ID,
        record_id: null,
        create_requested: true,
        price_cents: 24500,
        price_label: "50 cl",
        price_note: null,
        availability_note: null,
        is_active: true,
        category_id: CATEGORY_ID,
        copy_variants_from_branch_id: BRANCH_ID_2,
      }],
      p_variant_changes: [],
    });
  });

  it("atomik RPC hata verirse ikinci bir yazma sorgusu çalıştırmaz", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "40001", message: "stale_branch_price" },
    });
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ rpc, from });
    const formData = new FormData();
    formData.set("menu_item_id", ITEM_ID);
    formData.set(branchPricingField(BRANCH_ID, "record_id"), PRICE_ID);
    formData.set(branchPricingField(BRANCH_ID, "price"), "90");

    await expect(saveAdminProductPricing(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?error=",
    );
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(from).not.toHaveBeenCalled();
  });

  it("birleşik kayıtta geçersiz fiyatı hiçbir sorgu yapmadan reddeder", async () => {
    const formData = new FormData();
    formData.set("menu_item_id", ITEM_ID);
    formData.set(branchPricingField(BRANCH_ID, "record_id"), PRICE_ID);
    formData.set(branchPricingField(BRANCH_ID, "price"), "12,345");

    await expect(saveAdminProductPricing(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?error=",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("yetkisiz kullanıcıda fiyat sorgusuna başlamaz", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("forbidden"));
    const formData = new FormData();
    formData.set("menu_item_id", ITEM_ID);

    await expect(saveAdminProductPricing(formData)).rejects.toThrow("forbidden");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("geçersiz fiyatı veritabanına gitmeden reddeder", async () => {
    const formData = new FormData();
    formData.set("id", VARIANT_ID);
    formData.set("price", "12,345");

    await expect(updateAdminVariantPrice(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?error=",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
