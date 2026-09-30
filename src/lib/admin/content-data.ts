import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  withHeroImage,
  blockLabels,
  settingLabels,
  editableContentFields,
  type ContentRecord,
} from "./content-model";
export const contentSections = [
  { key: "home", label: "Ana Sayfa", url: "/" },
  { key: "alsancak", label: "Alsancak Şubesi", url: "/menu?sube=alsancak" },
  { key: "atakent", label: "Atakent Şubesi", url: "/menu?sube=atakent" },
  { key: "events", label: "Etkinlikler", url: "/events" },
  {
    key: "memories",
    label: "Anılarımız / özel içerikler",
    url: "/#anilarimiz",
  },
  { key: "settings", label: "Footer ve İletişim", url: "/" },
];
export async function loadContentRecords(
  section: string,
): Promise<ContentRecord[]> {
  await requireAdmin();
  const c = await createClient();
  const records: ContentRecord[] = [];
  if (section === "alsancak" || section === "atakent") {
    const { data, error } = await c
      .from("branches")
      .select(
        "id,name,short_description,address_line,district,city,maps_url,phone,public_email,features,opening_hours,status,is_active,updated_at",
      )
      .eq("slug", section);
    if (error) throw error;
    for (const b of data ?? [])
      records.push({
        id: b.id,
        table: "branches",
        label: b.name,
        updated_at: b.updated_at,
        fields: editableContentFields({
          name: b.name,
          short_description: b.short_description ?? "",
          address_line: b.address_line,
          district: b.district,
          city: b.city,
          maps_url: b.maps_url,
          phone: b.phone ?? "",
          public_email: b.public_email ?? "",
          features: b.features,
          opening_hours: b.opening_hours,
        }),
        revisionHref: `/admin/manage/branches?edit=${b.id}`,
        visibility: { status: b.status, is_active: b.is_active },
      });
  }
  if (section === "settings") {
    const { data: rows, error } = await c
      .from("site_settings")
      .select("id,key,value,status,is_active,updated_at")
      .eq("is_public", true)
      .in(
        "key",
        Object.keys(settingLabels).filter((k) => k !== "sections.visibility"),
      );
    if (error) throw error;
    for (const s of rows ?? [])
      records.push({
        id: s.id,
        table: "site_settings",
        label: settingLabels[s.key],
        updated_at: s.updated_at,
        fields: editableContentFields(s.value),
        revisionHref: `/admin/manage/site-settings?edit=${s.id}`,
        visibility: { status: s.status, is_active: s.is_active },
      });
  }
  if (section === "settings")
    return records.map((r) => ({
      ...r,
      context: `Site → Footer ve İletişim → ${r.label}`,
      publicHref: "/#footer",
    }));
  const { data: pages, error: pageError } = await c
    .from("site_pages")
    .select(
      "id,slug,title,seo_title,seo_description,status,is_active,updated_at",
    )
    .eq("slug", section === "events" ? "events" : "home");
  if (pageError) throw pageError;
  const page = (pages ?? []).find(
    (p) => p.slug === (section === "events" ? "events" : "home"),
  );
  if (page) {
    if (section === "home" || section === "events")
      records.push({
        id: page.id,
        table: "site_pages",
        label: "Sayfa başlığı ve arama motoru metinleri",
        updated_at: page.updated_at,
        fields: editableContentFields({
          title: page.title,
          seo_title: page.seo_title ?? "",
          seo_description: page.seo_description ?? "",
        }),
        revisionHref: `/admin/manage/site-pages?edit=${page.id}`,
        visibility: { status: page.status, is_active: page.is_active },
      });
    const { data: blocks, error } = await c
      .from("content_blocks")
      .select("id,key,content,status,is_active,updated_at")
      .eq("page_id", page.id)
      .in(
        "key",
        section === "memories"
          ? ["memories-copy", "memories-gallery"]
          : ["alsancak", "atakent"].includes(section)
            ? ["locations", "menu-branches"]
            : Object.keys(blockLabels).filter((k) => !k.startsWith("memories")),
      )
      .order("sort_order");
    if (error) throw error;
    for (const b of blocks ?? []) {
      if (!blockLabels[b.key]) continue;
      if (section === "settings") continue;
      if (section === "memories" && !b.key.startsWith("memories")) continue;
      if (section === "home" && b.key.startsWith("memories")) continue;
      if (
        (section === "alsancak" || section === "atakent") &&
        !["locations", "menu-branches"].includes(b.key)
      )
        continue;
      let fields = editableContentFields(
        b.key === "hero" && page.slug === "home"
          ? withHeroImage(b.content)
          : b.content,
      );
      if (section === "alsancak" || section === "atakent") {
        const items =
          (b.content as { items?: { slug?: string }[] })?.items ?? [];
        fields = fields.filter(
          (f) =>
            f.path[0] === "items" && items[Number(f.path[1])]?.slug === section,
        );
        // Partial editors use the complete editable field set when saving; see content-actions.
      }
      records.push({
        id: b.id,
        table: "content_blocks",
        label: blockLabels[b.key],
        updated_at: b.updated_at,
        fields,
        revisionHref: `/admin/manage/content-blocks?edit=${b.id}`,
        visibility:
          section === "alsancak" || section === "atakent"
            ? undefined
            : { status: b.status, is_active: b.is_active },
      });
    }
  }
  return records
    .filter((r) => r.fields.length)
    .map((r) => ({
      ...r,
      context: `Site → ${contentSections.find((s) => s.key === section)?.label ?? section} → ${r.label}`,
      publicHref:
        section === "events"
          ? "/events"
          : ["alsancak", "atakent"].includes(section)
            ? `/#${r.table === "branches" || r.label.includes("konum") ? "subeler" : "menu"}`
            : section === "memories"
              ? "/#anilarimiz"
              : r.label === "Ana başlık"
                ? "/"
                : `/#${r.label.includes("menüsü") ? "menu" : r.label.includes("konum") ? "subeler" : r.label.includes("Instagram") ? "subeler" : ""}`,
    }));
}
