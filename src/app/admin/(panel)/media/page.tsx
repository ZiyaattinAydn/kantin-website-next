import ConfirmSubmitButton from "@/components/admin/crud/ConfirmSubmitButton";
import styles from "@/components/admin/crud/AdminResource.module.css";
import { firstString, formatAdminDate } from "@/lib/admin/format";
import {
  archiveAdminMedia,
  deleteTestAdminMedia,
  uploadAdminMedia,
} from "@/lib/admin/media-actions";
import { getSupabasePublicEnv } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_IMAGE_BUCKETS } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string | string[]; notice?: string | string[]; error?: string | string[] }>;
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
  const q = firstString(params.q)?.toLocaleLowerCase("tr-TR") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.from("media").select("*").eq("kind", "image").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []).filter((row) => {
    if (!q) return true;
    return [row.title, row.alt_text, row.local_path, row.object_path].some((value) => value?.toLocaleLowerCase("tr-TR").includes(q));
  });

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Storage ve medya</p>
          <h1>Medya kütüphanesi<span>.</span></h1>
          <p>Menü, etkinlik, merch, galeri ve Instagram görsellerini yükle; içerik formlarında medya kaydını seç.</p>
        </div>
      </div>

      {firstString(params.notice) ? <p className={styles.notice}>{firstString(params.notice)}</p> : null}
      {firstString(params.error) ? <p className={styles.error}>{firstString(params.error)}</p> : null}

      <div className={`${styles.layout} ${styles.layoutWithEditor}`}>
        <div className={styles.panel}>
          <form className={styles.search} method="get">
            <input defaultValue={q} name="q" placeholder="Medya ara…" type="search" />
            <button className={styles.secondary} type="submit">Ara</button>
          </form>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Önizleme</th><th>Ad</th><th>Kaynak</th><th>Durum</th><th>Tarih</th><th>İşlem</th></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const url = mediaUrl(row);
                  return (
                    <tr key={row.id}>
                      <td>{url ? <img alt={row.alt_text ?? ""} height={56} loading="lazy" src={url} style={{ borderRadius: 10, height: 56, objectFit: "cover", width: 72 }} width={72} /> : "—"}</td>
                      <td><strong>{row.title || row.alt_text || "Adsız görsel"}</strong><br /><small>{row.object_path || row.local_path}</small></td>
                      <td>{row.source}<br /><small>{row.bucket_name || "—"}</small></td>
                      <td>{row.is_active ? "Aktif" : "Pasif"}<br /><small>{row.status}</small></td>
                      <td>{formatAdminDate(row.created_at)}</td>
                      <td>
                        <form action={archiveAdminMedia}>
                          <input name="id" type="hidden" value={row.id} />
                          <ConfirmSubmitButton className={styles.linkButton} confirmMessage="Bu görsel arşivlensin mi?" type="submit">Arşivle</ConfirmSubmitButton>
                        </form>
                        {row.source === "storage" && /^TEST[_\s-]/i.test(row.title ?? "") ? (
                          <form action={deleteTestAdminMedia}>
                            <input name="id" type="hidden" value={row.id} />
                            <ConfirmSubmitButton className={styles.danger} confirmMessage="Bu TEST görseli Storage ve veritabanından kalıcı silinsin mi?" type="submit">TEST sil</ConfirmSubmitButton>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
        </aside>
      </div>
    </section>
  );
}
