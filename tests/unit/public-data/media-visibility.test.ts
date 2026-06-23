import { describe, expect, it, vi } from "vitest";
import {
  getPublicMediaReferenceSet,
  getPublicMediaRows,
  isAllowedPublicMediaReference,
  isPublicMedia,
  resolveMediaUrl,
  type PublicMediaRow,
  type PublicSupabaseClient,
} from "@/lib/public-data/helpers";

const publishedMedia: PublicMediaRow = {
  id: "TEST_media",
  source: "local",
  bucket_name: null,
  object_path: null,
  external_url: null,
  local_path: "/assets/TEST_media.webp",
  alt_text: "TEST medya",
  width: 800,
  height: 600,
  status: "published",
  is_active: true,
};

describe("public medya görünürlüğü", () => {
  it("yalnız published ve aktif medyayı public kabul eder", () => {
    expect(isPublicMedia(publishedMedia)).toBe(true);
    expect(isPublicMedia({ ...publishedMedia, status: "archived" })).toBe(false);
    expect(isPublicMedia({ ...publishedMedia, is_active: false })).toBe(false);
  });

  it("arşivli veya pasif medya URL'sini public adapter'a vermez", () => {
    const client = {} as PublicSupabaseClient;

    expect(resolveMediaUrl(client, publishedMedia)).toBe("/assets/TEST_media.webp");
    expect(resolveMediaUrl(client, { ...publishedMedia, status: "archived" })).toBeNull();
    expect(resolveMediaUrl(client, { ...publishedMedia, is_active: false })).toBeNull();
  });

  it("medya sorgusuna status ve is_active filtrelerini açıkça uygular", async () => {
    const finalResult = Promise.resolve({ data: [publishedMedia], error: null });
    const secondEq = vi.fn(() => finalResult);
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const inIds = vi.fn(() => ({ eq: firstEq }));
    const select = vi.fn(() => ({ in: inIds }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as PublicSupabaseClient;

    const result = await getPublicMediaRows(client, [publishedMedia.id]);

    expect(from).toHaveBeenCalledWith("media");
    expect(inIds).toHaveBeenCalledWith("id", [publishedMedia.id]);
    expect(firstEq).toHaveBeenCalledWith("status", "published");
    expect(secondEq).toHaveBeenCalledWith("is_active", true);
    expect(result).toEqual([publishedMedia]);
  });

  it("savunma katmanında arşivli satırı sonuçtan da çıkarır", async () => {
    const archived = { ...publishedMedia, status: "archived" as const };
    const secondEq = vi.fn(() => Promise.resolve({ data: [archived], error: null }));
    const client = {
      from: () => ({
        select: () => ({
          in: () => ({
            eq: () => ({ eq: secondEq }),
          }),
        }),
      }),
    } as unknown as PublicSupabaseClient;

    await expect(getPublicMediaRows(client, [archived.id])).resolves.toEqual([]);
  });

  it("content block görsellerini yalnız aktif medya referanslarıyla sınırlar", async () => {
    const storageMedia: PublicMediaRow = {
      ...publishedMedia,
      id: "TEST_storage_media",
      source: "storage",
      bucket_name: "gallery-images",
      object_path: "admin/2026/TEST_storage.webp",
      local_path: null,
    };
    const thirdEq = vi.fn(() => Promise.resolve({ data: [storageMedia], error: null }));
    const secondEq = vi.fn(() => ({ eq: thirdEq }));
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const select = vi.fn(() => ({ eq: firstEq }));
    const getPublicUrl = vi.fn(() => ({
      data: {
        publicUrl: "https://example.supabase.co/storage/v1/object/public/gallery-images/admin/2026/TEST_storage.webp",
      },
    }));
    const client = {
      from: () => ({ select }),
      storage: { from: () => ({ getPublicUrl }) },
    } as unknown as PublicSupabaseClient;

    const references = await getPublicMediaReferenceSet(client);

    expect(firstEq).toHaveBeenCalledWith("kind", "image");
    expect(secondEq).toHaveBeenCalledWith("status", "published");
    expect(thirdEq).toHaveBeenCalledWith("is_active", true);
    expect(
      isAllowedPublicMediaReference(
        "https://example.supabase.co/storage/v1/object/public/gallery-images/admin/2026/TEST_storage.webp",
        references,
      ),
    ).toBe(true);
    expect(
      isAllowedPublicMediaReference(
        "https://example.supabase.co/storage/v1/object/public/gallery-images/admin/2026/TEST_archived.webp",
        references,
      ),
    ).toBe(false);
    expect(isAllowedPublicMediaReference("/assets/img/TEST.webp", references)).toBe(true);
  });

});
