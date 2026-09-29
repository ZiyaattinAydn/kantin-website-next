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
): Promise<T[]> {
  const rows: T[] = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .order(order)
      .range(start, start + 499);
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
    loadAllAdminRows<MenuData["branches"][number]>(client, "branches"),
    loadAllAdminRows<MenuData["categories"][number]>(client, "menu_categories"),
    loadAllAdminRows<MenuData["categoryBranches"][number]>(
      client,
      "menu_category_branches",
    ),
    loadAllAdminRows<MenuData["products"][number]>(client, "menu_items"),
    loadAllAdminRows<MenuData["placements"][number]>(
      client,
      "menu_item_branches",
    ),
    loadAllAdminRows<MenuData["variants"][number]>(
      client,
      "menu_item_variants",
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
