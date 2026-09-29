import Link from "next/link";
import MenuManager from "@/components/admin/simple/MenuManager";
import { loadMenuData } from "@/lib/admin/menu-data";
import { loadMediaChoices } from "@/lib/admin/media-choices";
import { recordSystemEvent } from "@/lib/admin/system-logs";
import styles from "@/components/admin/simple/SimpleAdmin.module.css";
export const dynamic = "force-dynamic";
export default async function MenuPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
  const query = await searchParams;
  try {
    const [data,media] = await Promise.all([loadMenuData(),loadMediaChoices()]);
    return <MenuManager data={data} media={media} initialBranch={query.branch} initialSearch={query.q} initialEdit={query.edit} initialCategory={query.category} showNew={query.new==="1"} pricesOnly={query.mode==="prices"} />;
  } catch(error) {
    await recordSystemEvent({route:"/admin/menu",operation:"read",entityType:"menu_items",error});
    return <section className={styles.page}><h1>Menüyü Düzenle</h1><p role="alert">Menü yüklenemedi. Tekrar deneyin.</p><Link href="/admin/menu">Tekrar dene</Link></section>;
  }
}
