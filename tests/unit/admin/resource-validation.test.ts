import { describe, expect, it } from "vitest";
import {
  AdminValidationError,
  parseAdminResourcePayload,
} from "@/lib/admin/resource-validation";
import { getAdminResource } from "@/lib/admin/resources";

function resource(key: string) {
  const value = getAdminResource(key);
  if (!value) throw new Error(`TEST_ resource bulunamadı: ${key}`);
  return value;
}

function baseMenuItemBranch() {
  const formData = new FormData();
  formData.set("menu_item_id", "11111111-1111-4111-8111-111111111111");
  formData.set("branch_id", "22222222-2222-4222-8222-222222222222");
  formData.set("price_cents", "12,34");
  formData.set("is_active", "on");
  return formData;
}

describe("parseAdminResourcePayload", () => {
  it("para, tam sayı, checkbox ve UUID alanlarını tipli payload'a çevirir", () => {
    const payload = parseAdminResourcePayload(resource("menu-item-branches"), baseMenuItemBranch());

    expect(payload).toMatchObject({
      branch_id: "22222222-2222-4222-8222-222222222222",
      is_active: true,
      price_cents: 1234,
    });
    expect(payload).not.toHaveProperty("sort_order");
  });

  it("foreign alanda serbest metni reddeder", () => {
    const formData = baseMenuItemBranch();
    formData.set("branch_id", "TEST_branch");

    expect(() => parseAdminResourcePayload(resource("menu-item-branches"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "branch_id", code: "foreign_id" }),
    );
  });

  it("select alanında seçenek listesi dışındaki değeri reddeder", () => {
    const formData = new FormData();
    formData.set("name", "TEST_ Kategori");
    formData.set("slug", "test-kategori");
    formData.set("display_type", "bilinmeyen");
    formData.set("status", "draft");

    expect(() => parseAdminResourcePayload(resource("menu-categories"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "display_type", code: "option" }),
    );
  });

  it("JSON sözdizimini, nesne biçimini ve tehlikeli anahtarları reddeder", () => {
    const formData = new FormData();
    formData.set("page_id", "33333333-3333-4333-8333-333333333333");
    formData.set("key", "TEST_block");
    formData.set("block_type", "hero");
    formData.set("content", "[]");
    formData.set("status", "draft");

    expect(() => parseAdminResourcePayload(resource("content-blocks"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "content", code: "json_shape" }),
    );

    formData.set("content", '{"__proto__":{"polluted":true}}');
    expect(() => parseAdminResourcePayload(resource("content-blocks"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "content", code: "json_key" }),
    );
  });

  it("şube çalışma saatlerinde gün ve saat çiftini doğrular", () => {
    const formData = new FormData();
    formData.set("name", "TEST_ Şube");
    formData.set("short_description", "TEST");
    formData.set("address_line", "TEST adres");
    formData.set("district", "Konak");
    formData.set("city", "İzmir");
    formData.set("maps_url", "https://example.com/maps");
    formData.set("opening_hours", '{"items":[{"day":"Pazartesi"}]}');
    formData.set("status", "draft");

    expect(() => parseAdminResourcePayload(resource("branches"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "opening_hours", code: "json_shape" }),
    );
  });

  it("tema ayarlarının DB constraint'iyle aynı seçim kümesini uygular", () => {
    const formData = new FormData();
    formData.set("key", "theme.settings");
    formData.set("value", JSON.stringify({
      fontPreset: "brand",
      colorPreset: "kantin",
      headingScale: "balanced",
      bodyScale: "balanced",
      cardDensity: "airy",
      homeSectionOrder: ["menu", "merch", "memories", "events", "branches"],
    }));
    formData.set("status", "published");

    expect(parseAdminResourcePayload(resource("site-settings"), formData).value).toMatchObject({
      cardDensity: "airy",
    });

    formData.set("value", JSON.stringify({
      fontPreset: "comic-sans",
      colorPreset: "kantin",
      headingScale: "balanced",
      bodyScale: "balanced",
      cardDensity: "airy",
      homeSectionOrder: ["menu", "merch", "memories", "events", "branches"],
    }));
    expect(() => parseAdminResourcePayload(resource("site-settings"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "value", code: "json_shape" }),
    );
  });

  it("duyuru payload'ını tarih zorunluluğu olmadan kabul eder", () => {
    const formData = new FormData();
    formData.set("content_type", "announcement");
    formData.set("title", "TEST_ Duyuru");
    formData.set("slug", "test-duyuru");
    formData.set("status", "published");
    formData.set("is_active", "on");
    formData.set("publish_start_at", "2026-06-23T10:00");
    formData.set("publish_end_at", "2099-06-23T10:00");

    const payload = parseAdminResourcePayload(resource("events"), formData);

    expect(payload).toMatchObject({
      content_type: "announcement",
      title: "TEST_ Duyuru",
      start_at: null,
      description: null,
    });
  });

  it("etkinlik payload'ında başlangıç ve açıklamayı zorunlu tutar", () => {
    const formData = new FormData();
    formData.set("content_type", "event");
    formData.set("title", "TEST_ Etkinlik");
    formData.set("slug", "test-etkinlik");
    formData.set("status", "published");

    expect(() => parseAdminResourcePayload(resource("events"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "description", code: "required" }),
    );

    formData.set("description", "TEST_ Etkinlik açıklaması");
    expect(() => parseAdminResourcePayload(resource("events"), formData)).toThrowError(
      expect.objectContaining<Partial<AdminValidationError>>({ field: "start_at", code: "required" }),
    );
  });
});
