"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { primaryNavigation } from "@/data/site";
import type { NavigationItem } from "@/types/content";
import styles from "./SiteHeader.module.css";

const DESKTOP_BREAKPOINT = 1024;

function isNavigationItemActive(pathname: string, item: NavigationItem) {
  if (item.href.includes("#")) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function SiteHeader({
  navigation = primaryNavigation,
}: {
  navigation?: NavigationItem[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsOpen(false);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        const target = lastFocusedElementRef.current ?? toggleRef.current;
        target?.focus();
      });
    }
  }, []);

  const openMenu = useCallback(() => {
    lastFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : toggleRef.current;
    setIsOpen(true);
  }, []);

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const scrollToPageTop = useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  const handleSamePageNavigation = useCallback(
    (
      event: ReactMouseEvent<HTMLAnchorElement>,
      href: string,
      restoreFocus = false,
    ) => {
      const isModifiedClick =
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey;

      if (isModifiedClick || href.includes("#") || pathname !== href) {
        closeMenu();
        return;
      }

      event.preventDefault();
      closeMenu(restoreFocus);
      requestAnimationFrame(scrollToPageTop);
    },
    [closeMenu, pathname, scrollToPageTop],
  );


  useEffect(() => {
    const updateViewportState = () => {
      const mobile = window.innerWidth < DESKTOP_BREAKPOINT;
      setIsMobile(mobile);

      if (!mobile) {
        setIsOpen(false);
      }
    };

    const updateScrollState = () => setIsScrolled(window.scrollY > 8);

    updateViewportState();
    updateScrollState();

    window.addEventListener("resize", updateViewportState);
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("pageshow", updateViewportState);

    return () => {
      window.removeEventListener("resize", updateViewportState);
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("pageshow", updateViewportState);
    };
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    nav.inert = isMobile && !isOpen;
  }, [isMobile, isOpen]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", isOpen);

    if (isOpen) {
      requestAnimationFrame(() => {
        navRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
      });
    }

    return () => document.body.classList.remove("nav-open");
  }, [isOpen]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || !isMobile) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const nav = navRef.current;
      const toggle = toggleRef.current;
      if (!nav || !toggle) return;

      const focusableElements = [
        toggle,
        ...nav.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hidden);

      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu, isMobile, isOpen]);

  return (
    <header className={`${styles.header}${isScrolled ? ` ${styles.scrolled}` : ""}`}>
      <div className={`container ${styles.navWrap}`}>
        <Link
          className={styles.brand}
          href="/"
          aria-label={pathname === "/" ? "Sayfanın en üstüne dön" : "Kantin ana sayfa"}
          onClick={(event) => handleSamePageNavigation(event, "/")}
        >
          kantin<span>.</span>
        </Link>

        <button
          ref={toggleRef}
          className={styles.toggle}
          type="button"
          aria-expanded={isOpen}
          aria-controls="site-nav"
          aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          ref={navRef}
          className={`${styles.nav}${isOpen ? ` ${styles.open}` : ""}`}
          id="site-nav"
          aria-label="Ana navigasyon"
          aria-hidden={isMobile ? !isOpen : undefined}
        >
          {navigation.map((item) => {
            const active = isNavigationItemActive(pathname, item);

            return (
              <Link
                key={item.href}
                className={`${styles.navLink}${active ? ` ${styles.active}` : ""}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) =>
                  handleSamePageNavigation(event, item.href, isMobile)
                }
              >
                {item.label}
              </Link>
            );
          })}

        </nav>
      </div>
    </header>
  );
}
