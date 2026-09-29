"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { applyContentChanges,editableContentFields,blockLabels,settingLabels } from "./content-model";
import { assertUuid } from "./pricing";
import { loadMediaChoices } from "./media-choices";
import { recordSystemEvent } from "./system-logs";
export async function saveContentRecord(input:{id:string;table:string;updated_at:string;changes:{path:(string|number)[];value:unknown}[];confirmed?:string}) {
  const admin=await requireAdmin();
  try {
    assertUuid(input.id,"İçerik");
    if(!["content_blocks","site_settings","site_pages","branches"].includes(input.table))throw new Error("invalid_content_payload");
    const c=await createClient();
    const {data,error}=await c.from(input.table as "content_blocks").select("*").eq("id",input.id).single();if(error)throw error;
    const row=data as unknown as Record<string,Json>;
    if(row.updated_at!==input.updated_at) throw {code:"40001"};
    if(input.table==="content_blocks"&&!blockLabels[String(row.key)])throw new Error("invalid_content_payload");
    if(input.table==="site_settings"&&(!settingLabels[String(row.key)]||row.is_public!==true))throw new Error("invalid_content_payload");
    let current:Json;
    if(input.table==="content_blocks") current=row.content;
    else if(input.table==="site_settings") current=row.value;
    else {
      const fields=input.table==="site_pages"?["title","seo_title","seo_description"]:["name","short_description","address_line","district","city","maps_url","phone","public_email","features","opening_hours"];
      current=Object.fromEntries(fields.map(k=>[k,row[k]??""])) as Json;
    }
    const allowed=editableContentFields(current);
    if(!Array.isArray(input.changes)||input.changes.length>500)throw new Error("invalid_content_payload");
    if(input.table==="site_settings"&&row.key==="sections.visibility"&&input.confirmed!=="EVET")throw new Error("visibility_confirmation_required");
    const changes=new Map(input.changes.map(change=>[JSON.stringify(change.path),change]));
    if(changes.size!==input.changes.length||input.changes.some(ch=>!allowed.some(f=>JSON.stringify(f.path)===JSON.stringify(ch.path))))throw new Error("invalid_content_payload");
    // Omitted fields keep their database values. Branch editors cannot drop other branch content.
    const complete=allowed.map(f=>changes.get(JSON.stringify(f.path))??{path:f.path,value:f.value});
    const media=await loadMediaChoices();
    const next=applyContentChanges(current,complete,new Map(media.map(m=>[m.id,m.url])));
    const patch=input.table==="content_blocks"?{content:next}:input.table==="site_settings"?{value:next}:next;
    const result=await c.from(input.table as "content_blocks").update(patch as {content:Json}).eq("id",input.id).eq("updated_at",input.updated_at).select("id").single();
    if(result.error||!result.data)throw result.error??{code:"40001"};
    ["/admin","/admin/content","/admin/manage","/","/menu","/events"].forEach(path=>revalidatePath(path,"layout"));
    return {ok:true,message:"Site içeriği kaydedildi."};
  }catch(error) {
    await recordSystemEvent({actorId:admin.userId,route:"/admin/content",operation:"save",entityType:input.table,entityId:input.id,error});
    return {ok:false,message:error&&typeof error==="object"&&"code"in error&&error.code==="40001"?"İçerik başka bir işlemle değişti. Sayfayı yenileyip tekrar deneyin.":"Site içeriği kaydedilemedi. Alanları kontrol edip tekrar deneyin."};
  }
}
