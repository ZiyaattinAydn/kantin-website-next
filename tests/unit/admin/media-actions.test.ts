import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  logAdminAction: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  loadMediaUsageMap: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  },
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/admin/audit", () => ({ logAdminAction: mocks.logAdminAction }));
vi.mock("@/lib/admin/media-usage", () => ({
  loadMediaUsageMap: mocks.loadMediaUsageMap,
}));

import {
  archiveAdminMedia,
  deleteTestAdminMedia,
  restoreAdminMedia,
  uploadAdminMedia,
} from "@/lib/admin/media-actions";

describe("admin medya eylemleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "TEST_admin", role: "admin" });
    mocks.logAdminAction.mockResolvedValue(undefined);
  });

  it("kullanılan medyanın arşivlenmesini engeller", async () => {
    const media = {
      id: "TEST_media",
      title: "TEST_ Kullanılan medya",
      kind: "image",
      bucket_name: "menu-images",
      object_path: "TEST.webp",
      external_url: null,
      local_path: null,
      status: "published",
      is_active: true,
    };
    const update = vi.fn();
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: media, error: null }),
          }),
        }),
        update,
      })),
    });
    mocks.loadMediaUsageMap.mockResolvedValue(new Map([
      [media.id, [{ source: "menu_items", sourceId: "TEST_item" }]],
    ]));
    const formData = new FormData();
    formData.set("id", media.id);

    await expect(archiveAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(update).not.toHaveBeenCalled();
    expect(mocks.logAdminAction).not.toHaveBeenCalled();
  });

  it("bağlantısız medyayı arşivler", async () => {
    const media = {
      id: "TEST_media",
      title: "TEST_ Boş medya",
      kind: "image",
      bucket_name: "menu-images",
      object_path: "TEST.webp",
      external_url: null,
      local_path: null,
      status: "published",
      is_active: true,
    };
    const updateSingle = vi.fn().mockResolvedValue({
      data: { title: media.title },
      error: null,
    });
    const update = vi.fn(() => ({
      eq: () => ({ select: () => ({ single: updateSingle }) }),
    }));
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: media, error: null }),
          }),
        }),
        update,
      })),
    });
    mocks.loadMediaUsageMap.mockResolvedValue(new Map([[media.id, []]]));
    const formData = new FormData();
    formData.set("id", media.id);

    await expect(archiveAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(update).toHaveBeenCalledWith({ status: "archived", is_active: false });
    expect(mocks.logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: "media_archive", entityId: media.id }),
    );
  });

  it("arşiv kaydını yeniden yayına alır", async () => {
    const update = vi.fn(() => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: { title: "TEST_ Medya" }, error: null }),
        }),
      }),
    }));
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => ({ update })) });
    const formData = new FormData();
    formData.set("id", "TEST_media");

    await expect(restoreAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(update).toHaveBeenCalledWith({ status: "published", is_active: true });
  });

  it("desteklenmeyen dosyayı Storage'a gitmeden reddeder", async () => {
    const formData = new FormData();
    formData.set("bucket", "media");
    formData.set("title", "TEST_belge");
    formData.set("alt_text", "TEST belge");
    formData.set(
      "file",
      new File(["TEST"], "TEST_belge.txt", { type: "text/plain" }),
    );

    await expect(uploadAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("TEST_ olmayan medya kaydını kalıcı silmez", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "real-media",
        source: "storage",
        title: "Gerçek medya",
        bucket_name: "media",
        object_path: "public/real.webp",
      },
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: () => ({ eq: () => ({ single }) }),
      })),
    });
    const formData = new FormData();
    formData.set("id", "real-media");

    await expect(deleteTestAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(single).toHaveBeenCalledOnce();
    expect(mocks.logAdminAction).not.toHaveBeenCalled();
  });
});
