// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/revision-actions", () => ({
  restoreAdminResourceRevision: vi.fn(),
}));

import AdminRevisionHistory from "@/components/admin/crud/AdminRevisionHistory";
import { getAdminResource } from "@/lib/admin/resources";

describe("AdminRevisionHistory", () => {
  it("değişen alanları gösterir ve update snapshotı için geri yükleme sunar", () => {
    const resource = getAdminResource("site-pages");
    if (!resource) throw new Error("TEST_ resource bulunamadı");

    render(
      <AdminRevisionHistory
        recordId="11111111-1111-4111-8111-111111111111"
        recordLabel="Ana Sayfa"
        resource={resource}
        revisions={[
          {
            id: "22222222-2222-4222-8222-222222222222",
            actorId: "33333333-3333-4333-8333-333333333333",
            operation: "update",
            beforeData: { title: "Eski başlık", seo_title: "Eski SEO" },
            afterData: { title: "Yeni başlık", seo_title: "Yeni SEO" },
            changedFields: ["title", "seo_title"],
            createdAt: "2026-06-25T10:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("Sürüm geçmişi")).toBeInTheDocument();
    expect(screen.getByText("Sayfa adı, SEO başlığı")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bu değişiklikten önceki hâle dön" })).toBeInTheDocument();
  });

  it("ilk kayıt snapshotında geri yükleme düğmesi göstermez", () => {
    const resource = getAdminResource("branches");
    if (!resource) throw new Error("TEST_ resource bulunamadı");

    render(
      <AdminRevisionHistory
        recordId="11111111-1111-4111-8111-111111111111"
        recordLabel="TEST_ Şube"
        resource={resource}
        revisions={[
          {
            id: "22222222-2222-4222-8222-222222222222",
            actorId: null,
            operation: "insert",
            beforeData: null,
            afterData: { name: "TEST_ Şube" },
            changedFields: [],
            createdAt: "2026-06-25T10:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("İlk kayıt")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bu değişiklikten önceki hâle dön" })).not.toBeInTheDocument();
  });
});
