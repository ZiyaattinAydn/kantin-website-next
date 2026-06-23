import { expect, test } from "@playwright/test";

test("public sayfalar Supabase kesintisinde fallback ile açılır", async ({
  page,
  request,
}) => {
  test.setTimeout(90_000);

  test.skip(
    process.env.E2E_EXPECT_FALLBACK !== "1",
    "Bu senaryo yalnız fallback hedefi bilinçli olarak hazırlandığında çalışır.",
  );

  const health = await request.get("/api/health/public-data");
  expect(health.status()).toBe(503);
  await expect(health.json()).resolves.toMatchObject({
    ok: false,
    degraded: true,
  });

  for (const path of ["/", "/menu?sube=alsancak", "/events"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("#main")).toBeVisible();
  }
});
