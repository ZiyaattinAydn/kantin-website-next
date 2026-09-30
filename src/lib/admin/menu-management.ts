import { assertUuid, parseTryPrice } from "./pricing";
import { MenuValidationError, menuSlug } from "./menu-model";
export function parseCategoryInput(value: unknown) {
  if (!value || typeof value !== "object")
    throw new MenuValidationError("Kategori bilgilerini kontrol edin.");
  const p = value as Record<string, unknown>;
  if (
    typeof p.name !== "string" ||
    !p.name.trim() ||
    p.name.length > 180 ||
    !Array.isArray(p.branches) ||
    !p.branches.length ||
    p.branches.length > 20 ||
    !Number.isInteger(p.sort_order) ||
    Number(p.sort_order) < 0 ||
    Number(p.sort_order) > 100000 ||
    typeof p.is_active !== "boolean" ||
    !["draft", "published", "archived"].includes(String(p.status))
  )
    throw new MenuValidationError(
      "Kategori adı, şube, sıralama ve yayın durumunu kontrol edin.",
    );
  const branches = p.branches.map((id) => assertUuid(String(id), "Şube"));
  if (new Set(branches).size !== branches.length)
    throw new MenuValidationError("Şube seçimini kontrol edin.");
  return {
    id: p.id ? assertUuid(String(p.id), "Kategori") : null,
    updated_at: p.updated_at ?? null,
    name: p.name.trim(),
    slug: `${menuSlug(p.name)}-${crypto.randomUUID().slice(0, 8)}`,
    branches,
    sort_order: Number(p.sort_order),
    is_active: p.is_active,
    status: String(p.status),
    confirmed: p.confirmed === "EVET" ? "EVET" : "",
    branch_snapshot: p.branch_snapshot ?? [],
  };
}
export function parseQuickPrices(value: unknown) {
  if (!value || typeof value !== "object")
    throw new MenuValidationError("Fiyat bilgilerini kontrol edin.");
  const p = value as Record<string, unknown>;
  if (
    !Array.isArray(p.branches) ||
    !Array.isArray(p.variants) ||
    p.branches.length > 20 ||
    p.variants.length > 600 ||
    (!p.branches.length && !p.variants.length)
  )
    throw new MenuValidationError("Fiyat bilgilerini kontrol edin.");
  const rows = (values: Record<string, unknown>[], nullable: boolean) =>
    values.map((v) => {
      if (
        !v ||
        typeof v.updated_at !== "string" ||
        v.updated_at.length > 50 ||
        !Number.isFinite(Date.parse(v.updated_at))
      )
        throw new MenuValidationError("Sayfayı yenileyip tekrar deneyin.");
      let price;
      try {
        price = nullable
          ? parseTryPrice(String(v.price ?? ""), true)
          : parseTryPrice(String(v.price ?? ""));
      } catch {
        throw new MenuValidationError("Fiyatı 85 veya 85,50 biçiminde girin.");
      }
      return {
        id: assertUuid(String(v.id), "Fiyat"),
        updated_at: v.updated_at,
        price_cents: price,
      };
    });
  return {
    id: assertUuid(String(p.id), "Ürün"),
    branches: rows(p.branches, true),
    variants: rows(p.variants, false),
  };
}
