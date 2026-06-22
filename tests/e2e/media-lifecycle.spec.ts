import { expect, test, type Page } from "@playwright/test";

function adminCredentials() {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  return email && password ? { email, password } : null;
}

async function loginAsAdmin(
  page: Page,
  credentials: { email: string; password: string },
) {
  await page.goto("/admin/login");
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole("button", { name: /Giriş yap$/ }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("medya kütüphanesi TEST_ güvenlik kontrollerini sunar", async ({ page }) => {
  const credentials = adminCredentials();
  test.skip(!credentials, "Yerel TEST admin bilgileri tanımlı değil.");
  await loginAsAdmin(page, credentials!);
  await page.goto("/admin/media");

  await expect(page.locator('input[name="file"]')).toHaveAttribute(
    "accept",
    /image\/webp/,
  );
  await expect(page.locator('input[name="title"]')).toHaveAttribute(
    "placeholder",
    /TEST_/,
  );
  await expect(page.getByRole("button", { name: "Görseli yükle" })).toBeVisible();
  await expect(page.locator('select[name="status"]')).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Kullanım" })).toBeVisible();
  await expect(page.locator("aside")).toContainText("public bucket nesnesini silmez");
});
