import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  logAdminAction: vi.fn(),
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
vi.mock("@/lib/admin/audit", () => ({ logAdminAction: mocks.logAdminAction }));

import { anonymizeApplicationAction } from "@/lib/admin/application-actions";

describe("anonymizeApplicationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "TEST_admin", role: "admin" });
  });

  it("açık onay metni olmadan DB veya Storage'a gitmez", async () => {
    const formData = new FormData();
    formData.set("id", "TEST_application");
    formData.set("confirmation", "yanlis");

    await expect(anonymizeApplicationAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/applications?edit=TEST_application&error=",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("dry-run kontrolünde DB veya Storage yazma akışını çağırmaz", async () => {
    const remove = vi.fn();
    const rpc = vi.fn();
    const applicationMaybeSingle = vi.fn(async () => ({
      data: {
        id: "TEST_application",
        status: "archived",
        privacy_status: "active",
        cv_media_id: "TEST_media",
      },
      error: null,
    }));
    const mediaMaybeSingle = vi.fn(async () => ({
      data: {
        id: "TEST_media",
        source: "storage",
        kind: "document",
        bucket_name: "career-cvs",
        object_path: "incoming/TEST_application/TEST_cv.pdf",
      },
      error: null,
    }));
    const from = vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: table === "job_applications"
            ? applicationMaybeSingle
            : mediaMaybeSingle,
        })),
      })),
    }));
    mocks.createClient.mockResolvedValue({
      from,
      rpc,
      storage: { from: vi.fn(() => ({ remove })) },
    });
    const formData = new FormData();
    formData.set("id", "TEST_application");
    formData.set("_intent", "dry_run");

    await expect(anonymizeApplicationAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/applications?edit=TEST_application&notice=",
    );
    expect(from).toHaveBeenCalledWith("job_applications");
    expect(from).toHaveBeenCalledWith("media");
    expect(rpc).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("dry-run geçersiz CV medya bağlantısını yazma yapmadan durdurur", async () => {
    const remove = vi.fn();
    const rpc = vi.fn();
    const applicationMaybeSingle = vi.fn(async () => ({
      data: {
        id: "TEST_application",
        status: "archived",
        privacy_status: "active",
        cv_media_id: "TEST_media",
      },
      error: null,
    }));
    const mediaMaybeSingle = vi.fn(async () => ({
      data: {
        id: "TEST_media",
        source: "storage",
        kind: "image",
        bucket_name: "gallery-images",
        object_path: "TEST_image.webp",
      },
      error: null,
    }));
    const from = vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: table === "job_applications"
            ? applicationMaybeSingle
            : mediaMaybeSingle,
        })),
      })),
    }));
    mocks.createClient.mockResolvedValue({
      from,
      rpc,
      storage: { from: vi.fn(() => ({ remove })) },
    });
    const formData = new FormData();
    formData.set("id", "TEST_application");
    formData.set("_intent", "dry_run");

    await expect(anonymizeApplicationAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/applications?edit=TEST_application&error=",
    );
    expect(rpc).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("CV silindikten sonra anonimleştirmeyi tamamlar", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn((name: string) => {
      if (name === "begin_job_application_anonymization") {
        return {
          single: async () => ({
            data: {
              application_id: "TEST_application",
              media_id: "TEST_media",
              bucket_name: "career-cvs",
              object_path: "incoming/TEST_application/TEST_cv.pdf",
            },
            error: null,
          }),
        };
      }
      if (name === "complete_job_application_anonymization") {
        return Promise.resolve({ data: true, error: null });
      }
      return Promise.resolve({ data: false, error: null });
    });
    mocks.createClient.mockResolvedValue({
      rpc,
      storage: { from: vi.fn(() => ({ remove })) },
    });
    const formData = new FormData();
    formData.set("id", "TEST_application");
    formData.set("confirmation", "ANONIMLESTIR");

    await expect(anonymizeApplicationAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/applications?notice=",
    );
    expect(remove).toHaveBeenCalledWith([
      "incoming/TEST_application/TEST_cv.pdf",
    ]);
    expect(rpc).toHaveBeenCalledWith(
      "complete_job_application_anonymization",
      { p_application_id: "TEST_application" },
    );
  });

  it("Storage silme hatasında anonimleştirme durumunu geri alır", async () => {
    const remove = vi.fn().mockResolvedValue({
      error: { message: "TEST_ storage error" },
    });
    const rpc = vi.fn((name: string) => {
      if (name === "begin_job_application_anonymization") {
        return {
          single: async () => ({
            data: {
              application_id: "TEST_application",
              media_id: "TEST_media",
              bucket_name: "career-cvs",
              object_path: "incoming/TEST_application/TEST_cv.pdf",
            },
            error: null,
          }),
        };
      }
      if (name === "cancel_job_application_anonymization") {
        return Promise.resolve({ data: true, error: null });
      }
      return Promise.resolve({ data: false, error: null });
    });
    mocks.createClient.mockResolvedValue({
      rpc,
      storage: { from: vi.fn(() => ({ remove })) },
    });
    const formData = new FormData();
    formData.set("id", "TEST_application");
    formData.set("confirmation", "ANONIMLESTIR");

    await expect(anonymizeApplicationAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/applications?edit=TEST_application&error=",
    );
    expect(rpc).toHaveBeenCalledWith(
      "cancel_job_application_anonymization",
      {
        p_application_id: "TEST_application",
        p_reason: "cv_storage_delete_failed",
      },
    );
    expect(rpc).not.toHaveBeenCalledWith(
      "complete_job_application_anonymization",
      expect.anything(),
    );
  });
});
