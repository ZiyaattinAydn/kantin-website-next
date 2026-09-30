"use server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { MenuValidationError, parseMenuPayload } from "./menu-model";
import { parseCategoryInput, parseQuickPrices } from "./menu-management";
import { assertUuid } from "./pricing";
import { recordSystemEvent } from "./system-logs";
export type MenuActionResult = { ok: boolean; message: string; id?: string };
function refreshMenu() {
  [
    "/admin",
    "/admin/menu",
    "/admin/pricing",
    "/admin/manage",
    "/",
    "/menu",
  ].forEach((path) => revalidatePath(path, "layout"));
}
export async function saveMenuProduct(
  input: unknown,
): Promise<MenuActionResult> {
  const admin = await requireAdmin();
  let id: string | null = null;
  try {
    const payload = parseMenuPayload(input);
    id = payload.id;
    const client: SupabaseClient = await createClient();
    const { data, error } = await client.rpc("save_admin_menu_product", {
      p_payload: payload,
    });
    if (error) throw error;
    refreshMenu();
    return { ok: true, message: "Ürün kaydedildi.", id: String(data) };
  } catch (error) {
    await recordSystemEvent({
      actorId: admin.userId,
      route: "/admin/menu",
      operation: "save",
      entityType: "menu_items",
      entityId: id,
      error,
    });
    const code =
      error && typeof error === "object" && "code" in error ? error.code : null;
    return {
      ok: false,
      message:
        error instanceof MenuValidationError
          ? error.message
          : code === "40001"
            ? "Bu ürün başka bir işlemle değişti. Sayfayı yenileyip tekrar deneyin."
            : "Ürün kaydedilemedi. Tekrar deneyin.",
    };
  }
}
export async function setMenuVisibility(
  id: string,
  branchId: string,
  visible: boolean,
  updatedAt: string,
  confirmed: string,
): Promise<MenuActionResult> {
  const admin = await requireAdmin();
  try {
    assertUuid(id, "Ürün");
    assertUuid(branchId, "Şube");
    if (confirmed !== "EVET" || typeof visible !== "boolean")
      throw new Error("confirmation_required");
    const client = await createClient();
    const { data, error } = await client
      .from("menu_item_branches")
      .update({ is_active: visible })
      .eq("menu_item_id", id)
      .eq("branch_id", branchId)
      .eq("updated_at", updatedAt)
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("stale_menu_product");
    refreshMenu();
    return {
      ok: true,
      message: visible
        ? "Ürün bu şubede gösterilecek."
        : "Ürün bu şubede gizlendi.",
    };
  } catch (error) {
    await recordSystemEvent({
      actorId: admin.userId,
      route: "/admin/menu",
      operation: "update",
      entityType: "menu_items",
      entityId: id,
      error,
    });
    return {
      ok: false,
      message: "Görünürlük değiştirilemedi. Sayfayı yenileyip tekrar deneyin.",
    };
  }
}
export async function moveMenuProduct(
  id: string,
  branchId: string,
  direction: "up" | "down",
  updatedAt: string,
): Promise<MenuActionResult> {
  const admin = await requireAdmin();
  try {
    assertUuid(id, "Ürün");
    assertUuid(branchId, "Şube");
    if (!["up", "down"].includes(direction))
      throw new Error("invalid_direction");
    const client: SupabaseClient = await createClient();
    const { error } = await client.rpc("move_admin_menu_product", {
      p_id: id,
      p_branch_id: branchId,
      p_direction: direction,
      p_updated_at: updatedAt,
    });
    if (error) throw error;
    refreshMenu();
    return { ok: true, message: "Menü sırası güncellendi." };
  } catch (error) {
    await recordSystemEvent({
      actorId: admin.userId,
      route: "/admin/menu",
      operation: "reorder",
      entityType: "menu_items",
      entityId: id,
      error,
    });
    return {
      ok: false,
      message: "Sıra değiştirilemedi. Sayfayı yenileyip tekrar deneyin.",
    };
  }
}

export async function saveMenuCategory(
  input: unknown,
): Promise<MenuActionResult> {
  const admin = await requireAdmin();
  try {
    const payload = parseCategoryInput(input);
    const client: SupabaseClient = await createClient();
    const { data, error } = await client.rpc("save_admin_menu_category", {
      p_payload: payload,
    });
    if (error) throw error;
    refreshMenu();
    return {
      ok: true,
      message: "Kategori ve şube seçimleri kaydedildi.",
      id: String(data),
    };
  } catch (error) {
    await recordSystemEvent({
      actorId: admin.userId,
      route: "/admin/menu",
      operation: "save",
      entityType: "menu_categories",
      error,
    });
    return {
      ok: false,
      message:
        error instanceof MenuValidationError
          ? error.message
          : "Kategori kaydedilemedi. Sayfayı yenileyip tekrar deneyin.",
    };
  }
}
export async function saveQuickMenuPrices(
  input: unknown,
): Promise<MenuActionResult> {
  const admin = await requireAdmin();
  try {
    const payload = parseQuickPrices(input);
    const client: SupabaseClient = await createClient();
    const { error } = await client.rpc("save_admin_menu_prices", {
      p_payload: payload,
    });
    if (error) throw error;
    refreshMenu();
    return { ok: true, message: "Fiyatlar güncellendi." };
  } catch (error) {
    await recordSystemEvent({
      actorId: admin.userId,
      route: "/admin/menu",
      operation: "update",
      entityType: "menu_items",
      error,
    });
    return {
      ok: false,
      message:
        error instanceof MenuValidationError
          ? error.message
          : "Fiyatlar güncellenemedi. Sayfayı yenileyip tekrar deneyin.",
    };
  }
}
