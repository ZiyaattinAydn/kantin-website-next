import { describe, expect, it } from "vitest";
import { getAdminResource } from "@/lib/admin/resources";

describe("admin sistem kaydı korumaları", () => {
  it.each(["site-settings", "site-pages", "content-blocks"])(
    "%s kaynağında yeni kayıt oluşturmayı kapatır",
    (key) => {
      const resource = getAdminResource(key);
      expect(resource?.allowCreate).toBe(false);
      expect(resource?.createProtectionReason).toBeTruthy();
    },
  );

  it.each(["branches", "site-settings", "site-pages", "content-blocks"])(
    "%s kritik sistem kaynağında kalıcı silmeyi kapatır",
    (key) => {
      const resource = getAdminResource(key);
      expect(resource?.allowHardDelete).toBe(false);
      expect(resource?.hardDeleteProtectionReason).toBeTruthy();
    },
  );

  it("mevcut sistem kimliklerini düzenlemeye kapatır", () => {
    const lockedFields = {
      "site-settings": ["key"],
      "site-pages": ["slug"],
      "content-blocks": ["page_id", "key", "block_type"],
    } as const;

    for (const [resourceKey, fieldNames] of Object.entries(lockedFields)) {
      const resource = getAdminResource(resourceKey);
      for (const fieldName of fieldNames) {
        expect(
          resource?.fields.find((field) => field.name === fieldName)?.immutableOnUpdate,
          `${resourceKey}.${fieldName} kilitli olmalı`,
        ).toBe(true);
      }
    }
  });
});
