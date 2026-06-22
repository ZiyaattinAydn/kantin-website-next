import "server-only";

import type { Json } from "@/lib/supabase/database.types";
import type { createClient } from "@/lib/supabase/server";

type AdminSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type MediaUsageRecord = {
  mediaId: string;
  source: "menu_items" | "events" | "merch_products" | "instagram_posts" | "job_applications" | "content_blocks";
  sourceId: string;
  label: string;
  href: string;
  field: "image_media_id" | "cv_media_id" | "content";
};

export type MediaForUsage = {
  id: string;
  kind: string;
  bucket_name: string | null;
  object_path: string | null;
  external_url: string | null;
  local_path: string | null;
};

export type MediaUsageDatasets = {
  menuItems: Array<{ id: string; name: string; image_media_id: string | null }>;
  events: Array<{ id: string; title: string; image_media_id: string | null }>;
  merchProducts: Array<{ id: string; name: string; image_media_id: string | null }>;
  instagramPosts: Array<{ id: string; image_media_id: string | null }>;
  jobApplications: Array<{ id: string; cv_media_id: string | null }>;
  contentBlocks: Array<{ id: string; key: string; content: Json }>;
};

function stringReferencesMedia(value: string, media: MediaForUsage): boolean {
  if (value === media.id) return true;
  if (media.local_path && value === media.local_path) return true;
  if (media.external_url && value === media.external_url) return true;
  if (!media.object_path) return false;

  return value === media.object_path || value.endsWith(`/${media.object_path}`);
}

export function contentReferencesMedia(value: Json | undefined, media: MediaForUsage): boolean {
  if (typeof value === "string") return stringReferencesMedia(value, media);
  if (Array.isArray(value)) {
    return value.some((item) => contentReferencesMedia(item, media));
  }
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => contentReferencesMedia(item, media));
  }
  return false;
}

export function buildMediaUsageMap(
  mediaRows: MediaForUsage[],
  datasets: MediaUsageDatasets,
): Map<string, MediaUsageRecord[]> {
  const result = new Map(mediaRows.map((media) => [media.id, [] as MediaUsageRecord[]]));

  function add(mediaId: string | null, usage: Omit<MediaUsageRecord, "mediaId">) {
    if (!mediaId || !result.has(mediaId)) return;
    result.get(mediaId)?.push({ mediaId, ...usage });
  }

  for (const row of datasets.menuItems) {
    add(row.image_media_id, {
      source: "menu_items",
      sourceId: row.id,
      label: `Menü ürünü: ${row.name}`,
      href: `/admin/manage/menu-items?edit=${row.id}`,
      field: "image_media_id",
    });
  }
  for (const row of datasets.events) {
    add(row.image_media_id, {
      source: "events",
      sourceId: row.id,
      label: `Etkinlik: ${row.title}`,
      href: `/admin/manage/events?edit=${row.id}`,
      field: "image_media_id",
    });
  }
  for (const row of datasets.merchProducts) {
    add(row.image_media_id, {
      source: "merch_products",
      sourceId: row.id,
      label: `Merch: ${row.name}`,
      href: `/admin/manage/merch-products?edit=${row.id}`,
      field: "image_media_id",
    });
  }
  for (const row of datasets.instagramPosts) {
    add(row.image_media_id, {
      source: "instagram_posts",
      sourceId: row.id,
      label: "Instagram gönderisi",
      href: `/admin/manage/instagram-posts?edit=${row.id}`,
      field: "image_media_id",
    });
  }
  for (const row of datasets.jobApplications) {
    add(row.cv_media_id, {
      source: "job_applications",
      sourceId: row.id,
      label: "Kariyer başvurusu CV dosyası",
      href: `/admin/applications?edit=${row.id}`,
      field: "cv_media_id",
    });
  }
  for (const block of datasets.contentBlocks) {
    for (const media of mediaRows) {
      if (!contentReferencesMedia(block.content, media)) continue;
      add(media.id, {
        source: "content_blocks",
        sourceId: block.id,
        label: `İçerik bloğu: ${block.key}`,
        href: `/admin/manage/content-blocks?edit=${block.id}`,
        field: "content",
      });
    }
  }

  return result;
}

export async function loadMediaUsageMap(
  supabase: AdminSupabaseClient,
  mediaRows: MediaForUsage[],
): Promise<Map<string, MediaUsageRecord[]>> {
  if (!mediaRows.length) return new Map();
  const includesCareerMedia = mediaRows.some(
    (media) => media.kind === "document" || media.bucket_name === "career-cvs",
  );
  const mediaIds = mediaRows.map((media) => media.id);

  const [menuItems, events, merchProducts, instagramPosts, jobApplications, contentBlocks] = await Promise.all([
    supabase.from("menu_items").select("id, name, image_media_id").in("image_media_id", mediaIds),
    supabase.from("events").select("id, title, image_media_id").in("image_media_id", mediaIds),
    supabase.from("merch_products").select("id, name, image_media_id").in("image_media_id", mediaIds),
    supabase.from("instagram_posts").select("id, image_media_id").in("image_media_id", mediaIds),
    includesCareerMedia
      ? supabase.from("job_applications").select("id, cv_media_id").in("cv_media_id", mediaIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("content_blocks").select("id, key, content"),
  ]);

  for (const query of [menuItems, events, merchProducts, instagramPosts, jobApplications, contentBlocks]) {
    if (query.error) throw new Error(query.error.message);
  }

  return buildMediaUsageMap(mediaRows, {
    menuItems: menuItems.data ?? [],
    events: events.data ?? [],
    merchProducts: merchProducts.data ?? [],
    instagramPosts: instagramPosts.data ?? [],
    jobApplications: jobApplications.data ?? [],
    contentBlocks: contentBlocks.data ?? [],
  });
}
