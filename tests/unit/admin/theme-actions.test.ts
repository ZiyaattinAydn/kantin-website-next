import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  },
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { saveThemeSettings } from "@/lib/admin/theme-actions";

function createThemeFormData(): FormData {
  const formData = new FormData();
  formData.set("fontPreset", "clean");
  formData.set("colorPreset", "ocean");
  formData.set("headingScale", "expressive");
  formData.set("bodyScale", "comfortable");
  formData.set("cardDensity", "airy");

  for (const key of ["branches", "menu", "events", "merch", "memories"]) {
    formData.append("homeSectionOrder", key);
  }

  formData.set("visibility.homeHero", "on");
  formData.set("visibility.branches", "on");
  formData.set("visibility.menu", "on");
  formData.set("visibility.events", "on");
  formData.set("visibility.merch", "on");
  formData.set("visibility.memories", "on");
  formData.set("visibility.instagram", "on");
  formData.set("visibility.careers", "on");
  return formData;
}

describe("saveThemeSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "TEST_admin", role: "admin" });
  });

  it("tema ve görünürlük ayarlarını transaction RPC ile kaydeder", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(saveThemeSettings(createThemeFormData())).rejects.toThrow(
      "REDIRECT:/admin/theme?notice=",
    );

    expect(rpc).toHaveBeenCalledWith("save_admin_theme_settings", {
      p_theme: {
        fontPreset: "clean",
        colorPreset: "ocean",
        headingScale: "expressive",
        bodyScale: "comfortable",
        cardDensity: "airy",
        homeSectionOrder: ["branches", "menu", "events", "merch", "memories"],
      },
      p_visibility: {
        homeHero: true,
        branches: true,
        menu: true,
        events: true,
        merch: true,
        memories: true,
        instagram: true,
        careers: true,
      },
      p_reset: false,
    });
  });

  it("reset işleminde güvenli varsayılanları RPC'ye gönderir", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    mocks.createClient.mockResolvedValue({ rpc });
    const formData = new FormData();
    formData.set("_intent", "reset");

    await expect(saveThemeSettings(formData)).rejects.toThrow(
      "REDIRECT:/admin/theme?notice=",
    );

    expect(rpc).toHaveBeenCalledWith(
      "save_admin_theme_settings",
      expect.objectContaining({
        p_reset: true,
        p_theme: expect.objectContaining({
          fontPreset: "brand",
          colorPreset: "kantin",
        }),
        p_visibility: expect.objectContaining({
          homeHero: true,
          careers: true,
        }),
      }),
    );
  });

  it("RPC hatasında başarı yönlendirmesi yapmaz", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "TEST_ theme transaction error" },
    });
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(saveThemeSettings(createThemeFormData())).rejects.toThrow(
      "REDIRECT:/admin/theme?error=",
    );
  });
});
