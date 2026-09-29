"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { adminNavigation, advancedNavigation } from "@/lib/admin/navigation";
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
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", escape); };
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
                      : pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={active ? styles.active : undefined}
                      href={link.href}
                      key={link.href}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}

              </div>
            </section>
          ))}
          <details className={styles.advancedNav} open={advancedNavigation.some(link => pathname === link.href)}>
            <summary>Gelişmiş Yönetim</summary>
            <div>{advancedNavigation.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}</div>
          </details>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank">Ziyaretçi sitesini aç</Link>
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
        <form action="/admin/search" className={styles.search} role="search">
          <label htmlFor="admin-task-search">Panelde ara</label>
          <div><input id="admin-task-search" name="q" placeholder="Ne yapmak istiyorsunuz?" maxLength={100} type="search" /><button type="submit">Ara</button></div>
        </form>
        {children}
      </main>
    </div>
  );
}
