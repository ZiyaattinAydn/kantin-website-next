import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createPublicClient: vi.fn() }));
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: mocks.createPublicClient,
}));

import { getEventPublicData } from "@/lib/public-data/events";

describe("getEventPublicData sorgu kapsamı", () => {
  beforeEach(() => vi.clearAllMocks());

  it("yalnız etkinliklerin bağlı medya UUID'lerini sorgular", async () => {
    const mediaResult = {
      data: [{
        id: "TEST_media",
        source: "local",
        kind: "image",
        bucket_name: null,
        object_path: null,
        external_url: null,
        local_path: "/assets/TEST_event.webp",
        title: "TEST_ Event",
        alt_text: "TEST_ Event",
        mime_type: "image/webp",
        size_bytes: 100,
        width: 800,
        height: 600,
        metadata: {},
        status: "published",
        is_active: true,
        sort_order: 1,
        created_at: "2026-06-23T00:00:00.000Z",
        updated_at: "2026-06-23T00:00:00.000Z",
      }],
      error: null,
    };
    const mediaActiveEq = vi.fn().mockResolvedValue(mediaResult);
    const mediaStatusEq = vi.fn(() => ({ eq: mediaActiveEq }));
    const mediaIn = vi.fn(() => ({ eq: mediaStatusEq }));
    const results = {
      events: {
        data: [{
          id: "TEST_event",
          content_type: "event",
          title: "TEST_ Etkinlik",
          description: "TEST_ Etkinlik açıklaması",
          start_at: "2099-06-23T18:00:00.000Z",
          end_at: null,
          venue_name: "TEST_ Mekan",
          location_text: null,
          external_url: null,
          cta_label: null,
          image_media_id: "TEST_media",
          publish_start_at: null,
          publish_end_at: null,
          sort_order: 0,
        }],
        error: null,
      },
      event_branches: {
        data: [{ event_id: "TEST_event", branch_id: "TEST_branch", sort_order: 1 }],
        error: null,
      },
      branches: {
        data: [{
          id: "TEST_branch",
          slug: "bostanli",
          name: "TEST_ Alsancak",
          address_line: "TEST_ Adres",
          district: "Konak",
          city: "İzmir",
        }],
        error: null,
      },
    };
    const from = vi.fn((table: keyof typeof results | "media") => {
      if (table === "media") return { select: () => ({ in: mediaIn }) };
      return {
        select: () => ({
          order: async () => results[table],
        }),
      };
    });
    mocks.createPublicClient.mockReturnValue({ from });

    const result = await getEventPublicData();

    expect(mediaIn).toHaveBeenCalledWith("id", ["TEST_media"]);
    expect(mediaStatusEq).toHaveBeenCalledWith("status", "published");
    expect(mediaActiveEq).toHaveBeenCalledWith("is_active", true);
    expect(result.source).toBe("supabase");
    expect(result.data.events[0]?.imageUrl).toBe("/assets/TEST_event.webp");
    expect(result.data.events[0]?.branch).toBe("bostanli");
    expect(result.data.branchLabels.bostanli).toBe("TEST_ Alsancak");
  });
});
