import Link from "next/link";
import AdminPagination from "@/components/admin/crud/AdminPagination";
import ConfirmSubmitButton from "@/components/admin/crud/ConfirmSubmitButton";
import TypedConfirmSubmitButton from "@/components/admin/crud/TypedConfirmSubmitButton";
import styles from "@/components/admin/crud/AdminResource.module.css";
import mediaStyles from "./MediaLibrary.module.css";
import { firstString, formatAdminDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  resolveAdminPage,
  normaliseAdminSearch,
  parseAdminPage,
} from "@/lib/admin/pagination";
import {
  archiveAdminMedia,
  deleteAdminMedia,
  replaceAdminMedia,
  restoreAdminMedia,
  updateAdminMedia,
  uploadAdminMedia,
} from "@/lib/admin/media-actions";
import {
  loadMediaUsageMap,
  type MediaUsageRecord,
} from "@/lib/admin/media-usage";
import { getSupabasePublicEnv } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_IMAGE_BUCKETS, type StorageBucket } from "@/lib/supabase/storage";
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
    new?: string | string[];
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
}: {
  q?: string;
  status?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (page && page > 1) params.set("page", String(page));
  return `/admin/media${params.size ? `?${params.toString()}` : ""}`;
}

function isPublicImageBucket(
  value: string | null,
): value is (typeof PUBLIC_IMAGE_BUCKETS)[number] {
  return Boolean(
    value
    && PUBLIC_IMAGE_BUCKETS.includes(value as (typeof PUBLIC_IMAGE_BUCKETS)[number]),
  );
}

const bucketLabels: Record<(typeof PUBLIC_IMAGE_BUCKETS)[number], string> = {
  "menu-images": "Menü ürünleri",
  "event-images": "Etkinlik ve duyurular",
  "merch-images": "Merch ürünleri",
  "instagram-media": "Instagram içerikleri",
  "gallery-images": "Galeri ve genel görseller",
};

function bucketLabel(value: string | null): string {
  if (isPublicImageBucket(value)) return bucketLabels[value];
  return "Yerel proje görseli";
}

function sourceLabel(value: string): string {
  if (value === "storage") return "Yüklenen dosya";
  if (value === "local") return "Projeyle gelen dosya";
  if (value === "external") return "Dış bağlantı";
  return "Görsel kaynağı";
}

function statusLabel(value: MediaRow["status"]): string {
  if (value === "published") return "Yayında";
  if (value === "archived") return "Arşivde";
  return "Taslak";
}

function defaultReplacementBucket(
  row: MediaRow,
  usages: MediaUsageRecord[],
): StorageBucket {
  if (isPublicImageBucket(row.bucket_name)) return row.bucket_name;
  if (usages.some((usage) => usage.source === "menu_items")) return "menu-images";
  if (usages.some((usage) => usage.source === "events")) return "event-images";
  if (usages.some((usage) => usage.source === "merch_products")) return "merch-images";
  if (usages.some((usage) => usage.source === "instagram_posts")) return "instagram-media";
  return "gallery-images";
}

