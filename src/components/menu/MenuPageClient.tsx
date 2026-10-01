"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PublicEmptyState } from "@/components/data-state/PublicDataNotice";
import GenericMenuPanel from "./GenericMenuPanel";
import MenuProductQuickView from "./MenuProductQuickView";
import {
  AlsancakMenuPanel,
  AtakentMenuPanel,
  MenuHero,
  MenuTruthNote,
} from "./MenuSections";
import type { MenuPublicData } from "@/lib/public-data/types";
import type {
  MerchBundle,
  MerchDoodle,
  MerchProductContent,
} from "@/types/content";
import type { MenuBranch } from "@/types/menu";
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
  const selectorSentinelRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef(new Map<string, HTMLElement>());

  const setPanelRef = useCallback(
    (slug: string) => (element: HTMLElement | null) => {
      if (element) panelRefs.current.set(slug, element);
      else panelRefs.current.delete(slug);
    },
    [],
  );

  const scrollToMenuStart = useCallback(() => {
    const sentinel = selectorSentinelRef.current;
    if (!sentinel) return;

    const rootStyles = window.getComputedStyle(document.documentElement);
    const headerHeight =
      Number.parseFloat(rootStyles.getPropertyValue("--header-height")) || 0;
    const menuTop = sentinel.getBoundingClientRect().top + window.scrollY;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: Math.max(0, menuTop - headerHeight - 4),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const selector = selectorRef.current;
    const sentinel = selectorSentinelRef.current;
    if (!selector || !sentinel) return;

    let frame: number | null = null;
    let headerHeight = 0;
    let selectorHeight = 0;
    let sentinelPageY = 0;

    const measure = () => {
      const rootStyles = window.getComputedStyle(document.documentElement);
      headerHeight =
        Number.parseFloat(rootStyles.getPropertyValue("--header-height")) || 0;
      selectorHeight = selector.getBoundingClientRect().height;
      sentinelPageY = sentinel.getBoundingClientRect().top + window.scrollY;
    };

    const updateStickyState = () => {
      if (frame !== null) return;

      frame = window.requestAnimationFrame(() => {
        const headerHidden = document.body.classList.contains("header-hidden");
        const stickyTop = headerHidden ? 0 : headerHeight;
        const stuckDistance = Math.max(
          0,
          window.scrollY + stickyTop - sentinelPageY,
        );
        const isStuck = stuckDistance > 1;
        const hideReadyDistance = Math.max(120, selectorHeight * 1.35);

        selector.dataset.stuck = String(isStuck);
        selector.dataset.hideReady = String(
          isStuck && stuckDistance >= hideReadyDistance,
        );
        frame = null;
      });
    };

    const remeasure = () => {
      measure();
      updateStickyState();
    };

    const bodyClassObserver = new MutationObserver(updateStickyState);

    measure();
    updateStickyState();
    bodyClassObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("pageshow", remeasure);

    return () => {
      bodyClassObserver.disconnect();
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("pageshow", remeasure);

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const panel = panelRefs.current.get(activeBranch);
    const frame = window.requestAnimationFrame(() => {
      panel?.querySelectorAll<HTMLElement>(".reveal").forEach((item) => {
        item.classList.add("is-visible");
        item.classList.remove("reveal-pending");
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeBranch]);

  const activateBranch = useCallback(
    (branch: MenuBranch, shouldScroll = true) => {
      const url = new URL(window.location.href);
      url.searchParams.set("sube", branch);
      window.history.replaceState({}, "", url);

      if (shouldScroll) {
        scrollToMenuStart();
      }

      if (branch === activeBranch) return;

      setActiveBranch(branch);
    },
    [activeBranch, scrollToMenuStart],
  );

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + data.branchOptions.length) %
      data.branchOptions.length;
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
          <div
            ref={selectorSentinelRef}
            className={styles.selectorSentinel}
            aria-hidden="true"
          />
          <div ref={selectorRef} className={styles.selectorWrap}>
            <div
              className={`container ${styles.selector}`}
              role="tablist"
              aria-label="Şube menüsü seçimi"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  data.branchOptions.length,
                  4,
                )}, minmax(0, 1fr))`,
              }}
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
                    <span className={styles.code}>{branch.code}</span>
                    <strong>{branch.label}</strong>
                    <small>{branch.description}</small>
                  </button>
                );
              })}
            </div>
          </div>

          {data.branches.map((branch) => {
            if (branch.slug === "alsancak") {
              return (
                <AlsancakMenuPanel
                  key={branch.slug}
                  panelRef={setPanelRef(branch.slug)}
                  hidden={activeBranch !== branch.slug}
                  data={data}
                  merchProducts={merchProducts}
                  merchBundles={merchBundles}
                  merchDoodles={merchDoodles}
                />
              );
            }

            if (branch.slug === "atakent") {
              return (
                <AtakentMenuPanel
                  key={branch.slug}
                  panelRef={setPanelRef(branch.slug)}
                  hidden={activeBranch !== branch.slug}
                  data={data}
                />
              );
            }

            return (
              <GenericMenuPanel
                key={branch.slug}
                panelRef={setPanelRef(branch.slug)}
                hidden={activeBranch !== branch.slug}
                branch={branch}
              />
            );
          })}

          <MenuTruthNote />
          <MenuProductQuickView />
        </>
      )}
    </>
  );
}
