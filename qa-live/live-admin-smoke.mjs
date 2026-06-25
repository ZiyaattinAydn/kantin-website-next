import { chromium, devices } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BASE_URL = (process.env.QA_BASE_URL || 'https://kantin-website-ziyaattinaydns-projects.vercel.app').replace(/\/$/, '');
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const HEADLESS = process.env.QA_HEADLESS !== '0';

if (!EMAIL || !PASSWORD) {
  throw new Error('E2E_ADMIN_EMAIL ve E2E_ADMIN_PASSWORD ortam değişkenleri gerekli.');
}

const allowedHosts = new Set([
  'kantin-website-ziyaattinaydns-projects.vercel.app',
  'localhost',
  '127.0.0.1',
]);
const target = new URL(BASE_URL);
if (!allowedHosts.has(target.hostname) && process.env.QA_ALLOW_OTHER_HOST !== '1') {
  throw new Error(`Güvenlik nedeniyle bu hedefe izin verilmiyor: ${target.hostname}`);
}

const routes = [
  '/admin',
  '/admin/pricing',
  '/admin/media',
  '/admin/applications',
  '/admin/manage/menu-categories',
  '/admin/manage/menu-category-branches',
  '/admin/manage/menu-items',
  '/admin/manage/menu-item-branches',
  '/admin/manage/menu-item-variants',
  '/admin/manage/events',
  '/admin/manage/event-branches',
  '/admin/manage/merch-products',
  '/admin/manage/merch-product-branches',
  '/admin/manage/instagram-posts',
  '/admin/manage/site-pages',
  '/admin/manage/content-blocks',
  '/admin/manage/branches',
  '/admin/theme',
  '/admin/manage/site-settings',
];

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const resultDir = path.resolve(process.cwd(), 'qa-live-results', stamp);
await fs.mkdir(resultDir, { recursive: true });

