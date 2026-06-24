import Link from "next/link";
import AdminPagination from "@/components/admin/crud/AdminPagination";
import adminStyles from "@/components/admin/crud/AdminResource.module.css";
import styles from "./PricingManagement.module.css";
import { firstString, formatAdminDate, formatMoneyCents } from "@/lib/admin/format";
import { saveAdminProductPricing } from "@/lib/admin/pricing-actions";
import {
  branchPricingField,
  formatTryPriceInput,
  hasMissingBranchPrice,
  isUuid,
  resolveBranchDisplayPrice,
  resolveProductMenuState,
  variantPricingField,
} from "@/lib/admin/pricing";
import {
  createAdminPagination,
  normaliseAdminSearch,
  parseAdminPage,
} from "@/lib/admin/pagination";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

const PRICING_PAGE_SIZE = 12;

type ProductRow = Pick<
  Database["public"]["Tables"]["menu_items"]["Row"],
  "id" | "category_id" | "name" | "slug" | "status" | "is_active" | "sort_order" | "updated_at"
>;
type CategoryRow = Pick<
  Database["public"]["Tables"]["menu_categories"]["Row"],
  "id" | "name" | "status" | "is_active" | "sort_order"
>;
type BranchRow = Pick<
  Database["public"]["Tables"]["branches"]["Row"],
  "id" | "name" | "code" | "status" | "is_active" | "sort_order"
>;
type CategoryBranchRow = Pick<
  Database["public"]["Tables"]["menu_category_branches"]["Row"],
  "category_id" | "branch_id" | "is_active"
>;
type BranchPriceRow = Pick<
  Database["public"]["Tables"]["menu_item_branches"]["Row"],
  | "id"
  | "menu_item_id"
  | "branch_id"
  | "price_cents"
  | "price_label"
  | "price_note"
  | "availability_note"
  | "is_active"
  | "sort_order"
  | "updated_at"
>;
type VariantRow = Pick<
  Database["public"]["Tables"]["menu_item_variants"]["Row"],
  | "id"
  | "menu_item_branch_id"
  | "label"
  | "slug"
  | "price_cents"
  | "price_note"
  | "is_active"
  | "sort_order"
  | "updated_at"
>;

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    branch?: string | string[];
    active?: string | string[];
    missing?: string | string[];
    page?: string | string[];
    notice?: string | string[];
    error?: string | string[];
  }>;
};

function pricingHref(values: {
  q?: string;
  category?: string;
  branch?: string;
  active?: string;
  missing?: boolean;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.category) params.set("category", values.category);
  if (values.branch) params.set("branch", values.branch);
  if (values.active && values.active !== "all") params.set("active", values.active);
  if (values.missing) params.set("missing", "1");
  if (values.page && values.page > 1) params.set("page", String(values.page));
  return `/admin/pricing${params.size ? `?${params.toString()}` : ""}`;
}

function keyFor(menuItemId: string, branchId: string) {
  return `${menuItemId}:${branchId}`;
}

function latestUpdatedAt(values: Array<string | null | undefined>): string {
  let latest = "";
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    if (!value) continue;
    const time = Date.parse(value);
    if (Number.isNaN(time) || time <= latestTime) continue;
    latest = value;
    latestTime = time;
  }

  return latest;
}

