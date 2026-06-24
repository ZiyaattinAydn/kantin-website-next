import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";

export type PublicSupabaseClient = SupabaseClient<Database>;
export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type PublicMediaRow = Pick<
  TableRow<"media">,
  | "id"
  | "source"
  | "bucket_name"
  | "object_path"
  | "external_url"
  | "local_path"
  | "alt_text"
  | "width"
  | "height"
  | "status"
  | "is_active"
>;


export const PUBLIC_MEDIA_SELECT =
  "id, source, bucket_name, object_path, external_url, local_path, alt_text, width, height, status, is_active" as const;

export function isPublicMedia(
  media: PublicMediaRow | null | undefined,
): media is PublicMediaRow {
  return Boolean(media && media.status === "published" && media.is_active);
}

export async function getPublicMediaRows(
  client: PublicSupabaseClient,
  mediaIds: string[],
): Promise<PublicMediaRow[]> {
  if (!mediaIds.length) return [];

  const { data, error } = await client
    .from("media")
    .select(PUBLIC_MEDIA_SELECT)
    .in("id", mediaIds)
    .eq("status", "published")
    .eq("is_active", true);

  if (error) throw error;
  return ((data ?? []) as PublicMediaRow[]).filter(isPublicMedia);
}

export type PublicMediaWithMetadataRow = PublicMediaRow & Pick<
  TableRow<"media">,
  "metadata"
>;

export const PUBLIC_MEDIA_WITH_METADATA_SELECT =
  `${PUBLIC_MEDIA_SELECT}, metadata` as const;

export async function getPublicMediaRowsByMetadata(
  client: PublicSupabaseClient,
  metadata: Record<string, unknown>,
): Promise<PublicMediaWithMetadataRow[]> {
  const { data, error } = await client
    .from("media")
    .select(PUBLIC_MEDIA_WITH_METADATA_SELECT)
    .eq("kind", "image")
    .eq("status", "published")
    .eq("is_active", true)
    .contains("metadata", metadata);

  if (error) throw error;
  return ((data ?? []) as PublicMediaWithMetadataRow[]).filter(isPublicMedia);
}

export async function getPublicMediaReferenceSet(
  client: PublicSupabaseClient,
): Promise<ReadonlySet<string>> {
  const { data, error } = await client
    .from("media")
    .select(PUBLIC_MEDIA_SELECT)
    .eq("kind", "image")
    .eq("status", "published")
    .eq("is_active", true);

  if (error) throw error;

  const references = new Set<string>();
  for (const media of ((data ?? []) as PublicMediaRow[]).filter(isPublicMedia)) {
    for (const value of [
      media.id,
      media.local_path,
      media.external_url,
      media.object_path,
    ]) {
      if (typeof value === "string" && value.trim()) references.add(value.trim());
    }

    if (media.source === "storage" && media.bucket_name && media.object_path) {
      const publicUrl = client.storage
        .from(media.bucket_name)
        .getPublicUrl(media.object_path).data.publicUrl;
      references.add(publicUrl);

      try {
        references.add(new URL(publicUrl).pathname);
      } catch {
        // Supabase public URL üretimi normalde mutlak URL döndürür.
      }
    }
  }

  return references;
}

function withoutSearchOrHash(value: string): string {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const end = [queryIndex, hashIndex]
    .filter((index) => index >= 0)
    .reduce((minimum, index) => Math.min(minimum, index), value.length);
  return value.slice(0, end);
}

export function isAllowedPublicMediaReference(
  reference: string | null | undefined,
  activeReferences: ReadonlySet<string>,
): boolean {
  const value = reference?.trim();
  if (!value) return false;

  // Paketle birlikte gelen public dosyalar medya yaşam döngüsüne bağlı değildir.
  if (value.startsWith("/") && !value.startsWith("/storage/v1/object/public/")) {
    return true;
  }

  return activeReferences.has(value) || activeReferences.has(withoutSearchOrHash(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asRecord(value: Json | unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}


export function stringArray(value: unknown, fallback: string[] = []): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : fallback;
}

export function arrayOfRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

export function formatTryFromCents(priceCents: number | null | undefined): string {
  if (typeof priceCents !== "number") return "—";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function formatDisplayDate(date: string, explicit?: unknown): string {
  const display = stringValue(explicit);
  if (display) return display;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Istanbul",
  }).format(parsed);
}

export function resolveMediaUrl(
  client: PublicSupabaseClient,
  media: PublicMediaRow | null | undefined,
): string | null {
  if (!isPublicMedia(media)) return null;
  if (media.source === "local") return media.local_path;
  if (media.source === "external") return media.external_url;

  if (media.source === "storage" && media.bucket_name && media.object_path) {
    return client.storage.from(media.bucket_name).getPublicUrl(media.object_path).data.publicUrl;
  }

  return null;
}

export function normaliseIssue(error: unknown, context: string): string {
  if (error instanceof Error && error.message.trim()) {
    return `${context}: ${error.message}`;
  }

  if (isRecord(error) && typeof error.message === "string") {
    return `${context}: ${error.message}`;
  }

  return `${context}: bilinmeyen veri hatası`;
}

export async function getPageBlocks(
  client: PublicSupabaseClient,
  pageSlug: string,
): Promise<Map<string, Record<string, unknown>>> {
  const { data: page, error: pageError } = await client
    .from("site_pages")
    .select("id")
    .eq("slug", pageSlug)
    .maybeSingle();

  if (pageError) throw pageError;
  if (!page) return new Map();

  const { data: blocks, error: blocksError } = await client
    .from("content_blocks")
    .select("key, content")
    .eq("page_id", page.id)
    .order("sort_order");

  if (blocksError) throw blocksError;

  return new Map(
    (blocks ?? []).map((block) => [block.key, asRecord(block.content)]),
  );
}
