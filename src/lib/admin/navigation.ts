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
    href: "/admin/site",
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
  { label: "Menü", links: [{ href: "/admin/menu", label: "Menü" }] },
  {
    label: "İçerik",
    links: [
      { href: "/admin/manage/events", label: "Etkinlikler / Duyurular" },
      { href: "/admin/media", label: "Görseller" },
      { href: "/admin/site", label: "Site" },
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
    label: "Teknik",
    links: [{ href: "/admin/logs", label: "Sistem Kayıtları / Teknik Loglar" }],
  },
];
