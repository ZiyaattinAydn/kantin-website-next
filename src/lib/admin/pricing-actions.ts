"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import {
  assertUuid,
  branchPricingField,
  optionalText,
  parseTryPrice,
  pricingResultPath,
  variantPricingField,
} from "@/lib/admin/pricing";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const FRIENDLY_DATABASE_MESSAGES: Record<string, string> = {
  branch_create_confirmation_required: "Yeni şube bağlantısı için ‘Bu ürünü şubeye ekle’ onayı gerekli.",
  branch_required: "Şube bilgisi eksik.",
  category_conflict: "Bir ürün aynı anda farklı menü kategorilerine eklenemez.",
  category_required: "Yeni şube bağlantısı için menü kategorisi seçilmelidir.",
  content_manager_required: "Bu fiyatları değiştirmek için yetkin bulunmuyor.",
  duplicate_branch_change: "Aynı şube formda birden fazla kez gönderildi. Sayfayı yenileyip tekrar dene.",
  duplicate_variant_change: "Aynı varyant formda birden fazla kez gönderildi. Sayfayı yenileyip tekrar dene.",
  invalid_price: "Fiyat alanlarından biri geçersiz.",
  invalid_pricing_payload: "Fiyat formu beklenen biçimde gönderilmedi. Sayfayı yenileyip tekrar dene.",
  menu_category_not_found: "Seçilen menü kategorisi artık bulunamıyor.",
  menu_item_not_found: "Ürün artık bulunamıyor.",
  source_branch_price_not_found: "Varyantların kopyalanacağı kaynak şube fiyatı bulunamadı.",
  stale_branch_price: "Şube fiyat kaydı başka bir işlemle değişmiş. Sayfayı yenileyip tekrar dene.",
  variant_not_owned: "Varyant bu ürüne ait değil veya artık bulunamıyor.",
  variant_required: "Varyant bilgisi eksik.",
};

function friendlyError(error: unknown): string {
  if (error && typeof error === "object") {
    const candidate = error as { code?: unknown; message?: unknown };
    const code = String(candidate.code ?? "");
    const message = typeof candidate.message === "string" ? candidate.message.trim() : "";
    if (message && FRIENDLY_DATABASE_MESSAGES[message]) {
      return FRIENDLY_DATABASE_MESSAGES[message];
    }
    if (code === "23505") return "Bu ürün ve şube bağlantısı zaten mevcut.";
    if (code === "23503") return "Ürün, şube veya fiyat kaydı artık bulunamıyor.";
    if (code === "23514" || code === "22P02" || code === "22023") {
      return "Fiyat alanlarından biri veritabanı kurallarıyla uyuşmuyor.";
    }
    if (code === "40001") return "Kayıt başka bir işlemle değişmiş. Sayfayı yenileyip tekrar dene.";
    if (code === "42501") return "Bu fiyatları değiştirmek için yetkin bulunmuyor.";
    if (message) return message.slice(0, 220);
  }

  return error instanceof Error && error.message.trim()
    ? error.message.slice(0, 220)
    : "Fiyat işlemi tamamlanamadı.";
}

function revalidatePricingSurfaces() {
  revalidatePath("/admin/pricing");
  revalidatePath("/admin/manage/menu-item-branches");
  revalidatePath("/admin/manage/menu-item-variants");
  revalidatePath("/");
  revalidatePath("/menu");
}

function collectEntityIds(formData: FormData, entity: "branch" | "variant"): string[] {
  const suffix = ".record_id";
  const prefix = `${entity}.`;
  const ids = new Set<string>();

  for (const key of formData.keys()) {
    if (!key.startsWith(prefix) || !key.endsWith(suffix)) continue;
    const id = key.slice(prefix.length, -suffix.length);
    ids.add(assertUuid(id, entity === "branch" ? "Şube" : "Varyant"));
  }

  return [...ids];
}

function variantCreatePath(branchPriceId: string, notice: string): string {
  const params = new URLSearchParams({
    new: "1",
    prefill_menu_item_branch_id: branchPriceId,
    notice: notice.slice(0, 220),
  });
  return `/admin/manage/menu-item-variants?${params.toString()}#new-record`;
}

