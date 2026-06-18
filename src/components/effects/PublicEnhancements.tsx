"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = ".reveal";

function showRevealItem(item: HTMLElement) {
  item.classList.add("is-visible");
  item.classList.remove("reveal-pending");
}

function isNearViewport(item: HTMLElement, mobile: boolean) {
  const rect = item.getBoundingClientRect();
  const viewportBuffer = mobile ? 1.05 : 1.15;
  return rect.bottom >= -32 && rect.top <= window.innerHeight * viewportBuffer;
}

function isRenderable(item: HTMLElement) {
  return item.getClientRects().length > 0 && !item.closest("[hidden]");
}

export default function PublicEnhancements() {
  const pathname = usePathname();

  useEffect(() => {
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );

    if (!revealItems.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mobile = window.matchMedia("(max-width: 719px)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(showRevealItem);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showRevealItem(entry.target as HTMLElement);
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: mobile ? 0.01 : 0.04,
        rootMargin: mobile ? "0px 0px 48px 0px" : "0px 0px 90px 0px",
      },
    );

    revealItems.forEach((item) => {
      if (!isRenderable(item)) return;

      if (isNearViewport(item, mobile)) {
        showRevealItem(item);
      } else {
        item.classList.add("reveal-pending");
        observer.observe(item);
      }
    });

    const revealVisibleItems = () => {
      revealItems.forEach((item) => {
        if (isRenderable(item) && isNearViewport(item, mobile)) {
          showRevealItem(item);
        }
      });
    };

    const timers = [
      window.setTimeout(revealVisibleItems, 700),
      window.setTimeout(revealVisibleItems, 1800),
    ];

    window.addEventListener("pageshow", revealVisibleItems);
    window.addEventListener("orientationchange", revealVisibleItems);

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pageshow", revealVisibleItems);
      window.removeEventListener("orientationchange", revealVisibleItems);
    };
  }, [pathname]);

  return null;
}
