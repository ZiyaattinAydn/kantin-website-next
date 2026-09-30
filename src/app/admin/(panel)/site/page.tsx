import AdminInteractionGuard from "@/components/admin/AdminInteractionGuard";
import Link from "next/link";
import { contentSections, loadContentRecords } from "@/lib/admin/content-data";
import { loadMediaChoices } from "@/lib/admin/media-choices";
import { recordSystemEvent } from "@/lib/admin/system-logs";
import ThemeSettingsPage from "../theme/page";
import ContentEditor from "@/components/admin/simple/ContentEditor";
import styles from "@/components/admin/simple/SimpleAdmin.module.css";
export const dynamic = "force-dynamic";
export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const tab = ["content", "sections", "design"].includes(query.tab ?? "")
    ? query.tab!
    : "content";
  const section =
    contentSections.find((s) => s.key === query.section) ?? contentSections[0];
  let records: Awaited<ReturnType<typeof loadContentRecords>> = [];
  let media: Awaited<ReturnType<typeof loadMediaChoices>> = [];
  let failed = false;
  try {
    if (tab === "content")
      [records, media] = await Promise.all([
        loadContentRecords(section.key),
        loadMediaChoices(),
      ]);
  } catch (error) {
    failed = true;
    await recordSystemEvent({
      route: "/admin/site",
      operation: "read",
      error,
    });
  }
  return (
    <section
      className={`${styles.page} ${styles.sitePage}`}
      id="admin-site-page"
    >
      <AdminInteractionGuard rootId="admin-site-page" />
      <header className={styles.head}>
        <div>
          <p className="eyebrow">İçerik</p>
          <h1>Site</h1>
          <p>Bölümü seçin; metinleri, görselleri ve bağlantıları değiştirin.</p>
        </div>
        <Link className={styles.button} href={section.url} target="_blank">
          Canlı siteyi aç
        </Link>
      </header>
      <nav className={styles.tabs} aria-label="Site yönetimi">
        {[
          ["content", "İçerik"],
          ["sections", "Bölümler"],
          ["design", "Tasarım"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/site?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {tab !== "content" ? (
        <ThemeSettingsPage
          searchParams={Promise.resolve(query)}
          embedded
          view={tab === "sections" ? "sections" : "design"}
        />
      ) : (
        <>
          <nav className={styles.tabs} aria-label="Site bölümleri">
            {contentSections.map((s) => (
              <Link
                aria-current={section.key === s.key ? "page" : undefined}
                href={`/admin/site?section=${s.key}`}
                key={s.key}
              >
                {s.label}
              </Link>
            ))}
          </nav>
          {failed ? (
            <p role="alert">İçerik yüklenemedi. Tekrar deneyin.</p>
          ) : null}
          {section.key === "events" ? (
            <div className={styles.actions}>
              <Link className={styles.button} href="/admin/manage/events">
                Etkinlik ve duyuruları düzenle
              </Link>
              <Link className={styles.button} href="/admin/manage/events?new=1">
                + Etkinlik / duyuru ekle
              </Link>
            </div>
          ) : null}
          {section.key === "home" ? (
            <div className={styles.actions}>
              <Link
                className={styles.button}
                href="/admin/manage/instagram-posts"
              >
                Instagram gönderilerini düzenle
              </Link>
              <Link
                className={styles.button}
                href="/admin/manage/merch-products"
              >
                Merch ürünlerini düzenle
              </Link>
              <Link className={styles.button} href="/admin/manage/events">
                Etkinlik bölümünü düzenle
              </Link>
              <Link className={styles.button} href="/admin/site?tab=sections">
                Bölüm sırası / tasarım
              </Link>
            </div>
          ) : null}
          {records.map((r) => (
            <ContentEditor
              key={`${r.id}-${r.updated_at}`}
              record={r}
              initialOpen={query.record === r.id}
              media={media}
            />
          ))}
          {!failed && !records.length ? (
            <p>Bu bölümde düzenlenebilir içerik bulunamadı.</p>
          ) : null}
          <p>
            Her bölüm ayrı kaydedilir. Kaydedilen değişiklikleri canlı siteyi
            açarak kontrol edebilirsiniz.
          </p>
        </>
      )}
    </section>
  );
}
