import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminAccess: vi.fn(),
  createClient: vi.fn(),
  requireAdminActionLog: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({
  getAdminAccess: mocks.getAdminAccess,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/admin/audit", () => ({
  requireAdminActionLog: mocks.requireAdminActionLog,
}));

import { GET } from "@/app/api/admin/applications/[id]/cv/route";

const TEST_APPLICATION_ID =
  "00000000-0000-0000-0000-000000000101";

const TEST_MEDIA_ID =
  "00000000-0000-0000-0000-000000000102";

const TEST_ADMIN_ID =
  "00000000-0000-0000-0000-000000000103";

const TEST_SIGNED_URL =
  "https://example.supabase.co/storage/v1/object/sign/career-cvs/TEST_cv.pdf?token=TEST";

type SupabaseMockOptions = {
  privacyStatus?: string;
  cvMediaId?: string | null;
  mediaSource?: string;
  mediaKind?: string;
  bucketName?: string | null;
  objectPath?: string | null;
  signedUrl?: string | null;
};

function createSupabaseMock(
  options: SupabaseMockOptions = {},
) {
  const applicationSingle = vi.fn().mockResolvedValue({
    data: {
      id: TEST_APPLICATION_ID,
      cv_media_id:
        options.cvMediaId === undefined
          ? TEST_MEDIA_ID
          : options.cvMediaId,
      privacy_status:
        options.privacyStatus ?? "active",
    },
    error: null,
  });

  const mediaSingle = vi.fn().mockResolvedValue({
    data: {
      source: options.mediaSource ?? "storage",
      kind: options.mediaKind ?? "document",
      bucket_name:
        options.bucketName === undefined
          ? "career-cvs"
          : options.bucketName,
      object_path:
        options.objectPath === undefined
          ? "applications/TEST_cv.pdf"
          : options.objectPath,
    },
    error: null,
  });

  const createSignedUrl = vi.fn().mockResolvedValue({
    data: {
      signedUrl:
        options.signedUrl === undefined
          ? TEST_SIGNED_URL
          : options.signedUrl,
    },
    error: null,
  });

  const from = vi.fn((table: string) => {
    if (table === "job_applications") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: applicationSingle,
          })),
        })),
      };
    }

    if (table === "media") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mediaSingle,
          })),
        })),
      };
    }

    throw new Error(
      `Beklenmeyen TEST_ tablo sorgusu: ${table}`,
    );
  });

  const storageFrom = vi.fn(() => ({
    createSignedUrl,
  }));

  return {
    client: {
      from,
      storage: {
        from: storageFrom,
      },
    },
    spies: {
      from,
      storageFrom,
      createSignedUrl,
    },
  };
}

describe("admin CV indirme rotası", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getAdminAccess.mockResolvedValue({
      status: "authorized",
      admin: {
        userId: TEST_ADMIN_ID,
      },
    });

    mocks.requireAdminActionLog.mockResolvedValue(
      undefined,
    );
  });

  it("zorunlu audit başarılıysa signed URL'ye yönlendirir", async () => {
    const { client, spies } = createSupabaseMock();

    mocks.createClient.mockResolvedValue(client);

    const response = await GET(
      new Request(
        `http://localhost/api/admin/applications/${TEST_APPLICATION_ID}/cv`,
      ),
      {
        params: Promise.resolve({
          id: TEST_APPLICATION_ID,
        }),
      },
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      TEST_SIGNED_URL,
    );
    expect(response.headers.get("cache-control")).toBe(
      "no-store",
    );

    expect(spies.storageFrom).toHaveBeenCalledWith(
      "career-cvs",
    );

    expect(spies.createSignedUrl).toHaveBeenCalledWith(
      "applications/TEST_cv.pdf",
      60,
      {
        download: true,
      },
    );

    expect(
      mocks.requireAdminActionLog,
    ).toHaveBeenCalledWith({
      actorId: TEST_ADMIN_ID,
      action: "application_cv_download",
      entityType: "job_applications",
      entityId: TEST_APPLICATION_ID,
      metadata: {
        access_method: "signed_url",
        expires_in_seconds: 60,
      },
    });
  });

  it("zorunlu audit başarısızsa signed URL'yi kullanıcıya vermez", async () => {
    const { client } = createSupabaseMock();

    mocks.createClient.mockResolvedValue(client);

    mocks.requireAdminActionLog.mockRejectedValue(
      new Error("ADMIN_AUDIT_WRITE_FAILED"),
    );

    const response = await GET(
      new Request(
        `http://localhost/api/admin/applications/${TEST_APPLICATION_ID}/cv`,
      ),
      {
        params: Promise.resolve({
          id: TEST_APPLICATION_ID,
        }),
      },
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("location")).toBeNull();

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error:
        "Güvenli denetim kaydı oluşturulamadığı için CV erişimi geçici olarak durduruldu.",
    });
  });

  it("anonimleştirme sürecindeki başvurunun CV erişimini kapatır", async () => {
    const { client, spies } = createSupabaseMock({
      privacyStatus: "anonymization_pending",
    });

    mocks.createClient.mockResolvedValue(client);

    const response = await GET(
      new Request(
        `http://localhost/api/admin/applications/${TEST_APPLICATION_ID}/cv`,
      ),
      {
        params: Promise.resolve({
          id: TEST_APPLICATION_ID,
        }),
      },
    );

    expect(response.status).toBe(410);
    expect(spies.createSignedUrl).not.toHaveBeenCalled();
    expect(
      mocks.requireAdminActionLog,
    ).not.toHaveBeenCalled();
  });

  it("geçersiz CV medya kaydına signed URL üretmez", async () => {
    const { client, spies } = createSupabaseMock({
      bucketName: "gallery-images",
      mediaKind: "image",
    });

    mocks.createClient.mockResolvedValue(client);

    const response = await GET(
      new Request(
        `http://localhost/api/admin/applications/${TEST_APPLICATION_ID}/cv`,
      ),
      {
        params: Promise.resolve({
          id: TEST_APPLICATION_ID,
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(spies.createSignedUrl).not.toHaveBeenCalled();
    expect(
      mocks.requireAdminActionLog,
    ).not.toHaveBeenCalled();
  });
});