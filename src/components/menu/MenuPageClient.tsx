"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlsancakMenuPanel,
  AtakentMenuPanel,
  MenuHero,
  MenuTruthNote,
} from "./MenuSections";

import { branchOptions, type MenuBranch } from "@/content/menu";
import styles from "./MenuPageClient.module.css";


type MenuPageClientProps = {
  initialBranch: MenuBranch;
};

export default function MenuPageClient({ initialBranch }: MenuPageClientProps) {
  const [activeBranch, setActiveBranch] = useState<MenuBranch>(initialBranch);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const alsancakPanelRef = useRef<HTMLElement | null>(null);
  const atakentPanelRef = useRef<HTMLElement | null>(null);


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
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeBranch]);

  const activateBranch = useCallback(
    (branch: MenuBranch, shouldScroll = true) => {
      setActiveBranch(branch);

      const url = new URL(window.location.href);
      url.searchParams.set("sube", branch);
      window.history.replaceState({}, "", url);

      if (!shouldScroll) return;

      const selector = selectorRef.current;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (selector) {
        window.scrollTo({
          top: Math.max(0, selector.offsetTop - 80),
          behavior: reduceMotion ? "auto" : "smooth",
        });
      }
    },
    [],
  );

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + branchOptions.length) % branchOptions.length;
    const nextBranch = branchOptions[nextIndex].id;

    tabRefs.current[nextIndex]?.focus();
    activateBranch(nextBranch);
  };

  return (
    <>
      <MenuHero />

      <div ref={selectorRef} className={styles.selectorWrap}>
        <div
          className={`container ${styles.selector}`}
          role="tablist"
          aria-label="Şube menüsü seçimi"
        >
          {branchOptions.map((branch, index) => {
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
      />
      <AtakentMenuPanel
        panelRef={atakentPanelRef}
        hidden={activeBranch !== "atakent"}
      />
      <MenuTruthNote />
    </>
  );
}
