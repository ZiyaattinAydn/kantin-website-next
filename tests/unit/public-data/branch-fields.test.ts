import { describe, expect, it } from "vitest";
import { mapBranch, parseOpeningHours } from "@/lib/public-data/common";

describe("admin şube alanları", () => {
  it("çalışma saati notice ve satırlarını normalize eder", () => {
    expect(parseOpeningHours({
      notice: "TEST_ Bayram saatleri değişebilir",
      items: [
        { label: "Pazartesi-Cuma", hours: "09:00-23:00" },
        "Cumartesi: 10:00-00:00",
      ],
    })).toEqual([
      "TEST_ Bayram saatleri değişebilir",
      "Pazartesi-Cuma: 09:00-23:00",
      "Cumartesi: 10:00-00:00",
    ]);
  });

  it("telefon, e-posta, açıklama ve saatleri public şube modeline taşır", () => {
    const branch = mapBranch({
      slug: "alsancak",
      code: "ALS",
      name: "TEST_ Alsancak",
      short_description: "TEST_ Kısa açıklama",
      address_line: "TEST_ Adres",
      district: "Konak",
      city: "İzmir",
      maps_url: "https://maps.example/test",
      phone: "+90 555 000 00 00",
      public_email: "test@example.com",
      opening_hours: { note: "Her gün 10:00-00:00" },
      features: ["TEST_ Özellik"],
      is_active: true,
      sort_order: 1,
    });

    expect(branch).toMatchObject({
      shortDescription: "TEST_ Kısa açıklama",
      phone: "+90 555 000 00 00",
      publicEmail: "test@example.com",
      openingHours: ["Her gün 10:00-00:00"],
    });
  });
  it("tanımlı iki şube dışındaki geçerli slug ve kodu da kabul eder", () => {
    const branch = mapBranch({
      slug: "bostanli",
      code: "BOS",
      name: "TEST_ Bostanlı",
      short_description: null,
      address_line: "TEST_ Adres",
      district: "Bostanlı",
      city: "İzmir",
      maps_url: "https://maps.example/bostanli",
      phone: null,
      public_email: null,
      opening_hours: {},
      features: [],
      is_active: true,
      sort_order: 3,
    });

    expect(branch).toMatchObject({
      id: "bostanli",
      code: "BOS",
      name: "TEST_ Bostanlı",
    });
  });

});
