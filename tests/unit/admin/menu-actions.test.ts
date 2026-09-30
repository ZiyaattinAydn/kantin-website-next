import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  log: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: m.auth }));
vi.mock("@/lib/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/admin/system-logs", () => ({ recordSystemEvent: m.log }));
vi.mock("next/cache", () => ({ revalidatePath: m.refresh }));
import {
  saveMenuProduct,
  setMenuVisibility,
  moveMenuProduct,
  saveMenuCategory,
  saveQuickMenuPrices,
} from "@/lib/admin/menu-actions";
const id = "11111111-1111-4111-8111-111111111111",
  branch = "22222222-2222-4222-8222-222222222222",
  category = "33333333-3333-4333-8333-333333333333";
const payload = () => ({
  name: "TEST_Product",
  category_id: category,
  description: "",
  status: "draft",
  is_active: true,
  branches: [{ id: branch, price: "85", is_active: true, variants: [] }],
});
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({ userId: id });
  m.log.mockResolvedValue(undefined);
});
describe("menu actions", () => {
  it("authorizes the new category and price operations before database access", async () => {
    m.auth.mockRejectedValue(new Error("forbidden"));
    await expect(saveMenuCategory({})).rejects.toThrow("forbidden");
    await expect(saveQuickMenuPrices({})).rejects.toThrow("forbidden");
    expect(m.client).not.toHaveBeenCalled();
  });
  it("saves category choices and branch snapshot through one RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: category, error: null });
    m.client.mockResolvedValue({ rpc });
    const branch_snapshot = [
      { id: branch, updated_at: "2026-09-30T00:00:00Z" },
    ];
    expect(
      await saveMenuCategory({
        id: category,
        name: "TEST_Kategori",
        branches: [branch],
        status: "draft",
        is_active: true,
        sort_order: 2,
        branch_snapshot,
      }),
    ).toMatchObject({ ok: true, id: category });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("save_admin_menu_category", {
      p_payload: expect.objectContaining({
        id: category,
        branches: [branch],
        branch_snapshot,
      }),
    });
  });
  it("sends only changed price records to the narrow price RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    m.client.mockResolvedValue({ rpc });
    expect(
      await saveQuickMenuPrices({
        id,
        branches: [
          { id: branch, updated_at: "2026-09-30T00:00:00Z", price: "215,50" },
        ],
        variants: [],
      }),
    ).toMatchObject({ ok: true });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("save_admin_menu_prices", {
      p_payload: {
        id,
        branches: [
          {
            id: branch,
            updated_at: "2026-09-30T00:00:00Z",
            price_cents: 21550,
          },
        ],
        variants: [],
      },
    });
  });
  it("does not expose database errors from either new operation", async () => {
    m.client.mockResolvedValue({
      rpc: vi
        .fn()
        .mockResolvedValue({
          error: { code: "40001", message: "token=SECRET" },
        }),
    });
    const categoryResult = await saveMenuCategory({
      name: "TEST_Kategori",
      branches: [branch],
      status: "draft",
      is_active: true,
      sort_order: 0,
    });
    const priceResult = await saveQuickMenuPrices({
      id,
      branches: [
        { id: branch, updated_at: "2026-09-30T00:00:00Z", price: "215" },
      ],
      variants: [],
    });
    expect(categoryResult.ok || priceResult.ok).toBe(false);
    expect(categoryResult.message + priceResult.message).not.toMatch(
      /SECRET|40001|token/,
    );
    expect(m.refresh).not.toHaveBeenCalled();
  });
  it("authorizes before parsing or writing", async () => {
    m.auth.mockRejectedValue(new Error("forbidden"));
    await expect(saveMenuProduct(payload())).rejects.toThrow("forbidden");
    expect(m.client).not.toHaveBeenCalled();
  });
  it("uses a single transactional RPC for product, placements and options", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: id, error: null });
    m.client.mockResolvedValue({ rpc });
    expect(await saveMenuProduct(payload())).toMatchObject({ ok: true, id });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls[0][1].p_payload.branches[0].price_cents).toBe(8500);
  });
  it("hides raw error contents and records safe event context", async () => {
    m.client.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({
        error: { code: "23505", message: "token=SECRET; private schema" },
      }),
    });
    const r = await saveMenuProduct(payload());
    expect(r.ok).toBe(false);
    expect(r.message).not.toMatch(/SECRET|23505|schema/);
    expect(m.log).toHaveBeenCalledWith(
      expect.objectContaining({ route: "/admin/menu", operation: "save" }),
    );
    expect(m.refresh).not.toHaveBeenCalled();
  });
  it("does not overwrite stale changes", async () => {
    m.client.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({ error: { code: "40001" } }),
    });
    expect(await saveMenuProduct(payload())).toMatchObject({
      ok: false,
      message: expect.stringContaining("yenileyip"),
    });
  });
  it("requires confirmation for hide/show", async () => {
    expect((await setMenuVisibility(id, branch, false, "now", "")).ok).toBe(
      false,
    );
    expect(m.client).not.toHaveBeenCalled();
  });
  it("reorders via guarded RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    m.client.mockResolvedValue({ rpc });
    expect(
      (await moveMenuProduct(id, branch, "up", "2026-09-29T00:00:00Z")).ok,
    ).toBe(true);
    expect(rpc).toHaveBeenCalledWith(
      "move_admin_menu_product",
      expect.objectContaining({ p_branch_id: branch, p_direction: "up" }),
    );
  });
});
