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
        name: "TEST_ Yeni şube adı",
        short_description: "TEST_ Yeni açıklama",
        features: ["TEST_ Yeni özellik"],
      }],
    );

    expect(result).toMatchObject({
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
});