export default async function AdminPricingPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = normaliseAdminSearch(firstString(params.q));
  const categoryParam = firstString(params.category) ?? "";
  const categoryFilter = isUuid(categoryParam) ? categoryParam : "";
  const branchFilter = firstString(params.branch) ?? "";
  const activeFilter = ["active", "inactive"].includes(firstString(params.active) ?? "")
    ? firstString(params.active)!
    : "all";
  const onlyMissing = firstString(params.missing) === "1";
  const requestedPage = parseAdminPage(firstString(params.page));
  const supabase = await createClient();

  let productsQuery = supabase
    .from("menu_items")
    .select("id, category_id, name, slug, status, is_active, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (q) productsQuery = productsQuery.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  if (categoryFilter) productsQuery = productsQuery.eq("category_id", categoryFilter);
  if (activeFilter === "active") productsQuery = productsQuery.eq("is_active", true);
  if (activeFilter === "inactive") productsQuery = productsQuery.eq("is_active", false);

  const [categoriesResult, branchesResult, productsResult] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name, status, is_active, sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("branches")
      .select("id, name, code, status, is_active, sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    productsQuery.limit(1000),
  ]);

  for (const result of [categoriesResult, branchesResult, productsResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const categories = (categoriesResult.data ?? []) as CategoryRow[];
  const activeBranches = ((branchesResult.data ?? []) as BranchRow[]).filter(
    (branch) => branch.is_active,
  );
  const products = (productsResult.data ?? []) as ProductRow[];
  const validBranchFilter = activeBranches.some((branch) => branch.id === branchFilter)
    ? branchFilter
    : "";
  const displayBranches = validBranchFilter
    ? activeBranches.filter((branch) => branch.id === validBranchFilter)
    : activeBranches;

  let categoryBranches: CategoryBranchRow[] = [];
  const categoryIds = [...new Set(products.map((product) => product.category_id))];
  const activeBranchIds = activeBranches.map((branch) => branch.id);
  if (categoryIds.length && activeBranchIds.length) {
    const { data, error } = await supabase
      .from("menu_category_branches")
      .select("category_id, branch_id, is_active")
      .in("category_id", categoryIds)
      .in("branch_id", activeBranchIds)
      .limit(5000);
    if (error) throw new Error(error.message);
    categoryBranches = (data ?? []) as CategoryBranchRow[];
  }

  let allBranchPrices: BranchPriceRow[] = [];
  const productIds = products.map((product) => product.id);
  if (productIds.length) {
    const { data, error } = await supabase
      .from("menu_item_branches")
      .select(
        "id, menu_item_id, branch_id, price_cents, price_label, price_note, availability_note, is_active, sort_order, updated_at",
      )
      .in("menu_item_id", productIds)
      .limit(5000);
    if (error) throw new Error(error.message);
    allBranchPrices = (data ?? []) as BranchPriceRow[];
  }

  let variantsForMissingFilter: VariantRow[] = [];
  if (onlyMissing && allBranchPrices.length) {
    const { data, error } = await supabase
      .from("menu_item_variants")
      .select(
        "id, menu_item_branch_id, label, slug, price_cents, price_note, is_active, sort_order, updated_at",
      )
      .order("sort_order", { ascending: true })
      .limit(5000);
    if (error) throw new Error(error.message);
    variantsForMissingFilter = (data ?? []) as VariantRow[];
  }

  const priceByProductBranch = new Map(
    allBranchPrices.map((price) => [keyFor(price.menu_item_id, price.branch_id), price]),
  );
  const displayedBranchIds = displayBranches.map((branch) => branch.id);
  const filteredProducts = onlyMissing
    ? products.filter((product) =>
        hasMissingBranchPrice(
          product.id,
          displayedBranchIds,
          allBranchPrices,
          variantsForMissingFilter,
        ),
      )
    : products;

  const pagination = createAdminPagination(
    filteredProducts.length,
    requestedPage,
    PRICING_PAGE_SIZE,
  );
  const start = (pagination.page - 1) * pagination.pageSize;
  const visibleProducts = filteredProducts.slice(start, start + pagination.pageSize);
  const visibleProductIds = new Set(visibleProducts.map((product) => product.id));
  const visibleBranchPrices = allBranchPrices.filter((price) =>
    visibleProductIds.has(price.menu_item_id),
  );
  const visibleBranchPriceIds = visibleBranchPrices.map((price) => price.id);

  let variants: VariantRow[] = [];
  if (visibleBranchPriceIds.length) {
    if (onlyMissing) {
      const visibleBranchPriceIdSet = new Set(visibleBranchPriceIds);
      variants = variantsForMissingFilter.filter((variant) =>
        visibleBranchPriceIdSet.has(variant.menu_item_branch_id),
      );
    } else {
      const { data, error } = await supabase
        .from("menu_item_variants")
        .select(
          "id, menu_item_branch_id, label, slug, price_cents, price_note, is_active, sort_order, updated_at",
        )
        .in("menu_item_branch_id", visibleBranchPriceIds)
        .order("sort_order", { ascending: true })
        .limit(5000);
      if (error) throw new Error(error.message);
      variants = (data ?? []) as VariantRow[];
    }
  }

  const variantsByBranchPrice = new Map<string, VariantRow[]>();
  for (const variant of variants) {
    const list = variantsByBranchPrice.get(variant.menu_item_branch_id) ?? [];
    list.push(variant);
    variantsByBranchPrice.set(variant.menu_item_branch_id, list);
  }

  const pricesByProduct = new Map<string, BranchPriceRow[]>();
  for (const price of visibleBranchPrices) {
    const list = pricesByProduct.get(price.menu_item_id) ?? [];
    list.push(price);
    pricesByProduct.set(price.menu_item_id, list);
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const branchById = new Map(activeBranches.map((branch) => [branch.id, branch]));
  const categoryBranchByKey = new Map(
    categoryBranches.map((relation) => [
      keyFor(relation.category_id, relation.branch_id),
      relation,
    ]),
  );
  const returnTo = pricingHref({
    q,
    category: categoryFilter,
    branch: validBranchFilter,
    active: activeFilter,
    missing: onlyMissing,
    page: pagination.page,
  });

  return (
    <section className={adminStyles.page}>
      <header className={adminStyles.head}>
        <div>
          <p className="eyebrow">Menü fiyatları</p>
          <h1>Fiyat yönetimi<span>.</span></h1>
          <p>
            Ürünü bul, satırı aç ve görünen bütün şube fiyatlarıyla varyantları tek seferde kaydet.
          </p>
        </div>
        <div className={adminStyles.actions}>
          <Link className={adminStyles.secondary} href="/admin/manage/menu-items">Ürün içerikleri</Link>
          <Link className={adminStyles.secondary} href="/admin/manage/menu-item-branches">Gelişmiş fiyat tabloları</Link>
        </div>
      </header>

      {firstString(params.notice) ? <p className={adminStyles.notice}>{firstString(params.notice)}</p> : null}
      {firstString(params.error) ? <p className={adminStyles.error}>{firstString(params.error)}</p> : null}

      <section className={`${adminStyles.panel} ${styles.filterPanel}`}>
        <form className={styles.filters} method="get">
          <label>
            <span>Ürün ara</span>
            <input defaultValue={q} name="q" placeholder="Ürün adı veya slug" type="search" />
          </label>
          <label>
            <span>Kategori</span>
            <select defaultValue={categoryFilter} name="category">
              <option value="">Tüm kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}{category.is_active ? "" : " (pasif)"}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Şube</span>
            <select defaultValue={validBranchFilter} name="branch">
              <option value="">Tüm aktif şubeler</option>
              {activeBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Ürün durumu</span>
            <select defaultValue={activeFilter} name="active">
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </label>
          <label className={styles.missingToggle}>
            <input defaultChecked={onlyMissing} name="missing" type="checkbox" value="1" />
            <span>Fiyatı eksik olanlar</span>
          </label>
          <button className={adminStyles.primary} type="submit">Filtrele</button>
          <Link className={adminStyles.secondary} href="/admin/pricing">Temizle</Link>
        </form>
        <p className={styles.summary}>
          {filteredProducts.length} ürün · {displayBranches.length} şube · Sayfa {pagination.page}/{pagination.pageCount}
        </p>
      </section>

      {visibleProducts.length ? (
        <section className={styles.pricingTable} aria-label="Birleşik fiyat yönetimi tablosu">
          <div className={styles.tableHeader} aria-hidden="true">
            <span>Ürün adı</span>
            <span>Kategori</span>
            <span>Ürün türü</span>
            <span>Şube fiyatları</span>
            <span>Durum</span>
            <span>Son güncelleme</span>
            <span>İşlem</span>
          </div>

          <div className={styles.productList}>
            {visibleProducts.map((product) => {
              const category = categoryById.get(product.category_id);
              const productPrices = pricesByProduct.get(product.id) ?? [];
              const productVariants = productPrices.flatMap(
                (price) => variantsByBranchPrice.get(price.id) ?? [],
              );
              const productType = productVariants.length ? "Varyantlı" : "Standart";
              const latestUpdate = latestUpdatedAt([
                product.updated_at,
                ...productPrices.map((price) => price.updated_at),
                ...productVariants.map((variant) => variant.updated_at),
              ]);
              const categoryIsPublic = Boolean(
                category?.is_active && category.status === "published",
              );
              const hasPublicBranchPlacement = productPrices.some((price) => {
                const branch = branchById.get(price.branch_id);
                const categoryBranch = categoryBranchByKey.get(
                  keyFor(product.category_id, price.branch_id),
                );
                return Boolean(
                  price.is_active
                  && branch?.is_active
                  && branch.status === "published"
                  && categoryBranch?.is_active,
                );
              });
              const menuState = resolveProductMenuState({
                productStatus: product.status,
                productIsActive: product.is_active,
                categoryIsPublic,
                hasPublicBranchPlacement,
              });

              return (
                <details className={styles.productCard} key={product.id}>
                  <summary className={styles.productSummary}>
                    <span className={styles.productNameCell} data-label="Ürün adı">
                      <strong>{product.name}</strong>
                      <small>{product.slug}</small>
                    </span>
                    <span className={styles.summaryCell} data-label="Kategori">
                      {category?.name ?? "Kategorisiz"}
                    </span>
                    <span className={styles.summaryCell} data-label="Ürün türü">
                      <span className={styles.typeBadge}>{productType}</span>
                    </span>
                    <span className={`${styles.summaryCell} ${styles.branchSummary}`} data-label="Şube fiyatları">
                      {displayBranches.map((branch) => {
                        const price = priceByProductBranch.get(keyFor(product.id, branch.id));
                        const branchVariants = price
                          ? variantsByBranchPrice.get(price.id) ?? []
                          : [];
                        const displayPrice = resolveBranchDisplayPrice(price, branchVariants);
                        return (
                          <span
                            className={`${styles.priceChip} ${displayPrice === null ? styles.priceMissing : ""} ${price && !price.is_active ? styles.pricePassive : ""}`}
                            key={branch.id}
                          >
                            <strong>{branch.name}</strong>
                            <span>{displayPrice === null ? "Fiyat yok" : formatMoneyCents(displayPrice.priceCents)}</span>
                            {displayPrice?.source === "variant" ? (
                              <small>{displayPrice.variantLabel ?? "Varyant fiyatı"}</small>
                            ) : price?.price_label ? (
                              <small>{price.price_label}</small>
                            ) : null}
                          </span>
                        );
                      })}
                    </span>
                    <span className={styles.summaryCell} data-label="Durum">
                      <span
                        className={
                          menuState.tone === "live"
                            ? styles.live
                            : menuState.tone === "unlisted"
                              ? styles.unlisted
                              : styles.passive
                        }
                      >
                        {menuState.label}
                      </span>
                    </span>
                    <span className={styles.summaryCell} data-label="Son güncelleme">
                      {formatAdminDate(latestUpdate)}
                    </span>
                    <span className={styles.openAction} data-label="İşlem">
                      <span>Düzenle</span>
                      <span className={styles.chevron}>⌄</span>
                    </span>
                  </summary>

                  <form action={saveAdminProductPricing} className={styles.productEditor}>
                    <input name="menu_item_id" type="hidden" value={product.id} />
                    <input name="return_to" type="hidden" value={returnTo} />

                    <div className={styles.editorHead}>
                      <div>
                        <strong>{product.name} fiyatları</strong>
                        <p>
                          Bu formda görünen şubeler ve varyantlar tek kaydetme işlemiyle güncellenir.
                        </p>
                      </div>
                      <Link href={`/admin/manage/menu-items?edit=${product.id}`}>Ürün içeriğini düzenle →</Link>
                    </div>

                    <div className={styles.branchGrid}>
                      {displayBranches.map((branch) => {
                        const branchPrice = priceByProductBranch.get(keyFor(product.id, branch.id));
                        const branchVariants = branchPrice
                          ? variantsByBranchPrice.get(branchPrice.id) ?? []
                          : [];
                        const variantSourcePrices = productPrices.filter((candidate) =>
                          candidate.branch_id !== branch.id
                          && (variantsByBranchPrice.get(candidate.id) ?? []).length > 0,
                        );

                        return (
                          <section className={styles.branchCard} key={branch.id}>
                            <input
                              name={branchPricingField(branch.id, "record_id")}
                              type="hidden"
                              value={branchPrice?.id ?? ""}
                            />
                            <div className={styles.branchHead}>
                              <div>
                                <span>{branch.code}</span>
                                <h2>{branch.name}</h2>
                              </div>
                              <div className={styles.branchState}>
                                {branchPrice ? (
                                  <>
                                    <small>{branchVariants.length} varyant</small>
                                    <small>Güncelleme: {formatAdminDate(branchPrice.updated_at)}</small>
                                  </>
                                ) : (
                                  <small className={styles.missing}>Menü bağlantısı yok</small>
                                )}
                              </div>
                            </div>

                            {!branchPrice ? (
                              <details className={styles.addToMenu}>
                                <summary>
                                  <span>Bu ürünü {branch.name} menüsüne ekle</span>
                                  <span className={styles.chevron}>⌄</span>
                                </summary>
                                <div className={styles.addToMenuBody}>
                                  <label className={styles.createToggle}>
                                    <input name={branchPricingField(branch.id, "create")} type="checkbox" />
                                    <span>Kaydettiğimde ürün–şube bağlantısını oluştur</span>
                                  </label>

                                  <div className={styles.impactNote}>
                                    <strong>Etkilenecek kayıtlar</strong>
                                    <p>
                                      Ürün kategorisi kontrol edilir; kategori–şube bağlantısı otomatik oluşturulur veya aktifleştirilir;
                                      ürün menü sırasının sonuna eklenir ve seçersen varyantlar kaynak şubeden kopyalanır.
                                      Kayıttan sonra doğrudan varyant yönetimi açılır.
                                    </p>
                                  </div>

                                  <div className={styles.menuPlacementGrid}>
                                    <label>
                                      <span>Menü kategorisi</span>
                                      <select
                                        defaultValue={product.category_id}
                                        name={branchPricingField(branch.id, "category_id")}
                                      >
                                        {categories.map((candidate) => (
                                          <option key={candidate.id} value={candidate.id}>
                                            {candidate.name}{candidate.is_active && candidate.status === "published" ? "" : " (ziyaretçi sitesinde değil)"}
                                          </option>
                                        ))}
                                      </select>
                                      <small>Kategori değişirse ürünün iki şubedeki kategorisi de değişir.</small>
                                    </label>
                                    <label>
                                      <span>Varyantları kopyala</span>
                                      <select
                                        defaultValue=""
                                        name={branchPricingField(branch.id, "copy_variants_from_branch_id")}
                                      >
                                        <option value="">Kopyalama</option>
                                        {variantSourcePrices.map((sourcePrice) => {
                                          const sourceBranch = branchById.get(sourcePrice.branch_id);
                                          const sourceVariants = variantsByBranchPrice.get(sourcePrice.id) ?? [];
                                          return (
                                            <option key={sourcePrice.branch_id} value={sourcePrice.branch_id}>
                                              {sourceBranch?.name ?? "Diğer şube"} · {sourceVariants.length} varyant
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </label>
                                  </div>
                                </div>
                              </details>
                            ) : null}

                            <div className={styles.priceFields}>
                              <label>
                                <span>Ana fiyat (TL)</span>
                                <input
                                  aria-label={`${product.name} ${branch.name} ana fiyatı`}
                                  defaultValue={formatTryPriceInput(branchPrice?.price_cents)}
                                  inputMode="decimal"
                                  name={branchPricingField(branch.id, "price")}
                                  placeholder="85,50"
                                />
                              </label>
                              <label>
                                <span>Fiyat etiketi</span>
                                <input
                                  defaultValue={branchPrice?.price_label ?? ""}
                                  maxLength={120}
                                  name={branchPricingField(branch.id, "price_label")}
                                  placeholder="Porsiyon / Başlangıç"
                                />
                              </label>
                              {branchPrice ? (
                                <label className={styles.activeToggle}>
                                  <input
                                    defaultChecked={branchPrice.is_active}
                                    name={branchPricingField(branch.id, "is_active")}
                                    type="checkbox"
                                  />
                                  <span>Bu şubede aktif</span>
                                </label>
                              ) : null}
                            </div>

                            <details className={styles.notes}>
                              <summary>Fiyat ve bulunabilirlik notları</summary>
                              <div className={styles.noteFields}>
                                <label>
                                  <span>Fiyat notu</span>
                                  <input
                                    defaultValue={branchPrice?.price_note ?? ""}
                                    maxLength={300}
                                    name={branchPricingField(branch.id, "price_note")}
                                  />
                                </label>
                                <label>
                                  <span>Bulunabilirlik notu</span>
                                  <input
                                    defaultValue={branchPrice?.availability_note ?? ""}
                                    maxLength={300}
                                    name={branchPricingField(branch.id, "availability_note")}
                                  />
                                </label>
                              </div>
                            </details>

                            {branchPrice ? (
                              <div className={styles.variants}>
                                <div className={styles.variantsHead}>
                                  <strong>Varyantlar</strong>
                                  <Link
                                    href={`/admin/manage/menu-item-variants?new=1&prefill_menu_item_branch_id=${branchPrice.id}#new-record`}
                                  >
                                    Yeni / gelişmiş yönetim →
                                  </Link>
                                </div>
                                {branchVariants.length ? branchVariants.map((variant) => (
                                  <div className={styles.variantRow} key={variant.id}>
                                    <input
                                      name={variantPricingField(variant.id, "record_id")}
                                      type="hidden"
                                      value={variant.id}
                                    />
                                    <div>
                                      <strong>{variant.label}</strong>
                                      <small>{variant.slug}</small>
                                    </div>
                                    <label>
                                      <span>Fiyat (TL)</span>
                                      <input
                                        aria-label={`${product.name} ${variant.label} fiyatı`}
                                        defaultValue={formatTryPriceInput(variant.price_cents)}
                                        inputMode="decimal"
                                        name={variantPricingField(variant.id, "price")}
                                        required
                                      />
                                    </label>
                                    <label className={styles.variantActive}>
                                      <input
                                        defaultChecked={variant.is_active}
                                        name={variantPricingField(variant.id, "is_active")}
                                        type="checkbox"
                                      />
                                      <span>Aktif</span>
                                    </label>
                                    <label>
                                      <span>Fiyat notu</span>
                                      <input
                                        defaultValue={variant.price_note ?? ""}
                                        maxLength={300}
                                        name={variantPricingField(variant.id, "price_note")}
                                        placeholder="Opsiyonel"
                                      />
                                    </label>
                                  </div>
                                )) : (
                                  <p className={styles.noVariants}>Bu şube fiyatında varyant yok.</p>
                                )}
                              </div>
                            ) : null}
                          </section>
                        );
                      })}
                    </div>

                    <footer className={styles.saveBar}>
                      <p>
                        Değişiklikler işlem geçmişine kaydedilir. Boş bırakılan yeni şubeler oluşturulmaz.
                      </p>
                      <button className={adminStyles.primary} type="submit">
                        Görünen tüm fiyatları kaydet
                      </button>
                    </footer>
                  </form>
                </details>
              );
            })}
          </div>
        </section>
      ) : (
        <div className={`${adminStyles.panel} ${styles.empty}`}>
          Bu filtrelerle eşleşen ürün bulunamadı.
        </div>
      )}

      <AdminPagination
        basePath="/admin/pricing"
        pagination={pagination}
        query={{
          q: q || undefined,
          category: categoryFilter || undefined,
          branch: validBranchFilter || undefined,
          active: activeFilter !== "all" ? activeFilter : undefined,
          missing: onlyMissing ? "1" : undefined,
        }}
      />
    </section>
  );
}
