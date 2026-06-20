"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PublicEmptyState } from "@/components/data-state/PublicDataNotice";
import {
  AlsancakMenuPanel,
  AtakentMenuPanel,
  MenuHero,
  MenuTruthNote,
} from "./MenuSections";
import type { MenuPublicData } from "@/lib/public-data/types";
import type { MerchBundle, MerchDoodle, MerchProductContent } from "@/types/content";
import type { MenuBranch } from "@/data/menu";
import styles from "./MenuPageClient.module.css";

type MenuPageClientProps = {
  initialBranch: MenuBranch;
  data: MenuPublicData;
  merchProducts: MerchProductContent[];
  merchBundles: MerchBundle[];
  merchDoodles: MerchDoodle[];
};

export default function MenuPageClient({
  initialBranch,
  data,
  merchProducts,
  merchBundles,
  merchDoodles,
}: MenuPageClientProps) {
  const [activeBranch, setActiveBranch] = useState<MenuBranch>(initialBranch);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const alsancakPanelRef = useRef<HTMLElement | null>(null);
  const atakentPanelRef = useRef<HTMLElement | null>(null);
  const shouldScrollAfterBranchChangeRef = useRef(false);

  const scrollToPanelStart = useCallback((branch: MenuBranch) => {
    const panel =
      branch === "alsancak"
        ? alsancakPanelRef.current
        : atakentPanelRef.current;

    if (!panel) return;

    const rootStyles = window.getComputedStyle(document.documentElement);
    const headerHeight = Number.parseFloat(
      rootStyles.getPropertyValue("--header-height"),
    ) || 0;
    const selectorHeight = selectorRef.current?.getBoundingClientRect().height ?? 0;
    const panelTop = panel.getBoundingClientRect().top + window.scrollY;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: Math.max(0, panelTop - headerHeight - selectorHeight - 8),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const panel =
      activeBranch === "alsancak"
        ? alsancakPanelRef.current
        : atakentPanelRef.current;

    const frame = window.requestAnimationFrame(() => {
      panel?.querySelectorAll<HTMLElement>(".reveal").forEach((item) => {
        item.classList.add("is-visible");
        item.classList.remove("reveal-pending");
      });

      if (shouldScrollAfterBranchChangeRef.current) {
        shouldScrollAfterBranchChangeRef.current = false;
        scrollToPanelStart(activeBranch);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeBranch, scrollToPanelStart]);

  const activateBranch = useCallback(
    (branch: MenuBranch, shouldScroll = true) => {
      const url = new URL(window.location.href);
      url.searchParams.set("sube", branch);
      window.history.replaceState({}, "", url);

      if (branch === activeBranch) {
        if (shouldScroll) scrollToPanelStart(branch);
        return;
      }

      shouldScrollAfterBranchChangeRef.current = shouldScroll;
      setActiveBranch(branch);
    },
    [activeBranch, scrollToPanelStart],
  );

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + data.branchOptions.length) % data.branchOptions.length;
    const nextBranch = data.branchOptions[nextIndex].id;

    tabRefs.current[nextIndex]?.focus();
    activateBranch(nextBranch);
  };

  return (
    <>
      <MenuHero data={data.menuHero} />

      {!data.hasMenuData ? (
        <section className="section dotted-paper">
          <div className="container">
            <PublicEmptyState
              title="Menü şu anda yayında değil."
              description="Aktif kategoriler ve ürünler yayınlandığında burada görünecek."
            />
          </div>
        </section>
      ) : (
        <>
          <div ref={selectorRef} className={styles.selectorWrap}>
            <div
              className={`container ${styles.selector}`}
              role="tablist"
              aria-label="Şube menüsü seçimi"
            >
              {data.branchOptions.map((branch, index) => {
                const isActive = activeBranch === branch.id;

                return (
                  <button
                    key={branch.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    id={`tab-${branch.id}`}
                    className={`${styles.tab}${isActive ? ` ${styles.active}` : ""}`}
                    type="button"
                    role="tab"
                    aria-controls={`panel-${branch.id}`}
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => activateBranch(branch.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                  >
                    <strong>{branch.label}</strong>
                    <small>{branch.description}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <AlsancakMenuPanel
            panelRef={alsancakPanelRef}
            hidden={activeBranch !== "alsancak"}
            data={data}
            merchProducts={merchProducts}
            merchBundles={merchBundles}
            merchDoodles={merchDoodles}
          />
          <AtakentMenuPanel
            panelRef={atakentPanelRef}
            hidden={activeBranch !== "atakent"}
            data={data}
          />
          <MenuTruthNote />
        </>
      )}
    </>
  );
}
