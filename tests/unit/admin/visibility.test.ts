import { describe, expect, it } from "vitest";
import {
  ADMIN_VISIBILITY_CONFIRMATIONS,
  adminVisibilityImpact,
  isAdminResourcePubliclyVisible,
  requiredAdminVisibilityConfirmation,
} from "@/lib/admin/visibility";

describe("admin visibility protection", () => {
  it("yayında ve aktif kaydı ziyaretçiye görünür kabul eder", () => {
    expect(isAdminResourcePubliclyVisible({
      hasActiveField: true,
      hasStatusField: true,
      active: true,
      status: "published",
    })).toBe(true);
  });

  it("yayındaki kaydı gizleyen değişiklikte PASİFE AL onayı ister", () => {
    expect(requiredAdminVisibilityConfirmation({
      isCreate: false,
      current: {
        hasActiveField: true,
        hasStatusField: true,
        active: true,
        status: "published",
      },
      next: {
        hasActiveField: true,
        hasStatusField: true,
        active: false,
        status: "published",
      },
    })).toBe(ADMIN_VISIBILITY_CONFIRMATIONS.hide);
  });

  it("taslak kayıt arşive alınırken ziyaretçide görünmese bile PASİFE AL onayı ister", () => {
    expect(requiredAdminVisibilityConfirmation({
      isCreate: false,
      current: {
        hasActiveField: true,
        hasStatusField: true,
        active: true,
        status: "draft",
      },
      next: {
        hasActiveField: true,
        hasStatusField: true,
        active: false,
        status: "archived",
      },
    })).toBe(ADMIN_VISIBILITY_CONFIRMATIONS.hide);
  });

  it("gizli kaydı yayına açan değişiklikte YAYINLA onayı ister", () => {
    expect(requiredAdminVisibilityConfirmation({
      isCreate: false,
      current: {
        hasActiveField: true,
        hasStatusField: true,
        active: true,
        status: "draft",
      },
      next: {
        hasActiveField: true,
        hasStatusField: true,
        active: true,
        status: "published",
      },
    })).toBe(ADMIN_VISIBILITY_CONFIRMATIONS.publish);
  });

  it("aktif-only yeni ilişki kaydında gereksiz yayın onayı istemez", () => {
    expect(requiredAdminVisibilityConfirmation({
      isCreate: true,
      current: null,
      next: {
        hasActiveField: true,
        hasStatusField: false,
        active: true,
      },
    })).toBeNull();
  });

  it("doğrudan yayında oluşturulan içerikte YAYINLA onayı ister", () => {
    expect(requiredAdminVisibilityConfirmation({
      isCreate: true,
      current: null,
      next: {
        hasActiveField: true,
        hasStatusField: true,
        active: true,
        status: "published",
      },
    })).toBe(ADMIN_VISIBILITY_CONFIRMATIONS.publish);
  });

  it("kaynak için kullanıcıya özel görünürlük etkisi döndürür", () => {
    expect(adminVisibilityImpact("menu-items", "ürün")).toContain("Şube fiyatları");
    expect(adminVisibilityImpact("unknown", "kayıt")).toContain("kayıt silinmez");
  });
});
