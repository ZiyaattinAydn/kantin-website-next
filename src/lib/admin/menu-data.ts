import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { MenuData } from "./menu-model";

// Page through every table: PostgREST's default row limit must not truncate options.
export async function loadAllAdminRows<T>(
  client: SupabaseClient,
  table: string,
  order = "id",
  columns = "*",
): Promise<T[]> {
  const rows: T[] = [];
  for (let start = 0; ; start += 500) {
    let { data, error } = await client
      .from(table)
      .select(columns)
      .order(order)
      .range(start, start + 499);
    if (
      error &&
      table === "menu_category_branches" &&
      columns.includes("metadata") &&
      ["42703", "PGRST204"].includes(error.code)
    ) {
      const compatible = await client
        .from(table)
        .select(columns.replace("metadata,", ""))
        .order(order)
        .range(start, start + 499);
      data = compatible.data;
      error = compatible.error;
    }
    if (error) throw error;
    rows.push(...((data ?? []) as T[]));
    if ((data?.length ?? 0) < 500) return rows;
  }
}
export async function loadMenuData(): Promise<MenuData> {
  await requireAdmin();
  const client = await createClient();
  const [
    branches,
    categories,
    categoryBranches,
    products,
    placements,
    variants,
  ] = await Promise.all([
    loadAllAdminRows<MenuData["branches"][number]>(
      client,
      "branches",
      "id",
      "id,slug,code,name,status,is_active,sort_order,updated_at",
    ),
    loadAllAdminRows<MenuData["categories"][number]>(
      client,
      "menu_categories",
      "id",
      "id,slug,name,description,display_type,metadata,status,is_active,sort_order,updated_at",
    ),
    loadAllAdminRows<MenuData["categoryBranches"][number]>(
      client,
      "menu_category_branches",
      "id",
      "id,category_id,branch_id,display_name,description,metadata,sort_order,is_active,updated_at",
    ),
    loadAllAdminRows<MenuData["products"][number]>(
      client,
      "menu_items",
      "id",
      "id,category_id,slug,name,description,detail,highlight_text,allergen_text,badges,image_media_id,metadata,status,is_active,sort_order,updated_at",
    ),
    loadAllAdminRows<MenuData["placements"][number]>(
      client,
      "menu_item_branches",
      "id",
      "id,menu_item_id,branch_id,price_cents,price_label,price_note,availability_note,metadata,sort_order,is_active,updated_at",
    ),
    loadAllAdminRows<MenuData["variants"][number]>(
      client,
      "menu_item_variants",
      "id",
      "id,menu_item_branch_id,slug,label,detail,price_cents,price_note,metadata,sort_order,is_active,updated_at",
    ),
  ]);
  return {
    branches: branches.sort((a, b) => a.sort_order - b.sort_order),
    categories: categories.sort((a, b) => a.sort_order - b.sort_order),
    categoryBranches,
    products,
    placements,
    variants,
  };
}