async function launchBrowser() {
  const errors = [];
  if (process.platform === 'win32') {
    for (const channel of ['msedge', 'chrome']) {
      try {
        return await chromium.launch({ channel, headless: HEADLESS });
      } catch (error) {
        errors.push(`${channel}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  try {
    return await chromium.launch({ headless: HEADLESS });
  } catch (error) {
    errors.push(`bundled chromium: ${error instanceof Error ? error.message : String(error)}`);
  }
  throw new Error(`Tarayıcı başlatılamadı. Önce "npx playwright install chromium" çalıştır.\n${errors.join('\n')}`);
}

function safeFileName(route) {
  return route.replace(/^\//, '').replaceAll('/', '-') || 'root';
}

async function login(page) {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/admin', { timeout: 45_000 }),
    page.getByRole('button', { name: /^Giriş yap$/ }).click(),
  ]);
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
}

async function openFirstDynamicRow(page, route) {
  const selectors = route === '/admin/pricing'
    ? ['details[data-admin-accordion-item="true"] > summary']
    : route === '/admin/media'
      ? ['details[id^="media-"] > summary']
      : route === '/admin/applications'
        ? ['details[id^="application-"] > summary']
        : route.includes('/admin/manage/')
          ? ['details[id^="record-"] > summary']
          : [];

  for (const selector of selectors) {
    const summary = page.locator(selector).first();
    if (await summary.count() === 0 || !(await summary.isVisible().catch(() => false))) continue;
    const details = summary.locator('..');
    const before = await details.getAttribute('open');
    await summary.click();
    await page.waitForTimeout(250);
    const after = await details.getAttribute('open');
    return {
      attempted: true,
      opened: before === null && after !== null,
      formCount: await details.locator('form').count(),
      inputCount: await details.locator('input, select, textarea').count(),
    };
  }
  return { attempted: false, opened: false, formCount: 0, inputCount: 0 };
}

async function testDirtyGuard(page) {
  await page.goto(`${BASE_URL}/admin/manage/menu-items`, { waitUntil: 'networkidle', timeout: 45_000 });
  const summary = page.locator('details[id^="record-"] > summary').first();
  if (!(await summary.isVisible().catch(() => false))) return { skipped: 'Düzenlenebilir ürün kaydı bulunamadı.' };
  await summary.click();
  const details = summary.locator('..');
  const input = details.locator('input[type="text"]:not([readonly]):not([disabled])').first();
  if (!(await input.isVisible().catch(() => false))) return { skipped: 'Değiştirilebilir metin alanı bulunamadı.' };
  const original = await input.inputValue();
  await input.fill(`${original} QA`);

  let dialogSeen = false;
  page.once('dialog', async (dialog) => {
    dialogSeen = true;
    await dialog.dismiss();
  });
  await page.getByRole('link', { name: 'Ana ekran' }).first().click();
  await page.waitForTimeout(500);
  const stayed = new URL(page.url()).pathname.includes('/admin/manage/menu-items');
  return { dialogSeen, stayed, originalValueRestored: (await input.inputValue().catch(() => '')) === `${original} QA` };
}

async function testMobileMenu(page) {
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 45_000 });
  const button = page.getByRole('button', { name: /Yönetim|Kapat/ }).first();
  if (!(await button.isVisible().catch(() => false))) return { skipped: 'Mobil yönetim düğmesi görünmedi.' };
  await button.click();
  const expanded = await button.getAttribute('aria-expanded');
  const sidebarVisible = await page.locator('#admin-sidebar').isVisible().catch(() => false);
  const closeButton = page.getByRole('button', { name: /Kapat/ }).first();
  if (await closeButton.isVisible().catch(() => false)) await closeButton.click();
  return { expanded, sidebarVisible };
}

async function runProfile(browser, profile) {
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  let currentRoute = '/admin/login';

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push({ route: currentRoute, text: message.text() });
  });
  page.on('pageerror', (error) => pageErrors.push({ route: currentRoute, text: error.message }));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('/_next/image') && request.failure()?.errorText?.includes('ERR_ABORTED')) return;
    failedRequests.push({ route: currentRoute, method: request.method(), url, error: request.failure()?.errorText || '' });
  });

  const output = {
    profile: profile.name,
    login: null,
    routes: [],
    dirtyGuard: null,
    mobileMenu: null,
    consoleErrors,
    pageErrors,
    failedRequests,
  };

  const loginStarted = Date.now();
  await login(page);
  output.login = {
    ok: new URL(page.url()).pathname === '/admin',
    durationMs: Date.now() - loginStarted,
    finalUrl: page.url(),
  };
  await page.screenshot({ path: path.join(resultDir, `${profile.name}-00-dashboard.png`), fullPage: true });

  let index = 1;
  for (const route of routes) {
    currentRoute = route;
    const started = Date.now();
    let response;
    let navigationError;
    try {
      response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 45_000 });
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error);
    }
    await page.waitForTimeout(250);

    const finalPath = new URL(page.url()).pathname;
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const dynamicRow = navigationError ? null : await openFirstDynamicRow(page, route);
    const routeResult = {
      route,
      status: response?.status() ?? null,
      finalPath,
      durationMs: Date.now() - started,
      navigationError: navigationError || null,
      redirectedToLogin: finalPath === '/admin/login',
      h1: await page.locator('h1').first().innerText().catch(() => ''),
      horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth).catch(() => null),
      emptyState: /eşleşen kayıt bulunamadı|henüz .* bulunmuyor/i.test(bodyText),
      dynamicRow,
      visibleErrorMessages: await page.locator('[role="alert"], [class*="error" i]').filter({ visible: true }).allTextContents().catch(() => []),
    };
    output.routes.push(routeResult);
    await page.screenshot({ path: path.join(resultDir, `${profile.name}-${String(index).padStart(2, '0')}-${safeFileName(route)}.png`), fullPage: true });
    index += 1;
  }

  if (profile.name === 'desktop') {
    currentRoute = 'dirty-guard';
    output.dirtyGuard = await testDirtyGuard(page).catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));
  } else {
    currentRoute = 'mobile-menu';
    output.mobileMenu = await testMobileMenu(page).catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));
  }

  await context.close();
  return output;
}

function createMarkdown(report) {
  const lines = [
    '# Kantin Canlı Admin Kabul Testi',
    '',
    `- Tarih: ${report.createdAt}`,
    `- Hedef: ${report.baseUrl}`,
    '- Mod: Salt okunur (kayıt oluşturma, kaydetme veya silme yapılmadı)',
    '',
  ];
  for (const profile of report.profiles) {
    lines.push(`## ${profile.profile === 'desktop' ? 'Masaüstü' : 'Mobil'}`, '');
    lines.push(`- Giriş: ${profile.login?.ok ? 'Başarılı' : 'Başarısız'}`);
    lines.push(`- Konsol hatası: ${profile.consoleErrors.length}`);
    lines.push(`- Sayfa hatası: ${profile.pageErrors.length}`);
    lines.push(`- Başarısız istek: ${profile.failedRequests.length}`);
    lines.push('');
    lines.push('| Rota | HTTP | Başlık | Taşma | Dinamik satır | Sonuç |');
    lines.push('|---|---:|---|---|---|---|');
    for (const item of profile.routes) {
      const ok = !item.navigationError && !item.redirectedToLogin && item.status && item.status < 400;
      lines.push(`| \`${item.route}\` | ${item.status ?? '—'} | ${String(item.h1 || '—').replaceAll('|', '\\|')} | ${item.horizontalOverflow ? 'Var' : 'Yok'} | ${item.dynamicRow?.attempted ? (item.dynamicRow.opened ? 'Açıldı' : 'Açılamadı') : 'Yok'} | ${ok ? '✅' : '❌'} |`);
    }
    lines.push('');
    if (profile.dirtyGuard) lines.push(`- Kaydedilmemiş değişiklik koruması: \`${JSON.stringify(profile.dirtyGuard)}\``);
    if (profile.mobileMenu) lines.push(`- Mobil menü: \`${JSON.stringify(profile.mobileMenu)}\``);
    lines.push('');
  }
  lines.push('## Not', '', 'Bu rapor şifre, erişim anahtarı veya oturum çerezi içermez.');
  return lines.join('\n');
}

const browser = await launchBrowser();
let report;
try {
  const profiles = [
    { name: 'desktop', context: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', context: { ...devices['Pixel 7'] } },
  ];
  const results = [];
  for (const profile of profiles) results.push(await runProfile(browser, profile));
  report = { createdAt: new Date().toISOString(), baseUrl: BASE_URL, profiles: results };
} finally {
  await browser.close();
}

await fs.writeFile(path.join(resultDir, 'report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(resultDir, 'REPORT.md'), createMarkdown(report));
console.log(`\nTest tamamlandı: ${resultDir}`);
console.log(`Rapor: ${path.join(resultDir, 'REPORT.md')}`);