export default async function AdminMediaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = normaliseAdminSearch(firstString(params.q));
  const statusFilter = firstString(params.status) ?? "all";
  const editId = firstString(params.edit);
  const showNew = firstString(params.new) === "1" || Boolean(firstString(params.error) && !editId);
  const page = parseAdminPage(firstString(params.page));
  const supabase = await createClient();
  let countQuery = supabase
    .from("media")
    .select("id", { count: "exact", head: true })
    .eq("kind", "image");

  if (statusFilter === "active") {
    countQuery = countQuery.eq("is_active", true).eq("status", "published");
  } else if (statusFilter === "archived") {
    countQuery = countQuery.or("is_active.eq.false,status.eq.archived");
  }
  if (q) {
    countQuery = countQuery.or(
      `title.ilike.%${q}%,alt_text.ilike.%${q}%,local_path.ilike.%${q}%,object_path.ilike.%${q}%`,
    );
  }

  const { count, error: countError } = await countQuery;
  if (countError) throw new Error(countError.message);
  const resolved = resolveAdminPage(count ?? 0, page, ADMIN_PAGE_SIZE);

  let mediaQuery = supabase
    .from("media")
    .select(MEDIA_LIST_COLUMNS)
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

  const { data, error } = await mediaQuery
    .order("created_at", { ascending: false })
    .range(resolved.from, resolved.to);
  if (error) throw new Error(error.message);

  const listedRows = (data ?? []) as MediaRow[];
  let selectedRow = editId ? listedRows.find((row) => row.id === editId) ?? null : null;
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

  const rows = selectedRow && !listedRows.some((row) => row.id === selectedRow?.id)
    ? [selectedRow, ...listedRows]
    : listedRows;
  const usageMap = await loadMediaUsageMap(supabase, rows);
  const pagination = {
    page: resolved.page,
    pageSize: resolved.pageSize,
    pageCount: resolved.pageCount,
    total: resolved.total,
  };
  const listHref = mediaListHref({ q, status: statusFilter, page: resolved.page });

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Görsel arşivi</p>
          <h1>Medya kütüphanesi<span>.</span></h1>
          <p>Satırın herhangi bir yerine dokunarak görseli aç. Dosyayı değiştirirken mevcut menü, etkinlik, merch ve içerik bağlantıları korunur.</p>
        </div>
      </div>

      <nav aria-label="Medya hızlı işlemleri" className={mediaStyles.shortcuts}>
        <Link className={mediaStyles.shortcutPrimary} href="/admin/media?new=1#media-editor">＋ Yeni görsel</Link>
        <Link href="/admin/media?status=active#media-list">Yayındakiler</Link>
        <Link href="/admin/media?status=archived#media-list">Arşiv / pasif</Link>
        <Link href="/admin/media#media-list">Tüm görseller</Link>
      </nav>

      {firstString(params.notice) ? <p className={styles.notice}>{firstString(params.notice)}</p> : null}
      {firstString(params.error) ? <p className={styles.error}>{firstString(params.error)}</p> : null}

      <details className={mediaStyles.uploadCard} id="media-editor" open={showNew}>
        <summary className={mediaStyles.uploadSummary}>
          <span>
            <strong>＋ Yeni görsel yükle</strong>
            <small>Ziyaretçi sitesinde kullanılacak yeni bir görsel yükle.</small>
          </span>
          <span className={mediaStyles.chevron}>⌄</span>
        </summary>
        <div className={mediaStyles.uploadBody}>
          <div className={mediaStyles.uploadIntro}>
            <p className="eyebrow">Yeni medya</p>
            <h2>Görseli yükle</h2>
            <p>Dosya en fazla 8 MB olabilir. Kullanım alanı, görselin nerede kullanılacağını belirler.</p>
          </div>
          <form action={uploadAdminMedia} className={`${styles.form} ${mediaStyles.uploadForm}`}>
            <label className={styles.field}>
              <span>Kullanım alanı</span>
              <select name="bucket" required>{PUBLIC_IMAGE_BUCKETS.map((bucket) => <option key={bucket} value={bucket}>{bucketLabels[bucket]}</option>)}</select>
            </label>
            <label className={styles.field}>
              <span>Medya adı</span>
              <input name="title" placeholder="Menü görseli" required />
            </label>
            <label className={styles.field}>
              <span>Alt metin</span>
              <input name="alt_text" placeholder="Görseli erişilebilir biçimde açıkla" required />
            </label>
            <label className={styles.field}>
              <span>Dosya</span>
              <input accept="image/jpeg,image/png,image/webp,image/avif" name="file" required type="file" />
            </label>
            <button className={styles.primary} type="submit">Görseli yükle</button>
          </form>
        </div>
      </details>

      <section className={mediaStyles.filterPanel} id="media-list" aria-label="Medya filtreleri">
        <form className={mediaStyles.mediaSearch} method="get">
          <label>
            <span>Medya ara</span>
            <input defaultValue={q} name="q" placeholder="Görsel adı veya alt metin" type="search" />
          </label>
          <label>
            <span>Yayın durumu</span>
            <select defaultValue={statusFilter} name="status">
              <option value="all">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="archived">Arşiv / pasif</option>
            </select>
          </label>
          <div className={mediaStyles.filterActions}>
            <button className={styles.primary} type="submit">Filtrele</button>
            <Link className={styles.secondary} href="/admin/media">Temizle</Link>
          </div>
        </form>
        <p className={mediaStyles.resultSummary}>{pagination.total} görsel · Sayfa {pagination.page}/{pagination.pageCount || 1}</p>
      </section>

      <section className={mediaStyles.mediaTable} aria-label="Medya kütüphanesi tablosu">
        <div className={mediaStyles.tableHeader} aria-hidden="true">
          <span>Önizleme</span>
          <span>Medya</span>
          <span>Durum</span>
          <span>Kullanım</span>
          <span>Güncelleme</span>
          <span>İşlem</span>
        </div>

        <div className={mediaStyles.mediaList}>
          {rows.map((row) => {
            const url = mediaUrl(row);
            const usages = usageMap.get(row.id) ?? [];
            const pendingDelete = isDeletePending(row.metadata);
            const canDelete = row.status === "archived" && !row.is_active && !pendingDelete;
            const replacementBucket = defaultReplacementBucket(row, usages);
            const isSelected = editId === row.id;

            return (
              <details
                className={mediaStyles.mediaCard}
                id={`media-${row.id}`}
                key={row.id}
                open={isSelected}
              >
                <summary className={mediaStyles.mediaSummary}>
                  <span className={mediaStyles.summaryCell} data-label="Önizleme">
                    {url ? (
                      <img alt={row.alt_text ?? ""} className={mediaStyles.preview} height={64} loading="lazy" src={url} width={82} />
                    ) : <span className={mediaStyles.noPreview}>Görsel yok</span>}
                  </span>
                  <span className={mediaStyles.summaryCell} data-label="Medya">
                    <span className={mediaStyles.mediaIdentity}>
                      <strong>{row.title || row.alt_text || "Adsız görsel"}</strong>
                      <small>{row.alt_text || "Alt metin yok"}</small>
                    </span>
                  </span>
                  <span className={mediaStyles.summaryCell} data-label="Durum">
                    <span className={row.is_active && row.status === "published" ? mediaStyles.statusActive : mediaStyles.statusPassive}>
                      {row.is_active && row.status === "published" ? "Yayında" : "Yayında değil"}
                    </span>
                    <small className={mediaStyles.statusMeta}>{statusLabel(row.status)} · {sourceLabel(row.source)}</small>
                    {pendingDelete ? <small className={mediaStyles.pendingDelete}>Silme bekliyor</small> : null}
                  </span>
                  <span className={mediaStyles.summaryCell} data-label="Kullanım">
                    <span className={usages.length ? mediaStyles.usageBusy : mediaStyles.usageFree}>
                      {usages.length ? `${usages.length} bağlantı` : "Kullanılmıyor"}
                    </span>
                  </span>
                  <span className={mediaStyles.summaryCell} data-label="Güncelleme">
                    <small>{formatAdminDate(row.updated_at)}</small>
                  </span>
                  <span className={mediaStyles.openAction} data-label="İşlem">
                    <span>Yönet</span>
                    <span className={mediaStyles.chevron}>⌄</span>
                  </span>
                </summary>

                <div className={mediaStyles.mediaEditor}>
                  <div className={mediaStyles.editorHeading}>
                    <div>
                      <p className="eyebrow">Görsel yönetimi</p>
                      <h2>{row.title || "Adsız görsel"}</h2>
                      <p>Değişiklikler kaydetme sonrasında uygulanır. Dosya değişiminde aynı görsel kaydı ve bağlı içerikler korunur.</p>
                    </div>
                    {isSelected ? <Link className={styles.secondary} href={`${listHref}#media-${row.id}`}>Seçimi kapat</Link> : null}
                  </div>

                  {pendingDelete ? (
                    <section className={mediaStyles.pendingPanel}>
                      <div>
                        <strong>Yarım kalmış kalıcı silme işlemi</strong>
                        <p>Düzenleme ve geri yükleme kilitli. Dosya, medya kaydı ve bağlı içerik bağlantılarının temizliğini güvenli biçimde tamamla.</p>
                        <code>{row.object_path || row.local_path || row.external_url || "—"}</code>
                      </div>
                      <form action={deleteAdminMedia}>
                        <input name="id" type="hidden" value={row.id} />
                        <TypedConfirmSubmitButton
                          className={styles.danger}
                          confirmMessage="Önceki kalıcı silme işlemi yarıda kaldı. Dosya, medya kaydı ve bağlı içerik bağlantıları güvenli biçimde yeniden temizlenecek."
                          confirmPhrase="SİLMEYİ TAMAMLA"
                          type="submit"
                        >
                          Silmeyi tamamla
                        </TypedConfirmSubmitButton>
                      </form>
                    </section>
                  ) : (
                    <>
                      <div className={mediaStyles.editorGrid}>
                        <section className={mediaStyles.previewPanel}>
                          {url ? <img alt={row.alt_text ?? ""} height={360} src={url} width={540} /> : <div className={mediaStyles.largeNoPreview}>Önizleme yok</div>}
                          <div className={mediaStyles.sourceInfo}>
                            <strong>Mevcut dosya</strong>
                            <span>{sourceLabel(row.source)} · {bucketLabel(row.bucket_name)}</span>
                            <details className={mediaStyles.technicalInfo}>
                              <summary>Teknik dosya bilgisini göster</summary>
                              <code>{row.object_path || row.local_path || row.external_url || "—"}</code>
                            </details>
                          </div>

                          <div className={mediaStyles.usagePanel}>
                            <div>
                              <strong>Bağlı içerikler</strong>
                              <span>{usages.length ? `${usages.length} yerde kullanılıyor` : "Bu görsel henüz bir içeriğe bağlı değil."}</span>
                            </div>
                            {usages.length ? (
                              <ul>
                                {usages.map((usage) => (
                                  <li key={`${usage.source}-${usage.sourceId}`}>
                                    <Link href={usage.href}>{usage.label}</Link>
                                    <small>Değiştirmede korunur; kalıcı silmede otomatik kaldırılır.</small>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </section>

                        <section className={mediaStyles.formPanel}>
                          <div className={mediaStyles.sectionTitle}>
                            <h3>Görsel bilgileri</h3>
                            <p>Ad, erişilebilir alt metin ve yayın durumunu düzenle.</p>
                          </div>
                          <form action={updateAdminMedia} className={styles.form}>
                            <input name="id" type="hidden" value={row.id} />
                            <label className={styles.field}>
                              <span>Medya adı</span>
                              <input defaultValue={row.title ?? ""} maxLength={180} name="title" required />
                            </label>
                            <label className={styles.field}>
                              <span>Alt metin</span>
                              <textarea defaultValue={row.alt_text ?? ""} maxLength={500} name="alt_text" required rows={5} />
                            </label>
                            <label className={styles.field}>
                              <span>Yayın durumu</span>
                              <select defaultValue={row.status} name="status" required>
                                <option value="draft">Taslak</option>
                                <option value="published">Yayında</option>
                                <option value="archived">Arşiv</option>
                              </select>
                            </label>
                            <label className={styles.checkbox}>
                              <input defaultChecked={row.is_active} name="is_active" type="checkbox" />
                              <span>Aktif</span>
                            </label>
                            <input name="sort_order" type="hidden" value={row.sort_order} />
                            <button className={styles.primary} type="submit">Bilgileri kaydet</button>
                          </form>
                        </section>
                      </div>

                      <section className={mediaStyles.replaceSection}>
                        <div className={mediaStyles.sectionTitle}>
                          <p className="eyebrow">Hızlı değiştir</p>
                          <h3>Yerine başka görsel koy</h3>
                          <p>Yeni dosya aynı medya kaydına bağlanır. Menü, etkinlik, merch, Instagram ve içerik bloklarındaki bağlantılar otomatik korunur.</p>
                        </div>
                        <form action={replaceAdminMedia} className={mediaStyles.replaceForm}>
                          <input name="id" type="hidden" value={row.id} />
                          <label className={styles.field}>
                            <span>Kullanım alanı</span>
                            <select defaultValue={replacementBucket} name="bucket" required>
                              {PUBLIC_IMAGE_BUCKETS.map((bucket) => <option key={bucket} value={bucket}>{bucketLabels[bucket]}</option>)}
                            </select>
                          </label>
                          <label className={styles.field}>
                            <span>Yeni görsel</span>
                            <input accept="image/jpeg,image/png,image/webp,image/avif" name="file" required type="file" />
                          </label>
                          <button className={styles.primary} type="submit">Görseli değiştir</button>
                        </form>
                      </section>

                      <section className={mediaStyles.lifecycleSection}>
                        <div className={mediaStyles.sectionTitle}>
                          <h3>Yayın ve yaşam döngüsü</h3>
                          <p>Arşivleme bağlantıları korur. Kalıcı silme ise bağlı alanları otomatik temizler ve geri alınamaz.</p>
                        </div>
                        <div className={mediaStyles.lifecycleActions}>
                          {row.is_active && row.status !== "archived" ? (
                            <form action={archiveAdminMedia}>
                              <input name="id" type="hidden" value={row.id} />
                              <ConfirmSubmitButton
                                className={styles.secondary}
                                confirmMessage={usages.length
                                  ? "Bu görsel içeriklerde kullanılıyor. Arşivlenirse ziyaretçi sitesinde görünmez; bağlantılar korunur. Devam edilsin mi?"
                                  : "Bu görsel arşivlensin ve ziyaretçi sitesinden kaldırılsın mı?"}
                                type="submit"
                              >
                                Arşivle
                              </ConfirmSubmitButton>
                            </form>
                          ) : null}

                          {(!row.is_active || row.status === "archived") ? (
                            <form action={restoreAdminMedia}>
                              <input name="id" type="hidden" value={row.id} />
                              <button className={styles.secondary} type="submit">Yayına al</button>
                            </form>
                          ) : null}

                          {canDelete ? (
                            <form action={deleteAdminMedia}>
                              <input name="id" type="hidden" value={row.id} />
                              <TypedConfirmSubmitButton
                                className={styles.danger}
                                confirmMessage={usages.length
                                  ? `Bu görsel ${usages.length} yerde kullanılıyor. Kalıcı silme sırasında tüm bağlantılar otomatik kaldırılacak ve işlem geri alınamayacak.`
                                  : "Bu görsel ve medya kaydı geri alınamaz biçimde silinecek."}
                                confirmPhrase="KALICI SİL"
                                type="submit"
                              >
                                Kalıcı sil
                              </TypedConfirmSubmitButton>
                            </form>
                          ) : null}
                        </div>
                        {row.status === "archived" && usages.length ? <small>{usages.length} bağlantı kalıcı silmede otomatik kaldırılır.</small> : null}
                        {row.status === "archived" && row.source !== "storage" ? <small>Medya kaydı kaldırılır; paket içindeki eski dosya kullanılmadan kalır.</small> : null}
                      </section>
                    </>
                  )}
                </div>
              </details>
            );
          })}
          {!rows.length ? <p className={mediaStyles.emptyState}>Bu filtreye uygun medya bulunamadı.</p> : null}
        </div>
      </section>

      <AdminPagination
        basePath="/admin/media"
        pagination={pagination}
        query={{ q: q || undefined, status: statusFilter === "all" ? undefined : statusFilter }}
      />
    </section>
  );
}
