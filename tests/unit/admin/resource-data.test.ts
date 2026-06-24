import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  loadAdminResourceRecord,
  loadAdminResourceRows,
} from "@/lib/admin/resource-data";
import { getAdminResource } from "@/lib/admin/resources";

describe("admin resource data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("liste sorgusunda yalnız gerekli kolonları, aramayı ve sayfa aralığını kullanır", async () => {
    const builder = {
      or: vi.fn(),
      order: vi.fn(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: "TEST_event",
            title: "TEST_ Etkinlik",
          },
        ],
        error: null,
        count: 51,
      }),
    };

    builder.or.mockReturnValue(builder);
    builder.order.mockReturnValue(builder);

    const select = vi.fn(() => builder);

    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    const resource = getAdminResource("events");

    if (!resource) {
      throw new Error("TEST_ resource bulunamadı");
    }

    const result = await loadAdminResourceRows(resource, {
      page: 2,
      search: "TEST etkinlik",
    });

    expect(select).toHaveBeenCalledWith(
      "id,sort_order,title,content_type,start_at,status,is_active,is_featured,slug,summary,description,end_at,venue_name,location_text,external_url,cta_label,image_media_id,published_at,publish_start_at,publish_end_at,updated_at",
      { count: "exact" },
    );

    expect(builder.or).toHaveBeenCalledWith(
      expect.stringContaining("title.ilike.%TEST etkinlik%"),
    );

    expect(builder.range).toHaveBeenCalledWith(25, 49);

    expect(result.pagination).toMatchObject({
      page: 2,
      pageCount: 3,
      total: 51,
    });
  });

  it("düzenleme sorgusunda yıldız yerine yalnız form alanlarını seçer", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "TEST_event",
        title: "TEST_ Etkinlik",
      },
      error: null,
    });

    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));

    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    const resource = getAdminResource("events");

    if (!resource) {
      throw new Error("TEST_ resource bulunamadı");
    }

    const result = await loadAdminResourceRecord(
      resource,
      "TEST_event",
    );

    expect(select).toHaveBeenCalledWith(
      [
        "id",
        "content_type",
        "title",
        "slug",
        "summary",
        "description",
        "start_at",
        "end_at",
        "venue_name",
        "location_text",
        "external_url",
        "cta_label",
        "image_media_id",
        "status",
        "is_active",
        "is_featured",
        "published_at",
        "publish_start_at",
        "publish_end_at",
      ].join(","),
    );

    expect(eq).toHaveBeenCalledWith("id", "TEST_event");

    expect(result).toMatchObject({
      id: "TEST_event",
      title: "TEST_ Etkinlik",
    });
  });
});