type BranchPricingChange = {
  branch_id: string;
  record_id: string | null;
  create_requested: boolean;
  price_cents: number | null;
  price_label: string | null;
  price_note: string | null;
  availability_note: string | null;
  is_active: boolean;
  category_id: string | null;
  copy_variants_from_branch_id: string | null;
};

type VariantPricingChange = {
  record_id: string;
  price_cents: number;
  price_note: string | null;
  is_active: boolean;
};

export async function saveAdminProductPricing(formData: FormData): Promise<never> {
  await requireAdmin();
  const returnTo = text(formData, "return_to");
  let destination: string;

  try {
    const menuItemId = assertUuid(text(formData, "menu_item_id"), "Ürün");
    const branchIds = collectEntityIds(formData, "branch");
    const variantIds = collectEntityIds(formData, "variant");

    const branchChanges: BranchPricingChange[] = branchIds.flatMap((branchId) => {
      const recordIdRaw = text(formData, branchPricingField(branchId, "record_id"));
      const recordId = recordIdRaw ? assertUuid(recordIdRaw, "Şube fiyat kaydı") : null;
      const priceRaw = text(formData, branchPricingField(branchId, "price"));
      const priceLabel = optionalText(
        formData.get(branchPricingField(branchId, "price_label")),
        120,
      );
      const priceNote = optionalText(
        formData.get(branchPricingField(branchId, "price_note")),
        300,
      );
      const availabilityNote = optionalText(
        formData.get(branchPricingField(branchId, "availability_note")),
        300,
      );
      const createRequested = formData.get(branchPricingField(branchId, "create")) === "on";
      const hasEnteredContent = Boolean(priceRaw || priceLabel || priceNote || availabilityNote);
      const shouldPersist = Boolean(recordId || createRequested || hasEnteredContent);
      if (!shouldPersist) return [];

      const categoryIdRaw = text(formData, branchPricingField(branchId, "category_id"));
      const copyVariantsFromRaw = text(
        formData,
        branchPricingField(branchId, "copy_variants_from_branch_id"),
      );

      return [{
        branch_id: branchId,
        record_id: recordId,
        create_requested: createRequested,
        price_cents: parseTryPrice(priceRaw, true),
        price_label: priceLabel,
        price_note: priceNote,
        availability_note: availabilityNote,
        is_active: recordId
          ? formData.get(branchPricingField(branchId, "is_active")) === "on"
          : true,
        category_id: categoryIdRaw ? assertUuid(categoryIdRaw, "Kategori") : null,
        copy_variants_from_branch_id: copyVariantsFromRaw
          ? assertUuid(copyVariantsFromRaw, "Varyant kaynak şubesi")
          : null,
      }];
    });

    const variantChanges: VariantPricingChange[] = variantIds.map((variantId) => {
      const recordId = assertUuid(
        text(formData, variantPricingField(variantId, "record_id")),
        "Varyant kaydı",
      );
      if (recordId !== variantId) {
        throw new Error("Varyant kaydı değişmiş. Sayfayı yenileyip tekrar dene.");
      }

      return {
        record_id: recordId,
        price_cents: parseTryPrice(text(formData, variantPricingField(variantId, "price"))),
        price_note: optionalText(
          formData.get(variantPricingField(variantId, "price_note")),
          300,
        ),
        is_active: formData.get(variantPricingField(variantId, "is_active")) === "on",
      };
    });

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("save_admin_product_pricing", {
      p_menu_item_id: menuItemId,
      p_branch_changes: branchChanges as Json,
      p_variant_changes: variantChanges as Json,
    });
    if (error) throw error;

    const result = data?.[0];
    const addedBranchCount = result?.added_branch_count ?? 0;
    const updatedBranchCount = result?.updated_branch_count ?? 0;
    const updatedVariantCount = result?.updated_variant_count ?? 0;
    const copiedVariantCount = result?.copied_variant_count ?? 0;
    const changedCount = addedBranchCount + updatedBranchCount + updatedVariantCount;
    const message = changedCount || copiedVariantCount
      ? `${addedBranchCount} yeni şube bağlantısı, ${updatedBranchCount} şube fiyatı ve ${updatedVariantCount} varyant güncellendi${copiedVariantCount ? `; ${copiedVariantCount} varyant kopyalandı` : ""}.`
      : "Kaydedilecek bir değişiklik bulunamadı.";

    destination = addedBranchCount === 1 && result?.added_branch_price_id
      ? variantCreatePath(
          result.added_branch_price_id,
          `${message} Varyantları şimdi düzenleyebilirsin.`,
        )
      : pricingResultPath(returnTo, "notice", message);
  } catch (error) {
    destination = pricingResultPath(returnTo, "error", friendlyError(error));
  }

  revalidatePricingSurfaces();
  redirect(destination);
}

