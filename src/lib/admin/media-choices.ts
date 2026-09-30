import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
export type MediaChoice = {
  id: string;
  label: string;
  url: string;
  width: number | null;
  height: number | null;
};
export async function loadMediaChoices(
  ids?: string[],
  page?: number,
  search = "",
): Promise<MediaChoice[]> {
  await requireAdmin();
  const client = await createClient();
  let query = client
    .from("media")
    .select(
      "id,title,alt_text,source,local_path,external_url,bucket_name,object_path,width,height,kind,status,is_active",
    )
    .eq("kind", "image")
    .eq("status", "published")
    .eq("is_active", true)
    .or("bucket_name.is.null,bucket_name.neq.career-cvs")
    .order("id");
  if (ids) query = query.in("id", ids);
  if (search)
    query = query.ilike(
      "title",
      `%${search.replace(/[%_,()]/g, "").slice(0, 100)}%`,
    );
  const rows: Pick<
    Database["public"]["Tables"]["media"]["Row"],
    | "id"
    | "title"
    | "alt_text"
    | "source"
    | "local_path"
    | "external_url"
    | "bucket_name"
    | "object_path"
    | "width"
    | "height"
    | "kind"
    | "status"
    | "is_active"
  >[] = [];
  for (let start = page === undefined ? 0 : page * 24; ; start += 500) {
    const { data, error } = await query.range(
      start,
      start + (page === undefined ? 499 : 23),
    );
    if (error) throw error;
    rows.push(...(data ?? []));
    if (page !== undefined || (data?.length ?? 0) < 500) break;
  }
  return rows
    .filter(
      (m) =>
        m.kind === "image" &&
        m.status === "published" &&
        m.is_active &&
        m.bucket_name !== "career-cvs",
    )
    .flatMap((m) => {
      const url =
        m.source === "local"
          ? m.local_path
          : m.source === "external"
            ? m.external_url
            : m.bucket_name && m.object_path
              ? client.storage.from(m.bucket_name).getPublicUrl(m.object_path)
                  .data.publicUrl
              : null;
      return url &&
        ((url.startsWith("/") && !url.startsWith("//")) ||
          url.startsWith("https://"))
        ? [
            {
              id: m.id,
              label: m.title || m.alt_text || "Görsel",
              url,
              width: m.width,
              height: m.height,
            },
          ]
        : [];
    });
}
