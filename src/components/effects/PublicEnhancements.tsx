"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = ".reveal";

function showRevealItem(item: HTMLElement) {
  item.classList.add("is-visible");
  item.classList.remove("reveal-pending");
}

function isNearViewport(item: HTMLElement) {
  const rect = item.getBoundingClientRect();
  return rect.bottom >= -40 && rect.top <= window.innerHeight * 1.15;
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
      { threshold: 0.04, rootMargin: "0px 0px 90px 0px" },
    );

    revealItems.forEach((item) => {
      if (isNearViewport(item)) {
        showRevealItem(item);
      } else {
        item.classList.add("reveal-pending");
        observer.observe(item);
      }
    });

    const revealVisibleItems = () => {
      revealItems.forEach((item) => {
        if (isNearViewport(item)) showRevealItem(item);
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
