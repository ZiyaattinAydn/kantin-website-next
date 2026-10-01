"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { GenericMenuBranchData } from "@/lib/public-data/types";
import { MenuQuickViewButton } from "./MenuProductQuickView";
import styles from "./MenuDiscoveryRadar.module.css";

const STOCK_IMAGE = "/assets/img/instagram/post-03.webp";

const POSITIONS = [
  ["50%", "9%"],
  ["78%", "20%"],
  ["91%", "50%"],
  ["77%", "79%"],
  ["50%", "91%"],
  ["22%", "79%"],
  ["9%", "50%"],
  ["22%", "20%"],
] as const;

type RadarStyle = CSSProperties & {
  "--node-x": string;
  "--node-y": string;
};

function formatPrice(category: GenericMenuBranchData["categories"][number]) {
  const item = category.items[0];
  if (!item) return "Menüyü keşfet";

  if (item.variants.length) {
    return item.variants
      .slice(0, 2)
      .map((variant) => \`\${variant.label} \${variant.price}\`)
      .join(" · ");
  }

  return item.price || item.priceLabel || "Detayı gör";
}

export default function MenuDiscoveryRadar({
  branch,
}: {
  branch: GenericMenuBranchData;
}) {
  const categories = useMemo(
    () =>
      [...branch.categories]
        .filter((category) => category.items.length > 0)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 8),
    [branch],
  );

  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");

  useEffect(() => {
    setActiveSlug(categories[0]?.slug ?? "");
  }, [branch.id, categories]);

  const activeCategory =
    categories.find((category) => category.slug === activeSlug) ?? categories[0];
  const featuredItem = activeCategory?.items[0];

  if (!activeCategory || !featuredItem) return null;

  const imageSrc = featuredItem.image?.imageUrl || STOCK_IMAGE;
  const imageAlt =
    featuredItem.image?.imageAlt ||
    \`\${featuredItem.name} için geçici temsili ürün görseli\`;

  const scrollToCategory = () => {
    const panel = document.getElementById(\`panel-\${branch.slug}\`);
    const target =
      panel?.querySelector<HTMLElement>(\`#kategori-\${activeCategory.slug}\`) ??
      document.getElementById(\`kategori-\${activeCategory.slug}\`);

    if (!target) return;

    const rootStyles = window.getComputedStyle(document.documentElement);
    const headerHeight =
      Number.parseFloat(rootStyles.getPropertyValue("--header-height")) || 0;
    const top = target.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: Math.max(0, top - headerHeight - 28),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <section className={styles.section} aria-label="Menü keşfi">
      <div className="container">
        <div className={styles.shell}>
          <div className={styles.heading}>
            <div>
              <p className={styles.kicker}>Menü radarı</p>
              <h2>Ne içelim, ne yiyelim?</h2>
            </div>
            <p>
              Kategoriyi seç, öne çıkan ürüne göz at. İstersen direkt menüde o
              bölüme atla.
            </p>
          </div>

          <div className={styles.layout}>
            <div className={styles.radar} aria-label="Menü kategorileri">
              <div aria-hidden="true" className={styles.ringOne} />
              <div aria-hidden="true" className={styles.ringTwo} />
              <div aria-hidden="true" className={styles.crosshair} />

              <div className={styles.center}>
                <span>{branch.code}</span>
                <strong>{branch.name}</strong>
                <small>{categories.length} kategori</small>
              </div>

              {categories.map((category, index) => {
                const [x, y] = POSITIONS[index] ?? POSITIONS[0];
                const isActive = category.slug === activeCategory.slug;
                const nodeStyle = {
                  "--node-x": x,
                  "--node-y": y,
                } as RadarStyle;

                return (
                  <button
                    aria-pressed={isActive}
                    className={\`\${styles.node}\${isActive ? \` \${styles.nodeActive}\` : ""}\`}
                    key={category.id}
                    onClick={() => setActiveSlug(category.slug)}
                    style={nodeStyle}
                    type="button"
                  >
                    <span>{category.name}</span>
                    <small>{category.items.length}</small>
                  </button>
                );
              })}
            </div>

            <article className={styles.showcase}>
              <div className={styles.imageWrap}>
                <img alt={imageAlt} decoding="async" src={imageSrc} />
                <span>{activeCategory.name}</span>
              </div>

              <div className={styles.copy}>
                <p className={styles.categoryLabel}>
                  {branch.name} · {activeCategory.name}
                </p>

                <div className={styles.productTitle}>
                  <h3>{featuredItem.name}</h3>
                  <MenuQuickViewButton
                    name={featuredItem.name}
                    description={featuredItem.description}
                    detail={featuredItem.detail}
                    price={formatPrice(activeCategory)}
                    note={
                      featuredItem.priceNote ?? featuredItem.availabilityNote
                    }
                    allergens={featuredItem.allergens}
                    badge={featuredItem.badges[0]}
                    highlight={featuredItem.highlight}
                    category={activeCategory.name}
                    subcategory={activeCategory.group?.label}
                  />
                </div>

                <p className={styles.description}>
                  {featuredItem.description ||
                    featuredItem.detail ||
                    activeCategory.description ||
                    "Bu kategoriden öne çıkan ürün."}
                </p>

                <strong className={styles.price}>
                  {formatPrice(activeCategory)}
                </strong>

                <button
                  className={styles.jumpButton}
                  onClick={scrollToCategory}
                  type="button"
                >
                  Kategoriye git
                  <span aria-hidden="true">↘</span>
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
