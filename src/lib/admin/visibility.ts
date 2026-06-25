export const ADMIN_VISIBILITY_CONFIRMATIONS = {
  publish: "YAYINLA",
  hide: "PASİFE AL",
} as const;

export type AdminVisibilityConfirmation =
  (typeof ADMIN_VISIBILITY_CONFIRMATIONS)[keyof typeof ADMIN_VISIBILITY_CONFIRMATIONS];

type VisibilityState = {
  hasActiveField: boolean;
  hasStatusField: boolean;
  active?: boolean;
  status?: string;
};

type VisibilityTransition = {
  isCreate: boolean;
  current?: VisibilityState | null;
  next: VisibilityState;
};

const IMPACTS: Record<string, string> = {
  "menu-categories":
    "Kategori ziyaretçi menüsünden kaldırılır. İçindeki ürünler silinmez; kategori yeniden yayınlandığında aynı bağlantılarla görünür.",
  "menu-category-branches":
    "Kategori yalnız seçili şubenin menüsünden kaldırılır. Kategori ve diğer şube bağlantıları korunur.",
  "menu-items":
    "Ürün ziyaretçi menüsünden kaldırılır. Şube fiyatları ve varyantlar silinmez; yeniden yayınlandığında kullanılmaya devam eder.",
  "menu-item-branches":
    "Ürün yalnız seçili şubede görünmez. Ürün kartı, diğer şube fiyatları ve varyant kayıtları korunur.",
  "menu-item-variants":
    "Varyant ilgili ürünün fiyat seçeneklerinden kaldırılır. Ana ürün ve diğer varyantlar etkilenmez.",
  events:
    "Etkinlik veya duyuru ziyaretçi sitesinden kaldırılır. Şube bağlantıları ve içerik bilgileri silinmez.",
  "event-branches":
    "Etkinlik yalnız seçili şubede görünmez. Etkinliğin kendisi ve diğer şube bağlantıları korunur.",
  "merch-products":
    "Merch ürünü ziyaretçi sitesinden kaldırılır. Stok ve şube bağlantıları silinmez.",
  "merch-product-branches":
    "Merch ürünü yalnız seçili şubede kullanılamaz hâle gelir. Ürün kaydı ve diğer şubeler korunur.",
  "instagram-posts":
    "Instagram içeriği ziyaretçi sitesindeki akıştan kaldırılır. Kayıt ve medya bağlantısı silinmez.",
  branches:
    "Şube ziyaretçi sitesinde ve aktif seçim listelerinde görünmez. Bağlı fiyat, kategori ve içerik kayıtları silinmez.",
  "site-settings":
    "Bu ayarın siteye etkisi durur. İlgili bölüm varsayılan, eksik veya gizli görünebilir; ayar verisi silinmez.",
  "site-pages":
    "Sayfa ziyaretçilere kapatılır. Sayfaya bağlı içerik blokları ve SEO verileri silinmez.",
  "content-blocks":
    "Bu içerik bölümü bağlı olduğu sayfada görünmez. İçerik verisi ve sayfa kaydı silinmez.",
};

export function isAdminResourcePubliclyVisible(state: VisibilityState): boolean {
  const active = state.hasActiveField ? state.active === true : true;
  const published = state.hasStatusField ? state.status === "published" : true;
  return active && published;
}

export function requiredAdminVisibilityConfirmation({
  isCreate,
  current,
  next,
}: VisibilityTransition): AdminVisibilityConfirmation | null {
  if (!next.hasActiveField && !next.hasStatusField) return null;

  const nextVisible = isAdminResourcePubliclyVisible(next);

  if (isCreate) {
    // Aktif-only ilişki kayıtları oluşturulurken ek onay gerektirmez. Yayın durumu olan
    // içerikler doğrudan ziyaretçiye açılıyorsa bilinçli yayın onayı ister.
    return next.hasStatusField && nextVisible
      ? ADMIN_VISIBILITY_CONFIRMATIONS.publish
      : null;
  }

  if (!current) return null;

  const becomesArchived =
    next.hasStatusField && current.status !== "archived" && next.status === "archived";
  const becomesInactive =
    next.hasActiveField && current.active === true && next.active === false;
  if (becomesArchived || becomesInactive) {
    return ADMIN_VISIBILITY_CONFIRMATIONS.hide;
  }

  const currentVisible = isAdminResourcePubliclyVisible(current);
  if (currentVisible && !nextVisible) {
    return ADMIN_VISIBILITY_CONFIRMATIONS.hide;
  }
  if (!currentVisible && nextVisible) {
    return ADMIN_VISIBILITY_CONFIRMATIONS.publish;
  }

  return null;
}

export function adminVisibilityImpact(resourceKey: string, singular: string): string {
  return (
    IMPACTS[resourceKey] ??
    `${singular} ziyaretçi görünümünden kaldırılır; kayıt silinmez ve daha sonra yeniden yayınlanabilir.`
  );
}
