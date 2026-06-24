import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminOptionSource } from "./resources";

export type AdminOption = {
  value: string;
  label: string;
};

export type AdminOptionsMap = Partial<
  Record<AdminOptionSource, AdminOption[]>
>;

export const ADMIN_OPTION_PAGE_SIZE = 500;

type AdminOptionPage<Row> = {
  data: Row[] | null;
  error: { message: string } | null;
};

async function loadEveryOptionRow<Row>(
  loadPage: (from: number, to: number) => PromiseLike<AdminOptionPage<Row>>,
): Promise<Row[]> {
  const rows: Row[] = [];
  let from = 0;

  while (true) {
    const to = from + ADMIN_OPTION_PAGE_SIZE - 1;
    const { data, error } = await loadPage(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const page = data ?? [];
    rows.push(...page);

    if (page.length < ADMIN_OPTION_PAGE_SIZE) {
      return rows;
    }

    from += ADMIN_OPTION_PAGE_SIZE;
  }
}

export async function loadAdminOptions(
  sources: readonly AdminOptionSource[],
): Promise<AdminOptionsMap> {
  const uniqueSources = [...new Set(sources)];

  if (!uniqueSources.length) {
    return {};
  }

  const supabase = await createClient();
  const result: AdminOptionsMap = {};

  await Promise.all(
    uniqueSources.map(async (source) => {
      if (source === "branches") {
        const data = await loadEveryOptionRow((from, to) =>
          supabase
            .from("branches")
            .select("id, name, code")
            .order("sort_order")
            .range(from, to),
        );

        result[source] = data.map((row) => ({
          value: row.id,
          label: `${row.name} (${row.code})`,
        }));

        return;
      }

      if (source === "categories") {
        const data = await loadEveryOptionRow((from, to) =>
          supabase
            .from("menu_categories")
            .select("id, name")
            .order("sort_order")
            .range(from, to),
        );

        result[source] = data.map((row) => ({
          value: row.id,
          label: row.name,
        }));

        return;
      }

      if (source === "media") {
        const data = await loadEveryOptionRow((from, to) =>
          supabase
            .from("media")
            .select(
              "id, title, alt_text, local_path, object_path, source",
            )
            .eq("kind", "image")
            .eq("is_active", true)
            .eq("status", "published")
            .order("sort_order")
            .range(from, to),
        );

        result[source] = data.map((row) => ({
          value: row.id,
          label:
            row.title ||
            row.alt_text ||
            row.local_path ||
            row.object_path ||
            `${row.source} görsel`,
        }));

        return;
      }

      if (source === "pages") {
        const data = await loadEveryOptionRow((from, to) =>
          supabase
            .from("site_pages")
            .select("id, title, slug")
            .order("sort_order")
            .range(from, to),
        );

        result[source] = data.map((row) => ({
          value: row.id,
          label: `${row.title} (${row.slug || "anasayfa"})`,
        }));

        return;
      }

      if (source === "menu-items") {
        const data = await loadEveryOptionRow((from, to) =>
          supabase
            .from("menu_items")
            .select("id, name, slug")
            .order("sort_order")
            .range(from, to),
        );

        result[source] = data.map((row) => ({
          value: row.id,
          label: `${row.name} (${row.slug})`,
        }));

        return;
      }

      if (source === "events") {
        const data = await loadEveryOptionRow((from, to) =>
          supabase
            .from("events")
            .select("id, title, start_at")
            .order("start_at", { ascending: false })
            .range(from, to),
        );

        result[source] = data.map((row) => ({
          value: row.id,
          label: row.title,
        }));

        return;
      }

      if (source === "merch-products") {
        const data = await loadEveryOptionRow((from, to) =>
          supabase
            .from("merch_products")
            .select("id, name, product_type")
            .order("sort_order")
            .range(from, to),
        );

        result[source] = data.map((row) => ({
          value: row.id,
          label: `${row.name} (${
            row.product_type === "bundle" ? "Paket" : "Ürün"
          })`,
        }));

        return;
      }

      if (source === "menu-item-branches") {
        const [links, items, branches] = await Promise.all([
          loadEveryOptionRow((from, to) =>
            supabase
              .from("menu_item_branches")
              .select("id, menu_item_id, branch_id")
              .order("sort_order")
              .range(from, to),
          ),
          loadEveryOptionRow((from, to) =>
            supabase
              .from("menu_items")
              .select("id, name")
              .order("sort_order")
              .range(from, to),
          ),
          loadEveryOptionRow((from, to) =>
            supabase
              .from("branches")
              .select("id, name")
              .order("sort_order")
              .range(from, to),
          ),
        ]);

        const itemMap = new Map(
          items.map((row) => [row.id, row.name]),
        );

        const branchMap = new Map(
          branches.map((row) => [row.id, row.name]),
        );

        result[source] = links.map((row) => ({
          value: row.id,
          label: `${
            itemMap.get(row.menu_item_id) ?? "Ürün"
          } · ${
            branchMap.get(row.branch_id) ?? "Şube"
          }`,
        }));
      }
    }),
  );

  return result;
}
