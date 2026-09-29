import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ env: vi.fn(), client: vi.fn(), claims: vi.fn() }));
vi.mock("@/lib/env/public", () => ({ getSupabasePublicEnv: mocks.env }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.client }));
import { updateSession } from "@/lib/supabase/proxy";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.env.mockReturnValue({ url: "https://test.supabase.co", publishableKey: "sb_publishable_TEST" });
  mocks.client.mockReturnValue({ auth: { getClaims: mocks.claims } });
  mocks.claims.mockResolvedValue({ data: null, error: null });
});

describe("admin session availability", () => {
  it("ayar eksikken korunan ekranı geçirmez, girişe yönlendirir", async () => {
    mocks.env.mockImplementation(() => { throw new Error("TEST_secret"); });
    const response = await updateSession(new NextRequest("https://example.com/admin/menu"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/admin/login");
    expect(location.searchParams.get("reason")).toBe("unavailable");
    expect(location.searchParams.get("next")).toBe("/admin/menu");
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("TEST_secret");
  });
  it("ayar eksikken login sayfasının güvenli hata durumuna ulaşır, döngüye girmez", async () => {
    mocks.env.mockImplementation(() => { throw new Error("Missing environment"); });
    const response = await updateSession(new NextRequest("https://example.com/admin/login"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("auth isteği exception atınca API güvenli 503 döndürür", async () => {
    mocks.claims.mockRejectedValue(new Error("TEST_private_token"));
    const response = await updateSession(new NextRequest("https://example.com/api/admin/applications/id/cv"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "Bu işlem şu anda tamamlanamadı. Tekrar deneyin." });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("TEST_private_token");
  });
  it("SDK geçici bağlantı hatası döndürünce API'yi korur", async () => {
    mocks.claims.mockResolvedValue({ data: null, error: { name: "AuthRetryableFetchError", status: 503 } });
    const response = await updateSession(new NextRequest("https://example.com/api/admin/test"));
    expect(response.status).toBe(503);
  });
  it("normal oturumsuz isteği girişe yönlendirir", async () => {
    const response = await updateSession(new NextRequest("https://example.com/admin"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).searchParams.has("reason")).toBe(false);
  });
  it("doğrulanmış claim varsa mevcut sunucu admin kontrolüne devam eder", async () => {
    mocks.claims.mockResolvedValue({ data: { claims: { sub: "TEST_user" } }, error: null });
    const response = await updateSession(new NextRequest("https://example.com/admin"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
