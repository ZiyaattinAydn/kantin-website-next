import { beforeEach, describe, it, expect, vi } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  media: vi.fn(),
  log: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: m.auth }));
vi.mock("@/lib/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/admin/media-choices", () => ({ loadMediaChoices: m.media }));
vi.mock("@/lib/admin/system-logs", () => ({ recordSystemEvent: m.log }));
vi.mock("next/cache", () => ({ revalidatePath: m.refresh }));
import { saveContentRecord } from "@/lib/admin/content-actions";
const id = "11111111-1111-4111-8111-111111111111";
const setting = {
  id,
  key: "site.identity",
  value: { name: "kantin.", slogan: "Existing", seedSource: "keep" },
  description: "",
  is_public: true,
  status: "published",
  is_active: true,
  updated_at: "v1",
};
function client(row = setting) {
  const single = vi.fn().mockResolvedValue({ data: row, error: null });
  const write = vi
    .fn()
    .mockResolvedValue({
      data: {
        ...row,
        updated_at: "v2",
        value: { ...row.value, slogan: "New" },
      },
      error: null,
    });
  const chain = { select: vi.fn(), eq: vi.fn(), single };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  const updateChain = { eq: vi.fn(), select: vi.fn(), single: write };
  updateChain.eq.mockReturnValue(updateChain);
  updateChain.select.mockReturnValue(updateChain);
  const update = vi.fn().mockReturnValue(updateChain);
  return {
    from: vi.fn().mockReturnValue({ ...chain, update }),
    update,
    updateChain,
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({ userId: id });
  m.media.mockResolvedValue([]);
  m.log.mockResolvedValue(undefined);
});
describe("content save security and preservation", () => {
  it("preserves hidden structure and compares the record version on write", async () => {
    const c = client();
    m.client.mockResolvedValue(c);
    const result = await saveContentRecord({
      id,
      table: "site_settings",
      updated_at: "v1",
      changes: [{ path: ["slogan"], value: "New" }],
    });
    expect(result.ok).toBe(true);
    expect(result).toMatchObject({
      snapshot: {
        updated_at: "v2",
        fields: expect.arrayContaining([
          expect.objectContaining({ path: ["slogan"], value: "New" }),
        ]),
      },
    });
    expect(m.media).not.toHaveBeenCalled();
    expect(c.update).toHaveBeenCalledWith({
      value: { name: "kantin.", slogan: "New", seedSource: "keep" },
      status: "published",
      is_active: true,
    });
    expect(c.updateChain.eq).toHaveBeenCalledWith("updated_at", "v1");
  });
  it("blocks stale edits, private settings and protected keys", async () => {
    const c = client();
    m.client.mockResolvedValue(c);
    expect(
      (
        await saveContentRecord({
          id,
          table: "site_settings",
          updated_at: "old",
          changes: [],
        })
      ).ok,
    ).toBe(false);
    expect(c.update).not.toHaveBeenCalled();
    expect(
      (
        await saveContentRecord({
          id,
          table: "site_settings",
          updated_at: "v1",
          changes: [{ path: ["seedSource"], value: "hacked" }],
        })
      ).ok,
    ).toBe(false);
    expect(c.update).not.toHaveBeenCalled();
    m.client.mockResolvedValue(client({ ...setting, is_public: false }));
    expect(
      (
        await saveContentRecord({
          id,
          table: "site_settings",
          updated_at: "v1",
          changes: [],
        })
      ).ok,
    ).toBe(false);
  });
  it("requires confirmation to change publishing", async () => {
    const c = client();
    m.client.mockResolvedValue(c);
    expect(
      (
        await saveContentRecord({
          id,
          table: "site_settings",
          updated_at: "v1",
          changes: [],
          status: "draft",
        })
      ).ok,
    ).toBe(false);
    expect(c.update).not.toHaveBeenCalled();
  });
  it("normalizes a selected image to its public URL and returns the saved database version", async () => {
    const hero = {
      id,
      key: "hero",
      page_id: id,
      block_type: "hero",
      content: { description: "TEST_old", image: { src: "/old.jpg" } },
      status: "published",
      is_active: true,
      updated_at: "v1",
    };
    const updated = {
      ...hero,
      updated_at: "v2",
      content: {
        description: "TEST_old",
        image: { src: "https://example.test/new.jpg" },
      },
    };
    const make = (row: unknown) => {
      const q = {
        select: vi.fn(),
        eq: vi.fn(),
        single: vi.fn().mockResolvedValue({ data: row, error: null }),
      };
      q.select.mockReturnValue(q);
      q.eq.mockReturnValue(q);
      return q;
    };
    const read = make(hero),
      write = make(updated),
      page = make({ slug: "home" });
    const update = vi.fn().mockReturnValue(write);
    m.client.mockResolvedValue({
      from: vi.fn((table: string) =>
        table === "site_pages" ? page : { ...read, update },
      ),
    });
    m.media.mockResolvedValue([{ id, url: "https://example.test/new.jpg" }]);
    const result = await saveContentRecord({
      id,
      table: "content_blocks",
      updated_at: "v1",
      changes: [{ path: ["image", "src"], value: `media:${id}` }],
    });
    expect(result).toMatchObject({
      ok: true,
      snapshot: {
        updated_at: "v2",
        fields: expect.arrayContaining([
          expect.objectContaining({
            path: ["image", "src"],
            value: "https://example.test/new.jpg",
          }),
        ]),
      },
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: {
          description: "TEST_old",
          image: { src: "https://example.test/new.jpg" },
        },
      }),
    );
    expect(m.media).toHaveBeenCalledWith([id]);
  });
  it("authorizes before reading", async () => {
    m.auth.mockRejectedValue(new Error("forbidden"));
    await expect(
      saveContentRecord({
        id,
        table: "site_settings",
        updated_at: "v1",
        changes: [],
      }),
    ).rejects.toThrow("forbidden");
    expect(m.client).not.toHaveBeenCalled();
  });
});
