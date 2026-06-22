import { describe, expect, it } from "vitest";
import type { PublicSupabaseClient, TableRow } from "@/lib/public-data/helpers";
import { mapMenuItemImages } from "@/lib/public-data/menu";

const media: TableRow<"media"> = {
  id: "TEST_media",
  source: "local",
  kind: "image",
  bucket_name: null,
  object_path: null,
  external_url: null,
  local_path: "/assets/TEST_menu.webp",
  title: "TEST_ Menü görseli",
  alt_text: "TEST_ Ürün sunumu",
  mime_type: "image/webp",
  size_bytes: 100,
  width: 800,
  height: 600,
  metadata: {},
  status: "published",
  is_active: true,
  sort_order: 1,
  created_at: "2026-06-22T00:00:00.000Z",
  updated_at: "2026-06-22T00:00:00.000Z",
};

describe("menü ürünü medya eşleşmesi", () => {
  it("admin'de seçilen medyayı public menü görseline dönüştürür", () => {
    const result = mapMenuItemImages(
      {} as PublicSupabaseClient,
      [{
        item: {
          id: "TEST_item",
          slug: "test-item",
          name: "TEST_ Ürün",
          image_media_id: media.id,
        },
        branch: "alsancak",
      }],
      [media],
    );

    expect(result).toEqual([{
      itemId: "TEST_item",
      slug: "test-item",
      name: "TEST_ Ürün",
      branch: "alsancak",
      imageUrl: "/assets/TEST_menu.webp",
      imageAlt: "TEST_ Ürün sunumu",
      width: 800,
      height: 600,
    }]);
  });

  it("RLS nedeniyle okunamayan veya bağlantısız medyayı public listeye eklemez", () => {
    expect(mapMenuItemImages(
      {} as PublicSupabaseClient,
      [{
        item: {
          id: "TEST_item",
          slug: "test-item",
          name: "TEST_ Ürün",
          image_media_id: "TEST_missing",
        },
        branch: "atakent",
      }],
      [],
    )).toEqual([]);
  });
});
