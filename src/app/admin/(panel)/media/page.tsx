import Link from "next/link";
import AdminPagination from "@/components/admin/crud/AdminPagination";
import ConfirmSubmitButton from "@/components/admin/crud/ConfirmSubmitButton";
import styles from "@/components/admin/crud/AdminResource.module.css";
import mediaStyles from "./MediaLibrary.module.css";
import { firstString, formatAdminDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  adminPageRange,
  createAdminPagination,
  normaliseAdminSearch,
  parseAdminPage,
} from "@/lib/admin/pagination";
import {
  archiveAdminMedia,
  deleteTestAdminMedia,
  restoreAdminMedia,
  uploadAdminMedia,
} from "@/lib/admin/media-actions";
import { loadMediaUsageMap } from "@/lib/admin/media-usage";
import { getSupabasePublicEnv } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_IMAGE_BUCKETS } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
    notice?: string | string[];
    error?: string | string[];
  }>;
};

function mediaUrl(row: {
  source: string;
  local_path: string | null;
  external_url: string | null;
  bucket_name: string | null;
  object_path: string | null;
}) {
  if (row.source === "local") return row.local_path;
  if (row.source === "external") return row.external_url;
  if (row.bucket_name && row.object_path) {
    const { url } = getSupabasePublicEnv();
    return `${url}/storage/v1/object/public/${row.bucket_name}/${row.object_path}`;
  }
  return null;
}

