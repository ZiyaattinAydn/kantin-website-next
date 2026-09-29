import type { Json } from "@/lib/supabase/database.types";
export type ContentField = {
  path: (string | number)[];
  label: string;
  value: string | number | boolean;
  kind: "text" | "textarea" | "url" | "image" | "number" | "checkbox";
};
export type ContentRecord = {
  id: string;
  table: "content_blocks" | "site_settings" | "site_pages" | "branches";
  label: string;
  updated_at: string;
  fields: ContentField[];
  revisionHref: string;
  visibility?: { status: string; is_active: boolean };
};
const labels: Record<string, string> = {
  title: "Başlık",
  name: "Ad",
  description: "Açıklama",
  eyebrow: "Üst başlık",
  introduction: "Giriş metni",
  statement: "Vurgu metni",
  closingLine: "Kapanış metni",
  marquee: "Kayan yazı",
  label: "Etiket / buton metni",
  href: "Bağlantı",
  caption: "Açıklama",
  alt: "Görsel açıklaması",
  src: "Görsel",
  address: "Adres",
  mapsUrl: "Yol tarifi bağlantısı",
  tags: "Özellik",
  slogan: "Slogan",
  sloganLines: "Slogan satırı",
  instagramUrl: "Instagram bağlantısı",
  publicEmail: "İletişim e-postası",
  city: "Şehir",
  country: "Ülke",
  postsLimit: "Gönderi sayısı",
  external: "Yeni sekmede aç",
  homeHero: "Ana başlık bölümü",
  branches: "Şubeler bölümü",
  menu: "Menü bölümü",
  events: "Etkinlik bölümü",
  merch: "Merch bölümü",
  memories: "Anılarımız bölümü",
  instagram: "Instagram bölümü",
  careers: "Kariyer bölümü",
  seo_title: "Arama motoru başlığı",
  seo_description: "Arama motoru açıklaması",
  short_description: "Kısa açıklama",
  address_line: "Adres",
  district: "İlçe",
  maps_url: "Yol tarifi bağlantısı",
  phone: "Telefon",
  public_email: "İletişim e-postası",
  features: "Özellik",
  note: "Çalışma saatleri",
  notice: "Saat açıklaması",
  day: "Gün",
  hours: "Saatler",
  opens: "Açılış",
  closes: "Kapanış",
  is_active: "Sitede göster",
  status: "Yayın durumu",
};
const contexts: Record<string, string> = {
  primaryAction: "Ana buton",
  secondaryAction: "İkinci buton",
  features: "Özellikler",
  chapters: "Bölüm",
  items: "İçerik",
  images: "Görseller",
  links: "Bağlantılar",
  opening_hours: "Çalışma saatleri",
};
export const blockLabels: Record<string, string> = {
  hero: "Ana başlık",
  "menu-branches": "Şube menüsü tanıtımları",
  locations: "Şube görselleri / konum",
  "memories-copy": "Anılarımız metni",
  "memories-gallery": "Anılarımız fotoğrafları",
  instagram: "Instagram bölümü",
  "merch-doodles": "Merch görselleri",
};
export const settingLabels: Record<string, string> = {
  "site.identity": "Marka ve sosyal medya",
  "site.contact": "İletişim",
  "navigation.footer": "Footer bağlantıları",
  "navigation.primary": "Üst menü bağlantıları",
  "sections.visibility": "Bölüm görünürlükleri",
};
export function editableContentFields(
  value: unknown,
  path: (string | number)[] = [],
  context = "",
): ContentField[] {
  if (Array.isArray(value))
    return value.flatMap((v, i) =>
      editableContentFields(v, [...path, i], `${context} · ${i + 1}`),
    );
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, v]) => {
      if (
        key === "image" ||
        key === "items" ||
        key === "images" ||
        key === "chapters" ||
        key === "features" ||
        key === "links" ||
        key === "primaryAction" ||
        key === "secondaryAction" ||
        key === "opening_hours"
      ) {
        return editableContentFields(
          v,
          [...path, key],
          `${context}${context ? " · " : ""}${contexts[key] ?? "Görsel"}`,
        );
      }
      if (!labels[key]) return [];
      return editableContentFields(
        v,
        [...path, key],
        `${context}${context ? " · " : ""}${labels[key]}`,
      );
    });
  }
  if (!["string", "number", "boolean"].includes(typeof value)) return [];
  const key = String(path.findLast((p) => typeof p === "string"));
  const kind =
    typeof value === "boolean"
      ? "checkbox"
      : typeof value === "number"
        ? "number"
        : key === "src"
          ? "image"
          : /href|[Uu]rl/.test(key)
            ? "url"
            : /description|introduction|statement|closingLine|caption/.test(key)
              ? "textarea"
              : "text";
  return [
    { path, label: context, value: value as string | number | boolean, kind },
  ];
}
export function applyContentChanges(
  current: Json,
  changes: { path: (string | number)[]; value: unknown }[],
  media: Map<string, string>,
): Json {
  const allowed = editableContentFields(current);
  const copy = structuredClone(current);
  if (changes.length !== allowed.length)
    throw new Error("invalid_content_payload");
  const seen = new Set<string>();
  for (const change of changes) {
    const key = JSON.stringify(change.path);
    const field = allowed.find((f) => JSON.stringify(f.path) === key);
    if (!field || seen.has(key)) throw new Error("invalid_content_payload");
    seen.add(key);
    let v = change.value;
    if (
      field.kind === "image" &&
      typeof v === "string" &&
      v.startsWith("media:")
    ) {
      v = media.get(v.slice(6));
      if (!v) throw new Error("media_not_available");
    }
    if (
      typeof v !== typeof field.value ||
      (typeof v === "string" && v.length > 10000) ||
      (typeof v === "number" && (!Number.isFinite(v) || v < 0 || v > 100))
    )
      throw new Error("invalid_content_payload");
    if (
      field.kind === "image" &&
      v !== "" &&
      v !== field.value &&
      !Array.from(media.values()).includes(String(v))
    )
      throw new Error("media_not_available");
    if (
      field.kind === "url" &&
      typeof v === "string" &&
      v &&
      !(
        (v.startsWith("/") && !v.startsWith("//") && !v.includes("\\")) ||
        v.startsWith("#") ||
        /^https:\/\/[^\s]+$/.test(v)
      )
    )
      throw new Error("invalid_content_url");
    let target = copy as Record<string | number, Json>;
    for (const part of change.path.slice(0, -1))
      target = target[part] as Record<string | number, Json>;
    target[change.path.at(-1)!] = v as Json;
  }
  return copy;
}

export function withHeroImage(content: Json): Json {
  if (!content || typeof content !== "object" || Array.isArray(content))
    return content;
  return {
    ...content,
    image:
      content.image && typeof content.image === "object"
        ? content.image
        : { src: "" },
  };
}
