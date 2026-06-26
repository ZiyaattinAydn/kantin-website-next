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
  await expect(page.getByRole("heading", { name: /Kariyer başvuruları/ })).toBeVisible();
  await expect(page.locator('select[name="privacy"]')).toBeVisible();

  const applicationTable = page.locator('section[aria-label="Kariyer başvuruları tablosu"]');
  await expect(applicationTable).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "Veri yaşam döngüsü" }).first(),
  ).toBeVisible();
});
