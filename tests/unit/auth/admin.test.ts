import { afterEach, describe, expect, it, vi } from "vitest";

type ProfileResult = {
  data: { display_name: string | null; role: "viewer" | "editor" | "admin"; is_active: boolean } | null;
  error: Error | null;
};

function mockClient(input: {
  claims?: Record<string, unknown> | null;
  claimError?: Error | null;
  profile?: ProfileResult;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(
    input.profile ?? { data: null, error: null },
  );
  const client = {
    auth: {
      getClaims: vi.fn().mockResolvedValue({
        data: input.claims ? { claims: input.claims } : null,
        error: input.claimError ?? null,
      }),
    },
    from: vi.fn(() => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
    })),
  };

  vi.doMock("@/lib/supabase/server", () => ({
    createClient: async () => client,
  }));
  return client;
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("getAdminAccess", () => {
  it("claim yoksa signed_out döndürür", async () => {
    mockClient({ claims: null });
    const { getAdminAccess } = await import("@/lib/auth/admin");
    await expect(getAdminAccess()).resolves.toEqual({ status: "signed_out" });
  });

  it("aktif admin profilini yetkilendirir", async () => {
    mockClient({
      claims: { sub: "00000000-0000-0000-0000-000000000001", email: "admin@example.com" },
      profile: {
        data: { display_name: "TEST_ Admin", role: "admin", is_active: true },
        error: null,
      },
    });
    const { getAdminAccess } = await import("@/lib/auth/admin");

    await expect(getAdminAccess()).resolves.toMatchObject({
      status: "authorized",
      admin: { displayName: "TEST_ Admin", role: "admin" },
    });
  });

  it("editor rolünü admin paneli için yetkisiz sayar", async () => {
    mockClient({
      claims: { sub: "00000000-0000-0000-0000-000000000002", email: "editor@example.com" },
      profile: {
        data: { display_name: "TEST_ Editor", role: "editor", is_active: true },
        error: null,
      },
    });
    const { getAdminAccess } = await import("@/lib/auth/admin");

    await expect(getAdminAccess()).resolves.toMatchObject({
      status: "unauthorized",
      role: "editor",
      isActive: true,
    });
  });
});
