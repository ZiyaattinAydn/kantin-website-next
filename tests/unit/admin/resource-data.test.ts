import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  includeSelectedAdminRow,
  loadAdminResourceRecord,
  loadAdminResourceRows,
} from "@/lib/admin/resource-data";
import { getAdminResource } from "@/lib/admin/resources";

describe("admin resource data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("önce sayıyı bulur, taşan sayfayı düzeltir ve doğru aralığı sorgular", async () => {
    const countBuilder = {
      or: vi.fn(),
      then: (resolve: (value: unknown) => unknown) => resolve({ count: 51, error: null }),
    };
    countBuilder.or.mockReturnValue(countBuilder);

    const rowsBuilder = {
      or: vi.fn(),
      order: vi.fn(),
      range: vi.fn().mockResolvedValue({
        data: [{ id: "TEST_event", title: "TEST_ Etkinlik" }],
        error: null,
      }),
    };
    rowsBuilder.or.mockReturnValue(rowsBuilder);
    rowsBuilder.order.mockReturnValue(rowsBuilder);

    const select = vi.fn((columns: string, options?: Record<string, unknown>) => {
      if (columns === "id" && options?.head === true) return countBuilder;
      return rowsBuilder;
    });

    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    const resource = getAdminResource("events");
    if (!resource) throw new Error("TEST_ resource bulunamadı");

    const result = await loadAdminResourceRows(resource, {
      page: 9,
      search: "TEST etkinlik",
    });

    expect(select).toHaveBeenNthCalledWith(1, "id", { count: "exact", head: true });
    expect(select).toHaveBeenNthCalledWith(
      2,
      "id,sort_order,title,content_type,start_at,status,is_active,is_featured,slug,summary,description,end_at,venue_name,location_text,external_url,cta_label,image_media_id,published_at,publish_start_at,publish_end_at,updated_at",
    );
    expect(countBuilder.or).toHaveBeenCalledWith(
      expect.stringContaining("title.ilike.%TEST etkinlik%"),
    );
    expect(rowsBuilder.or).toHaveBeenCalledWith(
      expect.stringContaining("title.ilike.%TEST etkinlik%"),
    );
    expect(rowsBuilder.range).toHaveBeenCalledWith(50, 74);
    expect(result.pagination).toMatchObject({ page: 3, pageCount: 3, total: 51 });
  });

  it("düzenleme sorgusunda açılır satır için liste ve form alanlarını birlikte seçer", async () => {
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
      "id,sort_order,title,content_type,start_at,status,is_active,is_featured,slug,summary,description,end_at,venue_name,location_text,external_url,cta_label,image_media_id,published_at,publish_start_at,publish_end_at,updated_at",
    );

    expect(eq).toHaveBeenCalledWith("id", "TEST_event");

    expect(result).toMatchObject({
      id: "TEST_event",
      title: "TEST_ Etkinlik",
    });
  });
  it("seçili kayıt mevcut sayfada değilse düzenleme için listenin başına ekler", () => {
    const rows = [
      { id: "row-1", title: "Birinci" },
      { id: "row-2", title: "İkinci" },
    ];
    const selected = { id: "row-9", title: "Seçili" };

    expect(includeSelectedAdminRow(rows, selected)).toEqual([selected, ...rows]);
    expect(includeSelectedAdminRow(rows, rows[0])).toEqual(rows);
    expect(includeSelectedAdminRow(rows, null)).toEqual(rows);
  });

});