export async function createAdminBranchPrice(formData: FormData): Promise<never> {
  await requireAdmin();
  const returnTo = text(formData, "return_to");
  let destination: string;

  try {
    const menuItemId = assertUuid(text(formData, "menu_item_id"), "Ürün");
    const branchId = assertUuid(text(formData, "branch_id"), "Şube");
    const priceCents = parseTryPrice(text(formData, "price"), true);
    const priceLabel = optionalText(formData.get("price_label"), 120);
    const supabase = await createClient();
    const { error } = await supabase
      .from("menu_item_branches")
      .insert({
        menu_item_id: menuItemId,
        branch_id: branchId,
        price_cents: priceCents,
        currency: "TRY",
        price_label: priceLabel,
        is_active: true,
        // DB trigger'ı hedef şubenin son sırasını transaction içinde güvenle atar.
        sort_order: -1,
      });

    if (error) throw error;
    destination = pricingResultPath(returnTo, "notice", "Şube fiyat bağlantısı oluşturuldu.");
  } catch (error) {
    destination = pricingResultPath(returnTo, "error", friendlyError(error));
  }

  revalidatePricingSurfaces();
  redirect(destination);
}

export async function updateAdminBranchPrice(formData: FormData): Promise<never> {
  await requireAdmin();
  const returnTo = text(formData, "return_to");
  let destination: string;

  try {
    const id = assertUuid(text(formData, "id"), "Şube fiyat kaydı");
    const priceCents = parseTryPrice(text(formData, "price"), true);
    const priceLabel = optionalText(formData.get("price_label"), 120);
    const priceNote = optionalText(formData.get("price_note"), 300);
    const availabilityNote = optionalText(formData.get("availability_note"), 300);
    const isActive = formData.get("is_active") === "on";
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("menu_item_branches")
      .update({
        price_cents: priceCents,
        price_label: priceLabel,
        price_note: priceNote,
        availability_note: availabilityNote,
        is_active: isActive,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) throw error ?? new Error("Şube fiyat kaydı bulunamadı.");
    destination = pricingResultPath(returnTo, "notice", "Şube fiyatı güncellendi.");
  } catch (error) {
    destination = pricingResultPath(returnTo, "error", friendlyError(error));
  }

  revalidatePricingSurfaces();
  redirect(destination);
}

export async function updateAdminVariantPrice(formData: FormData): Promise<never> {
  await requireAdmin();
  const returnTo = text(formData, "return_to");
  let destination: string;

  try {
    const id = assertUuid(text(formData, "id"), "Varyant");
    const priceCents = parseTryPrice(text(formData, "price"));
    const priceNote = optionalText(formData.get("price_note"), 300);
    const isActive = formData.get("is_active") === "on";
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("menu_item_variants")
      .update({
        price_cents: priceCents,
        price_note: priceNote,
        is_active: isActive,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) throw error ?? new Error("Varyant kaydı bulunamadı.");
    destination = pricingResultPath(returnTo, "notice", "Varyant fiyatı güncellendi.");
  } catch (error) {
    destination = pricingResultPath(returnTo, "error", friendlyError(error));
  }

  revalidatePricingSurfaces();
  redirect(destination);
}
