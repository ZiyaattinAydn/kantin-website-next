import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { loadAdminResourceRows } from "@/lib/admin/resource-data";
import { getAdminResource } from "@/lib/admin/resources";

describe("loadAdminResourceRows", () => {
  beforeEach(() => vi.clearAllMocks());

  it("arama, count ve sayfa aralığını veritabanı sorgusuna uygular", async () => {
    const builder = {
      or: vi.fn(),
      order: vi.fn(),
      range: vi.fn().mockResolvedValue({
        data: [{ id: "TEST_event", title: "TEST_ Etkinlik" }],
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
    if (!resource) throw new Error("TEST_ resource bulunamadı");

    const result = await loadAdminResourceRows(resource, {
      page: 2,
      search: "TEST etkinlik",
    });

    expect(select).toHaveBeenCalledWith("*", { count: "exact" });
    expect(builder.or).toHaveBeenCalledWith(expect.stringContaining("title.ilike.%TEST etkinlik%"));
    expect(builder.range).toHaveBeenCalledWith(25, 49);
    expect(result.pagination).toMatchObject({ page: 2, pageCount: 3, total: 51 });
  });
});
