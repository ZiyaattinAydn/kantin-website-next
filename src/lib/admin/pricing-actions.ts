"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  assertUuid,
  branchPricingField,
  optionalText,
  parseTryPrice,
  pricingResultPath,
  variantPricingField,
} from "@/lib/admin/pricing";

type BranchInsert = Database["public"]["Tables"]["menu_item_branches"]["Insert"];
type VariantInsert = Database["public"]["Tables"]["menu_item_variants"]["Insert"];
type BranchCurrent = Pick<
  Database["public"]["Tables"]["menu_item_branches"]["Row"],
  | "id"
  | "menu_item_id"
  | "branch_id"
  | "price_cents"
  | "currency"
  | "price_label"
  | "price_note"
  | "availability_note"
  | "is_active"
  | "sort_order"
>;
type VariantCurrent = Pick<
  Database["public"]["Tables"]["menu_item_variants"]["Row"],
  | "id"
  | "menu_item_branch_id"
  | "slug"
  | "label"
  | "detail"
  | "price_cents"
  | "currency"
  | "price_note"
  | "metadata"
  | "is_active"
  | "sort_order"
>;

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
    if (code === "42501") return "Bu fiyatları değiştirmek için yetkin bulunmuyor.";
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

async function nextCategoryBranchSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string,
  branchId: string,
): Promise<number> {
  const { data: existing, error: existingError } = await supabase
    .from("menu_category_branches")
    .select("sort_order")
    .eq("category_id", categoryId)
    .eq("branch_id", branchId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing && typeof existing.sort_order === "number") return existing.sort_order;

  const { data, error } = await supabase
    .from("menu_category_branches")
    .select("sort_order")
    .eq("branch_id", branchId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return typeof data?.sort_order === "number" ? data.sort_order + 10 : 0;
}

async function nextMenuItemBranchSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  branchId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("menu_item_branches")
    .select("sort_order")
    .eq("branch_id", branchId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return typeof data?.sort_order === "number" ? data.sort_order + 10 : 0;
}

function variantCreatePath(branchPriceId: string, notice: string): string {
  const params = new URLSearchParams({
    new: "1",
    prefill_menu_item_branch_id: branchPriceId,
    notice: notice.slice(0, 220),
  });
  return `/admin/manage/menu-item-variants?${params.toString()}#new-record`;
}

export async function saveAdminProductPricing(formData: FormData): Promise<never> {
  await requireAdmin();
  const returnTo = text(formData, "return_to");
  let destination: string;

  try {
    const menuItemId = assertUuid(text(formData, "menu_item_id"), "Ürün");
    const branchIds = collectEntityIds(formData, "branch");
    const variantIds = collectEntityIds(formData, "variant");

    const branchInputs = branchIds.map((branchId) => {
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
      const hasEnteredContent = Boolean(
        priceRaw || priceLabel || priceNote || availabilityNote,
      );
      const shouldPersist = Boolean(recordId || createRequested || hasEnteredContent);

      const categoryIdRaw = text(formData, branchPricingField(branchId, "category_id"));
      const copyVariantsFromRaw = text(
        formData,
        branchPricingField(branchId, "copy_variants_from_branch_id"),
      );

      return {
        branchId,
        recordId,
        shouldPersist,
        createRequested,
        priceCents: shouldPersist ? parseTryPrice(priceRaw, true) : null,
        priceLabel,
        priceNote,
        availabilityNote,
        isActive: recordId
          ? formData.get(branchPricingField(branchId, "is_active")) === "on"
          : true,
        categoryId: categoryIdRaw ? assertUuid(categoryIdRaw, "Kategori") : null,
        copyVariantsFromBranchId: copyVariantsFromRaw
          ? assertUuid(copyVariantsFromRaw, "Varyant kaynak şubesi")
          : null,
      };
    });

    const variantInputs = variantIds.map((variantId) => ({
      variantId,
      recordId: assertUuid(
        text(formData, variantPricingField(variantId, "record_id")),
        "Varyant kaydı",
      ),
      priceCents: parseTryPrice(text(formData, variantPricingField(variantId, "price"))),
      priceNote: optionalText(
        formData.get(variantPricingField(variantId, "price_note")),
        300,
      ),
      isActive: formData.get(variantPricingField(variantId, "is_active")) === "on",
    }));

    const supabase = await createClient();
    let currentBranches: BranchCurrent[] = [];
    if (branchIds.length) {
      const { data, error } = await supabase
        .from("menu_item_branches")
        .select(
          "id, menu_item_id, branch_id, price_cents, currency, price_label, price_note, availability_note, is_active, sort_order",
        )
        .eq("menu_item_id", menuItemId)
        .in("branch_id", branchIds);
      if (error) throw error;
      currentBranches = (data ?? []) as BranchCurrent[];
    }

    let currentVariants: VariantCurrent[] = [];
    if (variantIds.length) {
      const { data, error } = await supabase
        .from("menu_item_variants")
        .select(
          "id, menu_item_branch_id, slug, label, detail, price_cents, currency, price_note, metadata, is_active, sort_order",
        )
        .in("id", variantIds);
      if (error) throw error;
      currentVariants = (data ?? []) as VariantCurrent[];
    }

    const currentBranchByBranchId = new Map(
      currentBranches.map((branch) => [branch.branch_id, branch]),
    );
    const allowedBranchPriceIds = new Set(currentBranches.map((branch) => branch.id));
    const branchMutations: BranchInsert[] = [];
    const branchAdditions = branchInputs.filter((input) => {
      const current = currentBranchByBranchId.get(input.branchId);
      return input.shouldPersist && !current;
    });

    for (const input of branchInputs) {
      if (!input.shouldPersist) continue;
      const current = currentBranchByBranchId.get(input.branchId);
      if (input.recordId && (!current || current.id !== input.recordId)) {
        throw new Error("Şube fiyat kaydı değişmiş. Sayfayı yenileyip tekrar dene.");
      }
      if (!current) continue;

      const changed = current.price_cents !== input.priceCents
        || current.price_label !== input.priceLabel
        || current.price_note !== input.priceNote
        || current.availability_note !== input.availabilityNote
        || current.is_active !== input.isActive;
      if (!changed) continue;

      branchMutations.push({
        id: current.id,
        menu_item_id: menuItemId,
        branch_id: input.branchId,
        price_cents: input.priceCents,
        currency: current.currency,
        price_label: input.priceLabel,
        price_note: input.priceNote,
        availability_note: input.availabilityNote,
        is_active: input.isActive,
        sort_order: current.sort_order,
      });
    }

    const currentVariantById = new Map(
      currentVariants.map((variant) => [variant.id, variant]),
    );
    const variantMutations: VariantInsert[] = [];

    for (const input of variantInputs) {
      if (input.recordId !== input.variantId) {
        throw new Error("Varyant kaydı değişmiş. Sayfayı yenileyip tekrar dene.");
      }
      const current = currentVariantById.get(input.variantId);
      if (!current || !allowedBranchPriceIds.has(current.menu_item_branch_id)) {
        throw new Error("Varyant bu ürüne veya seçili şubeye ait değil.");
      }

      const changed = current.price_cents !== input.priceCents
        || current.price_note !== input.priceNote
        || current.is_active !== input.isActive;
      if (!changed) continue;

      variantMutations.push({
        id: current.id,
        menu_item_branch_id: current.menu_item_branch_id,
        slug: current.slug,
        label: current.label,
        detail: current.detail,
        price_cents: input.priceCents,
        currency: current.currency,
        price_note: input.priceNote,
        metadata: current.metadata,
        is_active: input.isActive,
        sort_order: current.sort_order,
      });
    }

    let addedBranchCount = 0;
    let copiedVariantCount = 0;
    let addedBranchPriceId: string | null = null;

    for (const input of branchAdditions) {
      if (!input.createRequested) {
        throw new Error("Yeni şube bağlantısı için ‘Bu ürünü şubeye ekle’ onayı gerekli.");
      }
      if (!input.categoryId) {
        throw new Error("Yeni şube bağlantısı için menü kategorisi seçilmelidir.");
      }

      const [categorySortOrder, itemSortOrder] = await Promise.all([
        nextCategoryBranchSortOrder(supabase, input.categoryId, input.branchId),
        nextMenuItemBranchSortOrder(supabase, input.branchId),
      ]);

      const { data, error } = await supabase.rpc("add_admin_menu_item_to_branch", {
        p_menu_item_id: menuItemId,
        p_branch_id: input.branchId,
        p_category_id: input.categoryId,
        p_price_cents: input.priceCents,
        p_price_label: input.priceLabel,
        p_price_note: input.priceNote,
        p_availability_note: input.availabilityNote,
        p_is_active: true,
        p_item_sort_order: itemSortOrder,
        p_category_sort_order: categorySortOrder,
        p_ensure_category_branch: true,
        p_publish_item: false,
        p_publish_category: false,
        p_copy_variants_from_branch_id: input.copyVariantsFromBranchId,
      });
      if (error) throw error;
      addedBranchCount += 1;
      copiedVariantCount += data?.[0]?.variants_copied ?? 0;
      addedBranchPriceId = data?.[0]?.branch_price_id ?? addedBranchPriceId;
    }

    if (branchMutations.length) {
      const { error } = await supabase
        .from("menu_item_branches")
        .upsert(branchMutations, { onConflict: "menu_item_id,branch_id" });
      if (error) throw error;
    }

    if (variantMutations.length) {
      const { error } = await supabase
        .from("menu_item_variants")
        .upsert(variantMutations, { onConflict: "id" });
      if (error) throw error;
    }

    const changedCount = addedBranchCount + branchMutations.length + variantMutations.length;
    const message = changedCount
      ? `${addedBranchCount} yeni şube bağlantısı, ${branchMutations.length} şube fiyatı ve ${variantMutations.length} varyant güncellendi${copiedVariantCount ? `; ${copiedVariantCount} varyant kopyalandı` : ""}.`
      : "Kaydedilecek bir değişiklik bulunamadı.";
    destination = addedBranchCount === 1 && addedBranchPriceId
      ? variantCreatePath(addedBranchPriceId, `${message} Varyantları şimdi düzenleyebilirsin.`)
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
    const sortOrder = await nextMenuItemBranchSortOrder(supabase, branchId);
    const { error } = await supabase
      .from("menu_item_branches")
      .insert({
        menu_item_id: menuItemId,
        branch_id: branchId,
        price_cents: priceCents,
        currency: "TRY",
        price_label: priceLabel,
        is_active: true,
        sort_order: sortOrder,
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
