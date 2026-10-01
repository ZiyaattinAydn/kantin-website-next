"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type {
  GenericMenuBranchData,
  GenericMenuItemData,
} from "@/lib/public-data/types";
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

const CARD_TONES = [
  ["#f4efe6", "#0047bb"],
  ["#dce8ff", "#003b9c"],
  ["#d9e7b8", "#24441f"],
  ["#ffd978", "#492d00"],
] as const;

type RadarStyle = CSSProperties & {
  "--node-x": string;
  "--node-y": string;
  "--node-delay": string;
};

type CarouselStyle = CSSProperties & {
  "--track-x": string;
  "--card-bg": string;
  "--card-ink": string;
};

function formatItemPrice(item: GenericMenuItemData) {
  if (item.variants.length) {
    return item.variants
      .slice(0, 2)
      .map((variant) => `${variant.label} ${variant.price}`)
      .join(" · ");
  }

  return item.price || item.priceLabel || "Detayı gör";
}

export default function MenuDiscoveryRadar({
  branch,
  branches,
  onBranchChange,
}: {
  branch: GenericMenuBranchData;
  branches: GenericMenuBranchData[];
  onBranchChange: (branch: string) => void;
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
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);

  useEffect(() => {
    setActiveSlug(categories[0]?.slug ?? "");
    setActiveProductIndex(0);
    setBranchPickerOpen(false);
  }, [branch.id, categories]);

  const activeCategory =
    categories.find((category) => category.slug === activeSlug) ?? categories[0];
  const products = activeCategory?.items ?? [];
  const activeProduct =
    products[activeProductIndex] ?? activeCategory?.items[0] ?? null;

  if (!activeCategory || !activeProduct) return null;

  const setCategory = (slug: string) => {
    setActiveSlug(slug);
    setActiveProductIndex(0);
  };

  const goToProduct = (index: number) => {
    if (!products.length) return;
    setActiveProductIndex((index + products.length) % products.length);
  };

  const scrollToCategory = () => {
    const panel = document.getElementById(`panel-${branch.slug}`);
    const target =
      panel?.querySelector<HTMLElement>(`#kategori-${activeCategory.slug}`) ??
      document.getElementById(`kategori-${activeCategory.slug}`);

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

  const [cardBg, cardInk] =
    CARD_TONES[activeProductIndex % CARD_TONES.length] ?? CARD_TONES[0];
  const carouselStyle = {
    "--track-x": `${activeProductIndex * -100}%`,
    "--card-bg": cardBg,
    "--card-ink": cardInk,
  } as CarouselStyle;

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
              Kategoriyi seç, ürünleri sağa sola gez. Şubeyi değiştirmek için
              radarın ortasına dokun.
            </p>
          </div>

          <div className={styles.layout}>
            <div className={styles.radar} aria-label="Menü kategorileri">
              <div aria-hidden="true" className={styles.ringOne} />
              <div aria-hidden="true" className={styles.ringTwo} />
              <div aria-hidden="true" className={styles.crosshair} />

              <div
                className={`${styles.centerWrap}${
                  branchPickerOpen ? ` ${styles.centerWrapOpen}` : ""
                }`}
              >
                <button
                  aria-expanded={branchPickerOpen}
                  aria-haspopup="menu"
                  className={styles.center}
                  onClick={() => setBranchPickerOpen((open) => !open)}
                  type="button"
                >
                  <span>{branch.code}</span>
                  <strong>{branch.name}</strong>
                  <small>Şube değiştir ↓</small>
                </button>

                <div
                  aria-hidden={!branchPickerOpen}
                  className={styles.branchPicker}
                  role="menu"
                >
                  {branches.map((option) => {
                    const isCurrent = option.slug === branch.slug;

                    return (
                      <button
                        aria-current={isCurrent ? "true" : undefined}
                        className={isCurrent ? styles.branchCurrent : ""}
                        key={option.id}
                        onClick={() => {
                          setBranchPickerOpen(false);
                          if (!isCurrent) onBranchChange(option.slug);
                        }}
                        role="menuitem"
                        tabIndex={branchPickerOpen ? 0 : -1}
                        type="button"
                      >
                        <span>{option.code}</span>
                        <strong>{option.name}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              {categories.map((category, index) => {
                const [x, y] = POSITIONS[index] ?? POSITIONS[0];
                const isActive = category.slug === activeCategory.slug;
                const nodeStyle = {
                  "--node-x": x,
                  "--node-y": y,
                  "--node-delay": `${index * -0.42}s`,
                } as RadarStyle;

                return (
                  <button
                    aria-pressed={isActive}
                    className={`${styles.node}${
                      isActive ? ` ${styles.nodeActive}` : ""
                    }`}
                    key={category.id}
                    onClick={() => setCategory(category.slug)}
                    style={nodeStyle}
                    type="button"
                  >
                    <span>{category.name}</span>
                    <small>{category.items.length}</small>
                  </button>
                );
              })}
            </div>

            <article className={styles.carousel} style={carouselStyle}>
              <div className={styles.carouselTop}>
                <div>
                  <p>{branch.name}</p>
                  <strong>{activeCategory.name}</strong>
                </div>

                {products.length > 1 ? (
                  <div className={styles.carouselControls}>
                    <button
                      aria-label="Önceki ürün"
                      onClick={() => goToProduct(activeProductIndex - 1)}
                      type="button"
                    >
                      ←
                    </button>
                    <button
                      aria-label="Sonraki ürün"
                      onClick={() => goToProduct(activeProductIndex + 1)}
                      type="button"
                    >
                      →
                    </button>
                  </div>
                ) : null}
              </div>

              <div className={styles.viewport}>
                <div className={styles.track}>
                  {products.map((item, index) => {
                    const imageSrc = item.image?.imageUrl || STOCK_IMAGE;
                    const imageAlt =
                      item.image?.imageAlt ||
                      `${item.name} için geçici temsili ürün görseli`;

                    return (
                      <section
                        aria-hidden={index !== activeProductIndex}
                        className={styles.slide}
                        key={item.id}
                      >
                        <div className={styles.imageWrap}>
                          <img alt={imageAlt} decoding="async" src={imageSrc} />
                          <span>{activeCategory.name}</span>
                        </div>

                        <div className={styles.copy}>
                          <p className={styles.categoryLabel}>
                            {activeCategory.name} ·{" "}
                            {String(index + 1).padStart(2, "0")}
                          </p>

                          <div className={styles.productTitle}>
                            <h3>{item.name}</h3>
                            <MenuQuickViewButton
                              name={item.name}
                              description={item.description}
                              detail={item.detail}
                              price={formatItemPrice(item)}
                              note={item.priceNote ?? item.availabilityNote}
                              allergens={item.allergens}
                              badge={item.badges[0]}
                              highlight={item.highlight}
                              category={activeCategory.name}
                              subcategory={activeCategory.group?.label}
                            />
                          </div>

                          <p className={styles.description}>
                            {item.description ||
                              item.detail ||
                              activeCategory.description ||
                              "Bu kategoriden öne çıkan ürün."}
                          </p>

                          <strong className={styles.price}>
                            {formatItemPrice(item)}
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
                      </section>
                    );
                  })}
                </div>
              </div>

              {products.length > 1 ? (
                <div className={styles.dots} aria-label="Ürün carousel konumu">
                  {products.map((item, index) => (
                    <button
                      aria-label={`${item.name} ürününe git`}
                      aria-current={
                        index === activeProductIndex ? "true" : undefined
                      }
                      className={
                        index === activeProductIndex ? styles.dotActive : ""
                      }
                      key={item.id}
                      onClick={() => goToProduct(index)}
                      type="button"
                    />
                  ))}
                </div>
              ) : null}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
