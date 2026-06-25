import { describe, expect, it } from "vitest";
import {
  getAdminResource,
  isAdminInternalFieldName,
} from "@/lib/admin/resources";

const RESOURCE_KEYS = [
  "menu-categories",
  "menu-category-branches",
  "menu-items",
  "menu-item-branches",
  "menu-item-variants",
  "events",
  "event-branches",
  "merch-products",
  "merch-product-branches",
  "instagram-posts",
  "branches",
  "site-settings",
  "site-pages",
  "content-blocks",
] as const;

describe("admin teknik alan görünürlüğü", () => {
  it("sort_order alanını kullanıcı arayüzünde gösterilmeyecek sistem alanı sayar", () => {
    expect(isAdminInternalFieldName("sort_order")).toBe(true);
    expect(isAdminInternalFieldName("title")).toBe(false);
  });

  it("sıralama kullanan kaynaklarda teknik alanı iç veri olarak korur", () => {
    for (const key of RESOURCE_KEYS) {
      const resource = getAdminResource(key);
      expect(resource, `${key} kaynağı bulunamadı`).not.toBeNull();
      expect(
        isAdminInternalFieldName(resource?.orderField ?? ""),
        `${key} teknik sıralama alanını iç veri olarak tanımlamalı`,
      ).toBe(true);
    }
  });

  it("teknik JSON alanlarını gelişmiş ve korumalı düzenleme altında tutar", () => {
    const protectedFields = {
      branches: ["opening_hours"],
      "site-settings": ["value"],
      "site-pages": ["metadata"],
      "content-blocks": ["content"],
    } as const;

    for (const [resourceKey, fieldNames] of Object.entries(protectedFields)) {
      const resource = getAdminResource(resourceKey);
      for (const fieldName of fieldNames) {
        const field = resource?.fields.find((candidate) => candidate.name === fieldName);
        expect(field?.type, `${resourceKey}.${fieldName} JSON alanı olmalı`).toBe("json");
        expect(field?.advanced, `${resourceKey}.${fieldName} gelişmiş alanda olmalı`).toBe(true);
        expect(field?.guardedJson, `${resourceKey}.${fieldName} korumalı olmalı`).toBe(true);
        expect(field?.guardedJsonWarning).toBeTruthy();
      }
    }
  });
});
