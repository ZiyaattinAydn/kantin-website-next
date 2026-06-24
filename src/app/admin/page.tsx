import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import styles from "./AdminDashboard.module.css";
import { formatAdminDate } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";


const activityLabels: Record<string, string> = {
  create: "Oluşturuldu",
  update: "Güncellendi",
  archive: "Arşivlendi",
  delete: "Kalıcı silindi",
  media_upload: "Görsel yüklendi",
  media_update: "Görsel bilgileri güncellendi",
  media_archive: "Görsel arşivlendi",
  media_restore: "Görsel yeniden yayına alındı",
  media_file_replace: "Görsel dosyası değiştirildi",
  media_delete: "Görsel kalıcı silindi",
  application_update: "Başvuru güncellendi",
  application_anonymization_started: "Başvuru anonimleştirme başlatıldı",
  application_anonymized: "Başvuru anonimleştirildi",
  menu_item_branch_add: "Ürün şubeye eklendi",
  menu_pricing_save: "Fiyatlar güncellendi",
};

function activityLabel(action: string): string {
  return activityLabels[action] ?? action.replaceAll("_", " ");
}

const cards = [
  { key: "menu_items", label: "Menü ürünü", href: "/admin/manage/menu-items" },
  { key: "menu_categories", label: "Kategori", href: "/admin/manage/menu-categories" },
  { key: "events", label: "Etkinlik", href: "/admin/manage/events" },
  { key: "merch_products", label: "Merch kaydı", href: "/admin/manage/merch-products" },
  { key: "instagram_posts", label: "Instagram gönderisi", href: "/admin/manage/instagram-posts" },
  { key: "job_applications", label: "Kariyer başvurusu", href: "/admin/applications" },
] as const;

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const identity = admin.displayName || admin.email || "Yetkili kullanıcı";
  const supabase = await createClient();
  const [counts, logsResult, newApplicationsResult] = await Promise.all([
    Promise.all(
      cards.map(async (card) => {
        const { count, error } = await supabase
          .from(card.key)
          .select("id", { count: "exact", head: true });
        return { ...card, count: error ? null : count ?? 0 };
      }),
    ),
    supabase
      .from("admin_activity_logs")
      .select("id, action, entity_type, entity_label, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return (
    <AdminShell identity={identity}>
    <section className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Güvenli yönetim alanı</p>
          <h1>
            Yönetici paneli<span>.</span>
          </h1>
          <p>
            Menüden kariyer başvurularına kadar bütün işletme içeriklerini tek yerden yönet. Değişiklikler yalnız yetkili hesaplar tarafından kaydedilebilir.
          </p>
        </div>
        <div className={styles.headActions}>
          <Link href="/" target="_blank">Ziyaretçi sitesini aç</Link>
          <Link href="/admin/media">Görsel yükle</Link>
        </div>
      </header>

      <div className={styles.alert}>
        <strong>{newApplicationsResult.count ?? 0}</strong>
        <span>yeni kariyer başvurusu inceleme bekliyor.</span>
        <Link href="/admin/applications?status=new">Başvurulara git</Link>
      </div>

      <div className={styles.cards}>
        {counts.map((card) => (
          <Link className={styles.card} href={card.href} key={card.key}>
            <span>{card.count ?? "—"}</span>
            <strong>{card.label}</strong>
            <small>Yönetimi aç →</small>
          </Link>
        ))}
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Hızlı işlemler</h2>
            <span>Günlük işlemler</span>
          </div>
          <div className={styles.quickLinks}>
            <Link href="/admin/manage/menu-items?new=1">Yeni menü ürünü</Link>
            <Link href="/admin/pricing">Ürün ve şube fiyatlarını yönet</Link>
            <Link href="/admin/manage/events?new=1">Yeni etkinlik / duyuru</Link>
            <Link href="/admin/manage/merch-products?new=1">Yeni merch ürünü</Link>
            <Link href="/admin/manage/instagram-posts?new=1">Yeni Instagram gönderisi</Link>
            <Link href="/admin/manage/site-settings">Footer ve site ayarları</Link>
            <Link href="/admin/manage/content-blocks">Anılarımız ve içerik blokları</Link>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Son işlemler</h2>
            <span>{logsResult.data?.length ?? 0} kayıt</span>
          </div>
          <div className={styles.logs}>
            {(logsResult.data ?? []).length ? (
              logsResult.data?.map((log) => (
                <div key={log.id}>
                  <strong>{log.entity_label || log.entity_type}</strong>
                  <span>{activityLabel(log.action)} · {formatAdminDate(log.created_at)}</span>
                </div>
              ))
            ) : (
              <p>Henüz kaydedilmiş bir yönetici işlemi yok.</p>
            )}
          </div>
        </article>
      </div>

      <div className={styles.security}>
        <strong>Silme güvenliği</strong>
        <p>
          Kalıcı silme yalnız pasife alınmış veya arşivlenmiş kayıtlarda açılır.
          Bir kayıt silindiğinde yalnızca ona bağlı alt kayıtlar temizlenir; kategori
          gibi üst kayıtlar korunur ve yapılan işlemler geçmişe kaydedilir.
        </p>
      </div>
    </section>
    </AdminShell>
  );
}
