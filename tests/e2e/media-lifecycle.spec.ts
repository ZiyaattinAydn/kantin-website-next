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


test("medya kütüphanesi düzenleme ve güvenli yaşam döngüsü kontrollerini sunar", async ({ page }) => {
  const credentials = adminCredentials();
  test.skip(!credentials, "Yerel TEST admin bilgileri tanımlı değil.");
  await loginAsAdmin(page, credentials!);
  await page.goto("/admin/media");

  const uploadPanel = page.locator("#media-editor");
  await uploadPanel.locator(":scope > summary").click();
  await expect(uploadPanel).toHaveAttribute("open", "");

  const uploadForm = uploadPanel.locator("form");
  await expect(uploadForm).toBeVisible();
  await expect(uploadForm.locator('input[name="file"]')).toHaveAttribute(
    "accept",
    /image\/webp/,
  );
  await expect(uploadForm.locator('input[name="title"]')).toHaveAttribute(
    "placeholder",
    /Menü görseli/,
  );
  await expect(uploadForm.getByRole("button", { name: "Görseli yükle" })).toBeVisible();
  const filterPanel = page.locator('section[aria-label="Medya filtreleri"]');
  await expect(filterPanel.locator('select[name="status"]')).toBeVisible();

  const mediaTable = page.locator('section[aria-label="Medya kütüphanesi tablosu"]');
  await expect(mediaTable).toBeVisible();
  await expect(mediaTable.locator('[data-label="Kullanım"]').first()).toBeVisible();
  await expect(mediaTable.locator('[data-label="İşlem"]').first()).toBeVisible();
  const firstMediaCard = mediaTable.locator('details[id^="media-"]').first();
  await firstMediaCard.locator(":scope > summary").click();
  await expect(firstMediaCard).toHaveAttribute("open", "");
  await expect(
    firstMediaCard.getByRole("heading", { name: "Yayın ve yaşam döngüsü" }),
  ).toBeVisible();
  await expect(
    firstMediaCard.getByText(
      "Arşivleme bağlantıları korur. Kalıcı silme ise bağlı alanları otomatik temizler ve geri alınamaz.",
      { exact: true },
    ),
  ).toBeVisible();
});
