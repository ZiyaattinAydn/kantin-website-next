"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MenuData } from "@/lib/admin/menu-model";
import type { MediaChoice } from "@/lib/admin/media-choices";
import { formatTryPriceInput } from "@/lib/admin/pricing";
import { moveMenuProduct, setMenuVisibility } from "@/lib/admin/menu-actions";
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
  pricesOnly,
}: {
  data: MenuData;
  media: MediaChoice[];
  initialBranch?: string;
  initialSearch?: string;
  initialEdit?: string;
  initialCategory?: string;
  showNew: boolean;
  pricesOnly: boolean;
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
  const [category, setCategory] = useState(initialCategory);
  const [message, setMessage] = useState("");
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
          <h1>{pricesOnly ? "Fiyatları Düzenle" : "Menüyü Düzenle"}</h1>
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
            onClick={() => setBranch(b.id)}
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
            setMessage(message);
          }}
        />
      ) : null}
      <label className={styles.field}>
        Ürün ara
        <input
          type="search"
          placeholder="Örneğin: Efes Pilsen"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {!data.branches.length ? (
        <p>Şube bulunamadı. Şube ayarlarını kontrol edin.</p>
      ) : null}
      {categories.map((c) => {
        const products = data.products
          .filter(
            (p) =>
              p.category_id === c.id &&
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
            {c.status !== "published" ||
            !c.is_active ||
            !data.categoryBranches.find(
              (b) => b.category_id === c.id && b.branch_id === branch,
            )?.is_active ? (
              <p className={styles.notice}>
                Bu kategori şubede kapalı. Ürünlerin görünmesi için kategori
                görünürlüğünü Gelişmiş Yönetim’den kontrol edin.
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
                        {!link.is_active ||
                        !p.is_active ||
                        p.status === "archived"
                          ? "Gizli"
                          : p.status === "draft"
                            ? "Taslak"
                            : "Yayında"}
                      </span>
                    </h3>
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
                    <button
                      disabled={pending || !!editing}
                      onClick={() => setEditing(p.id)}
                    >
                      {pricesOnly ? "Fiyatı düzenle" : "Düzenle"}
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
                          const result = await setMenuVisibility(
                            p.id,
                            branch,
                            !link.is_active,
                            link.updated_at,
                            "EVET",
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
                      disabled={pending || !!editing || i === 0 || !!search}
                      onClick={() =>
                        start(async () => {
                          const r = await moveMenuProduct(
                            p.id,
                            branch,
                            "up",
                            link.updated_at,
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
                        !!search
                      }
                      onClick={() =>
                        start(async () => {
                          const r = await moveMenuProduct(
                            p.id,
                            branch,
                            "down",
                            link.updated_at,
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
