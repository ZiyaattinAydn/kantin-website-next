// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ getAdminAccess: mocks.access }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/components/admin/AdminLoginForm", () => ({ default: () => <form aria-label="TEST_login" /> }));
import AdminLoginPage from "@/app/admin/login/page";

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);
describe("login outage state", () => {
  it("bağlantı kurulamadığında formu gizler ve yalnız kısa hata/tekrar dene gösterir", async () => {
    mocks.access.mockResolvedValue({ status: "unavailable" });
    render(await AdminLoginPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("alert")).toHaveTextContent("Bağlantı sorunu oluştu. Tekrar deneyin.");
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tekrar dene" })).toHaveAttribute("href", "/admin/login");
  });
  it("hizmet erişilebilir ve oturum kapalıysa normal giriş formunu gösterir", async () => {
    mocks.access.mockResolvedValue({ status: "signed_out" });
    render(await AdminLoginPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("form", { name: "TEST_login" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
