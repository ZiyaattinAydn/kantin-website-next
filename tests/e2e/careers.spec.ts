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

test("kariyer formu gerekli kişisel veri ve CV kontrollerini gösterir", async ({ page }) => {
  await page.goto("/careers");

  await expect(page.locator('input[name="fullName"]')).toBeVisible();
  await expect(page.locator('input[name="cv"]')).toHaveAttribute(
    "accept",
    /application\/pdf/,
  );
  await expect(page.locator('input[name="consent"]')).toBeVisible();
});

test("admin kariyer başvuruları listesine erişebilir", async ({ page }) => {
  const credentials = adminCredentials();
  test.skip(!credentials, "Yerel TEST admin bilgileri tanımlı değil.");
  await loginAsAdmin(page, credentials!);

  const response = await page.goto("/admin/applications");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('select[name="privacy"]')).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Veri yaşam döngüsü" })).toBeVisible();
});
