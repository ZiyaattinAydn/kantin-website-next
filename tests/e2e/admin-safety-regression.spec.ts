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


test("kritik sistem kayıtları oluşturma, kimlik düzenleme ve kalıcı silmeye karşı korunur", async ({ page }) => {
  const credentials = adminCredentials();
  test.skip(!credentials, "Yerel TEST admin bilgileri tanımlı değil.");
  await loginAsAdmin(page, credentials!);

  await page.goto("/admin/manage/site-settings");
  await expect(page.locator("#new-record")).toHaveCount(0);
  await expect(page.getByText("Yeni kayıt oluşturma koruması açık")).toBeVisible();

  const setting = page.locator('details[id^="record-"]').first();
  await setting.locator(":scope > summary").click();
  await expect(setting.locator('input[name="key"]')).toHaveAttribute("readonly", "");

  const advancedFields = setting.locator("details").filter({ hasText: "Gelişmiş alanlar" }).first();
  await advancedFields.locator(":scope > summary").click();
  await expect(setting.getByRole("button", { name: "Gelişmiş düzenlemeyi aç" })).toBeVisible();

  await page.goto("/admin/manage/content-blocks");
  await expect(page.locator("#new-record")).toHaveCount(0);
  const block = page.locator('details[id^="record-"]').first();
  await block.locator(":scope > summary").click();
  await expect(block.locator('select[name="page_id"]')).toBeDisabled();
  await expect(block.locator('input[name="key"]')).toHaveAttribute("readonly", "");
  await expect(block.locator('input[name="block_type"]')).toHaveAttribute("readonly", "");
  await expect(block.getByText("Kalıcı silme koruması açık")).toBeVisible();
  await expect(block.getByRole("button", { name: "Kalıcı olarak sil" })).toHaveCount(0);
});

test("kaydedilmemiş değişiklikte satır geçişini korur ve yalnız tek düzenleme satırı açar", async ({ page }) => {
  const credentials = adminCredentials();
  test.skip(!credentials, "Yerel TEST admin bilgileri tanımlı değil.");
  await loginAsAdmin(page, credentials!);
  await page.goto("/admin/manage/branches");

  const rows = page.locator('details[id^="record-"]');
  expect(await rows.count()).toBeGreaterThanOrEqual(2);
  const first = rows.nth(0);
  const second = rows.nth(1);
  await first.locator(":scope > summary").click();

  const name = first.locator('input[name="name"]');
  const original = await name.inputValue();
  await name.fill(`${original} TEST_DEGISIKLIK`);
  await expect(page.getByText("Kaydedilmemiş değişiklikler var")).toBeVisible();

  page.once("dialog", (dialog) => dialog.dismiss());
  await second.locator(":scope > summary").click();
  await expect(first).toHaveAttribute("open", "");
  await expect(second).not.toHaveAttribute("open", "");

  page.once("dialog", (dialog) => dialog.accept());
  await second.locator(":scope > summary").click();
  await expect(first).not.toHaveAttribute("open", "");
  await expect(second).toHaveAttribute("open", "");
  await expect(name).toHaveValue(original);
  await expect(page.getByText("Kaydedilmemiş değişiklikler var")).toHaveCount(0);
});
