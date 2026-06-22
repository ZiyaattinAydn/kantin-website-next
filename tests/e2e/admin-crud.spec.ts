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

test("admin temel CRUD modüllerini açabilir", async ({ page }) => {
  const credentials = adminCredentials();
  test.skip(!credentials, "Yerel TEST admin bilgileri tanımlı değil.");
  await loginAsAdmin(page, credentials!);

  for (const resource of [
    "menu-categories",
    "menu-items",
    "events",
    "site-settings",
    "content-blocks",
  ]) {
    const response = await page.goto(`/admin/manage/${resource}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();
  }
});
