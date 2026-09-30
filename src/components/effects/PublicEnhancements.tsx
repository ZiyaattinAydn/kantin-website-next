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
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (reduceMotion || !finePointer) return;

    let animationFrame: number | null = null;
    let currentY = window.scrollY;
    let targetY = window.scrollY;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const clampTarget = (value: number) =>
      Math.min(Math.max(value, 0), maxScroll());

    const hasScrollableAncestor = (target: EventTarget | null, deltaY: number) => {
      let element = target instanceof Element ? target : null;

      while (element && element !== document.documentElement) {
        const style = window.getComputedStyle(element);
        const canScroll =
          /(auto|scroll)/.test(style.overflowY) &&
          element.scrollHeight > element.clientHeight + 1;

        if (canScroll) {
          const atTop = element.scrollTop <= 0;
          const atBottom =
            element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

          if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
            return true;
          }
        }

        element = element.parentElement;
      }

      return false;
    };

    const animateScroll = () => {
      const distance = targetY - currentY;
      currentY += distance * 0.14;

      if (Math.abs(distance) < 0.7) {
        currentY = targetY;
        window.scrollTo(0, targetY);
        animationFrame = null;
        return;
      }

      window.scrollTo(0, currentY);
      animationFrame = window.requestAnimationFrame(animateScroll);
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        document.body.classList.contains("nav-open") ||
        hasScrollableAncestor(event.target, event.deltaY)
      ) {
        return;
      }

      event.preventDefault();

      const deltaMultiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 18
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;

      const delta = Math.max(
        -180,
        Math.min(180, event.deltaY * deltaMultiplier),
      );

      if (animationFrame === null) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }

      targetY = clampTarget(targetY + delta);

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(animateScroll);
      }
    };

    const syncScrollPosition = () => {
      if (animationFrame !== null) return;
      currentY = window.scrollY;
      targetY = window.scrollY;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", syncScrollPosition, { passive: true });
    window.addEventListener("resize", syncScrollPosition);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", syncScrollPosition);
      window.removeEventListener("resize", syncScrollPosition);

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [pathname]);

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
