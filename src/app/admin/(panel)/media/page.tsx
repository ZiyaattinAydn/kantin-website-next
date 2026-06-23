import Link from "next/link";
import AdminPagination from "@/components/admin/crud/AdminPagination";
import ConfirmSubmitButton from "@/components/admin/crud/ConfirmSubmitButton";
import TypedConfirmSubmitButton from "@/components/admin/crud/TypedConfirmSubmitButton";
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
  deleteAdminMedia,
  restoreAdminMedia,
  updateAdminMedia,
  uploadAdminMedia,
} from "@/lib/admin/media-actions";
import { loadMediaUsageMap } from "@/lib/admin/media-usage";
import { getSupabasePublicEnv } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_IMAGE_BUCKETS } from "@/lib/supabase/storage";
import type { Json } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

const MEDIA_LIST_COLUMNS =
  "id, kind, source, title, alt_text, local_path, external_url, bucket_name, object_path, metadata, status, is_active, sort_order, created_at, updated_at" as const;

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
    edit?: string | string[];
    notice?: string | string[];
    error?: string | string[];
  }>;
};

type MediaRow = {
  id: string;
  kind: string;
  source: string;
  title: string | null;
  alt_text: string | null;
  local_path: string | null;
  external_url: string | null;
  bucket_name: string | null;
  object_path: string | null;
  metadata: Json;
  status: "draft" | "published" | "archived";
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function mediaUrl(row: Pick<MediaRow, "source" | "local_path" | "external_url" | "bucket_name" | "object_path">) {
  if (row.source === "local") return row.local_path;
  if (row.source === "external") return row.external_url;
  if (row.bucket_name && row.object_path) {
    const { url } = getSupabasePublicEnv();
    return `${url}/storage/v1/object/public/${row.bucket_name}/${row.object_path}`;
  }
  return null;
}

function isDeletePending(metadata: Json): boolean {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
  const marker = metadata._admin_delete;
  return Boolean(
    marker
      && typeof marker === "object"
      && !Array.isArray(marker)
      && marker.state === "pending",
  );
}

function mediaListHref({
  q,
  status,
  page,
  edit,
}: {
  q?: string;
  status?: string;
  page?: number;
  edit?: string;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (page && page > 1) params.set("page", String(page));
  if (edit) params.set("edit", edit);
  return `/admin/media${params.size ? `?${params.toString()}` : ""}`;
}

export default async function AdminMediaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = normaliseAdminSearch(firstString(params.q));
  const statusFilter = firstString(params.status) ?? "all";
  const editId = firstString(params.edit);
  const page = parseAdminPage(firstString(params.page));
  const { from, to } = adminPageRange(page);
  const supabase = await createClient();
  let mediaQuery = supabase
    .from("media")
    .select(MEDIA_LIST_COLUMNS, { count: "exact" })
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

  const rows = (data ?? []) as MediaRow[];
  const usageMap = await loadMediaUsageMap(supabase, rows);
  const pagination = createAdminPagination(count ?? 0, page, ADMIN_PAGE_SIZE);

  let selectedRow = editId ? rows.find((row) => row.id === editId) ?? null : null;
  if (editId && !selectedRow) {
    const { data: selected, error: selectedError } = await supabase
      .from("media")
      .select(MEDIA_LIST_COLUMNS)
      .eq("id", editId)
      .eq("kind", "image")
      .maybeSingle();
    if (selectedError) throw new Error(selectedError.message);
    selectedRow = selected as MediaRow | null;
  }

  const listHref = mediaListHref({ q, status: statusFilter, page });
  const selectedDeletePending = selectedRow
    ? isDeletePending(selectedRow.metadata)
    : false;

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Storage ve medya</p>
          <h1>Medya kütüphanesi<span>.</span></h1>
          <p>Görselleri yükle, erişilebilirlik bilgilerini düzenle, yayın durumunu yönet ve yalnız bağlantısız arşiv kayıtlarını kalıcı sil.</p>
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
              <option value="archived">Arşiv / pasif</option>
            </select>
            <button className={styles.secondary} type="submit">Filtrele</button>
          </form>

          <div className={`${styles.tableWrap} ${mediaStyles.tableWrap}`}>
            <table className={`${styles.table} ${mediaStyles.mediaTable}`}>
              <thead>
                <tr>
                  <th>Önizleme</th>
                  <th>Medya</th>
                  <th>Durum</th>
                  <th>Kullanım</th>
                  <th>Güncelleme</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const url = mediaUrl(row);
                  const usages = usageMap.get(row.id) ?? [];
                  const pendingDelete = isDeletePending(row.metadata);
                  const canDelete =
                    row.source === "storage"
                    && row.status === "archived"
                    && !row.is_active
                    && !usages.length
                    && !pendingDelete;
                  const canResumeDelete =
                    row.source === "storage"
                    && row.status === "archived"
                    && !row.is_active
                    && !usages.length
                    && pendingDelete;
                  const editHref = mediaListHref({
                    q,
                    status: statusFilter,
                    page,
                    edit: row.id,
                  });

                  return (
                    <tr key={row.id}>
                      <td>
                        {url ? (
                          <img
                            alt={row.alt_text ?? ""}
                            className={mediaStyles.preview}
                            height={64}
                            loading="lazy"
                            src={url}
                            width={82}
                          />
                        ) : "—"}
                      </td>
                      <td className={mediaStyles.mediaIdentity}>
                        <strong>{row.title || row.alt_text || "Adsız görsel"}</strong>
                        <small>{row.alt_text || "Alt metin yok"}</small>
                        <code>{row.object_path || row.local_path || row.external_url || "—"}</code>
                      </td>
                      <td>
                        <span className={row.is_active && row.status === "published" ? mediaStyles.statusActive : mediaStyles.statusPassive}>
                          {row.is_active && row.status === "published" ? "Public" : "Public değil"}
                        </span>
                        <small className={mediaStyles.statusMeta}>{row.status} · {row.source}</small>
                        {pendingDelete ? <small className={mediaStyles.pendingDelete}>Silme bekliyor</small> : null}
                      </td>
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
                      <td>
                        {formatAdminDate(row.updated_at)}
                        <small className={mediaStyles.statusMeta}>Sıra: {row.sort_order}</small>
                      </td>
                      <td className={mediaStyles.actions}>
                        {!pendingDelete ? (
                          <Link className={styles.secondary} href={editHref}>Düzenle</Link>
                        ) : null}

                        {!pendingDelete && row.is_active && row.status !== "archived" ? (
                          <form action={archiveAdminMedia}>
                            <input name="id" type="hidden" value={row.id} />
                            <ConfirmSubmitButton
                              className={styles.linkButton}
                              confirmMessage={usages.length
                                ? "Bu medya içeriklerde kullanılıyor. Arşivlenirse public sayfalarda görsel yerine güvenli fallback/boş görünüm kullanılacak. Storage nesnesi silinmeyecek. Devam edilsin mi?"
                                : "Bu medya arşivlensin ve public görünümlerden kaldırılsın mı? Storage nesnesi silinmez."}
                              type="submit"
                            >
                              Arşivle
                            </ConfirmSubmitButton>
                          </form>
                        ) : null}

                        {!pendingDelete && (!row.is_active || row.status === "archived") ? (
                          <form action={restoreAdminMedia}>
                            <input name="id" type="hidden" value={row.id} />
                            <button className={styles.secondary} type="submit">Yayına al</button>
                          </form>
                        ) : null}

                        {canDelete || canResumeDelete ? (
                          <form action={deleteAdminMedia}>
                            <input name="id" type="hidden" value={row.id} />
                            <TypedConfirmSubmitButton
                              className={styles.danger}
                              confirmMessage={canResumeDelete
                                ? "Önceki kalıcı silme işlemi yarıda kaldı. Storage ve veritabanı adımları güvenli biçimde tekrar denenecek."
                                : "Bu görsel Storage ve veritabanından geri alınamaz biçimde silinecek."}
                              confirmPhrase={canResumeDelete ? "SİLMEYİ TAMAMLA" : "KALICI SİL"}
                              type="submit"
                            >
                              {canResumeDelete ? "Silmeyi tamamla" : "Kalıcı sil"}
                            </TypedConfirmSubmitButton>
                          </form>
                        ) : null}

                        {row.status === "archived" && usages.length ? (
                          <small>Kalıcı silmek için önce {usages.length} bağlantıyı kaldır.</small>
                        ) : null}
                        {row.status === "archived" && row.source !== "storage" ? (
                          <small>Yerel/harici kaynak fiziksel olarak buradan silinmez.</small>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
                {!rows.length ? (
                  <tr>
                    <td className={mediaStyles.emptyState} colSpan={6}>Bu filtreye uygun medya bulunamadı.</td>
                  </tr>
                ) : null}
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
          {selectedRow ? (
            <>
              <div className={styles.panelTitle}>
                <h2>Görsel ayarları</h2>
                <Link href={listHref}>Kapat</Link>
              </div>
              {selectedDeletePending ? (
                <>
                  <p className={styles.warning}>
                    Bu kayıtta yarım kalmış kalıcı silme işlemi var. Metadata düzenleme ve geri yükleme kilitli. Listeye dönüp “Silmeyi tamamla” işlemini kullan.
                  </p>
                  <div className={mediaStyles.readOnlySource}>
                    <strong>Bekleyen Storage kaydı</strong>
                    <span>{selectedRow.source} · {selectedRow.bucket_name || "bucket yok"}</span>
                    <code>{selectedRow.object_path || selectedRow.local_path || selectedRow.external_url || "—"}</code>
                  </div>
                  <Link className={styles.secondary} href={listHref}>Listeye dön</Link>
                </>
              ) : (
                <>
                  <form action={updateAdminMedia} className={styles.form}>
                    <input name="id" type="hidden" value={selectedRow.id} />
                    <label className={styles.field}>
                      <span>Medya adı</span>
                      <input defaultValue={selectedRow.title ?? ""} maxLength={180} name="title" required />
                    </label>
                    <label className={styles.field}>
                      <span>Alt metin</span>
                      <textarea defaultValue={selectedRow.alt_text ?? ""} maxLength={500} name="alt_text" required rows={4} />
                    </label>
                    <label className={styles.field}>
                      <span>Yayın durumu</span>
                      <select defaultValue={selectedRow.status} name="status" required>
                        <option value="draft">Taslak</option>
                        <option value="published">Yayında</option>
                        <option value="archived">Arşiv</option>
                      </select>
                    </label>
                    <label className={styles.checkbox}>
                      <input defaultChecked={selectedRow.is_active} name="is_active" type="checkbox" />
                      <span>Aktif</span>
                    </label>
                    <label className={styles.field}>
                      <span>Sıra</span>
                      <input defaultValue={selectedRow.sort_order} min={0} name="sort_order" required type="number" />
                    </label>
                    <div className={mediaStyles.readOnlySource}>
                      <strong>Dosya kaynağı değiştirilemez</strong>
                      <span>{selectedRow.source} · {selectedRow.bucket_name || "bucket yok"}</span>
                      <code>{selectedRow.object_path || selectedRow.local_path || selectedRow.external_url || "—"}</code>
                    </div>
                    <button className={styles.primary} type="submit">Ayarları kaydet</button>
                    <Link className={styles.secondary} href={listHref}>Vazgeç</Link>
                  </form>
                  <p className={mediaStyles.lifecycleNote}>
                    Taslak veya arşiv durumunda kayıt otomatik olarak pasif tutulur. Dosyanın kendisini değiştirmek için yeni görsel yükle ve ilgili içerikte medya bağlantısını güncelle.
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <div className={styles.panelTitle}><h2>Yeni görsel yükle</h2><span>Maksimum 8 MB</span></div>
              <form action={uploadAdminMedia} className={styles.form}>
                <label className={styles.field}><span>Bucket</span><select name="bucket" required>{PUBLIC_IMAGE_BUCKETS.map((bucket) => <option key={bucket} value={bucket}>{bucket}</option>)}</select></label>
                <label className={styles.field}><span>Medya adı</span><input name="title" placeholder="Menü görseli" required /></label>
                <label className={styles.field}><span>Alt metin</span><input name="alt_text" placeholder="Görseli erişilebilir biçimde açıkla" required /></label>
                <label className={styles.field}><span>Dosya</span><input accept="image/jpeg,image/png,image/webp,image/avif" name="file" required type="file" /></label>
                <button className={styles.primary} type="submit">Görseli yükle</button>
              </form>
              <p className={mediaStyles.lifecycleNote}>
                Arşivleme public görünürlüğü kapatır fakat Storage nesnesini silmez. Kalıcı silme yalnız bağlantısız, arşivlenmiş Storage görsellerinde açılır ve <strong>KALICI SİL</strong> onayı ister.
              </p>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
