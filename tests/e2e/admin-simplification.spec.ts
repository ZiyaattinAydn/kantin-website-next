import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  const email = process.env.E2E_ADMIN_EMAIL,
    password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email || !password, "Yerel TEST admin hesabı gerekli.");
  await page.goto("/admin/login");
  await page.getByLabel("E-posta", { exact: true }).fill(email!);
  await page.getByLabel("Şifre", { exact: true }).fill(password!);
  await page.getByRole("button", { name: /Giriş yap$/ }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
});
test("task dashboard, unified navigation and secondary logs", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: "Bugün ne yapmak istiyorsunuz?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Menü fiyatı değiştir/ }),
  ).toBeVisible();
  await expect(page.getByText("Gelişmiş Yönetim", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: "Varyant kayıtları" }),
  ).toHaveCount(0);
  if (
    await page.getByRole("button", { name: "Yönetim menüsünü aç" }).isVisible()
  )
    await page.getByRole("button", { name: "Yönetim menüsünü aç" }).click();
  await page
    .getByRole("link", { name: "Sistem Kayıtları / Teknik Loglar" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sistem Kayıtları / Teknik Loglar" }),
  ).toBeVisible();
  await expect(page.getByLabel("Hata seviyesi")).toBeVisible();
});
test("menu wizard, search and tablet forms fit screen", async ({ page }) => {
  await page.goto("/admin/menu?new=1");
  await expect(page.getByLabel("Ürün adı")).toBeVisible();
  await page.getByLabel("Ürün adı").fill("TEST_Wizard no-write");
  await page.getByRole("button", { name: "Devam", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hangi şubelerde satılıyor?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Düzenlemeyi kapat" })
    .click();
  await page.getByRole("button", { name: "Kaydetmeden çık" }).click();
  await page.goto("/admin/site");
  await expect(
    page.getByRole("heading", { name: "Site", level: 1 }),
  ).toBeVisible();
  await page.getByLabel("Panelde ara").fill("footer");
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Arama sonuçları" }),
  ).toBeVisible();
});
