"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./SauceExplorer.module.css";

type CssVars = CSSProperties & Record<`--${string}`, string>;

type SauceExplorerProps = {
  items: string[];
  kicker?: string;
};

const STOCK_SAUCE_IMAGE = "data:image/jpeg;base64,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";

const PALETTES = [
  { bg: "#0747bb", accent: "#f4efe6", ink: "#ffffff" },
  { bg: "#d9e7b8", accent: "#47652d", ink: "#173016" },
  { bg: "#8f241d", accent: "#f2a43d", ink: "#fff5e7" },
  { bg: "#f0b927", accent: "#fff1b8", ink: "#3b2800" },
  { bg: "#e86d2a", accent: "#f8d089", ink: "#351708" },
  { bg: "#9d9588", accent: "#342f2a", ink: "#fffaf1" },
  { bg: "#c83c38", accent: "#ffd66e", ink: "#fff8ef" },
];

function paletteFor(name: string, index: number) {
  const normalized = name.toLocaleLowerCase("tr-TR");

  if (normalized.includes("dereot")) return PALETTES[1];
  if (normalized.includes("barbek")) return PALETTES[2];
  if (normalized.includes("cheddar")) return PALETTES[3];
  if (normalized.includes("acı mayo")) return PALETTES[4];
  if (normalized.includes("trüf")) return PALETTES[5];
  if (normalized.includes("sweet chili")) return PALETTES[6];
  if (normalized.includes("kantin")) return PALETTES[0];

  return PALETTES[index % PALETTES.length];
}

export default function SauceExplorer({
  items,
  kicker = "Ekstra sos +₺30",
}: SauceExplorerProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const root = scrollerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const nextIndex = Number(
          (visible.target as HTMLElement).dataset.sauceIndex ?? 0,
        );
        setActiveIndex(nextIndex);
      },
      {
        root,
        threshold: [0.5, 0.68, 0.82],
      },
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [open, items.length]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const openExplorer = () => {
    setActiveIndex(0);
    setOpen(true);
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const scrollToSauce = (index: number) => {
    const root = scrollerRef.current;
    if (!root) return;

    root.scrollTo({
      top: root.clientHeight * index,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  const activePalette = paletteFor(items[activeIndex] ?? items[0], activeIndex);
  const panelStyle = {
    "--sauce-bg": activePalette.bg,
    "--sauce-accent": activePalette.accent,
    "--sauce-ink": activePalette.ink,
  } as CssVars;

  return (
    <>
      <div className={styles.triggerWrap}>
        <span>Sosları görüntüle</span>
        <button
          aria-expanded={open}
          aria-label={open ? "Sos alanını kapat" : "Sosları görüntüle"}
          className={styles.trigger}
          onClick={open ? close : openExplorer}
          ref={triggerRef}
          type="button"
        >
          {open ? (
            <span className={styles.triggerClose} aria-hidden="true">
              ×
            </span>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M2.8 12s3.2-5.6 9.2-5.6S21.2 12 21.2 12 18 17.6 12 17.6 2.8 12 2.8 12Z" />
              <circle cx="12" cy="12" r="2.55" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`${styles.expansion}${open ? ` ${styles.expansionOpen}` : ""}`}
        data-sauce-expanded={open ? "true" : "false"}
      >
        <div className={styles.expansionInner}>
          <div
            aria-label="Kantin sosları"
            className={styles.panel}
            role="region"
            style={panelStyle}
          >
            <div aria-hidden="true" className={styles.background}>
              <span className={styles.blobOne} />
              <span className={styles.blobTwo} />
              <span className={styles.blobThree} />
            </div>

            <header className={styles.topbar}>
              <span>{kicker}</span>
            </header>

            <nav aria-label="Sos seçimi" className={styles.rail}>
              {items.map((item, index) => (
                <button
                  aria-label={item}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={index === activeIndex ? styles.activeDot : ""}
                  key={item}
                  onClick={() => scrollToSauce(index)}
                  type="button"
                >
                  <span />
                </button>
              ))}
            </nav>

            <div className={styles.scroller} ref={scrollerRef}>
              {items.map((item, index) => {
                const palette = paletteFor(item, index);
                const sectionStyle = {
                  "--panel-accent": palette.accent,
                  "--panel-ink": palette.ink,
                } as CssVars;
                const isActive = index === activeIndex;

                return (
                  <section
                    className={styles.sauce}
                    data-active={isActive ? "true" : "false"}
                    data-sauce-index={index}
                    key={item}
                    ref={(element) => {
                      sectionRefs.current[index] = element;
                    }}
                    style={sectionStyle}
                  >
                    <div className={styles.copy}>
                      <div className={styles.meta}>
                        <span>Sos</span>
                        <span>{kicker}</span>
                      </div>
                      <h2>{item}</h2>

                      <div className={styles.detailCard}>
                        <strong>Bu sos için ayrılan tanıtım alanı.</strong>
                        <span>
                          İçerik, lezzet profili, eşleşme önerileri ve gerçek
                          ürün görseli geldiğinde burada güncellenecek.
                        </span>
                      </div>

                      <small>
                        {index === items.length - 1
                          ? "Yukarı kaydırarak önceki soslara dönebilirsin."
                          : "Tekerleği aşağı kaydır: sıradaki sosa oturur."}
                      </small>
                    </div>

                    <div className={styles.sauceVisual}>
                      <img
                        alt="Temsili sos görseli; gerçek ürün fotoğrafı daha sonra güncellenecek."
                        className={styles.stockImage}
                        decoding="async"
                        src={STOCK_SAUCE_IMAGE}
                      />
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
