import "server-only";

import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";

type MetadataFallback = {
  title: string;
  description?: string;
  canonical: string;
};

export function pageMetadataFromRow(
  row: {
    title: string;
    seo_title: string | null;
    seo_description: string | null;
  } | null,
  fallback: MetadataFallback,
): Metadata {
  return {
    title: row?.seo_title?.trim() || row?.title?.trim() || fallback.title,
    description: row?.seo_description?.trim() || fallback.description,
    alternates: { canonical: fallback.canonical },
  };
}

export async function getPagePublicMetadata(
  pageSlug: string,
  fallback: MetadataFallback,
): Promise<Metadata> {
  try {
    const client = createPublicClient();
    const { data, error } = await client
      .from("site_pages")
      .select("title, seo_title, seo_description")
      .eq("slug", pageSlug)
      .maybeSingle();

    if (error) throw error;
    return pageMetadataFromRow(data, fallback);
  } catch {
    return pageMetadataFromRow(null, fallback);
  }
}
