import {test,expect} from "@playwright/test";
test.beforeEach(async({page})=>{
  page.on("dialog", dialog => dialog.accept());
  const email=process.env.E2E_ADMIN_EMAIL, password=process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email||!password,"Yerel TEST admin hesabı gerekli.");
  await page.goto("/admin/login");await page.getByLabel("E-posta",{exact:true}).fill(email!);await page.getByLabel("Şifre",{exact:true}).fill(password!);
  await page.getByRole("button",{name:/Giriş yap$/}).click();await expect(page).toHaveURL(/\/admin\/?$/);
});
test("task dashboard, simple navigation and advanced logs",async({page})=>{
  await expect(page.getByRole("heading",{name:"Bugün ne yapmak istiyorsunuz?"})).toBeVisible();
  await expect(page.getByRole("link",{name:/Menü fiyatı değiştir/})).toBeVisible();
  const advanced=page.locator("details").filter({has:page.getByText("Gelişmiş Yönetim",{exact:true})});await expect(advanced).not.toHaveAttribute("open");
  if(await page.getByRole("button",{name:"Yönetim menüsünü aç"}).isVisible())await page.getByRole("button",{name:"Yönetim menüsünü aç"}).click();
  await advanced.locator("summary").click();await page.getByRole("link",{name:"Sistem Kayıtları / Teknik Loglar"}).click();
  await expect(page.getByRole("heading",{name:"Sistem Kayıtları / Teknik Loglar"})).toBeVisible();await expect(page.getByLabel("Hata seviyesi")).toBeVisible();
});
test("menu wizard, search and tablet forms fit screen",async({page})=>{
  await page.goto("/admin/menu?new=1");await expect(page.getByLabel("Ürün adı")).toBeVisible();
  await page.getByLabel("Ürün adı").fill("TEST_Wizard no-write");await page.getByRole("button",{name:"Devam",exact:true}).click();await expect(page.getByRole("heading",{name:"Hangi şubelerde satılıyor?"})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.goto("/admin/content");await expect(page.getByRole("heading",{name:"Site İçeriğini Düzenle"})).toBeVisible();
  await page.getByLabel("Panelde ara").fill("footer");await page.getByRole("button",{name:"Ara",exact:true}).click();await expect(page.getByRole("heading",{name:"Arama sonuçları"})).toBeVisible();
});
