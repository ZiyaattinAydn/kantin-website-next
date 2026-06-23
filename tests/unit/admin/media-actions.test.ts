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
  deleteAdminMedia,
  restoreAdminMedia,
  updateAdminMedia,
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
  status: "archived",
  is_active: false,
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

  it("bağlantılı olsa da medyayı transaction RPC ile arşivleyebilir", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { media_id: TEST_MEDIA.id, title: TEST_MEDIA.title },
      error: null,
    });
    const rpc = vi.fn(() => ({ single }));
    mocks.createClient.mockResolvedValue({ rpc });
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);

    await expect(archiveAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(rpc).toHaveBeenCalledWith("set_admin_media_state", {
      p_media_id: TEST_MEDIA.id,
      p_action: "media_archive",
    });
    expect(mocks.loadMediaUsageMap).not.toHaveBeenCalled();
  });

  it("medya metadata ve yayın ayarlarını transaction RPC ile günceller", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { media_id: TEST_MEDIA.id, title: "Yeni ad" },
      error: null,
    });
    const rpc = vi.fn(() => ({ single }));
    mocks.createClient.mockResolvedValue({ rpc });
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);
    formData.set("title", "Yeni ad");
    formData.set("alt_text", "Yeni erişilebilir açıklama");
    formData.set("status", "published");
    formData.set("is_active", "on");
    formData.set("sort_order", "4");

    await expect(updateAdminMedia(formData)).rejects.toThrow(
      `REDIRECT:/admin/media?edit=${TEST_MEDIA.id}&notice=`,
    );
    expect(rpc).toHaveBeenCalledWith("update_admin_media_metadata", {
      p_media_id: TEST_MEDIA.id,
      p_title: "Yeni ad",
      p_alt_text: "Yeni erişilebilir açıklama",
      p_status: "published",
      p_is_active: true,
      p_sort_order: 4,
    });
  });

  it("taslak durumunda aktif checkbox gelse bile kaydı pasif gönderir", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { media_id: TEST_MEDIA.id, title: "Taslak" },
      error: null,
    });
    const rpc = vi.fn(() => ({ single }));
    mocks.createClient.mockResolvedValue({ rpc });
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);
    formData.set("title", "Taslak");
    formData.set("alt_text", "Taslak görsel");
    formData.set("status", "draft");
    formData.set("is_active", "on");
    formData.set("sort_order", "0");

    await expect(updateAdminMedia(formData)).rejects.toThrow("REDIRECT:/admin/media?edit=");
    expect(rpc).toHaveBeenCalledWith(
      "update_admin_media_metadata",
      expect.objectContaining({ p_status: "draft", p_is_active: false }),
    );
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

  it("aktif medya kaydını kalıcı silme akışına almaz", async () => {
    const media = { ...TEST_MEDIA, status: "published", is_active: true };
    const rpc = vi.fn();
    mocks.createClient.mockResolvedValue({ ...mediaReadClient(media), rpc });
    const formData = new FormData();
    formData.set("id", media.id);

    await expect(deleteAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("kullanılan arşiv medyasını kalıcı silmez", async () => {
    const rpc = vi.fn();
    mocks.createClient.mockResolvedValue({ ...mediaReadClient(), rpc });
    mocks.loadMediaUsageMap.mockResolvedValue(new Map([
      [TEST_MEDIA.id, [{ source: "menu_items", sourceId: "TEST_item" }]],
    ]));
    const formData = new FormData();
    formData.set("id", TEST_MEDIA.id);

    await expect(deleteAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("Storage silme hatasında bekleyen medya silme işaretini temizler", async () => {
    const remove = vi.fn().mockResolvedValue({
      error: { message: "TEST_ storage delete error" },
    });
    const rpc = vi.fn((name: string) => {
      if (name === "begin_admin_media_delete") {
        return {
          single: async () => ({
            data: {
              media_id: TEST_MEDIA.id,
              title: TEST_MEDIA.title,
              bucket_name: TEST_MEDIA.bucket_name,
              object_path: TEST_MEDIA.object_path,
            },
            error: null,
          }),
        };
      }
      if (name === "cancel_admin_media_delete") {
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

    await expect(deleteAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?error=",
    );
    expect(rpc).toHaveBeenCalledWith("cancel_admin_media_delete", {
      p_media_id: TEST_MEDIA.id,
      p_reason: "storage_delete_failed",
    });
    expect(rpc).not.toHaveBeenCalledWith(
      "complete_admin_media_delete",
      expect.anything(),
    );
  });

  it("Storage nesnesi zaten yoksa bekleyen silme işlemini DB tarafında tamamlar", async () => {
    const remove = vi.fn().mockResolvedValue({
      error: { statusCode: 404, message: "Object not found" },
    });
    const rpc = vi.fn((name: string) => {
      if (name === "begin_admin_media_delete") {
        return {
          single: async () => ({
            data: {
              media_id: TEST_MEDIA.id,
              title: TEST_MEDIA.title,
              bucket_name: TEST_MEDIA.bucket_name,
              object_path: TEST_MEDIA.object_path,
            },
            error: null,
          }),
        };
      }
      if (name === "complete_admin_media_delete") {
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

    await expect(deleteAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(remove).toHaveBeenCalledWith([TEST_MEDIA.object_path]);
    expect(rpc).toHaveBeenCalledWith("complete_admin_media_delete", {
      p_media_id: TEST_MEDIA.id,
    });
    expect(rpc).not.toHaveBeenCalledWith(
      "cancel_admin_media_delete",
      expect.anything(),
    );
  });

  it("arşiv medyasını hazırla, Storage sil ve DB tamamla sırasıyla yürütür", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn((name: string) => {
      if (name === "begin_admin_media_delete") {
        return {
          single: async () => ({
            data: {
              media_id: TEST_MEDIA.id,
              title: TEST_MEDIA.title,
              bucket_name: TEST_MEDIA.bucket_name,
              object_path: TEST_MEDIA.object_path,
            },
            error: null,
          }),
        };
      }
      if (name === "complete_admin_media_delete") {
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

    await expect(deleteAdminMedia(formData)).rejects.toThrow(
      "REDIRECT:/admin/media?notice=",
    );
    expect(remove).toHaveBeenCalledWith([TEST_MEDIA.object_path]);
    expect(rpc).toHaveBeenCalledWith("complete_admin_media_delete", {
      p_media_id: TEST_MEDIA.id,
    });
  });
});
