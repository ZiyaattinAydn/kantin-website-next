"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  assertUuid,
  optionalText,
  parseTryPrice,
  pricingResultPath,
} from "@/lib/admin/pricing";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function friendlyError(error: unknown): string {
  if (error && typeof error === "object") {
    const candidate = error as { code?: unknown; message?: unknown };
    const code = String(candidate.code ?? "");
    if (code === "23505") return "Bu ürün ve şube bağlantısı zaten mevcut.";
    if (code === "23503") return "Ürün, şube veya fiyat kaydı artık bulunamıyor.";
    if (code === "23514" || code === "22P02") return "Fiyat alanlarından biri veritabanı kurallarıyla uyuşmuyor.";
    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message.slice(0, 220);
    }
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

export async function createAdminBranchPrice(formData: FormData): Promise<never> {
  await requireAdmin();
  const returnTo = text(formData, "return_to");
  let destination: string;

  try {
    const menuItemId = assertUuid(text(formData, "menu_item_id"), "Ürün");
    const branchId = assertUuid(text(formData, "branch_id"), "Şube");
    const priceCents = parseTryPrice(text(formData, "price"), true);
    const priceLabel = optionalText(formData.get("price_label"), 120);
    const isActive = formData.get("is_active") === "on";
    const supabase = await createClient();
    const { error } = await supabase
      .from("menu_item_branches")
      .insert({
        menu_item_id: menuItemId,
        branch_id: branchId,
        price_cents: priceCents,
        currency: "TRY",
        price_label: priceLabel,
        is_active: isActive,
        sort_order: 0,
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
