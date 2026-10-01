"use client";

import Link from "next/link";
import AdminNavLink from "./ui/AdminNavLink";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import AdminOnboarding from "@/components/admin/AdminOnboarding";
import { adminNavigation } from "@/lib/admin/navigation";
import AdminListState from "./ui/AdminListState";
import styles from "./AdminShell.module.css";

export default function AdminShell({
  children,
  identity,
}: {
  children: ReactNode;
  identity: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previousFocus = document.activeElement as HTMLElement | null;
    const sidebar = document.getElementById("admin-sidebar");
    const focusable = () =>
      Array.from(
        sidebar?.querySelectorAll<HTMLElement>(
          "a[href],button:not([disabled]),summary",
        ) ?? [],
      ).filter(
        (element) =>
          !element.closest("details:not([open])") ||
          element.tagName === "SUMMARY",
      );
    focusable()[0]?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
      previousFocus?.focus();
    };
  }, [open]);

  return (
    <div className={styles.shell}>
      <header className={styles.mobileHeader}>
        <Link className="brand" href="/">
          kantin<span>.</span>
        </Link>
        <button
          aria-expanded={open}
          aria-controls="admin-sidebar"
          aria-label={open ? "Yönetim menüsü açık" : "Yönetim menüsünü aç"}
          className={styles.menuButton}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          Yönetim
        </button>
      </header>

      <aside
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
        id="admin-sidebar"
      >
        <div className={styles.brandRow}>
          <Link className="brand" href="/">
            kantin<span>.</span>
          </Link>
          <div className={styles.brandActions}>
            <span className={styles.badge}>Admin</span>
            <button
              aria-label="Admin menüsünü kapat"
              className={styles.sidebarClose}
              onClick={() => setOpen(false)}
              type="button"
            >
              Kapat
            </button>
          </div>
        </div>

        <div className={styles.identity}>
          <strong>{identity}</strong>
          <span>Yetkili yönetici oturumu</span>
        </div>

        <nav className={styles.nav} aria-label="Admin navigasyonu">
          {adminNavigation.map((group) => (
            <section key={group.label}>
              <h2>{group.label}</h2>
              <div>
                {group.links.map((link) => {
                  const active =
                    link.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === link.href ||
                        pathname.startsWith(`${link.href}/`);
                  return (
                    <AdminNavLink
                      aria-current={active ? "page" : undefined}
                      className={active ? styles.active : undefined}
                      href={link.href}
                      key={link.href}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </AdminNavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <AdminOnboarding />
          <Link href="/" target="_blank">
            Ziyaretçi sitesini aç
          </Link>
          <AdminSignOutButton />
        </div>
      </aside>

      {open ? (
        <button
          aria-label="Admin menüsünü kapat"
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}

      <main className={styles.main}>
        <AdminListState />
        <form action="/admin/search" className={styles.search} role="search">
          <label htmlFor="admin-task-search">Panelde ara</label>
          <div>
            <input
              id="admin-task-search"
              name="q"
              placeholder="Ne yapmak istiyorsunuz?"
              maxLength={100}
              type="search"
            />
            <button type="submit">Ara</button>
          </div>
        </form>
        {children}
      </main>
    </div>
  );
}
