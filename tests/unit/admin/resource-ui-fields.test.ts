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
        resource?.fields.some((field) => isAdminInternalFieldName(field.name)),
        `${key} teknik sıralama alanını korumalı`,
      ).toBe(true);
    }
  });
});
