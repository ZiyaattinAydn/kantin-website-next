import type { Database } from "@/lib/supabase/database.types";
import { assertUuid, parseTryPrice } from "./pricing";

type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type MenuProduct = Row<"menu_items">;
export type MenuPlacement = Row<"menu_item_branches">;
export type MenuVariant = Row<"menu_item_variants">;
export type MenuData = {
  branches: Row<"branches">[];
  categories: Row<"menu_categories">[];
  categoryBranches: Row<"menu_category_branches">[];
  products: MenuProduct[];
  placements: MenuPlacement[];
  variants: MenuVariant[];
};
export class MenuValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MenuValidationError";
  }
}
export function menuSlug(value: string): string {
  return (
    value
      .toLocaleLowerCase("tr-TR")
      .replaceAll("ı", "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "urun"
  );
}
export function parseMenuPayload(value: unknown) {
  if (!value || typeof value !== "object")
    throw new MenuValidationError("Ürün bilgilerini kontrol edin.");
  const p = value as Record<string, unknown>;
  const str = (v: unknown, max: number) => {
    if (typeof v !== "string" || v.length > max)
      throw new MenuValidationError("Ürün bilgilerini kontrol edin.");
    return v.trim();
  };
  const uuid = (v: unknown) => {
    try {
      return assertUuid(str(v, 36), "Seçim");
    } catch {
      throw new MenuValidationError("Seçimlerinizi kontrol edin.");
    }
  };
  const price = (v: unknown, nullable = false) => {
    try {
      return nullable
        ? parseTryPrice(str(v, 50), true)
        : parseTryPrice(str(v, 50));
    } catch {
      throw new MenuValidationError("Fiyatı 85 veya 85,50 biçiminde girin.");
    }
  };
  const snapshot = (v: unknown) => {
    if (!Array.isArray(v) || v.length > 1000)
      throw new MenuValidationError("Sayfayı yenileyip tekrar deneyin.");
    return v.map((e) => ({
      id: uuid(e.id),
      updated_at: str(e.updated_at, 50),
    }));
  };
  const name = str(p.name, 180);
  if (
    !name ||
    !Array.isArray(p.branches) ||
    !p.branches.length ||
    p.branches.length > 20
  )
    throw new MenuValidationError("Ürün adı ve en az bir şube seçin.");
  if (!["draft", "published", "archived"].includes(String(p.status)))
    throw new MenuValidationError("Yayın durumunu seçin.");
  return {
    id: p.id ? uuid(p.id) : null,
    updated_at: p.id ? str(p.updated_at, 50) : null,
    branch_snapshot: snapshot(p.branch_snapshot ?? []),
    variant_snapshot: snapshot(p.variant_snapshot ?? []),
    name,
    slug: `${menuSlug(name)}-${crypto.randomUUID().slice(0, 8)}`,
    category_id: uuid(p.category_id),
    description: str(p.description ?? "", 10000),
    image_media_id: p.image_media_id ? uuid(p.image_media_id) : null,
    status: String(p.status),
    is_active: p.is_active === true,
    confirmed: p.confirmed === "EVET" ? "EVET" : "",
    branches: p.branches.map((b) => {
      if (
        !b ||
        typeof b !== "object" ||
        !Array.isArray(b.variants) ||
        b.variants.length > 30
      )
        throw new MenuValidationError("Porsiyon seçeneklerini kontrol edin.");
      return {
        id: uuid(b.id),
        price_cents: price(b.price, true),
        is_active: b.is_active === true,
        variants: b.variants.map((v: Record<string, unknown>) => {
          const label = str(v.label, 120);
          if (!label) throw new MenuValidationError("Porsiyon adını girin.");
          return {
            id: v.id ? uuid(v.id) : null,
            label,
            slug: `${menuSlug(label)}-${crypto.randomUUID().slice(0, 8)}`,
            price_cents: price(v.price),
            is_active: v.is_active === true,
          };
        }),
      };
    }),
  };
}
