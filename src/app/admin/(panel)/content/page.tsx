import Link from "next/link";
import { contentSections,loadContentRecords } from "@/lib/admin/content-data";
import { loadMediaChoices } from "@/lib/admin/media-choices";
import { recordSystemEvent } from "@/lib/admin/system-logs";
import ContentEditor from "@/components/admin/simple/ContentEditor";
import styles from "@/components/admin/simple/SimpleAdmin.module.css";
export const dynamic="force-dynamic";
export default async function ContentPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
  const query=await searchParams;const section=contentSections.find(s=>s.key===query.section)??contentSections[0];
  let records:Awaited<ReturnType<typeof loadContentRecords>>=[];let media:Awaited<ReturnType<typeof loadMediaChoices>>=[];let failed=false;
  try { [records,media]=await Promise.all([loadContentRecords(section.key),loadMediaChoices()]); }
  catch(error){failed=true;await recordSystemEvent({route:"/admin/content",operation:"read",error});}
  return <section className={styles.page}><header className={styles.head}><div><p className="eyebrow">İçerik</p><h1>Site İçeriğini Düzenle</h1><p>Bölümü seçin; metinleri, görselleri ve bağlantıları değiştirin.</p></div><Link className={styles.button} href={section.url} target="_blank">Canlı siteyi aç</Link></header>
    <nav className={styles.tabs} aria-label="Site bölümleri">{contentSections.map(s=><Link aria-current={section.key===s.key?"page":undefined} href={`/admin/content?section=${s.key}`} key={s.key}>{s.label}</Link>)}</nav>
    {failed?<p role="alert">İçerik yüklenemedi. Tekrar deneyin.</p>:null}
    {section.key==="events"?<div className={styles.actions}><Link className={styles.button} href="/admin/manage/events">Etkinlik ve duyuruları düzenle</Link><Link className={styles.button} href="/admin/manage/events?new=1">+ Etkinlik / duyuru ekle</Link></div>:null}
    {section.key==="home"?<div className={styles.actions}><Link className={styles.button} href="/admin/manage/instagram-posts">Instagram gönderilerini düzenle</Link><Link className={styles.button} href="/admin/manage/merch-products">Merch ürünlerini düzenle</Link><Link className={styles.button} href="/admin/manage/events">Etkinlik bölümünü düzenle</Link><Link className={styles.button} href="/admin/theme">Bölüm sırası / tasarım</Link></div>:null}
    {records.map(r=><ContentEditor key={`${r.id}-${r.updated_at}`} record={r} media={media}/>)}
    {!failed&&!records.length?<p>Bu bölümde düzenlenebilir içerik bulunamadı.</p>:null}
    <p>Her bölüm ayrı kaydedilir. Kaydedilen değişiklikleri canlı siteyi açarak kontrol edebilirsiniz.</p>
  </section>;
}
