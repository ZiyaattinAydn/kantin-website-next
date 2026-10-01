"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./SauceExplorer.module.css";

type CssVars = CSSProperties & Record<`--${string}`, string>;

type SauceExplorerProps = {
  items: string[];
  kicker?: string;
};

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
              <div>
                <span>{kicker}</span>
                <strong>
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                </strong>
              </div>
              <button
                aria-label="Sos alanını kapat"
                className={styles.close}
                onClick={close}
                type="button"
              >
                ×
              </button>
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
                      <p>Sos {String(index + 1).padStart(2, "0")}</p>
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

                    <div aria-hidden="true" className={styles.sauceMark}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <i />
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
