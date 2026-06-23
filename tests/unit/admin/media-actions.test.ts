import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
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
vi.mock("@/lib/admin/media-usage", () => ({
  loadMediaUsageMap: mocks.loadMediaUsageMap,
}));

import {
  archiveAdminMedia,
  deleteTestAdminMedia,
  restoreAdminMedia,
  uploadAdminMedia,
} from "@/lib/admin/media-actions";

const TEST_MEDIA = {
  id: "11111111-1111-4111-8111-111111111111",
  source: "storage",
  title: "TEST_ Medya",
  kind: "image",
  bucket_name: "menu-images",
  object_path: "admin/2026/11111111-1111-4111-8111-111111111111.webp",
  external_url: null,
  local_path: null,
  status: "published",
  is_active: true,
};

function mediaReadClient(media = TEST_MEDIA) {
  return {
    from: vi.fn(() => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: media, error: null }),
        }),
      }),
    })),
  };
}

describe("admin medya eylemleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "TEST_admin", role: "admin" });
  });

  it("kullanılan medyanın arşivlenmesini RPC'ye gitmeden engeller", async () => {
    const rpc = vi.fn();
    mocks.createClient.mockResolvedValue({ ...mediaReadClient(), rpc });
    mocks.loadMediaUsageMap.mockResolvedValue(
      new Map([
        [
          TEST_MEDIA.id,
          [{ source: "menu_items", sourceId: "TEST_item" }],
        ],
      ]),
    );
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);

    await expect(archiveAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("bağlantısız medyayı transaction RPC ile arşivler", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { media_id: TEST_MEDIA.id, title: TEST_MEDIA.title },
      error: null,
    });
    const rpc = vi.fn(() => ({ single }));
    mocks.createClient.mockResolvedValue({ ...mediaReadClient(), rpc });
    mocks.loadMediaUsageMap.mockResolvedValue(new Map([[TEST_MEDIA.id, []]]));
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);

    await expect(archiveAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(rpc).toHaveBeenCalledWith("set_admin_media_state", {
      p_media_id: TEST_MEDIA.id,
      p_action: "media_archive",
    });
  });

  it("arşiv kaydını transaction RPC ile yeniden yayına alır", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { media_id: TEST_MEDIA.id, title: TEST_MEDIA.title },
      error: null,
    });
    const rpc = vi.fn(() => ({ single }));
    mocks.createClient.mockResolvedValue({ rpc });
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);

    await expect(restoreAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(rpc).toHaveBeenCalledWith("set_admin_media_state", {
      p_media_id: TEST_MEDIA.id,
      p_action: "media_restore",
    });
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

  it("yüklenen görsel için medya kaydı ve audit'i transaction RPC'ye bırakır", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const remove = vi.fn().mockResolvedValue({ error: null });
    const storageFrom = vi.fn(() => ({ upload, remove }));
    const rpc = vi.fn().mockResolvedValue({
      data: "22222222-2222-4222-8222-222222222222",
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      storage: { from: storageFrom },
      rpc,
    });

    const formData = new FormData();
    formData.set("bucket", "menu-images");
    formData.set("title", "TEST_ Görsel");
    formData.set("alt_text", "TEST görsel açıklaması");
    formData.set(
      "file",
      new File(["TEST"], "TEST_gorsel.webp", { type: "image/webp" }),
    );

    await expect(uploadAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );

    expect(rpc).toHaveBeenCalledWith(
      "create_admin_media_record",
      expect.objectContaining({
        p_bucket_name: "menu-images",
        p_title: "TEST_ Görsel",
        p_alt_text: "TEST görsel açıklaması",
        p_mime_type: "image/webp",
        p_size_bytes: 4,
        p_object_path: expect.stringMatching(
          /^admin\/\d{4}\/[0-9a-f-]+\.webp$/,
        ),
      }),
    );
    expect(remove).not.toHaveBeenCalled();
  });

  it("medya kayıt RPC'si başarısızsa yüklenen Storage nesnesini temizler", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const remove = vi.fn().mockResolvedValue({ error: null });
    const storageFrom = vi.fn(() => ({ upload, remove }));
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "TEST_ media transaction error" },
    });
    mocks.createClient.mockResolvedValue({
      storage: { from: storageFrom },
      rpc,
    });

    const formData = new FormData();
    formData.set("bucket", "menu-images");
    formData.set("title", "TEST_ Görsel");
    formData.set("alt_text", "TEST görsel açıklaması");
    formData.set(
      "file",
      new File(["TEST"], "TEST_gorsel.webp", { type: "image/webp" }),
    );

    await expect(uploadAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(upload).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith([
      expect.stringMatching(/^admin\/\d{4}\/[0-9a-f-]+\.webp$/),
    ]);
  });

  it("TEST_ olmayan medya kaydını kalıcı silme akışına almaz", async () => {
    const media = { ...TEST_MEDIA, title: "Gerçek medya" };
    const rpc = vi.fn();
    mocks.createClient.mockResolvedValue({ ...mediaReadClient(media), rpc });
    const formData = new FormData();
    formData.set("id", media.id);

    await expect(deleteTestAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("Storage silme hatasında hazırlanmış TEST medya durumunu geri alır", async () => {
    const remove = vi.fn().mockResolvedValue({
      error: { message: "TEST_ storage delete error" },
    });
    const rpc = vi.fn((name: string) => {
      if (name === "begin_test_admin_media_delete") {
        return {
          single: async () => ({
            data: {
              media_id: TEST_MEDIA.id,
              title: TEST_MEDIA.title,
              bucket_name: TEST_MEDIA.bucket_name,
              object_path: TEST_MEDIA.object_path,
              previous_status: "published",
              previous_is_active: true,
            },
            error: null,
          }),
        };
      }
      if (name === "cancel_test_admin_media_delete") {
        return Promise.resolve({ data: true, error: null });
      }
      return Promise.resolve({ data: false, error: null });
    });
    mocks.createClient.mockResolvedValue({
      ...mediaReadClient(),
      rpc,
      storage: { from: vi.fn(() => ({ remove })) },
    });
    mocks.loadMediaUsageMap.mockResolvedValue(new Map([[TEST_MEDIA.id, []]]));
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);

    await expect(deleteTestAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(rpc).toHaveBeenCalledWith("cancel_test_admin_media_delete", {
      p_media_id: TEST_MEDIA.id,
      p_previous_status: "published",
      p_previous_is_active: true,
      p_reason: "storage_delete_failed",
    });
    expect(rpc).not.toHaveBeenCalledWith(
      "complete_test_admin_media_delete",
      expect.anything(),
    );
  });

  it("TEST medya silmeyi hazırla, Storage sil ve DB tamamla sırasıyla yürütür", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn((name: string) => {
      if (name === "begin_test_admin_media_delete") {
        return {
          single: async () => ({
            data: {
              media_id: TEST_MEDIA.id,
              title: TEST_MEDIA.title,
              bucket_name: TEST_MEDIA.bucket_name,
              object_path: TEST_MEDIA.object_path,
              previous_status: "published",
              previous_is_active: true,
            },
            error: null,
          }),
        };
      }
      if (name === "complete_test_admin_media_delete") {
        return Promise.resolve({ data: true, error: null });
      }
      return Promise.resolve({ data: false, error: null });
    });
    mocks.createClient.mockResolvedValue({
      ...mediaReadClient(),
      rpc,
      storage: { from: vi.fn(() => ({ remove })) },
    });
    mocks.loadMediaUsageMap.mockResolvedValue(new Map([[TEST_MEDIA.id, []]]));
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);

    await expect(deleteTestAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(remove).toHaveBeenCalledWith([TEST_MEDIA.object_path]);
    expect(rpc).toHaveBeenCalledWith("complete_test_admin_media_delete", {
      p_media_id: TEST_MEDIA.id,
    });
  });
});
