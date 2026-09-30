import { beforeEach, describe, it, expect, vi } from "vitest";
const m = vi.hoisted(() => ({ auth: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: m.auth }));
vi.mock("@/lib/supabase/server", () => ({ createClient: m.client }));
import { loadMenuData } from "@/lib/admin/menu-data";
import { loadContentRecords } from "@/lib/admin/content-data";
import { loadMediaChoices } from "@/lib/admin/media-choices";
import { loadMediaChoicePage } from "@/lib/admin/media-choice-actions";
function client() {
  const columns: Record<string, string[]> = {},
    ranges: Record<string, number[][]> = {};
  const from = vi.fn((table: string) => {
    const q = {
      select: vi.fn((projection: string) => {
        (columns[table] ??= []).push(projection);
        return q;
      }),
      eq: vi.fn(() => q),
      in: vi.fn(() => q),
      or: vi.fn(() => q),
      order: vi.fn(() => q),
      ilike: vi.fn(() => q),
      range: vi.fn((start: number, end: number) => {
        (ranges[table] ??= []).push([start, end]);
        return Promise.resolve({ data: [], error: null });
      }),
      then: (resolve: (value: unknown) => void) =>
        resolve({ data: [], error: null }),
    };
    return q;
  });
  return { from, columns, ranges };
}
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({});
});
describe("QA2 scoped admin loading", () => {
  it("uses six narrow menu projections without eager media loading", async () => {
    const c = client();
    m.client.mockResolvedValue(c);
    await loadMenuData();
    expect(c.from).toHaveBeenCalledTimes(6);
    expect(c.from).not.toHaveBeenCalledWith("media");
    expect(Object.values(c.columns).flat()).not.toContain("*");
  });
  it("does not load settings or media for the home content section", async () => {
    const c = client();
    m.client.mockResolvedValue(c);
    await loadContentRecords("home");
    expect(c.from).not.toHaveBeenCalledWith("site_settings");
    expect(c.from).not.toHaveBeenCalledWith("media");
    expect(Object.values(c.columns).flat()).not.toContain("*");
  });
  it("pages lazy media in bounded batches of 24", async () => {
    const c = client();
    m.client.mockResolvedValue(c);
    await loadMediaChoices(undefined, 2, "TEST_");
    expect(c.ranges.media).toEqual([[48, 71]]);
    expect(c.columns.media[0]).not.toBe("*");
  });
  it("shows a safe load error instead of pretending the picker is empty", async () => {
    m.client.mockRejectedValue(new Error("cookie=SECRET"));
    const r = await loadMediaChoicePage();
    expect(r).toMatchObject({
      ok: false,
      message: expect.stringContaining("yüklenemedi"),
    });
    expect(JSON.stringify(r)).not.toContain("SECRET");
  });
});
