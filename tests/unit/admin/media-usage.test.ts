import { describe, expect, it } from "vitest";
import {
  buildMediaUsageMap,
  contentReferencesMedia,
  type MediaForUsage,
  type MediaUsageDatasets,
} from "@/lib/admin/media-usage";

const localMedia: MediaForUsage = {
  id: "TEST_local_media",
  kind: "image",
  bucket_name: null,
  object_path: null,
  external_url: null,
  local_path: "/assets/img/TEST_local.webp",
};

const storageMedia: MediaForUsage = {
  id: "TEST_storage_media",
  kind: "image",
  bucket_name: "menu-images",
  object_path: "admin/2026/TEST_storage.webp",
  external_url: null,
  local_path: null,
};

function datasets(overrides: Partial<MediaUsageDatasets> = {}): MediaUsageDatasets {
  return {
    menuItems: [],
    events: [],
    merchProducts: [],
    instagramPosts: [],
    jobApplications: [],
    contentBlocks: [],
    ...overrides,
  };
}

describe("medya kullanım haritası", () => {
  it("FK ve JSON içerik yolu bağlantılarını birlikte bulur", () => {
    const result = buildMediaUsageMap(
      [localMedia, storageMedia],
      datasets({
        menuItems: [{
          id: "TEST_menu_item",
          name: "TEST_ Ürün",
          image_media_id: storageMedia.id,
        }],
        contentBlocks: [{
          id: "TEST_block",
          key: "TEST_gallery",
          content: {
            nested: [{ src: localMedia.local_path }],
            storageUrl: `http://127.0.0.1:54321/storage/v1/object/public/menu-images/${storageMedia.object_path}`,
          },
        }],
      }),
    );

    expect(result.get(storageMedia.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: "menu_items", sourceId: "TEST_menu_item" }),
      expect.objectContaining({ source: "content_blocks", sourceId: "TEST_block" }),
    ]));
    expect(result.get(localMedia.id)).toEqual([
      expect.objectContaining({ source: "content_blocks", field: "content" }),
    ]);
  });

  it("benzer ama farklı yolları kullanım saymaz", () => {
    expect(contentReferencesMedia(
      { src: "/assets/img/TEST_local-old.webp" },
      localMedia,
    )).toBe(false);
  });
});
