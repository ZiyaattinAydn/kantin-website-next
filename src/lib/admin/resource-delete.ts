import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AdminResource, AdminTable } from "./resources";

export type AdminDeleteImpactBehavior = "cascade" | "block";

export type AdminDeleteImpactItem = {
  key: string;
  label: string;
  count: number;
  behavior: AdminDeleteImpactBehavior;
};

export type AdminDeleteImpact = {
  items: AdminDeleteImpactItem[];
  note?: string;
};

type DeleteImpactRule = {
  key: string;
  table: AdminTable;
  foreignKey: string;
  label: string;
  behavior: AdminDeleteImpactBehavior;
};

type DeleteImpactDefinition = {
  rules: readonly DeleteImpactRule[];
  note?: string;
};

const DELETE_IMPACT_DEFINITIONS: Partial<Record<string, DeleteImpactDefinition>> = {
  "menu-categories": {
    rules: [
      {
        key: "menu-items",
        table: "menu_items",
        foreignKey: "category_id",
        label: "Bu kategoriyi kullanan ürün",
        behavior: "block",
      },
      {
        key: "menu-category-branches",
        table: "menu_category_branches",
        foreignKey: "category_id",
        label: "Şube görünürlük bağlantısı",
        behavior: "cascade",
      },
    ],
    note: "Kategoriye bağlı ürün varsa kategori silinmez. Önce ürünleri başka bir kategoriye taşımalısın. Şube görünürlük bağlantıları kategoriyle birlikte temizlenir.",
  },
  "menu-items": {
    rules: [
      {
        key: "menu-item-branches",
        table: "menu_item_branches",
        foreignKey: "menu_item_id",
        label: "Şube fiyatı ve menü bağlantısı",
        behavior: "cascade",
      },
    ],
    note: "Şube bağlantılarının altındaki fiyat varyantları da ürünle birlikte silinir. Ürünün kategorisi korunur.",
  },
  "menu-item-branches": {
    rules: [
      {
        key: "menu-item-variants",
        table: "menu_item_variants",
        foreignKey: "menu_item_branch_id",
        label: "Fiyat varyantı",
        behavior: "cascade",
      },
    ],
    note: "Yalnız seçilen ürün–şube bağlantısı ve ona bağlı varyantlar silinir; ürünün kendisi ve şube korunur.",
  },
  events: {
    rules: [
      {
        key: "event-branches",
        table: "event_branches",
        foreignKey: "event_id",
        label: "Etkinlik–şube bağlantısı",
        behavior: "cascade",
      },
    ],
    note: "Etkinlik veya duyuru silindiğinde yalnız ona ait şube bağlantıları birlikte temizlenir.",
  },
  "merch-products": {
    rules: [
      {
        key: "merch-product-branches",
        table: "merch_product_branches",
        foreignKey: "merch_product_id",
        label: "Merch–şube bağlantısı",
        behavior: "cascade",
      },
    ],
    note: "Merch ürünü silindiğinde yalnız o ürüne ait şube bulunabilirlik bağlantıları birlikte temizlenir.",
  },
};

async function countRelatedRows(
  client: SupabaseClient,
  rule: DeleteImpactRule,
  id: string,
): Promise<number> {
  const { count, error } = await client
    .from(rule.table)
    .select("id", { count: "exact", head: true })
    .eq(rule.foreignKey, id);

  if (error) {
    throw new Error("Silme işleminden etkilenecek bağlantılar doğrulanamadı.");
  }

  return count ?? 0;
}

export function deleteImpactDefinition(resource: AdminResource) {
  return DELETE_IMPACT_DEFINITIONS[resource.key] ?? null;
}

export async function loadAdminDeleteImpact(
  resource: AdminResource,
  id: string,
  client?: SupabaseClient,
): Promise<AdminDeleteImpact | null> {
  const definition = deleteImpactDefinition(resource);
  if (!definition || !resource.allowHardDelete) return null;

  const supabase = client ?? await createClient();
  const counts = await Promise.all(
    definition.rules.map(async (rule) => ({
      key: rule.key,
      label: rule.label,
      behavior: rule.behavior,
      count: await countRelatedRows(supabase, rule, id),
    })),
  );

  return {
    items: counts,
    note: definition.note,
  };
}

export async function assertAdminDeleteNotBlocked(
  client: SupabaseClient,
  resource: AdminResource,
  id: string,
): Promise<void> {
  const definition = deleteImpactDefinition(resource);
  const blockingRules = definition?.rules.filter((rule) => rule.behavior === "block") ?? [];

  for (const rule of blockingRules) {
    const count = await countRelatedRows(client, rule, id);
    if (count > 0) {
      throw new Error(
        `Bu kayıt kalıcı olarak silinemez: ${count} ${rule.label.toLocaleLowerCase("tr-TR")} hâlâ bu kaydı kullanıyor. Önce bağlı kayıtları taşı veya sil.`,
      );
    }
  }
}
