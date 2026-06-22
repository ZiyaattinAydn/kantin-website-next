import { describe, expect, it } from "vitest";
import {
  adminPageRange,
  createAdminPagination,
  normaliseAdminSearch,
  parseAdminPage,
} from "@/lib/admin/pagination";

describe("admin pagination", () => {
  it("geçersiz sayfayı bire döndürür", () => {
    expect(parseAdminPage("-2")).toBe(1);
    expect(parseAdminPage("test")).toBe(1);
  });

  it("25 kayıtlık ikinci sayfa aralığını hesaplar", () => {
    expect(adminPageRange(2)).toEqual({ from: 25, to: 49 });
  });

  it("arama metnini PostgREST filtre ayraçlarından temizler", () => {
    expect(normaliseAdminSearch("  TEST_,foo.(bar)%  ")).toBe("TEST foo bar");
  });

  it("toplam sayfa ve kayıt sayısını üretir", () => {
    expect(createAdminPagination(51, 2)).toEqual({
      page: 2,
      pageSize: 25,
      pageCount: 3,
      total: 51,
    });
  });
});
