import { expect, test, type Page } from "@playwright/test";

type AdminCredentials = { email: string; password: string };

function adminCredentials(): AdminCredentials | null {
  const email = process.env.E2E_ADMIN_EMAIL?.trim();
  const password = process.env.E2E_ADMIN_PASSWORD;
  return email && password ? { email, password } : null;
}

async function visibleLoginMessage(page: Page): Promise<string> {
  const candidates = page.locator('[role="alert"], [role="status"]');
  const count = await candidates.count();
  for (let index = count - 1; index >= 0; index -= 1) {
    const candidate = candidates.nth(index);
    if (await candidate.isVisible().catch(() => false)) {
      return (await candidate.textContent())?.trim() ?? "";
    }
  }
  return "";
}

async function loginAsAdmin(page: Page, credentials: AdminCredentials) {
  const maxAttempts = 3;
  let lastMessage = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="email"]').fill(credentials.email);
    await page.locator('input[name="password"]').fill(credentials.password);
    await page.getByRole("button", { name: /Giriş yap$/ }).click();

    try {
      await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15_000 });
      return;
    } catch {
      lastMessage = await visibleLoginMessage(page);
      if (attempt < maxAttempts) await page.waitForTimeout(attempt * 750);
    }
  }

  throw new Error(
    `Yerel TEST admin girişi ${maxAttempts} denemede tamamlanamadı.${
      lastMessage ? ` Son mesaj: ${lastMessage}` : ""
    }`,
  );
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

    const resourcePage = page.locator(`#admin-resource-${resource}`);
    await expect(resourcePage).toBeVisible();
    await expect(resourcePage.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(resourcePage.locator('input[type="search"]')).toBeVisible();
    await expect(resourcePage.locator('section[aria-label$=" tablosu"]')).toBeVisible();
  }
});

test("admin birleşik fiyat yönetiminde filtreleri ve ürün tablosunu kullanabilir", async ({ page }) => {
  const credentials = adminCredentials();
  test.skip(!credentials, "Yerel TEST admin bilgileri tanımlı değil.");
  await loginAsAdmin(page, credentials!);

  const response = await page.goto("/admin/pricing");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /Fiyat yönetimi/ })).toBeVisible();
  await expect(page.locator('input[name="q"]')).toBeVisible();
  await expect(page.locator('select[name="category"]')).toBeVisible();
  await expect(page.locator('select[name="branch"]')).toBeVisible();
  await expect(page.locator('select[name="active"]')).toBeVisible();
  await expect(page.locator('input[name="missing"]')).toBeVisible();

  const pricingTable = page.locator('section[aria-label="Birleşik fiyat yönetimi tablosu"]');
  await expect(pricingTable).toBeVisible();
  await expect(pricingTable.locator('[data-label="Şube fiyatları"]').first()).toBeVisible();
});
