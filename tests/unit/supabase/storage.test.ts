import { describe, expect, it } from "vitest";
import {
  STORAGE_BUCKETS,
  createStorageObjectPath,
  validateStorageFile,
} from "@/lib/supabase/storage";
import { validImageFile, validPdfFile } from "../../helpers/files";

describe("validateStorageFile", () => {
  it("geçerli WebP ve PDF dosyalarını kabul eder", () => {
    expect(
      validateStorageFile(validImageFile(), STORAGE_BUCKETS.galleryImages),
    ).toEqual({ ok: true });
    expect(validateStorageFile(validPdfFile(), STORAGE_BUCKETS.careerCvs)).toEqual({
      ok: true,
    });
  });

  it("MIME ve uzantı uyuşmazlığını reddeder", () => {
    const file = new File(["x"], "TEST_image.png", { type: "image/webp" });
    expect(validateStorageFile(file, STORAGE_BUCKETS.galleryImages)).toMatchObject({
      ok: false,
      code: "invalid_extension",
    });
  });
});

describe("createStorageObjectPath", () => {
  it("orijinal dosya adını açığa çıkarmayan kapsamlı yol üretir", () => {
    const path = createStorageObjectPath("test_scope_123", validPdfFile());
    expect(path).toMatch(/^test_scope_123\/[0-9a-f-]{36}\.pdf$/);
    expect(path).not.toContain("TEST_cv");
  });
});
