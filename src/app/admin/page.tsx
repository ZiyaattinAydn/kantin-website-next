import { eventAvailabilityFromRow } from "@/lib/event-availability";
import { loadAllAdminRows } from "@/lib/admin/menu-data";
import { loadSystemHealth } from "@/lib/admin/system-logs";
import { adminTasks } from "@/lib/admin/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import styles from "./AdminDashboard.module.css";
import { formatAdminDate } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const activityLabels: Record<string, string> = {
  restore: "Önceki sürüm geri yüklendi",
  theme_settings_save: "Tasarım ayarları güncellendi",
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
  return activityLabels[action] ?? "Kayıt değiştirildi";
}

const cards = [
  { key: "menu_items", label: "Menü ürünü", href: "/admin/menu" },
  { key: "menu_categories", label: "Kategori", href: "/admin/menu" },
  { key: "events", label: "Etkinlik", href: "/admin/manage/events" },
  {
    key: "merch_products",
    label: "Merch kaydı",
    href: "/admin/manage/merch-products",
  },
  {
    key: "instagram_posts",
    label: "Instagram gönderisi",
    href: "/admin/manage/instagram-posts",
  },
  {
    key: "job_applications",
    label: "Kariyer başvurusu",
    href: "/admin/applications",
  },
] as const;

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const identity = admin.displayName || admin.email || "Yetkili kullanıcı";
  const supabase = await createClient();
  const [counts, logsResult, newApplicationsResult, health, eventRows] =
    await Promise.all([
      Promise.all(
        cards.map(async (card) => {
          const { count, error } = await supabase
            .from(card.key)
            .select("id", { count: "exact", head: true });
          return { ...card, count: error ? null : (count ?? 0) };
        }),
      ),
      supabase
        .from("admin_activity_logs")
        .select("id, actor_id, action, entity_type, entity_label, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      loadSystemHealth(),
      loadAllAdminRows<Record<string, unknown>>(supabase, "events").catch(
        () => null,
      ),
    ]);

  const actorIds = [
    ...new Set((logsResult.data ?? []).map((log) => log.actor_id)),
  ];
  const { data: actors } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", actorIds)
    : { data: [] };
  const actorNames = new Map(
    (actors ?? []).map((actor) => [
      actor.id,
      actor.display_name || "Yetkili kullanıcı",
    ]),
  );

  return (
    <AdminShell identity={identity}>
      <section className={styles.page}>
        <header className={styles.head}>
          <div>
            <p className="eyebrow">Güvenli yönetim alanı</p>
            <h1>Bugün ne yapmak istiyorsunuz?</h1>
            <p>
              Yapmak istediğiniz işlemi seçin. Menü, içerik ve başvurular
              burada.
            </p>
          </div>
          <div className={styles.headActions}>
            <Link href="/" target="_blank">
              Ziyaretçi sitesini aç
            </Link>
            <Link href="/admin/media">Görsel yükle</Link>
          </div>
        </header>

        <div className={styles.alert}>
          <strong>{newApplicationsResult.count ?? 0}</strong>
          <span>yeni kariyer başvurusu inceleme bekliyor.</span>
          <Link href="/admin/applications?status=new">Başvurulara git</Link>
        </div>

        <div className={styles.cards}>
          {adminTasks.map((task) => (
            <Link className={styles.card} href={task.href} key={task.label}>
              <strong>{task.label}</strong>
              <small>{task.description}</small>
              <small>Başla →</small>
            </Link>
          ))}
        </div>
        <details className={styles.panel}>
          <summary>İşletmeye genel bakış</summary>
          <div className={styles.counts}>
            {counts.map((card) => (
              <Link className={styles.card} href={card.href} key={card.key}>
                <span>{card.count ?? "—"}</span>
                <strong>{card.label}</strong>
                <small>
                  Toplam kayıt
                  {card.key === "events"
                    ? ` · ${eventRows ? eventRows.filter((row) => eventAvailabilityFromRow(row).visible).length : "—"} güncel etkinlik / duyuru`
                    : ""}
                </small>
                <small>Yönetimi aç →</small>
              </Link>
            ))}
          </div>
        </details>

        <div className={styles.grid}>
          <article className={styles.panel}>
            <h2>Sistem durumu</h2>
            <p>
              {health.count === null
                ? "Sistem durumu şu anda kontrol edilemiyor."
                : health.count
                  ? `Son 24 saatte ${health.count} hata kaydı`
                  : "Sistem durumu: Sorun görünmüyor"}
            </p>
            <Link href="/admin/logs">Detayları gör</Link>
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
                    <strong>{log.entity_label || "Yönetim kaydı"}</strong>
                    <span>
                      {actorNames.get(log.actor_id) || "Yetkili kullanıcı"} ·{" "}
                      {activityLabel(log.action)} ·{" "}
                      {formatAdminDate(log.created_at)}
                    </span>
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
            Kalıcı silme yalnız pasife alınmış veya arşivlenmiş kayıtlarda
            açılır. Bir kayıt silindiğinde yalnızca ona bağlı alt kayıtlar
            temizlenir; kategori gibi üst kayıtlar korunur ve yapılan işlemler
            geçmişe kaydedilir.
          </p>
        </div>
      </section>
    </AdminShell>
  );
}
