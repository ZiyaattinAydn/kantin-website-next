export type MenuGroup = { key: string; label: string };
export const DEFAULT_MENU_GROUPS: MenuGroup[] = [
  { key: "main", label: "Ana Menü" },
  { key: "coffee", label: "Kahve Barı" },
];
export const MENU_DISPLAY_PRESETS = [
  { key: "cards", label: "Ürün kartları" },
  { key: "compact", label: "Kompakt liste" },
  { key: "price_table", label: "Fiyat tablosu" },
  { key: "editorial", label: "Başlıklı liste" },
  { key: "coffee", label: "Kahve listesi" },
] as const;
export function defaultMenuGroup(slug: string): MenuGroup {
  return DEFAULT_MENU_GROUPS[
    ["kahve", "spesiyaller", "kahve-disi", "kahve-ekstralari"].includes(slug)
      ? 1
      : 0
  ];
}
export function menuGroup(slug: string, metadata: unknown): MenuGroup {
  const value =
    metadata && typeof metadata === "object" && "menu_group" in metadata
      ? metadata.menu_group
      : null;
  if (
    value &&
    typeof value === "object" &&
    "key" in value &&
    "label" in value &&
    typeof value.key === "string" &&
    /^(main|coffee|custom:[a-z0-9-]{1,60})$/.test(value.key) &&
    typeof value.label === "string" &&
    value.label.trim().length <= 80 &&
    value.label.trim()
  )
    return { key: value.key, label: value.label.trim() };
  return defaultMenuGroup(slug);
}
export function categoryNeedsManagedPresentation(category: {
  slug: string;
  group?: MenuGroup | null;
  presentationOverride?: boolean;
  managedOrder?: boolean;
}) {
  return Boolean(
    category.presentationOverride ||
      (category.group &&
        category.group.key !== defaultMenuGroup(category.slug).key),
  );
}

export function categoryHidden(
  category: { status: string; is_active: boolean },
  link?: { is_active: boolean },
) {
  return (
    category.status !== "published" || !category.is_active || !link?.is_active
  );
}
