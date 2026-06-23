import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  logAdminAction,
  requireAdminActionLog,
} from "@/lib/admin/audit";

const TEST_AUDIT_INPUT = {
  actorId: "00000000-0000-0000-0000-000000000001",
  action: "TEST_action",
  entityType: "TEST_entity",
  entityId: "00000000-0000-0000-0000-000000000002",
  metadata: {
    test: true,
  },
};

describe("admin audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(
      () => undefined,
    );
  });

  it("audit kaydı başarılıysa true döndürür", async () => {
    const insert = vi.fn().mockResolvedValue({
      error: null,
    });

    const from = vi.fn(() => ({
      insert,
    }));

    mocks.createClient.mockResolvedValue({
      from,
    });

    await expect(
      logAdminAction(TEST_AUDIT_INPUT),
    ).resolves.toBe(true);

    expect(from).toHaveBeenCalledWith(
      "admin_activity_logs",
    );

    expect(insert).toHaveBeenCalledWith({
      actor_id: TEST_AUDIT_INPUT.actorId,
      action: TEST_AUDIT_INPUT.action,
      entity_type: TEST_AUDIT_INPUT.entityType,
      entity_id: TEST_AUDIT_INPUT.entityId,
      entity_label: null,
      metadata: {
        test: true,
      },
    });
  });

  it("best-effort audit başarısızsa ana akış için false döndürür", async () => {
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({
          error: {
            message: "TEST_ audit hatası",
          },
        }),
      })),
    });

    await expect(
      logAdminAction(TEST_AUDIT_INPUT),
    ).resolves.toBe(false);
  });

  it("zorunlu audit başarısızsa işlemi durdurur", async () => {
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({
          error: {
            message: "TEST_ audit hatası",
          },
        }),
      })),
    });

    await expect(
      requireAdminActionLog(TEST_AUDIT_INPUT),
    ).rejects.toThrow(
      "ADMIN_AUDIT_WRITE_FAILED",
    );
  });

  it("zorunlu audit başarılıysa hata üretmez", async () => {
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({
          error: null,
        }),
      })),
    });

    await expect(
      requireAdminActionLog(TEST_AUDIT_INPUT),
    ).resolves.toBeUndefined();
  });
});