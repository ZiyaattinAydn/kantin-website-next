"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MenuProductQuickView.module.css";

const QUICK_VIEW_EVENT = "kantin:menu-quick-view";
const STOCK_IMAGE = "/assets/img/instagram/post-03.webp";

export type MenuQuickViewData = {
  name: string;
  description?: string;
  detail?: string;
  price: string;
  note?: string;
  allergens?: string;
  badge?: string;
  category: string;
  subcategory?: string;
  highlight?: string;
};

type QuickViewEventDetail = {
  item: MenuQuickViewData;
  trigger: HTMLButtonElement;
};

export function MenuQuickViewButton({
  name,
  description,
  detail,
  price,
  note,
  allergens,
  badge,
  category,
  subcategory,
  highlight,
}: MenuQuickViewData) {
  return (
    <button
      className={styles.eyeButton}
      type="button"
      aria-label={`${name} ürün detayını gör`}
      title="Ürün detayını gör"
      onClick={(event) => {
        window.dispatchEvent(
          new CustomEvent<QuickViewEventDetail>(QUICK_VIEW_EVENT, {
            detail: {
              item: {
                name,
                description,
                detail,
                price,
                note,
                allergens,
                badge,
                category,
                subcategory,
                highlight,
              },
              trigger: event.currentTarget,
            },
          }),
        );
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M2.8 12s3.2-5.6 9.2-5.6S21.2 12 21.2 12 18 17.6 12 17.6 2.8 12 2.8 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    </button>
  );
}

export default function MenuProductQuickView() {
  const [active, setActive] = useState<MenuQuickViewData | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const openQuickView = (event: Event) => {
      const customEvent = event as CustomEvent<QuickViewEventDetail>;
      triggerRef.current = customEvent.detail.trigger;
      setActive(customEvent.detail.item);
    };

    window.addEventListener(QUICK_VIEW_EVENT, openQuickView);
    return () => window.removeEventListener(QUICK_VIEW_EVENT, openQuickView);
  }, []);

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setActive(null);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  const close = () => {
    setActive(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  if (!active) return null;

  const cleanText = (value?: string) =>
    value
      ?.replace(/\{highlight\}/g, active.highlight ?? "")
      .replace(/\s+/g, " ")
      .trim();

  const detailIsMeta = Boolean(
    active.detail &&
      active.detail.length <= 28 &&
      (/^\d/.test(active.detail) ||
        /^(yarım|tam|tek|duble)/i.test(active.detail)),
  );
  const description =
    cleanText(active.description) ||
    (!detailIsMeta ? cleanText(active.detail) : undefined) ||
    "Ürün açıklaması ve gerçek ürün görseli yakında eklenecek.";
  const detail = cleanText(active.detail);
  const metaItems = Array.from(
    new Set(
      [
        active.category,
        active.subcategory,
        detailIsMeta ? detail : undefined,
      ].filter((item): item is string => Boolean(item)),
    ),
  );
  const titleClass =
    active.name.length >= 28
      ? styles.titleCompact
      : active.name.length >= 18
        ? styles.titleMedium
        : "";

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        aria-labelledby="menu-quick-view-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
      >
        <button
          autoFocus
          aria-label="Ürün detayını kapat"
          className={styles.close}
          onClick={close}
          type="button"
        >
          ×
        </button>

        <figure className={styles.media}>
          <img
            alt="Temsili ürün görseli; masada bira ve paylaşmalık yiyecekler."
            decoding="async"
            src={STOCK_IMAGE}
          />
          <figcaption>Temsili görsel · ürün fotoğrafları daha sonra güncellenecek</figcaption>
        </figure>

        <div className={styles.copy}>
          <p className={styles.kicker}>Menü detayı</p>

          <div className={styles.metaRow} aria-label="Ürün kategorisi">
            {metaItems.map((item) => (
              <span className={styles.metaChip} key={item}>
                {item}
              </span>
            ))}
            {active.badge ? (
              <span className={styles.badge}>{active.badge}</span>
            ) : null}
          </div>

          <div className={styles.titleRow}>
            <h2
              className={titleClass}
              id="menu-quick-view-title"
            >
              {active.name}
            </h2>
          </div>

          <p className={styles.description}>{description}</p>

          {detail && !detailIsMeta && detail !== description ? (
            <p className={styles.detail}>{detail}</p>
          ) : null}

          <div className={styles.price}>{active.price}</div>

          {active.note ? <p className={styles.note}>{active.note}</p> : null}
          {active.allergens ? (
            <p className={styles.allergens}>{active.allergens}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
