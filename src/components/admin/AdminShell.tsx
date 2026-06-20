"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import styles from "./AdminShell.module.css";

const groups = [
  {
    label: "Genel",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/media", label: "Medya kütüphanesi" },
      { href: "/admin/applications", label: "Kariyer başvuruları" },
    ],
  },
  {
    label: "Menü",
    links: [
      { href: "/admin/manage/menu-categories", label: "Kategoriler" },
      { href: "/admin/manage/menu-category-branches", label: "Kategori şubeleri" },
      { href: "/admin/manage/menu-items", label: "Ürünler" },
      { href: "/admin/manage/menu-item-branches", label: "Şube fiyatları" },
      { href: "/admin/manage/menu-item-variants", label: "Fiyat varyantları" },
    ],
  },
  {
    label: "İçerik",
    links: [
      { href: "/admin/manage/events", label: "Etkinlikler" },
      { href: "/admin/manage/event-branches", label: "Etkinlik şubeleri" },
      { href: "/admin/manage/merch-products", label: "Merch ürünleri" },
      { href: "/admin/manage/merch-product-branches", label: "Merch şubeleri" },
      { href: "/admin/manage/instagram-posts", label: "Instagram" },
      { href: "/admin/manage/site-pages", label: "Site sayfaları" },
      { href: "/admin/manage/content-blocks", label: "İçerik blokları" },
    ],
  },
  {
    label: "Site",
    links: [
      { href: "/admin/manage/branches", label: "Şubeler" },
      { href: "/admin/manage/site-settings", label: "Site ayarları" },
    ],
  },
] as const;

export default function AdminShell({
  children,
  identity,
}: {
  children: ReactNode;
  identity: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <header className={styles.mobileHeader}>
        <Link className="brand" href="/">
          kantin<span>.</span>
        </Link>
        <button
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className={styles.menuButton}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? "Kapat" : "Yönetim"}
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
          <span className={styles.badge}>Admin</span>
        </div>

        <div className={styles.identity}>
          <strong>{identity}</strong>
          <span>Supabase Auth · Yetkili oturum</span>
        </div>

        <nav className={styles.nav} aria-label="Admin navigasyonu">
          {groups.map((group) => (
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
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank">Public siteyi aç</Link>
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

      <main className={styles.main}>{children}</main>
    </div>
  );
}
