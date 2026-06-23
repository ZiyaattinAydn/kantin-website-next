import { describe, expect, it } from "vitest";
import {
  mergeLocationsWithAdmin,
  mergeMenuBranchesWithAdmin,
} from "@/lib/public-data/home";
import { fallbackHomeData } from "@/lib/public-data/fallbacks";

describe("ana sayfa admin şube eşleşmesi", () => {
  it("menü kartı adı, açıklaması ve etiketlerini branches tablosundan alır", () => {
    const [result] = mergeMenuBranchesWithAdmin(
      [fallbackHomeData.menuBranches[0]],
      [{
        slug: "alsancak",
        code: "ALS",
        name: "TEST_ Yeni şube adı",
        short_description: "TEST_ Yeni açıklama",
        features: ["TEST_ Yeni özellik"],
      }],
    );

    expect(result).toMatchObject({
      code: "ALS",
      name: "TEST_ Yeni şube adı",
      description: "TEST_ Yeni açıklama",
      tags: ["TEST_ Yeni özellik"],
    });
  });

  it("konum kartı adresini ve harita bağlantısını branches tablosundan alır", () => {
    const [result] = mergeLocationsWithAdmin(
      [fallbackHomeData.locationBranches[0]],
      [{
        slug: "alsancak",
        code: "ALS",
        name: "Alsancak",
        address_line: "TEST_ Yeni adres",
        district: "TEST_ İlçe",
        city: "İzmir",
        short_description: "TEST_ Konum açıklaması",
        maps_url: "https://maps.example/new",
      }],
    );

    expect(result).toMatchObject({
      title: "TEST_ Yeni adres",
      address: "TEST_ İlçe / İzmir",
      description: "TEST_ Konum açıklaması",
      mapsUrl: "https://maps.example/new",
    });
  });

  it("içerik bloğunda bulunmayan üçüncü şube için genel kartlar üretir", () => {
    const menuBranches = mergeMenuBranchesWithAdmin(
      fallbackHomeData.menuBranches,
      [{
        slug: "bostanli",
        code: "BOS",
        name: "TEST_ Bostanlı",
        short_description: "TEST_ Üçüncü şube",
        features: ["TEST_ Bahçe"],
      }],
    );
    const locations = mergeLocationsWithAdmin(
      fallbackHomeData.locationBranches,
      [{
        slug: "bostanli",
        code: "BOS",
        name: "TEST_ Bostanlı",
        address_line: "TEST_ 1. Sokak No:1",
        district: "Bostanlı",
        city: "İzmir",
        short_description: "TEST_ Üçüncü şube",
        maps_url: "https://maps.example/bostanli",
      }],
    );

    expect(menuBranches).toEqual([
      expect.objectContaining({
        slug: "bostanli",
        code: "BOS",
        name: "TEST_ Bostanlı",
        image: undefined,
      }),
    ]);
    expect(locations).toEqual([
      expect.objectContaining({
        slug: "bostanli",
        code: "BOS",
        visualClass: "branch-generic",
        images: [],
      }),
    ]);
  });
});
