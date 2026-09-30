import { describe, it, expect } from "vitest";
import { managementDestination } from "@/lib/admin/management-routing";
import { preserveAdminListPath } from "@/lib/admin/result-path";
import {
  parseCategoryInput,
  parseQuickPrices,
} from "@/lib/admin/menu-management";
import { safeSystemLogView, systemLogSearch } from "@/lib/admin/log-safety";
import { runAdminAction } from "@/lib/admin/client-action";
const id = "11111111-1111-4111-8111-111111111111",
  branch = "22222222-2222-4222-8222-222222222222";
describe("unified management boundaries", () => {
  it("keeps transport failures readable without leaking technical details", async () => {
    expect(
      await runAdminAction(async () => {
        throw new Error("API_KEY=secret\nstack trace");
      }, "Bağlantı sorunu oluştu. Tekrar deneyin."),
    ).toEqual({
      ok: false,
      message: "Bağlantı sorunu oluştu. Tekrar deneyin.",
    });
  });
  it("keeps log filters after a resolution update", () =>
    expect(
      preserveAdminListPath(
        "/admin/logs?notice=OK",
        "/admin/logs?from=2026-09-01&level=error&resolved=false&code=42501",
      ),
    ).toBe(
      "/admin/logs?notice=OK&from=2026-09-01&level=error&code=42501&resolved=false",
    ));
  it("routes legacy child records to their owning product", () =>
    expect(
      managementDestination("menu-item-variants", { edit: branch }, id),
    ).toBe(`/admin/menu?edit=${id}`));
  it("opens category editing inside Menu", () =>
    expect(managementDestination("menu-categories", { new: "1" })).toBe(
      "/admin/menu?categoryEdit=new",
    ));
  it("preserves list filters and removes the completed edit marker", () =>
    expect(
      preserveAdminListPath(
        "/admin/media?edit=x&notice=OK#media-x",
        "/admin/media?q=Corona&page=2&status=active",
      ),
    ).toBe("/admin/media?notice=OK&q=Corona&page=2&status=active"));
  it("never accepts external or unrelated return destinations", () => {
    expect(
      preserveAdminListPath("/admin/media?notice=OK", "https://evil.test/"),
    ).toBe("/admin/media?notice=OK");
    expect(
      preserveAdminListPath(
        "/admin/media?notice=OK",
        "/admin/applications?q=x",
      ),
    ).toBe("/admin/media?notice=OK");
  });
  it("returns history restore to its consolidated origin", () =>
    expect(
      preserveAdminListPath(
        "/admin/manage/menu-items?notice=OK",
        `/admin/menu?branch=${branch}`,
      ),
    ).toBe(`/admin/menu?notice=OK&branch=${branch}`));
  it("parses category and branch choices together", () =>
    expect(
      parseCategoryInput({
        name: "TEST_Kategori",
        branches: [branch],
        status: "draft",
        is_active: true,
        sort_order: 2,
      }),
    ).toMatchObject({
      name: "TEST_Kategori",
      branches: [branch],
      sort_order: 2,
    }));
  it("rejects duplicate or empty branch choices", () => {
    expect(() =>
      parseCategoryInput({
        name: "TEST_Kategori",
        branches: [],
        status: "draft",
        is_active: true,
        sort_order: 0,
      }),
    ).toThrow();
    expect(() =>
      parseCategoryInput({
        name: "TEST_Kategori",
        branches: [branch, branch],
        status: "draft",
        is_active: true,
        sort_order: 0,
      }),
    ).toThrow();
  });
  it("parses narrow price changes with a version per record", () =>
    expect(
      parseQuickPrices({
        id,
        branches: [
          { id: branch, updated_at: "2026-09-30T00:00:00Z", price: "215,50" },
        ],
        variants: [],
      }),
    ).toEqual({
      id,
      branches: [
        { id: branch, updated_at: "2026-09-30T00:00:00Z", price_cents: 21550 },
      ],
      variants: [],
    }));
  it("rejects invalid prices before writing", () =>
    expect(() =>
      parseQuickPrices({
        id,
        branches: [],
        variants: [
          { id: branch, updated_at: "2026-09-30T00:00:00Z", price: "-1" },
        ],
      }),
    ).toThrow());
  it("sanitizes stored logs again before rendering", () => {
    const safe = safeSystemLogView({
      id,
      actor_id: id,
      request_id: branch,
      route: "/admin/menu?token=secret",
      operation: "save",
      error_code: "42501",
      technical_message: "API_KEY=secret",
      safe_detail: { cookie: "secret", cv: "secret" },
      level: "error",
    });
    expect(JSON.stringify(safe)).not.toContain("secret");
    expect(safe.technical_message).toBe("Permission check rejected operation");
  });
  it("validates log search before assembling filters", () => {
    expect(systemLogSearch("42501")).toBe("42501");
    expect(systemLogSearch("x),id.eq.1")).toBe("");
  });
});
