import type { Metadata } from "next";
import Link from "next/link";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { requireAdmin } from "@/lib/auth/admin";
import styles from "./AdminDashboard.module.css";

export const metadata: Metadata = {
  title: "Yönetici Paneli",
  robots: { index: false, follow: false },
};

const modules = [
  {
    title: "Menü yönetimi",
    description: "Kategori, ürün, fiyat, porsiyon ve şube görünürlüğü.",
  },
  {
    title: "Etkinlikler",
    description: "Etkinlik kayıtları, tarihler, şubeler ve yayın durumu.",
  },
  {
    title: "Merch ve Instagram",
    description: "Ürün kartları, medya, gönderiler ve içerik sıralaması.",
  },
  {
    title: "Şubeler ve site ayarları",
    description: "Adresler, çalışma saatleri, footer ve bölüm görünürlüğü.",
  },
  {
    title: "Kariyer başvuruları",
    description: "Başvuru durumları ve private CV dosyalarına güvenli erişim.",
  },
  {
    title: "Kontrollü tema",
    description: "Tasarım sistemini bozmayan renk, yazı ve yoğunluk seçenekleri.",
  },
];

export default async function AdminPage() {
  const admin = await requireAdmin();
  const identity = admin.displayName || admin.email || "Yetkili kullanıcı";

  return (
    <>
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link className="brand" href="/">
            kantin<span>.</span>
          </Link>
          <div>
            <div className={styles.identity}>
              <strong>{identity}</strong>
              <small>Admin · Supabase Auth</small>
            </div>
            <AdminSignOutButton />
          </div>
        </div>
      </header>

      <main className="admin-main">
        <section className="container admin-dashboard">
          <div className="admin-dashboard-head">
            <div>
              <p className="eyebrow">Güvenli yönetim alanı</p>
              <h1>
                Yönetici paneli<span>.</span>
              </h1>
            </div>
            <span className="admin-mode-badge">Oturum aktif</span>
          </div>

          <p className={styles.intro}>
            Supabase oturumu, aktif profil ve admin rolü sunucu tarafında
            doğrulandı. İçerik yönetim modülleri Faz 9&apos;da bu güvenli kabuğun
            içine eklenecek.
          </p>

          <div className={styles.grid}>
            {modules.map((module, index) => (
              <article className={styles.card} key={module.title}>
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.status}>Faz 9</span>
                </div>
                <div>
                  <h2>{module.title}</h2>
                  <p>{module.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.security}>
            <strong>Yetkilendirme etkin</strong>
            <p>
              Giriş yapmamış kullanıcılar login sayfasına yönlendirilir. Giriş
              yapmış olsa bile aktif admin rolü olmayan hesaplar bu sayfayı
              görüntüleyemez; veritabanı işlemleri ayrıca RLS tarafından korunur.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
