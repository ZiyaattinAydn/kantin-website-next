"use client";
import { menuGroup, categoryHidden } from "@/lib/menu/presentation";
import Link from "next/link";
import { runAdminAction } from "@/lib/admin/client-action";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MenuData } from "@/lib/admin/menu-model";
import type { MediaChoice } from "@/lib/admin/media-choices";
import { formatTryPriceInput } from "@/lib/admin/pricing";
import {
  moveMenuCategory,
  moveMenuProduct,
  setMenuVisibility,
} from "@/lib/admin/menu-actions";
import AdminDialog from "../ui/AdminDialog";
import MenuPriceForm from "./MenuPriceForm";
import MenuCategoryForm from "./MenuCategoryForm";
import MenuProductForm from "./MenuProductForm";
import styles from "./SimpleAdmin.module.css";
export default function MenuManager({
  data,
  media,
  initialBranch,
  initialSearch,
  initialEdit,
  initialCategory,
  showNew,
  initialPrices,
  initialCategoryEdit,
  initialVisibility,
}: {
  data: MenuData;
  media: MediaChoice[];
  initialBranch?: string;
  initialSearch?: string;
  initialEdit?: string;
  initialCategory?: string;
  showNew: boolean;
  initialPrices?: string;
  initialCategoryEdit?: string;
  initialVisibility?: string;
  pricesOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [branch, setBranch] = useState(
    data.branches.find(
      (b) => b.id === initialBranch || b.slug === initialBranch,
    )?.id ??
      data.branches[0]?.id ??
      "",
  );
  const [search, setSearch] = useState(initialSearch ?? "");
  const [editing, setEditing] = useState<string | null>(
    showNew
      ? "new"
      : data.products.some((p) => p.id === initialEdit)
        ? initialEdit!
        : null,
  );
  const [priceEdit, setPriceEdit] = useState<string | null>(
    data.products.some((p) => p.id === initialPrices) ? initialPrices! : null,
  );
  const [categoryEdit, setCategoryEdit] = useState<string | null>(
    initialCategoryEdit === "new" ||
      data.categories.some((c) => c.id === initialCategoryEdit)
      ? initialCategoryEdit!
      : null,
  );
  const [filterCategory, setFilterCategory] = useState(initialCategory ?? "");
  const [filterVisibility, setFilterVisibility] = useState(
    ["visible", "hidden"].includes(initialVisibility ?? "")
      ? initialVisibility!
      : "",
  );
  const [category, setCategory] = useState(initialCategory);
  const [message, setMessage] = useState("");
  function keepContext(key: string, value: string) {
    const url = new URL(location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    for (const k of [
      "edit",
      "new",
      "priceEdit",
      "categoryEdit",
      "mode",
      "notice",
    ])
      url.searchParams.delete(k);
    history.replaceState(history.state, "", url.pathname + url.search);
  }
  const categories = data.categories.filter(
    (c) =>
      data.categoryBranches.some(
        (b) => b.category_id === c.id && b.branch_id === branch,
      ) ||
      data.products.some(
        (p) =>
          p.category_id === c.id &&
          data.placements.some(
            (b) => b.menu_item_id === p.id && b.branch_id === branch,
          ),
      ),
  );
  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Menü</p>
          <h1>Menü</h1>
          <p>
            Şubeyi seçin. Ürünü açıp fiyatını, porsiyonlarını ve görselini
            düzenleyin.
          </p>
        </div>
        <button
          className={styles.primary}
          onClick={() => {
            setCategory(undefined);
            setEditing("new");
          }}
        >
          + Yeni ürün ekle
        </button>
      </header>
      <div className={styles.tabs} aria-label="Şube seçimi">
        {data.branches.map((b) => (
          <button
            className={b.id === branch ? styles.primary : undefined}
            aria-pressed={b.id === branch}
            key={b.id}
            disabled={pending || !!editing}
            onClick={() => {
              setBranch(b.id);
              keepContext("branch", b.id);
            }}
          >
            {b.name.toLocaleUpperCase("tr")}
          </button>
        ))}
        <Link
          className={styles.button}
          href={`/menu?sube=${data.branches.find((b) => b.id === branch)?.slug ?? ""}`}
          target="_blank"
        >
          Canlı menüyü aç
        </Link>
      </div>
      {message ? (
        <p role="status" className={styles.notice}>
          {message}
        </p>
      ) : null}
      {editing ? (
        <AdminDialog
          title={editing === "new" ? "Yeni ürün ekle" : "Ürünü düzenle"}
          open
          onClose={() => setEditing(null)}
        >
          <MenuProductForm
            key={editing}
            data={data}
            media={media}
            branchId={branch}
            categoryId={category}
            product={data.products.find((p) => p.id === editing)}
            onClose={() => setEditing(null)}
            onSaved={(message) => {
              setEditing(null);
              keepContext("", "");
              setMessage(message);
            }}
          />
        </AdminDialog>
      ) : null}
      {priceEdit ? (
        <AdminDialog
          title={`${data.products.find((p) => p.id === priceEdit)?.name} — Fiyatlar`}
          open
          onClose={() => setPriceEdit(null)}
        >
          <MenuPriceForm
            data={data}
            id={priceEdit}
            onSaved={(m) => {
              setPriceEdit(null);
              keepContext("", "");
              setMessage(m);
            }}
          />
        </AdminDialog>
      ) : null}
      {categoryEdit ? (
        <AdminDialog
          title={
            categoryEdit === "new" ? "Yeni kategori" : "Kategoriyi düzenle"
          }
          open
          onClose={() => setCategoryEdit(null)}
        >
          <MenuCategoryForm
            data={data}
            id={categoryEdit === "new" ? undefined : categoryEdit}
            branchId={branch}
            onSaved={(m) => {
              setCategoryEdit(null);
              keepContext("", "");
              setMessage(m);
            }}
          />
        </AdminDialog>
      ) : null}
      <div className={styles.actions}>
        <button onClick={() => setCategoryEdit("new")}>+ Kategori ekle</button>
        <label className={styles.field}>
          Kategori
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              keepContext("category", e.target.value);
            }}
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Görünürlük
          <select
            value={filterVisibility}
            onChange={(e) => {
              setFilterVisibility(e.target.value);
              keepContext("visibility", e.target.value);
            }}
          >
            <option value="">Tüm ürünler</option>
            <option value="visible">Yayındakiler</option>
            <option value="hidden">Gizli / taslak</option>
          </select>
        </label>
      </div>
      <label className={styles.field}>
        Ürün ara
        <input
          type="search"
          placeholder="Örneğin: Efes Pilsen"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            keepContext("q", e.target.value);
          }}
        />
      </label>
      {!data.branches.length ? (
        <p>Şube bulunamadı. Şube ayarlarını kontrol edin.</p>
      ) : null}
      {categories
        .filter((c) => !filterCategory || c.id === filterCategory)
        .sort((a, b) => {
          const groupOf = (category: typeof a) =>
            menuGroup(
              category.slug,
              data.categoryBranches.find(
                (l) => l.category_id === category.id && l.branch_id === branch,
              )?.metadata,
            );
          const groupA = groupOf(a),
            groupB = groupOf(b);
          const rank = (key: string) =>
            key === "main" ? 0 : key === "coffee" ? 1 : 2;
          if (groupA.key !== groupB.key)
            return (
              rank(groupA.key) - rank(groupB.key) ||
              groupA.label.localeCompare(groupB.label, "tr")
            );
          return (
            (data.categoryBranches.find(
              (l) => l.category_id === a.id && l.branch_id === branch,
            )?.sort_order ?? a.sort_order) -
            (data.categoryBranches.find(
              (l) => l.category_id === b.id && l.branch_id === branch,
            )?.sort_order ?? b.sort_order)
          );
        })
        .map((c) => {
          const categoryLink = data.categoryBranches.find(
            (l) => l.category_id === c.id && l.branch_id === branch,
          );
          const group = menuGroup(c.slug, categoryLink?.metadata);
          const groupCategories = categories
            .filter(
              (other) =>
                menuGroup(
                  other.slug,
                  data.categoryBranches.find(
                    (l) => l.category_id === other.id && l.branch_id === branch,
                  )?.metadata,
                ).key === group.key,
            )
            .sort(
              (a, b) =>
                (data.categoryBranches.find(
                  (l) => l.category_id === a.id && l.branch_id === branch,
                )?.sort_order ?? a.sort_order) -
                (data.categoryBranches.find(
                  (l) => l.category_id === b.id && l.branch_id === branch,
                )?.sort_order ?? b.sort_order),
            );
          const groupPosition = groupCategories.findIndex(
            (other) => other.id === c.id,
          );
          const products = data.products
            .filter(
              (p) =>
                p.category_id === c.id &&
                (!filterVisibility ||
                  (filterVisibility === "visible") ===
                    (p.status === "published" &&
                      p.is_active &&
                      data.placements.some(
                        (l) =>
                          l.menu_item_id === p.id &&
                          l.branch_id === branch &&
                          l.is_active,
                      ) &&
                      c.status === "published" &&
                      c.is_active &&
                      data.categoryBranches.some(
                        (l) =>
                          l.category_id === c.id &&
                          l.branch_id === branch &&
                          l.is_active,
                      ))) &&
                p.name
                  .toLocaleLowerCase("tr")
                  .includes(search.toLocaleLowerCase("tr")) &&
                data.placements.some(
                  (b) => b.menu_item_id === p.id && b.branch_id === branch,
                ),
            )
            .sort(
              (a, b) =>
                (data.placements.find(
                  (x) => x.menu_item_id === a.id && x.branch_id === branch,
                )?.sort_order ?? 0) -
                (data.placements.find(
                  (x) => x.menu_item_id === b.id && x.branch_id === branch,
                )?.sort_order ?? 0),
            );
          return (
            <section className={styles.panel} key={c.id}>
              <h2>
                {data.categoryBranches.find(
                  (b) => b.category_id === c.id && b.branch_id === branch,
                )?.display_name || c.name}
              </h2>
              <small>
                {group.label} · Bu menüde {groupPosition + 1}. sırada
              </small>
              <div className={styles.actions}>
                {(["up", "down"] as const).map((direction) => (
                  <button
                    type="button"
                    key={direction}
                    aria-label={`${c.name} kategorisini ${direction === "up" ? "yukarı" : "aşağı"} taşı`}
                    disabled={
                      pending ||
                      !!filterCategory ||
                      !categoryLink ||
                      (direction === "up"
                        ? groupPosition === 0
                        : groupPosition === groupCategories.length - 1)
                    }
                    onClick={() =>
                      start(async () => {
                        const result = await runAdminAction(
                          () =>
                            moveMenuCategory(
                              c.id,
                              branch,
                              direction,
                              categoryLink!.updated_at,
                            ),
                          "Kategori sırası değiştirilemedi.",
                        );
                        setMessage(result.message);
                        if (result.ok) router.refresh();
                      })
                    }
                  >
                    {direction === "up" ? "↑" : "↓"}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setCategoryEdit(c.id)}>
                Kategoriyi düzenle
              </button>
              {c.status !== "published" ||
              !c.is_active ||
              !data.categoryBranches.find(
                (b) => b.category_id === c.id && b.branch_id === branch,
              )?.is_active ? (
                <p className={styles.notice}>
                  Bu kategori şubede kapalı. Ürünlerin görünmesi için kategori
                  görünürlüğünü “Kategoriyi düzenle” üzerinden değiştirin.
                </p>
              ) : null}
              {products.map((p, i) => {
                const link = data.placements.find(
                  (b) => b.menu_item_id === p.id && b.branch_id === branch,
                )!;
                const variants = data.variants
                  .filter((v) => v.menu_item_branch_id === link.id)
                  .sort((a, b) => a.sort_order - b.sort_order);
                return (
                  <article className={styles.product} key={p.id}>
                    <div>
                      <h3>
                        {p.name}{" "}
                        <span className={styles.badge}>
                          {categoryHidden(c, categoryLink)
                            ? "Kategori nedeniyle gizli"
                            : !link.is_active ||
                                !p.is_active ||
                                p.status === "archived"
                              ? "Gizli"
                              : p.status === "draft"
                                ? "Taslak"
                                : "Yayında"}
                        </span>
                      </h3>
                      <small>
                        Bu kategori ve şubede{" "}
                        {data.placements
                          .filter(
                            (l) =>
                              l.branch_id === branch &&
                              data.products.some(
                                (product) =>
                                  product.id === l.menu_item_id &&
                                  product.category_id === c.id,
                              ),
                          )
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .findIndex((l) => l.id === link.id) + 1}
                        . sırada
                      </small>
                      <ul className={styles.prices}>
                        {link.price_cents !== null ? (
                          <li>
                            {link.price_label ?? "Fiyat"} — ₺
                            {formatTryPriceInput(link.price_cents)}
                          </li>
                        ) : null}
                        {variants.map((v) => (
                          <li key={v.id}>
                            {v.label} — ₺{formatTryPriceInput(v.price_cents)}
                            {!v.is_active ? " (gizli)" : ""}
                          </li>
                        ))}
                        {!variants.length && link.price_cents === null ? (
                          <li>Fiyat henüz girilmedi.</li>
                        ) : null}
                      </ul>
                    </div>
                    <div className={styles.actions}>
                      <button type="button" onClick={() => setPriceEdit(p.id)}>
                        Fiyatları değiştir
                      </button>
                      <button
                        disabled={pending || !!editing}
                        onClick={() => setEditing(p.id)}
                      >
                        Düzenle
                      </button>
                      <button
                        disabled={pending || !!editing}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `${p.name} bu şubede ${link.is_active ? "gizlensin" : "gösterilsin"} mi?`,
                            )
                          )
                            return;
                          start(async () => {
                            const result = await runAdminAction(
                              () =>
                                setMenuVisibility(
                                  p.id,
                                  branch,
                                  !link.is_active,
                                  link.updated_at,
                                  "EVET",
                                ),
                              "Bağlantı sorunu oluştu. Tekrar deneyin.",
                            );
                            setMessage(result.message);
                            if (result.ok) router.refresh();
                          });
                        }}
                      >
                        {link.is_active ? "Gizle" : "Göster"}
                      </button>
                      <button
                        aria-label={`${p.name} yukarı taşı`}
                        disabled={
                          pending ||
                          !!editing ||
                          i === 0 ||
                          !!search ||
                          !!filterVisibility
                        }
                        onClick={() =>
                          start(async () => {
                            const r = await runAdminAction(
                              () =>
                                moveMenuProduct(
                                  p.id,
                                  branch,
                                  "up",
                                  link.updated_at,
                                ),
                              "Bağlantı sorunu oluştu. Tekrar deneyin.",
                            );
                            setMessage(r.message);
                            if (r.ok) router.refresh();
                          })
                        }
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`${p.name} aşağı taşı`}
                        disabled={
                          pending ||
                          !!editing ||
                          i === products.length - 1 ||
                          !!search ||
                          !!filterVisibility
                        }
                        onClick={() =>
                          start(async () => {
                            const r = await runAdminAction(
                              () =>
                                moveMenuProduct(
                                  p.id,
                                  branch,
                                  "down",
                                  link.updated_at,
                                ),
                              "Bağlantı sorunu oluştu. Tekrar deneyin.",
                            );
                            setMessage(r.message);
                            if (r.ok) router.refresh();
                          })
                        }
                      >
                        ↓
                      </button>
                    </div>
                  </article>
                );
              })}
              {!products.length ? (
                <p>
                  {search
                    ? "Bu kategoride aramanıza uygun ürün yok."
                    : "Bu kategoride henüz ürün yok."}
                </p>
              ) : null}
              <button
                onClick={() => {
                  setCategory(c.id);
                  setEditing("new");
                }}
                disabled={!!editing}
              >
                + {products.length ? "Ürün ekle" : "İlk ürünü ekle"}
              </button>
            </section>
          );
        })}
      {!categories.length ? (
        <p>
          Bu şubede henüz kategori yok. Yeni ürün eklerken kategorisini
          seçebilirsiniz.
        </p>
      ) : null}
    </section>
  );
}
