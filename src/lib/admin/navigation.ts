export const adminTasks = [
  {
    label: "Menü fiyatı değiştir",
    href: "/admin/menu?mode=prices",
    description: "Şubeyi ve ürünü seçin, fiyatı güncelleyin.",
    keywords: "fiyat menü efes",
  },
  {
    label: "Yeni ürün ekle",
    href: "/admin/menu?new=1",
    description: "Ürün, şube, fiyat ve görseli birlikte ekleyin.",
    keywords: "ürün ekle",
  },
  {
    label: "Ürünü gizle / göster",
    href: "/admin/menu",
    description: "Bir ürünün şubedeki görünürlüğünü değiştirin.",
    keywords: "gizle göster menü",
  },
  {
    label: "Fotoğraf değiştir",
    href: "/admin/media",
    description: "Görselleri yükleyin ve kullanım yerlerini bulun.",
    keywords: "fotoğraf görsel medya",
  },
  {
    label: "Etkinlik / duyuru ekle",
    href: "/admin/manage/events?new=1",
    description: "Yeni etkinlik veya duyuru yayınlayın.",
    keywords: "etkinlik duyuru",
  },
  {
    label: "Site içeriğini düzenle",
    href: "/admin/content",
    description: "Ana sayfa, şubeler, Instagram ve footer.",
    keywords: "içerik instagram footer iletişim",
  },
  {
    label: "Kariyer başvurularını incele",
    href: "/admin/applications",
    description: "Yeni başvuruları ve değerlendirmeleri açın.",
    keywords: "kariyer başvuru",
  },
];

export const adminNavigation = [
  { label: "Ana Sayfa", links: [{ href: "/admin", label: "Ana Sayfa" }] },
  {
    label: "Menü",
    links: [
      { href: "/admin/menu", label: "Menüyü Düzenle" },
      { href: "/admin/menu?new=1", label: "Yeni Ürün Ekle" },
      { href: "/admin/menu?mode=prices", label: "Fiyatları Düzenle" },
    ],
  },
  {
    label: "İçerik",
    links: [
      { href: "/admin/manage/events", label: "Etkinlik / Duyuru" },
      { href: "/admin/media", label: "Görseller" },
      { href: "/admin/content", label: "Site İçeriği" },
    ],
  },
  {
    label: "İşletme",
    links: [
      { href: "/admin/manage/branches", label: "Şubeler" },
      { href: "/admin/applications", label: "Kariyer Başvuruları" },
    ],
  },
  {
    label: "Site",
    links: [
      { href: "/admin/theme", label: "Tasarım" },
      { href: "/admin/content?section=settings", label: "Site Ayarları" },
    ],
  },
];

export const advancedNavigation = [
  { href: "/admin/logs", label: "Sistem Kayıtları / Teknik Loglar" },
  { href: "/admin/manage/menu-categories", label: "Kategoriler" },
  {
    href: "/admin/manage/menu-category-branches",
    label: "Kategori - şube ilişkileri",
  },
  { href: "/admin/manage/menu-items", label: "Ürün kayıtları" },
  { href: "/admin/manage/menu-item-branches", label: "Ürün - şube ilişkileri" },
  { href: "/admin/manage/menu-item-variants", label: "Varyant kayıtları" },
  { href: "/admin/pricing", label: "Teknik fiyat yönetimi" },
  { href: "/admin/manage/event-branches", label: "Etkinlik - şube ilişkileri" },
  { href: "/admin/manage/merch-products", label: "Merch ürünleri" },
  {
    href: "/admin/manage/merch-product-branches",
    label: "Merch - şube ilişkileri",
  },
  { href: "/admin/manage/instagram-posts", label: "Instagram kayıtları" },
  { href: "/admin/manage/site-pages", label: "Site Pages" },
  { href: "/admin/manage/content-blocks", label: "Content Blocks" },
  { href: "/admin/manage/site-settings", label: "Gelişmiş Site Settings" },
];
