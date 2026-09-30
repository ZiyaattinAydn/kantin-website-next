import { expect, test } from "@playwright/test";

const routes = ["/", "/menu", "/etkinlikler", "/kariyer"];
const viewports = [
  { name: "320", width: 320, height: 720 },
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
];

for (const viewport of viewports) {
  test.describe(`responsive ${viewport.name}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of routes) {
      test(`${route} yatay taşma üretmiyor`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        expect(
          overflow.scrollWidth,
          `${route} için document genişliği viewport'u aşıyor`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1);
      });
    }
  });
}
