import "server-only";

import type { Database } from "@/lib/supabase/database.types";

export type AdminTable = keyof Database["public"]["Tables"];

export type AdminColumn<Table extends AdminTable> = Table extends AdminTable
  ? Extract<keyof Database["public"]["Tables"][Table]["Row"], string>
  : never;

export type AdminFieldType =
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "checkbox"
  | "select"
  | "datetime"
  | "url"
  | "json"
  | "string-array"
  | "foreign";

export type AdminOptionSource =
  | "branches"
  | "categories"
  | "media"
  | "pages"
  | "menu-items"
  | "menu-item-branches"
  | "events"
  | "merch-products";

export type AdminField<Table extends AdminTable = AdminTable> = {
  name: AdminColumn<Table>;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  nullable?: boolean;
  help?: string;
  options?: readonly { value: string; label: string }[];
  optionSource?: AdminOptionSource;
  defaultValue?: string | number | boolean;
  rows?: number;
  placeholder?: string;
};

type AdminResourceFor<Table extends AdminTable> = {
  key: string;
  table: Table;
  title: string;
  singular: string;
  description: string;
  group: "menu" | "events" | "merch" | "content" | "site";
  fields: readonly AdminField<Table>[];
  listFields: readonly AdminColumn<Table>[];
  labelField: AdminColumn<Table>;
  searchFields: readonly AdminColumn<Table>[];
  orderField: AdminColumn<Table>;
  allowCreate?: boolean;
  allowArchive?: boolean;
  allowHardDeleteTest?: boolean;
  testFields?: readonly string[];
  activeField?: Extract<AdminColumn<Table>, "is_active" | "is_available">;
  statusField?: Extract<AdminColumn<Table>, "status">;
};

export type AdminResource = {
  [Table in AdminTable]: AdminResourceFor<Table>;
}[AdminTable];

const contentStatusOptions = [
  { value: "draft", label: "Taslak" },
  { value: "published", label: "Yayında" },
  { value: "archived", label: "Arşiv" },
] as const;

