import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";

export type PublicSupabaseClient = SupabaseClient<Database>;
export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asRecord(value: Json | unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
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
  media: TableRow<"media"> | null | undefined,
): string | null {
  if (!media) return null;
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
