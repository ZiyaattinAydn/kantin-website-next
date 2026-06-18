import type { Metadata } from "next";
import Link from "next/link";
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
          <Link className="brand" href="/">
            kantin<span>.</span>
          </Link>
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
        id="kantin-admin-legacy"
        src="/assets/js/admin.js?v=react-final"
        type="module"
        strategy="afterInteractive"
      />
    </>
  );
}
