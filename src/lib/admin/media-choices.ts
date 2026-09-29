import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { loadAllAdminRows } from "./menu-data";
import type { Database } from "@/lib/supabase/database.types";
export type MediaChoice = { id:string; label:string; url:string; width:number|null; height:number|null };
export async function loadMediaChoices(): Promise<MediaChoice[]> {
  await requireAdmin();
  const client = await createClient();
  const rows = await loadAllAdminRows<Database["public"]["Tables"]["media"]["Row"]>(client,"media");
  return rows.filter(m=>m.kind==="image" && m.status==="published" && m.is_active && m.bucket_name!=="career-cvs")
    .flatMap(m=> {
      const url=m.source==="local" ? m.local_path : m.source==="external" ? m.external_url : m.bucket_name && m.object_path ? client.storage.from(m.bucket_name).getPublicUrl(m.object_path).data.publicUrl : null;
      return url && ((url.startsWith("/") && !url.startsWith("//")) || url.startsWith("https://")) ? [{id:m.id,label:m.title||m.alt_text||"Görsel",url,width:m.width,height:m.height}] : [];
    });
}
