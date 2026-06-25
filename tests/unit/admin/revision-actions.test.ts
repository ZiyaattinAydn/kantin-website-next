import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  },
}));

vi.mock("@/lib/auth/admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { restoreAdminResourceRevision } from "@/lib/admin/revision-actions";
import { ADMIN_REVISION_RESTORE_CONFIRMATION } from "@/lib/admin/revision-constants";

function restoreForm(confirm = ADMIN_REVISION_RESTORE_CONFIRMATION) {
  const formData = new FormData();
  formData.set("_resource", "site-pages");
  formData.set("_id", "11111111-1111-4111-8111-111111111111");
  formData.set("_revision_id", "22222222-2222-4222-8222-222222222222");
  if (confirm) formData.set("_confirm", confirm);
  return formData;
}

describe("admin revision restore action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "TEST_admin", role: "admin" });
  });

  it("doğru onayla yalnız seçili kayıt ve sürüm için transaction RPC çağırır", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ restored_entity_id: "record" }], error: null });
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(restoreAdminResourceRevision(restoreForm())).rejects.toThrow(
      "REDIRECT:/admin/manage/site-pages?notice=",
    );

    expect(rpc).toHaveBeenCalledWith("restore_admin_record_revision", {
      p_revision_id: "22222222-2222-4222-8222-222222222222",
      p_expected_entity_type: "site_pages",
      p_expected_entity_id: "11111111-1111-4111-8111-111111111111",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("GERİ YÜKLE onayı olmadan RPC çağırmaz", async () => {
    await expect(restoreAdminResourceRevision(restoreForm(""))).rejects.toThrow(
      "REDIRECT:/admin/manage/site-pages?error=",
    );

    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("başka kayda ait sürüm hatasını anlaşılır biçimde gösterir", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "revision_target_mismatch" },
    });
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(restoreAdminResourceRevision(restoreForm())).rejects.toThrow(
      /Se%C3%A7ilen\+s%C3%BCr%C3%BCm\+bu\+kayda\+ait\+de%C4%9Fil/,
    );
  });

  it("sürüm desteği olmayan normal kaynağı işlem başlamadan reddeder", async () => {
    const formData = restoreForm();
    formData.set("_resource", "menu-items");

    await expect(restoreAdminResourceRevision(formData)).rejects.toThrow(
      "REDIRECT:/admin?error=Geçersiz sürüm geri yükleme isteği.",
    );
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });
});
