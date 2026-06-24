import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeData = readFileSync("src/lib/public-data/home.ts", "utf8");
const menuData = readFileSync("src/lib/public-data/merch.ts", "utf8");
const homeMerch = readFileSync("src/components/home/HomeMerchDrop.tsx", "utf8");
const menuMerch = readFileSync("src/components/merch/MenuMerchShowcase.tsx", "utf8");
const merchCard = readFileSync("src/components/cards/MerchCard.tsx", "utf8");

describe("merch medya değiştirme kontratı", () => {
  it("ön ve arka tişört görsellerini aktif medya kayıtlarından çözer", () => {
    for (const source of [homeData, menuData]) {
      expect(source).toContain("getPublicMediaRowsByMetadata");
      expect(source).toContain('{ product_slug: "oversize-tshirt" }');
      expect(source).toContain('stringValue(metadata.view) === "back"');
      expect(source).toContain("backImage:");
    }
  });

  it("public bileşenlerde eski sabit tişört yollarına geri dönmez", () => {
    for (const source of [homeMerch, menuMerch]) {
      expect(source).not.toContain("/assets/img/merch/tee-front.jpg");
      expect(source).not.toContain("/assets/img/merch/tee-back.jpg");
      expect(source).toContain("merch-face-empty");
    }
  });

  it("arşivlenen veya silinen ürün görsellerinde kırık img yerine placeholder gösterir", () => {
    expect(merchCard).toContain("MissingMerchImage");
    expect(merchCard).toContain("const hasImage = Boolean(product.image)");
    expect(merchCard).toContain("merch-image-empty");
  });
});