const resources: readonly AdminResource[] = [
  {
    key: "menu-categories",
    table: "menu_categories",
    title: "Menü kategorileri",
    singular: "kategori",
    description: "Kategori adları, görünüm tipi, sıralama ve yayın durumu.",
    group: "menu",
    listFields: ["name", "slug", "display_type", "status", "is_active", "sort_order"],
    labelField: "name",
    searchFields: ["name", "slug", "description"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["name", "slug"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "name", label: "Kategori adı", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, help: "Küçük harf, sayı ve tire kullan." },
      { name: "description", label: "Açıklama", type: "textarea", nullable: true, rows: 3 },
      {
        name: "display_type",
        label: "Görünüm tipi",
        type: "select",
        required: true,
        defaultValue: "cards",
        options: [
          { value: "price_table", label: "Fiyat tablosu" },
          { value: "compact", label: "Kompakt" },
          { value: "cards", label: "Kartlar" },
          { value: "editorial", label: "Editorial" },
          { value: "feature", label: "Öne çıkan" },
          { value: "coffee", label: "Kahve" },
          { value: "custom", label: "Özel" },
        ],
      },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "menu-category-branches",
    table: "menu_category_branches",
    title: "Kategori - şube ilişkileri",
    singular: "kategori şube ilişkisi",
    description: "Kategorilerin Alsancak ve Atakent görünürlüğünü ve sırasını yönet.",
    group: "menu",
    listFields: ["category_id", "branch_id", "display_name", "is_active", "sort_order"],
    labelField: "display_name",
    searchFields: ["display_name", "description"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    activeField: "is_active",
    fields: [
      { name: "category_id", label: "Kategori", type: "foreign", optionSource: "categories", required: true },
      { name: "branch_id", label: "Şube", type: "foreign", optionSource: "branches", required: true },
      { name: "display_name", label: "Şubeye özel ad", type: "text", nullable: true },
      { name: "description", label: "Şubeye özel açıklama", type: "textarea", nullable: true, rows: 3 },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "menu-items",
    table: "menu_items",
    title: "Menü ürünleri",
    singular: "menü ürünü",
    description: "Ürün adı, açıklama, alerjen, görsel, kategori ve yayın durumu.",
    group: "menu",
    listFields: ["name", "category_id", "slug", "status", "is_active", "sort_order"],
    labelField: "name",
    searchFields: ["name", "slug", "description", "allergen_text"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["name", "slug"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "category_id", label: "Kategori", type: "foreign", optionSource: "categories", required: true },
      { name: "name", label: "Ürün adı", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Kısa açıklama", type: "textarea", nullable: true, rows: 3 },
      { name: "detail", label: "Detay", type: "textarea", nullable: true, rows: 3 },
      { name: "highlight_text", label: "Vurgu metni", type: "text", nullable: true },
      { name: "allergen_text", label: "Alerjen açıklaması", type: "text", nullable: true },
      { name: "allergens", label: "Alerjenler", type: "string-array", help: "Virgülle ayır." },
      { name: "badges", label: "Etiketler", type: "string-array", help: "Virgülle ayır." },
      { name: "image_media_id", label: "Ürün görseli", type: "foreign", optionSource: "media", nullable: true },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "menu-item-branches",
    table: "menu_item_branches",
    title: "Şube fiyatları",
    singular: "ürün şube fiyatı",
    description: "Ürünün şubede bulunması, temel fiyatı ve görünürlük notları.",
    group: "menu",
    listFields: ["menu_item_id", "branch_id", "price_cents", "price_label", "is_active", "sort_order"],
    labelField: "price_label",
    searchFields: ["price_label", "price_note", "availability_note"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    activeField: "is_active",
    fields: [
      { name: "menu_item_id", label: "Ürün", type: "foreign", optionSource: "menu-items", required: true },
      { name: "branch_id", label: "Şube", type: "foreign", optionSource: "branches", required: true },
      { name: "price_cents", label: "Temel fiyat (TL)", type: "money", nullable: true },
      { name: "price_label", label: "Fiyat etiketi", type: "text", nullable: true, placeholder: "Başlangıç / Porsiyon" },
      { name: "price_note", label: "Fiyat notu", type: "text", nullable: true },
      { name: "availability_note", label: "Bulunabilirlik notu", type: "text", nullable: true },
      { name: "is_active", label: "Bu şubede aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "menu-item-variants",
    table: "menu_item_variants",
    title: "Fiyat varyantları",
    singular: "fiyat varyantı",
    description: "Yarım/tam, hacim, kadeh/karaf gibi ürün seçenekleri.",
    group: "menu",
    listFields: ["menu_item_branch_id", "label", "slug", "price_cents", "is_active", "sort_order"],
    labelField: "label",
    searchFields: ["label", "slug", "detail", "price_note"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    activeField: "is_active",
    fields: [
      { name: "menu_item_branch_id", label: "Ürün ve şube", type: "foreign", optionSource: "menu-item-branches", required: true },
      { name: "label", label: "Seçenek adı", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "detail", label: "Detay", type: "text", nullable: true },
      { name: "price_cents", label: "Fiyat (TL)", type: "money", required: true },
      { name: "price_note", label: "Fiyat notu", type: "text", nullable: true },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "events",
    table: "events",
    title: "Etkinlikler",
    singular: "etkinlik",
    description: "Etkinlik metni, tarih-saat, yayın durumu ve görsel.",
    group: "events",
    listFields: ["title", "start_at", "status", "is_active", "is_featured"],
    labelField: "title",
    searchFields: ["title", "slug", "summary", "description"],
    orderField: "start_at",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["title", "slug"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "title", label: "Başlık", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "summary", label: "Kısa özet", type: "textarea", nullable: true, rows: 2 },
      { name: "description", label: "Açıklama", type: "textarea", required: true, rows: 5 },
      { name: "start_at", label: "Başlangıç", type: "datetime", required: true },
      { name: "end_at", label: "Bitiş", type: "datetime", nullable: true },
      { name: "venue_name", label: "Mekân adı", type: "text", nullable: true },
      { name: "location_text", label: "Konum metni", type: "text", nullable: true },
      { name: "external_url", label: "Harici bağlantı", type: "url", nullable: true },
      { name: "image_media_id", label: "Etkinlik görseli", type: "foreign", optionSource: "media", nullable: true },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "is_featured", label: "Öne çıkar", type: "checkbox" },
      { name: "published_at", label: "Yayın zamanı", type: "datetime", nullable: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "event-branches",
    table: "event_branches",
    title: "Etkinlik - şube ilişkileri",
    singular: "etkinlik şube ilişkisi",
    description: "Etkinliğin hangi şubelerde gösterileceğini belirle.",
    group: "events",
    listFields: ["event_id", "branch_id", "is_active", "sort_order"],
    labelField: "event_id",
    searchFields: [],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    activeField: "is_active",
    fields: [
      { name: "event_id", label: "Etkinlik", type: "foreign", optionSource: "events", required: true },
      { name: "branch_id", label: "Şube", type: "foreign", optionSource: "branches", required: true },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "merch-products",
    table: "merch_products",
    title: "Merch ürünleri",
    singular: "merch ürünü",
    description: "Ürün ve paketler, fiyat, stok, görsel ve yayın durumu.",
    group: "merch",
    listFields: ["name", "product_type", "price_cents", "inventory_status", "status", "is_active"],
    labelField: "name",
    searchFields: ["name", "slug", "description", "sku"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["name", "slug", "sku"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "name", label: "Ürün adı", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "product_type", label: "Tür", type: "select", required: true, defaultValue: "item", options: [{ value: "item", label: "Ürün" }, { value: "bundle", label: "Paket" }] },
      { name: "description", label: "Açıklama", type: "textarea", required: true, rows: 4 },
      { name: "detail", label: "Detay", type: "textarea", nullable: true, rows: 3 },
      { name: "sku", label: "SKU", type: "text", nullable: true },
      { name: "price_cents", label: "Fiyat (TL)", type: "money", required: true },
      { name: "inventory_status", label: "Stok durumu", type: "select", required: true, defaultValue: "available", options: [{ value: "available", label: "Mevcut" }, { value: "limited", label: "Sınırlı" }, { value: "out_of_stock", label: "Tükendi" }, { value: "discontinued", label: "Satıştan kaldırıldı" }] },
      { name: "stock_quantity", label: "Stok adedi", type: "number", nullable: true },
      { name: "image_media_id", label: "Ürün görseli", type: "foreign", optionSource: "media", nullable: true },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "published_at", label: "Yayın zamanı", type: "datetime", nullable: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "merch-product-branches",
    table: "merch_product_branches",
    title: "Merch - şube ilişkileri",
    singular: "merch şube ilişkisi",
    description: "Merch ürününün hangi şubede bulunduğunu belirle.",
    group: "merch",
    listFields: ["merch_product_id", "branch_id", "is_available", "sort_order"],
    labelField: "merch_product_id",
    searchFields: [],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    activeField: "is_available",
    fields: [
      { name: "merch_product_id", label: "Merch ürünü", type: "foreign", optionSource: "merch-products", required: true },
      { name: "branch_id", label: "Şube", type: "foreign", optionSource: "branches", required: true },
      { name: "is_available", label: "Bu şubede mevcut", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "instagram-posts",
    table: "instagram_posts",
    title: "Instagram gönderileri",
    singular: "Instagram gönderisi",
    description: "Gönderi bağlantısı, görsel, açıklama, tarih ve sıralama.",
    group: "content",
    listFields: ["caption", "published_at", "branch_id", "status", "is_active", "sort_order"],
    labelField: "caption",
    searchFields: ["caption", "permalink", "external_id"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["caption", "external_id"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "external_id", label: "Harici ID", type: "text", nullable: true },
      { name: "permalink", label: "Instagram bağlantısı", type: "url", required: true },
      { name: "caption", label: "Açıklama", type: "textarea", required: true, rows: 4 },
      { name: "image_alt", label: "Görsel alt metni", type: "text", required: true },
      { name: "branch_id", label: "Şube", type: "foreign", optionSource: "branches", nullable: true },
      { name: "image_media_id", label: "Görsel", type: "foreign", optionSource: "media", nullable: true },
      { name: "published_at", label: "Gönderi tarihi", type: "datetime", required: true },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "branches",
    table: "branches",
    title: "Şubeler",
    singular: "şube",
    description: "Adres, harita, iletişim, çalışma saatleri ve yayın durumu.",
    group: "site",
    listFields: ["name", "code", "district", "city", "status", "is_active", "sort_order"],
    labelField: "name",
    searchFields: ["name", "slug", "code", "address_line", "district", "city"],
    orderField: "sort_order",
    allowCreate: false,
    allowArchive: true,
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "name", label: "Şube adı", type: "text", required: true },
      { name: "short_description", label: "Kısa açıklama", type: "textarea", nullable: true, rows: 3 },
      { name: "address_line", label: "Adres", type: "textarea", required: true, rows: 3 },
      { name: "district", label: "İlçe", type: "text", required: true },
      { name: "city", label: "Şehir", type: "text", required: true },
      { name: "maps_url", label: "Google Maps bağlantısı", type: "url", required: true },
      { name: "phone", label: "Telefon", type: "text", nullable: true },
      { name: "public_email", label: "E-posta", type: "text", nullable: true },
      { name: "features", label: "Özellikler", type: "string-array" },
      { name: "opening_hours", label: "Çalışma saatleri (JSON)", type: "json", required: true, help: "Örnek: {\"note\":\"Her gün 09:00-00:00\"}" },
      { name: "status", label: "Yayın durumu", type: "select", required: true, options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox" },
      { name: "sort_order", label: "Sıra", type: "number", required: true },
    ],
  },
  {
    key: "site-settings",
    table: "site_settings",
    title: "Site ayarları",
    singular: "site ayarı",
    description: "Footer, sosyal medya, iletişim ve bölüm görünürlüklerini JSON değerlerle yönet.",
    group: "site",
    listFields: ["key", "description", "is_public", "status", "is_active", "sort_order"],
    labelField: "key",
    searchFields: ["key", "description"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["key"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "key", label: "Ayar anahtarı", type: "text", required: true },
      { name: "value", label: "Değer (JSON)", type: "json", required: true },
      { name: "description", label: "Açıklama", type: "textarea", nullable: true, rows: 3 },
      { name: "is_public", label: "Public siteden okunabilir", type: "checkbox" },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "site-pages",
    table: "site_pages",
    title: "Site sayfaları",
    singular: "site sayfası",
    description: "Sayfa başlıkları, SEO metinleri ve yayın durumu.",
    group: "content",
    listFields: ["title", "slug", "status", "is_active", "sort_order"],
    labelField: "title",
    searchFields: ["title", "slug", "seo_title", "seo_description"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["title", "slug"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "title", label: "Sayfa adı", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "seo_title", label: "SEO başlığı", type: "text", nullable: true },
      { name: "seo_description", label: "SEO açıklaması", type: "textarea", nullable: true, rows: 3 },
      { name: "metadata", label: "Metadata (JSON)", type: "json", required: true, defaultValue: "{}" },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "published_at", label: "Yayın zamanı", type: "datetime", nullable: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
  {
    key: "content-blocks",
    table: "content_blocks",
    title: "İçerik blokları",
    singular: "içerik bloğu",
    description: "Hero, Anılarımız, galeri ve diğer sayfa metinlerinin kontrollü JSON içeriği.",
    group: "content",
    listFields: ["key", "page_id", "block_type", "status", "is_active", "sort_order"],
    labelField: "key",
    searchFields: ["key", "block_type"],
    orderField: "sort_order",
    allowCreate: true,
    allowArchive: true,
    allowHardDeleteTest: true,
    testFields: ["key"],
    activeField: "is_active",
    statusField: "status",
    fields: [
      { name: "page_id", label: "Sayfa", type: "foreign", optionSource: "pages", required: true },
      { name: "key", label: "Blok anahtarı", type: "text", required: true },
      { name: "block_type", label: "Blok türü", type: "text", required: true },
      { name: "content", label: "İçerik (JSON)", type: "json", required: true },
      { name: "status", label: "Yayın durumu", type: "select", required: true, defaultValue: "draft", options: contentStatusOptions },
      { name: "is_active", label: "Aktif", type: "checkbox", defaultValue: true },
      { name: "sort_order", label: "Sıra", type: "number", required: true, defaultValue: 0 },
    ],
  },
] as const;

export function getAdminResource(key: string): AdminResource | null {
  return resources.find((resource) => resource.key === key) ?? null;
}

export function getAdminResources(): readonly AdminResource[] {
  return resources;
}
