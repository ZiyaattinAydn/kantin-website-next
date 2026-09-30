import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({ client: vi.fn(), auth: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: m.auth }));
vi.mock("@/lib/admin/log-actions", () => ({ resolveSystemLog: vi.fn() }));
import LogsPage from "@/app/admin/(panel)/logs/page";
function query() {
  const q = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    not: vi.fn(() => q),
    or: vi.fn(() => q),
    order: vi.fn(() => q),
    range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
  };
  m.client.mockResolvedValue({ from: vi.fn(() => q) });
  return q;
}
beforeEach(() => vi.clearAllMocks());
describe("effective log severity filters", () => {
  it("includes historical error-coded conflicts in the warning filter", async () => {
    const q = query();
    await LogsPage({ searchParams: Promise.resolve({ level: "warning" }) });
    expect(q.or).toHaveBeenCalledWith(
      expect.stringContaining("level.eq.warning,error_code.in.(40001"),
    );
    expect(q.eq).not.toHaveBeenCalledWith("level", "warning");
  });
  it("excludes expected validation and conflicts from real errors", async () => {
    const q = query();
    await LogsPage({ searchParams: Promise.resolve({ level: "error" }) });
    expect(q.eq).toHaveBeenCalledWith("level", "error");
    expect(q.not).toHaveBeenCalledWith(
      "error_code",
      "in",
      expect.stringContaining("40001"),
    );
  });
});
