export type BranchId = string;
export type EventBranchId = string;
export type CurrencyCode = "TRY";

/**
 * Backend ve yönetici panelinde kullanılacak şube modeli.
 * Adres, harita ve sıralama bilgileri tek bir kaynaktan yönetilir.
 */
export type Branch = {
  id: BranchId;
  code: string;
  name: string;
  addressLine: string;
  district: string;
  city: string;
  mapsUrl: string;
  shortDescription?: string;
  phone?: string;
  publicEmail?: string;
  openingHours?: readonly string[];
  features: readonly string[];
  active: boolean;
  sortOrder: number;
};

/** Menü kategorileri veritabanında şubelerle ilişkilendirilebilir. */
export type Category = {
  id: string;
  slug: string;
  name: string;
  branchIds: readonly BranchId[];
  description?: string;
  active: boolean;
  sortOrder: number;
};

/** Fiyat kuruş cinsinden tutulur; arayüzde biçimlendirilerek gösterilir. */
export type MenuItem = {
  id: string;
  categoryId: string;
  branchIds: readonly BranchId[];
  name: string;
  description?: string;
  price: number;
  currency: CurrencyCode;
  imageUrl?: string;
  allergens?: readonly string[];
  badges?: readonly string[];
  active: boolean;
  sortOrder: number;
};

/** Supabase tablosuna karşılık gelecek etkinlik modeli. */
export type Event = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt?: string | null;
  branchId: EventBranchId;
  status: "draft" | "published";
  location?: string;
  link?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Merch ürünleri de menüden bağımsız bir koleksiyon olarak yönetilir. */
export type MerchProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  detail?: string;
  price: number;
  currency: CurrencyCode;
  branchIds: readonly BranchId[];
  image?: string;
  imageAlt?: string;
  active: boolean;
  sortOrder: number;
};
