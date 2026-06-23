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
  updateAdminBranchPrice,
  updateAdminVariantPrice,
} from "@/lib/admin/pricing-actions";

const ITEM_ID = "11111111-1111-4111-8111-111111111111";
const BRANCH_ID = "22222222-2222-4222-8222-222222222222";
const PRICE_ID = "33333333-3333-4333-8333-333333333333";
const VARIANT_ID = "44444444-4444-4444-8444-444444444444";

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

  it("eksik ürün-şube fiyat bağlantısını oluşturur", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert }));
    mocks.createClient.mockResolvedValue({ from });
    const formData = new FormData();
    formData.set("menu_item_id", ITEM_ID);
    formData.set("branch_id", BRANCH_ID);
    formData.set("price", "85,50");
    formData.set("price_label", "Porsiyon");
    formData.set("is_active", "on");
    formData.set("return_to", "/admin/pricing?q=TEST");

    await expect(createAdminBranchPrice(formData)).rejects.toThrow(
      "REDIRECT:/admin/pricing?q=TEST&notice=",
    );
    expect(from).toHaveBeenCalledWith("menu_item_branches");
    expect(insert).toHaveBeenCalledWith({
      menu_item_id: ITEM_ID,
      branch_id: BRANCH_ID,
      price_cents: 8550,
      currency: "TRY",
      price_label: "Porsiyon",
      is_active: true,
      sort_order: 0,
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
