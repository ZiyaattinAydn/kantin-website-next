// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
vi.mock("@/components/admin/AdminShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/lib/auth/admin", () => ({
  requireAdmin: async () => ({ displayName: "TEST_Admin" }),
}));
vi.mock("@/lib/admin/system-logs", () => ({
  loadSystemHealth: async () => ({ count: 0 }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => {
      const q = {
        select: () => q,
        eq: () => q,
        order: () => q,
        limit: () => q,
        range: async () => ({ data: [], error: null }),
        then: (resolve: (value: unknown) => void) =>
          resolve({ count: 0, data: [], error: null }),
      };
      return q;
    },
  }),
}));
import Dashboard from "@/app/admin/page";
describe("empty career dashboard", () => {
  it("omits both the zero application alert and the zero count card", async () => {
    render(await Dashboard());
    expect(
      screen.queryByText("yeni kariyer başvurusu inceleme bekliyor."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Kariyer başvurusu")).not.toBeInTheDocument();
  });
});