export default async function AdminMediaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = normaliseAdminSearch(firstString(params.q));
  const statusFilter = firstString(params.status) ?? "all";
  const page = parseAdminPage(firstString(params.page));
  const { from, to } = adminPageRange(page);
  const supabase = await createClient();
  let mediaQuery = supabase
    .from("media")
    .select("*", { count: "exact" })
    .eq("kind", "image");
  if (statusFilter === "active") {
    mediaQuery = mediaQuery.eq("is_active", true).eq("status", "published");
  } else if (statusFilter === "archived") {
    mediaQuery = mediaQuery.or("is_active.eq.false,status.eq.archived");
  }
  if (q) {
    mediaQuery = mediaQuery.or(
      `title.ilike.%${q}%,alt_text.ilike.%${q}%,local_path.ilike.%${q}%,object_path.ilike.%${q}%`,
    );
  }
  const { data, error, count } = await mediaQuery
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  const usageMap = await loadMediaUsageMap(supabase, data ?? []);
  const rows = data ?? [];
  const pagination = createAdminPagination(count ?? 0, page, ADMIN_PAGE_SIZE);

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Storage ve medya</p>
          <h1>Medya kütüphanesi<span>.</span></h1>
          <p>Menü, etkinlik, merch, galeri ve Instagram görsellerini yükle; kullanım bağlantılarını kaldırmadan arşivleme veya silme yapma.</p>
        </div>
      </div>

      {firstString(params.notice) ? <p className={styles.notice}>{firstString(params.notice)}</p> : null}
      {firstString(params.error) ? <p className={styles.error}>{firstString(params.error)}</p> : null}

      <div className={`${styles.layout} ${styles.layoutWithEditor}`}>
        <div className={styles.panel}>
          <form className={styles.search} method="get">
            <input defaultValue={q} name="q" placeholder="Medya ara…" type="search" />
            <select defaultValue={statusFilter} name="status">
              <option value="all">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="archived">Arşiv</option>
            </select>
            <button className={styles.secondary} type="submit">Filtrele</button>
          </form>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Önizleme</th><th>Ad</th><th>Kaynak</th><th>Durum</th><th>Kullanım</th><th>Tarih</th><th>İşlem</th></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const url = mediaUrl(row);
                  const usages = usageMap.get(row.id) ?? [];
                  return (
                    <tr key={row.id}>
                      <td>{url ? <img alt={row.alt_text ?? ""} height={56} loading="lazy" src={url} style={{ borderRadius: 10, height: 56, objectFit: "cover", width: 72 }} width={72} /> : "—"}</td>
                      <td><strong>{row.title || row.alt_text || "Adsız görsel"}</strong><br /><small>{row.object_path || row.local_path}</small></td>
                      <td>{row.source}<br /><small>{row.bucket_name || "—"}</small></td>
                      <td>{row.is_active ? "Aktif" : "Pasif"}<br /><small>{row.status}</small></td>
                      <td>
                        <span className={usages.length ? mediaStyles.usageBusy : mediaStyles.usageFree}>
                          {usages.length ? `${usages.length} bağlantı` : "Kullanılmıyor"}
                        </span>
                        {usages.length ? (
                          <details className={mediaStyles.usageDetails}>
                            <summary>Bağlantıları gör</summary>
                            <ul>
                              {usages.map((usage) => (
                                <li key={`${usage.source}-${usage.sourceId}`}>
                                  <Link href={usage.href}>{usage.label}</Link>
                                  <small>{usage.field === "content" ? "JSON içindeki yolu değiştir" : "Görsel alanını değiştir veya boşalt"}</small>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </td>
                      <td>{formatAdminDate(row.created_at)}</td>
                      <td className={mediaStyles.actions}>
                        {row.is_active && row.status !== "archived" && !usages.length ? (
                          <form action={archiveAdminMedia}>
                            <input name="id" type="hidden" value={row.id} />
                            <ConfirmSubmitButton className={styles.linkButton} confirmMessage="Bu kullanılmayan medya kaydı arşivlensin mi? Storage nesnesi silinmez." type="submit">Arşivle</ConfirmSubmitButton>
                          </form>
                        ) : null}
                        {!row.is_active || row.status === "archived" ? (
                          <form action={restoreAdminMedia}>
                            <input name="id" type="hidden" value={row.id} />
                            <button className={styles.secondary} type="submit">Yayına al</button>
                          </form>
                        ) : null}
                        {row.source === "storage" && /^TEST[_\s-]/i.test(row.title ?? "") && !usages.length ? (
                          <form action={deleteTestAdminMedia}>
                            <input name="id" type="hidden" value={row.id} />
                            <ConfirmSubmitButton className={styles.danger} confirmMessage="Bu TEST görseli Storage ve veritabanından kalıcı silinsin mi?" type="submit">TEST sil</ConfirmSubmitButton>
                          </form>
                        ) : null}
                        {usages.length ? <small>Önce bağlantıları kaldır.</small> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminPagination
            basePath="/admin/media"
            pagination={pagination}
            query={{ q: q || undefined, status: statusFilter === "all" ? undefined : statusFilter }}
          />
        </div>

        <aside className={`${styles.panel} ${styles.editorPanel}`}>
          <div className={styles.panelTitle}><h2>Yeni görsel yükle</h2><span>Maksimum 8 MB</span></div>
          <form action={uploadAdminMedia} className={styles.form}>
            <label className={styles.field}><span>Bucket</span><select name="bucket" required>{PUBLIC_IMAGE_BUCKETS.map((bucket) => <option key={bucket} value={bucket}>{bucket}</option>)}</select></label>
            <label className={styles.field}><span>Medya adı</span><input name="title" placeholder="TEST_ Menü görseli" required /></label>
            <label className={styles.field}><span>Alt metin</span><input name="alt_text" placeholder="Görseli erişilebilir biçimde açıkla" required /></label>
            <label className={styles.field}><span>Dosya</span><input accept="image/jpeg,image/png,image/webp,image/avif" name="file" required type="file" /></label>
            <button className={styles.primary} type="submit">Görseli yükle</button>
          </form>
          <p className={mediaStyles.lifecycleNote}>
            Arşivleme yalnız veritabanı kaydını public seçimlerden kaldırır; public bucket nesnesini silmez. Kalıcı silme yalnız bağlantısız <strong>TEST_</strong> Storage kayıtlarında açılır.
          </p>
        </aside>
      </div>
    </section>
  );
}
