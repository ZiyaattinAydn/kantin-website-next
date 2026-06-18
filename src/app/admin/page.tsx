import type { Metadata } from "next";
import Script from "next/script";
import AdminBodyClass from "@/components/admin/AdminBodyClass";
import { adminMarkup } from "@/content/admin";

export const metadata: Metadata = {
  title: "Etkinlik Yönetimi",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <AdminBodyClass />

      <header className="admin-header">
        <div className="container admin-header-inner">
          <a className="brand" href="/">
            kantin<span>.</span>
          </a>
          <div>
            <span className="admin-mode-badge" data-admin-mode>
              Bağlantı kontrol ediliyor
            </span>
            <button
              className="admin-text-button"
              type="button"
              data-admin-signout
              hidden
            >
              Çıkış yap
            </button>
          </div>
        </div>
      </header>

      <main
        className="admin-main"
        dangerouslySetInnerHTML={{ __html: adminMarkup }}
      />

      <Script
        id="kantin-main-admin"
        src="/assets/js/main.js?v=next-migration-1"
        strategy="afterInteractive"
      />
      <Script
        id="kantin-admin-legacy"
        src="/assets/js/admin.js?v=next-migration-1"
        type="module"
        strategy="afterInteractive"
      />
    </>
  );
}
