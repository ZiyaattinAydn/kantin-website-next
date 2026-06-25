import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BASE_URL = (process.env.QA_BASE_URL || 'https://kantin-website-ziyaattinaydns-projects.vercel.app').replace(/\/$/, '');
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const HEADLESS = process.env.QA_HEADLESS !== '0';
const WRITE_CONFIRM = process.env.QA_WRITE_CONFIRM;
const REQUIRED_CONFIRM = 'TEST_YAZMA_TESTI_ONAYLI';

if (!EMAIL || !PASSWORD) {
  throw new Error('E2E_ADMIN_EMAIL ve E2E_ADMIN_PASSWORD ortam değişkenleri gerekli.');
}
if (WRITE_CONFIRM !== REQUIRED_CONFIRM) {
  throw new Error(`Canlı yazma testi için QA_WRITE_CONFIRM=${REQUIRED_CONFIRM} gerekli.`);
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

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const shortStamp = stamp.replaceAll('-', '').slice(0, 15);
const prefix = `TEST_QA_${shortStamp}`;
const categoryName = `${prefix}_KATEGORI`;
const categorySlug = `${prefix.toLowerCase().replaceAll('_', '-')}-kategori`;
const productName = `${prefix}_URUN`;
const productSlug = `${prefix.toLowerCase().replaceAll('_', '-')}-urun`;
const duplicateCategoryName = `${prefix}_DUPLICATE`;
const knownStaleCategoryNames = Object.freeze([]);
const knownStaleCategoryPrefixes = Object.freeze([
  'TEST_QA_20260625T002810_',
  'TEST_QA_20260625T003921_',
]);
const resultDir = path.resolve(process.cwd(), 'qa-live-write-results', stamp);
await fs.mkdir(resultDir, { recursive: true });

const report = {
  createdAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  prefix,
  mode: 'Canlı TEST_ yazma kabul testi',
  steps: [],
  createdRecords: [],
  cleanup: [],
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  mutationRequests: [],
  submitOutcomes: [],
  warnings: [],
  mainFlowCompleted: false,
  success: false,
  toolVersion: '5.0.0',
};

function addStep(name, ok, details = {}) {
  report.steps.push({ name, ok, at: new Date().toISOString(), ...details });
  console.log(`${ok ? '✓' : '✗'} ${name}${details.message ? ` — ${details.message}` : ''}`);
}

async function screenshot(page, name) {
  const safe = name.replace(/[^a-zA-Z0-9_-]+/g, '-');
  await page.screenshot({ path: path.join(resultDir, `${String(report.steps.length).padStart(2, '0')}-${safe}.png`), fullPage: true }).catch(() => undefined);
}

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

async function waitForAdminNavigation(page, timeout = 45_000) {
  await page.waitForFunction(() => {
    const pathname = window.location.pathname.replace(/\/+$/, '');
    return pathname.startsWith('/admin') && pathname !== '/admin/login';
  }, undefined, { timeout });
  await page.waitForTimeout(300);
}

async function login(page) {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await Promise.all([
    waitForAdminNavigation(page),
    page.getByRole('button', { name: /^Giriş yap$/ }).click(),
  ]);
  if (new URL(page.url()).pathname === '/admin/login') {
    throw new Error('Yönetici girişi başarısız.');
  }
}

function resourceUrl(resource, params = '') {
  return `${BASE_URL}/admin/manage/${resource}${params}`;
}

function directSummary(details) {
  return details.locator(':scope > summary').first();
}

function assertSafeTestLabel(label) {
  if (typeof label !== 'string' || !label.startsWith('TEST_QA_')) {
    throw new Error(`Güvenlik engeli: TEST_QA_ öneki olmayan kayıt değiştirilemez: ${String(label)}`);
  }
}

function searchQueryForLabel(label) {
  const text = String(label || '').trim();
  if (!text.startsWith('TEST_QA_')) return text;
  const uniqueStamp = text.match(/\d{8}T\d{6}/)?.[0];
  if (uniqueStamp) return uniqueStamp;
  return text.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function ensureDetailsOpen(details, label = 'Panel') {
  const isOpen = await details.evaluate((element) => element.open === true);

  if (!isOpen) {
    await directSummary(details).click();
  }

  const opened = await details.evaluate((element) => element.open === true);

  if (!opened) {
    throw new Error(`${label} açılamadı.`);
  }
}


function normalizePathname(value) {
  const normalized = String(value || '').replace(/\/+$/, '');
  return normalized || '/';
}

function parseOutcomeUrl(value, keys = ['notice', 'error']) {
  if (!value) return null;
  try {
    const url = new URL(String(value).split(';')[0], BASE_URL);
    for (const key of keys) {
      if (url.searchParams.has(key)) {
        return {
          key,
          value: url.searchParams.get(key) || '',
          href: url.href,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function pageSubmitDiagnostics(page, form = null) {
  const browserState = await page.evaluate(() => ({
    href: window.location.href,
    readyState: document.readyState,
    activeElement: document.activeElement instanceof HTMLElement
      ? `${document.activeElement.tagName}:${document.activeElement.textContent || document.activeElement.getAttribute('name') || ''}`.slice(0, 180)
      : '',
    submitProbe: window.__qaSubmitProbe ?? null,
  })).catch(() => ({ href: page.url(), readyState: 'unknown', activeElement: '', submitProbe: null }));

  let formState = null;
  if (form) {
    formState = await form.evaluate((element) => ({
      action: element.action,
      method: element.method,
      valid: element.checkValidity(),
      resource: element.querySelector('input[name="_resource"]')?.value || '',
      id: element.querySelector('input[name="_id"]')?.value || '',
      submitButtonDisabled: Boolean(element.querySelector('button[type="submit"]')?.disabled),
    })).catch(() => null);
  }

  return { browserState, formState };
}

async function settleOnRedirect(page, redirectRaw, expectedPath) {
  if (!redirectRaw) return;
  let redirectUrl;
  try {
    redirectUrl = new URL(String(redirectRaw).split(';')[0], BASE_URL);
  } catch {
    return;
  }
  if (redirectUrl.origin !== target.origin || !redirectUrl.pathname.startsWith('/admin')) return;

  const reached = await page.waitForFunction(({ href, pathname }) => {
    const current = new URL(window.location.href);
    if (current.href === href) return true;
    return current.pathname.replace(/\/+$/, '') === pathname.replace(/\/+$/, '')
      && current.search === new URL(href).search;
  }, { href: redirectUrl.href, pathname: expectedPath }, { timeout: 6_000 })
    .then(() => true)
    .catch(() => false);

  if (!reached) {
    await page.goto(redirectUrl.href, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  }
  await page.waitForTimeout(250);
}

async function submitFormAndWait(
  page,
  form,
  expectedPath,
  buttonName,
  keys = ['notice', 'error'],
  options = {},
) {
  const { mode = 'requestSubmit', timeout = 45_000 } = options;
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(250);
  await assertFormValid(form);

  const button = form.getByRole('button', { name: buttonName }).first();
  if (!(await button.count())) throw new Error(`Gönderim düğmesi bulunamadı: ${buttonName}`);
  await button.waitFor({ state: 'visible', timeout: 5_000 });
  if (await button.isDisabled()) throw new Error(`Gönderim düğmesi devre dışı: ${buttonName}`);

  const expectedNormalized = normalizePathname(expectedPath);
  const responsePromise = page.waitForResponse((response) => {
    const request = response.request();
    if (request.method() !== 'POST') return false;
    try {
      const requestUrl = new URL(request.url());
      return requestUrl.origin === target.origin
        && normalizePathname(requestUrl.pathname) === expectedNormalized;
    } catch {
      return false;
    }
  }, { timeout });

  const probeId = `qa-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await form.evaluate((element, id) => {
    window.__qaSubmitProbe = {
      id,
      submitEvents: 0,
      startedAt: new Date().toISOString(),
      resource: element.querySelector('input[name="_resource"]')?.value || '',
    };
    element.addEventListener('submit', () => {
      if (window.__qaSubmitProbe?.id === id) {
        window.__qaSubmitProbe.submitEvents += 1;
        window.__qaSubmitProbe.submittedAt = new Date().toISOString();
      }
    }, { capture: true, once: true });
  }, probeId);

  if (mode === 'click') {
    await button.click();
  } else {
    await form.evaluate((element, expectedButtonName) => {
      const submitter = Array.from(element.querySelectorAll('button[type="submit"], input[type="submit"]'))
        .find((candidate) => {
          const value = candidate instanceof HTMLInputElement ? candidate.value : candidate.textContent;
          return (value || '').trim() === expectedButtonName;
        });
      if (!(submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement)) {
        throw new Error(`Form içinde gönderim düğmesi bulunamadı: ${expectedButtonName}`);
      }
      element.requestSubmit(submitter);
    }, buttonName).catch((error) => {
      if (!/Execution context was destroyed|Target page, context or browser has been closed/i.test(String(error))) throw error;
    });
  }

  let response;
  try {
    response = await responsePromise;
  } catch (error) {
    const diagnostics = await pageSubmitDiagnostics(page, form);
    throw new Error(
      `Admin POST cevabı ${timeout} ms içinde yakalanmadı. `
      + `Tanı: ${JSON.stringify(diagnostics)}. `
      + `Asıl hata: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const headers = await response.allHeaders().catch(() => ({}));
  const redirectRaw = headers.location
    || headers['x-action-redirect']
    || headers['x-nextjs-redirect']
    || '';
  const status = response.status();

  await settleOnRedirect(page, redirectRaw, expectedNormalized);

  const headerOutcome = parseOutcomeUrl(redirectRaw, keys);
  const pageOutcome = parseOutcomeUrl(page.url(), keys);
  const outcome = headerOutcome || pageOutcome;
  const result = {
    key: outcome?.key ?? null,
    value: outcome?.value ?? '',
    href: outcome?.href ?? page.url(),
    status,
    redirect: redirectRaw ? String(redirectRaw).split(';')[0] : '',
    expectedPath: expectedNormalized,
    button: buttonName,
  };
  report.submitOutcomes.push(result);

  if (status < 200 || status >= 400) {
    throw new Error(`Admin POST beklenmeyen HTTP durumuyla tamamlandı: ${status}`);
  }
  return result;
}

async function revealField(form, selector, label) {
  const field = form.locator(selector).first();
  if (!(await field.count())) throw new Error(`${label} alanı bulunamadı.`);

  if (!(await field.isVisible())) {
    await field.evaluate((element) => {
      const closed = [];
      let parent = element.parentElement;
      while (parent) {
        if (parent instanceof HTMLDetailsElement && !parent.open) closed.push(parent);
        parent = parent.parentElement;
      }
      for (const details of closed.reverse()) details.open = true;
    });
  }

  await field.waitFor({ state: 'visible', timeout: 5_000 });
  return field;
}

async function fillNamedField(form, name, value) {
  const field = await revealField(form, `[name="${name}"]`, name);
  await field.fill(String(value));
  const actual = await field.inputValue();
  if (actual !== String(value)) {
    throw new Error(`${name} alanı doğru doldurulamadı. Beklenen: ${value} / Gerçek: ${actual}`);
  }
  return field;
}

async function assertFormValid(form) {
  const invalid = await form.evaluate((element) => {
    const controls = Array.from(element.elements || []);
    return controls.flatMap((control) => {
      if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement)) return [];
      if (control.disabled || control.type === 'hidden' || control.checkValidity()) return [];
      return [{
        name: control.name || control.id || control.tagName,
        message: control.validationMessage || 'Geçersiz alan',
        value: control.type === 'password' ? '[gizli]' : control.value,
      }];
    });
  });

  if (invalid.length) {
    throw new Error(`Form tarayıcı doğrulamasından geçmedi: ${JSON.stringify(invalid)}`);
  }
}

const recordLabelFields = Object.freeze({
  'menu-categories': 'name',
  'menu-items': 'name',
});

async function assertRecordHasExactLabel(record, resource, label) {
  assertSafeTestLabel(label);
  await ensureDetailsOpen(record, `${resource} kayıt paneli`);
  const fieldName = recordLabelFields[resource];
  if (!fieldName) throw new Error(`Güvenlik engeli: ${resource} için kayıt etiketi alanı tanımlı değil.`);
  const field = record.locator(`form[data-admin-dirty-guard="true"] [name="${fieldName}"]`).first();
  if (!(await field.count())) throw new Error(`Güvenlik engeli: ${resource} kayıt etiketi okunamadı.`);
  const actual = (await field.inputValue()).trim();
  if (actual !== label) {
    throw new Error(`Güvenlik engeli: bulunan kayıt tam TEST_ etiketiyle eşleşmiyor. Beklenen: ${label} / Gerçek: ${actual}`);
  }
}

async function openNewForm(page, resource) {
  await page.goto(resourceUrl(resource, '?new=1#new-record'), {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(250);

  const details = page.locator('#new-record');

  await details.waitFor({
    state: 'visible',
    timeout: 20_000,
  });

  await ensureDetailsOpen(details, 'Yeni kayıt paneli');

  await details.locator('form').first().waitFor({
    state: 'visible',
    timeout: 5_000,
  });

  return details;
}

async function setCheckbox(scope, name, checked) {
  const input = scope.locator(`input[name="${name}"]`).first();
  if (await input.count() === 0) return;
  if (checked) await input.check(); else await input.uncheck();
}

async function waitForHiddenSelection(hidden, previousValue, label) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const current = await hidden.inputValue();
    if (current && current !== previousValue) return current;
    await hidden.page().waitForTimeout(50);
  }
  throw new Error(`${label} seçimi gizli alana aktarılmadı.`);
}

async function selectByTextOrValue(scope, name, matcher, searchHint = '') {
  const select = scope.locator(`select[name="${name}"]`).first();
  if (await select.count()) {
    const options = await select.locator('option').evaluateAll((nodes) => nodes.map((node) => ({
      value: node.value,
      label: (node.textContent || '').trim(),
    })));
    const found = options.find((option) => typeof matcher === 'string'
      ? option.label === matcher || option.value === matcher || option.label.includes(matcher)
      : matcher.test(option.label));
    if (!found) throw new Error(`${name} için uygun seçenek bulunamadı: ${String(matcher)}`);
    await select.selectOption(found.value);
    return found;
  }

  const hidden = scope.locator(`input[name="${name}"][type="hidden"]`).first();
  if (await hidden.count()) {
    const container = hidden.locator('xpath=..');
    const combo = container.getByRole('combobox').first();
    if (await combo.count()) {
      const searchText = typeof matcher === 'string'
        ? searchQueryForLabel(matcher)
        : searchQueryForLabel(searchHint);
      await combo.fill(searchText);
      await combo.focus();
      const options = container.getByRole('option');
      await options.first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
      const count = await options.count();
      for (let index = 0; index < count; index += 1) {
        const option = options.nth(index);
        const label = (await option.innerText()).trim();
        const matches = typeof matcher === 'string'
          ? label === matcher || label.includes(matcher)
          : matcher.test(label);
        if (matches) {
          const previousValue = await hidden.inputValue();
          await option.click();
          const selectedValue = await waitForHiddenSelection(hidden, previousValue, name);
          return { value: selectedValue, label: await combo.inputValue() };
        }
      }
      throw new Error(`${name} için uygun aranabilir seçenek bulunamadı: ${String(matcher)}`);
    }
  }
  throw new Error(`${name} seçim alanı bulunamadı.`);
}

async function submitCreate(page, formScope) {
  const form = formScope.locator('form').first();
  const resource = await form.locator('input[name="_resource"]').inputValue();
  if (!resource) throw new Error('Kayıt oluşturma formunun kaynak bilgisi okunamadı.');

  const outcome = await submitFormAndWait(
    page,
    form,
    `/admin/manage/${resource}`,
    'Kaydı oluştur',
  );

  if (outcome.key === 'error') {
    throw new Error(`Kayıt oluşturma hatası: ${outcome.value || 'Bilinmeyen hata'}`);
  }
  if (outcome.key !== 'notice') {
    report.warnings.push({
      step: `create:${resource}`,
      message: 'POST başarılı döndü ancak notice parametresi okunamadı; kayıt durumu liste ekranından doğrulanacak.',
      status: outcome.status,
      redirect: outcome.redirect,
    });
  }
  return outcome;
}

async function createCategory(page) {
  const details = await openNewForm(page, 'menu-categories');
  const form = details.locator('form').first();
  await fillNamedField(form, 'name', categoryName);
  await fillNamedField(form, 'slug', categorySlug);
  await selectByTextOrValue(form, 'display_type', 'Kartlar');
  await selectByTextOrValue(form, 'status', 'Yayında');
  await setCheckbox(form, 'is_active', true);
  await submitCreate(page, details);

  const categoryRecord = await findRecord(page, 'menu-categories', categoryName);
  const id = await recordId(categoryRecord);
  report.createdRecords.push({ resource: 'menu-categories', label: categoryName, id });
  addStep('TEST_ kategori oluşturuldu ve listede doğrulandı', true, { value: categoryName });
  await screenshot(page, 'category-created');
}

async function findRecord(page, resource, text, extraText = null, options = {}) {
  const { optional = false } = options;
  const query = searchQueryForLabel(text);
  await page.goto(resourceUrl(resource, `?q=${encodeURIComponent(query)}`), {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  await page.waitForTimeout(500);

  const records = page.locator('details[id^="record-"]');
  const count = await records.count();
  for (let i = 0; i < count; i += 1) {
    const record = records.nth(i);
    const summaryText = (await directSummary(record).innerText().catch(() => '')).trim();
    if (!summaryText.includes(text) || (extraText && !summaryText.includes(extraText))) continue;

    const exactFieldName = recordLabelFields[resource];
    if (exactFieldName) {
      await ensureDetailsOpen(record, `${resource} kayıt paneli`);
      const exactField = record.locator(`form[data-admin-dirty-guard="true"] [name="${exactFieldName}"]`).first();
      if (!(await exactField.count())) continue;
      if ((await exactField.inputValue()).trim() !== text) continue;
    }

    return record;
  }

  if (optional) return null;
  throw new Error(`${resource} içinde kayıt bulunamadı: ${text}${extraText ? ` / ${extraText}` : ''} (arama: ${query})`);
}

async function recordId(record) {
  const id = await record.getAttribute('id');
  if (!id?.startsWith('record-')) throw new Error('Kayıt kimliği okunamadı.');
  return id.slice('record-'.length);
}

async function findRecordBySummary(page, resource, queryText, requiredTexts, options = {}) {
  const { optional = false } = options;
  await page.goto(resourceUrl(resource, `?q=${encodeURIComponent(searchQueryForLabel(queryText))}`), {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  await page.waitForTimeout(350);
  const required = requiredTexts.filter(Boolean).map((value) => String(value));
  const records = page.locator('details[id^="record-"]');
  const count = await records.count();
  for (let index = 0; index < count; index += 1) {
    const record = records.nth(index);
    const summaryText = (await directSummary(record).innerText().catch(() => '')).trim();
    if (required.every((value) => summaryText.includes(value))) return record;
  }
  if (optional) return null;
  throw new Error(`${resource} içinde beklenen kayıt bulunamadı: ${required.join(' / ')}`);
}

async function countRecordsByField(page, resource, queryText, fieldName, expectedValue) {
  await page.goto(resourceUrl(resource, `?q=${encodeURIComponent(searchQueryForLabel(queryText))}`), {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  await page.waitForTimeout(350);
  let matches = 0;
  const records = page.locator('details[id^="record-"]');
  const count = await records.count();
  for (let index = 0; index < count; index += 1) {
    const record = records.nth(index);
    await ensureDetailsOpen(record, `${resource} kayıt paneli`);
    const field = record.locator(`form[data-admin-dirty-guard="true"] [name="${fieldName}"]`).first();
    if (!(await field.count())) continue;
    if ((await field.inputValue()).trim() === expectedValue) matches += 1;
  }
  return matches;
}

async function assertNoSummaryRecord(page, resource, queryText, requiredTexts, label) {
  const found = await findRecordBySummary(page, resource, queryText, requiredTexts, { optional: true });
  if (found) throw new Error(`${label} temizlenmedi; kayıt hâlâ listede görünüyor.`);
}

async function assertNoSearchResults(page, resource, queryText, label) {
  await page.goto(resourceUrl(resource, `?q=${encodeURIComponent(searchQueryForLabel(queryText))}`), {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  await page.waitForTimeout(350);
  const count = await page.locator('details[id^="record-"]').count();
  if (count !== 0) {
    throw new Error(`${label} temizlenmedi; benzersiz test aramasında ${count} kayıt bulundu.`);
  }
}

async function branchOptions(page) {
  const details = await openNewForm(page, 'menu-category-branches');
  const form = details.locator('form').first();
  const select = form.locator('select[name="branch_id"]').first();
  if (await select.count()) {
    const options = await select.locator('option').evaluateAll((nodes) => nodes
      .map((node) => ({ value: node.value, label: (node.textContent || '').trim() }))
      .filter((item) => item.value));
    if (options.length < 2) throw new Error('Test için en az iki şube gerekli.');
    return options.slice(0, 2);
  }

  const hidden = form.locator('input[name="branch_id"][type="hidden"]').first();
  if (!(await hidden.count())) throw new Error('Şube seçim alanı bulunamadı.');
  const combo = hidden.locator('xpath=..').getByRole('combobox').first();
  await combo.fill('');
  await combo.focus();
  const optionLocators = hidden.locator('xpath=..').getByRole('option');
  await optionLocators.first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
  const count = await optionLocators.count();
  const options = [];
  for (let index = 0; index < count && options.length < 2; index += 1) {
    const option = optionLocators.nth(index);
    const label = (await option.innerText()).trim();
    if (!label) continue;
    const previousValue = await hidden.inputValue();
    await option.click();
    const selectedValue = await waitForHiddenSelection(hidden, previousValue, 'branch_id');
    options.push({ value: selectedValue, label: await combo.inputValue() || label });
    if (options.length < 2) {
      await combo.fill('');
      await combo.focus();
    }
  }
  if (options.length < 2) throw new Error('Test için en az iki şube gerekli.');
  return options;
}

async function createCategoryBranch(page, branch) {
  const details = await openNewForm(page, 'menu-category-branches');
  const form = details.locator('form').first();
  await selectByTextOrValue(form, 'category_id', categoryName);
  await selectByTextOrValue(form, 'branch_id', branch.value);
  await fillNamedField(form, 'display_name', categoryName);
  await setCheckbox(form, 'is_active', true);
  await submitCreate(page, details);

  const branchName = branch.label.split(' (')[0];
  const record = await findRecordBySummary(
    page,
    'menu-category-branches',
    prefix,
    [categoryName, branchName],
  );
  report.createdRecords.push({
    resource: 'menu-category-branches',
    label: `${categoryName} / ${branch.label}`,
    id: await recordId(record),
  });
  addStep(`Kategori ${branch.label} şubesine bağlandı ve doğrulandı`, true);
}

async function createProduct(page) {
  const details = await openNewForm(page, 'menu-items');
  const form = details.locator('form').first();
  await selectByTextOrValue(form, 'category_id', categoryName);
  await fillNamedField(form, 'name', productName);
  await fillNamedField(form, 'slug', productSlug);
  await fillNamedField(form, 'description', 'Canlı kabul testi için otomatik oluşturulan ürün.');
  await selectByTextOrValue(form, 'status', 'Yayında');
  await setCheckbox(form, 'is_active', true);
  await submitCreate(page, details);

  const productRecord = await findRecord(page, 'menu-items', productName);
  report.createdRecords.push({
    resource: 'menu-items',
    label: productName,
    id: await recordId(productRecord),
  });
  addStep('TEST_ ürün oluşturuldu ve listede doğrulandı', true, { value: productName });
}

async function testValidation(page) {
  const details = await openNewForm(page, 'menu-categories');
  const form = details.locator('form').first();
  await fillNamedField(form, 'name', duplicateCategoryName);
  await fillNamedField(form, 'slug', categorySlug);
  await selectByTextOrValue(form, 'display_type', 'Kartlar');
  await selectByTextOrValue(form, 'status', 'Taslak');
  await setCheckbox(form, 'is_active', true);
  await assertFormValid(form);

  const outcome = await submitFormAndWait(
    page,
    form,
    '/admin/manage/menu-categories',
    'Kaydı oluştur',
  );

  const duplicateRecord = await findRecord(
    page,
    'menu-categories',
    duplicateCategoryName,
    null,
    { optional: true },
  );
  if (duplicateRecord) {
    report.createdRecords.push({
      resource: 'menu-categories',
      label: duplicateCategoryName,
      id: await recordId(duplicateRecord),
      unexpected: true,
    });
    throw new Error('Tekrarlanan URL adı kabul edildi ve ikinci kategori gerçekten oluşturuldu.');
  }

  const slugMatchCount = await countRecordsByField(
    page,
    'menu-categories',
    categorySlug,
    'slug',
    categorySlug,
  );
  if (slugMatchCount !== 1) {
    throw new Error(`Tekrarlanan URL adı doğrulaması kesinleşmedi. Aynı slug için kayıt sayısı: ${slugMatchCount}`);
  }

  if (outcome.key === 'notice') {
    throw new Error('Sunucu tekrar denemesini başarılı bildirdi; buna rağmen ikinci kayıt listede bulunamadı. Sonuç tutarsız.');
  }

  const body = await page.locator('body').innerText().catch(() => '');
  const messageLooksCorrect = /zaten|benzersiz|kullanılıyor|unique|duplicate/i.test(`${outcome.value}\n${body}`);
  if (outcome.key === 'error' && !messageLooksCorrect) {
    throw new Error(`Tekrarlanan URL adı reddedildi fakat hata mesajı anlaşılır değil: ${outcome.value}`);
  }
  if (outcome.key !== 'error') {
    report.warnings.push({
      step: 'duplicate-slug',
      message: '303 POST sonrası hata parametresi okunamadı; aynı slug için yalnız tek kayıt kaldığı veri üzerinden doğrulandı.',
      status: outcome.status,
      redirect: outcome.redirect,
    });
  }

  addStep('Tekrarlanan URL adı reddedildi ve ikinci kayıt oluşmadığı doğrulandı', true);
  await screenshot(page, 'duplicate-validation');
}

async function createBranchPrice(page, branch, price, label) {
  const details = await openNewForm(page, 'menu-item-branches');
  const form = details.locator('form').first();
  const branchName = branch.label.split(' (')[0];
  const marker = `${prefix}_${branchName.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()}_${label}`;
  await selectByTextOrValue(form, 'menu_item_id', productName);
  await selectByTextOrValue(form, 'branch_id', branch.value);
  await fillNamedField(form, 'price_cents', price);
  await fillNamedField(form, 'price_label', marker);
  await fillNamedField(form, 'price_note', prefix);
  await setCheckbox(form, 'is_active', true);
  await submitCreate(page, details);

  const record = await findRecordBySummary(
    page,
    'menu-item-branches',
    prefix,
    [productName, branchName, marker],
  );
  report.createdRecords.push({
    resource: 'menu-item-branches',
    label: `${productName} / ${branch.label}`,
    id: await recordId(record),
  });
  addStep(`${branch.label} fiyat bağlantısı oluşturuldu ve doğrulandı`, true, { price });
}

async function createVariant(page, branch, variantLabel, price) {
  const details = await openNewForm(page, 'menu-item-variants');
  const form = details.locator('form').first();
  const branchName = branch.label.split(' (')[0];
  await selectByTextOrValue(
    form,
    'menu_item_branch_id',
    new RegExp(`${productName}.*${branchName}`, 'i'),
    productName,
  );
  await fillNamedField(form, 'label', variantLabel);
  await fillNamedField(form, 'slug', `${productSlug}-${variantLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  await fillNamedField(form, 'detail', `${prefix}_${variantLabel}`);
  await fillNamedField(form, 'price_cents', price);
  await fillNamedField(form, 'price_note', prefix);
  await setCheckbox(form, 'is_active', true);
  await submitCreate(page, details);

  const record = await findRecordBySummary(
    page,
    'menu-item-variants',
    prefix,
    [variantLabel, productName, branchName],
  );
  report.createdRecords.push({
    resource: 'menu-item-variants',
    label: `${productName} / ${branch.label} / ${variantLabel}`,
    id: await recordId(record),
  });
  addStep(`${variantLabel} varyantı oluşturuldu ve doğrulandı`, true, { price });
}

async function testUnifiedPricing(page, branches) {
  const pricingSearchUrl = `${BASE_URL}/admin/pricing?q=${encodeURIComponent(searchQueryForLabel(productName))}`;
  await page.goto(pricingSearchUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  const details = page.locator('details[data-admin-accordion-item="true"]').filter({ hasText: productName }).first();
  if (!(await details.count())) throw new Error('Fiyat Yönetimi’nde TEST_ ürün bulunamadı.');
  await ensureDetailsOpen(details, 'Fiyat Yönetimi ürün paneli');

  const branchOneName = branches[0].label.split(' (')[0];
  const branchTwoName = branches[1].label.split(' (')[0];
  const firstPrice = details.getByLabel(`${productName} ${branchOneName} ana fiyatı`);
  const secondPrice = details.getByLabel(`${productName} ${branchTwoName} ana fiyatı`);
  if (!(await firstPrice.count()) || !(await secondPrice.count())) {
    throw new Error('İki şubenin fiyat alanı birleşik ekranda bulunamadı.');
  }
  await firstPrice.fill('130.00');
  await secondPrice.fill('240.00');

  const variantPrice = details.getByLabel(`${productName} 50 cl fiyatı`);
  if (!(await variantPrice.count())) throw new Error('50 cl varyantı birleşik fiyat ekranında bulunamadı.');
  await variantPrice.fill('155.00');

  const pricingForm = details.locator('form').first();
  const outcome = await submitFormAndWait(
    page,
    pricingForm,
    '/admin/pricing',
    'Görünen tüm fiyatları kaydet',
  );
  if (outcome.key === 'error') throw new Error(`Fiyat Yönetimi kaydetme hatası: ${outcome.value}`);

  await page.goto(pricingSearchUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  const verifiedDetails = page.locator('details[data-admin-accordion-item="true"]').filter({ hasText: productName }).first();
  if (!(await verifiedDetails.count())) throw new Error('Kaydetme sonrasında TEST_ ürün Fiyat Yönetimi’nde bulunamadı.');
  await ensureDetailsOpen(verifiedDetails, 'Fiyat Yönetimi doğrulama paneli');

  const savedFirst = await verifiedDetails.getByLabel(`${productName} ${branchOneName} ana fiyatı`).inputValue();
  const savedSecond = await verifiedDetails.getByLabel(`${productName} ${branchTwoName} ana fiyatı`).inputValue();
  const savedVariant = await verifiedDetails.getByLabel(`${productName} 50 cl fiyatı`).inputValue();
  const numeric = (value) => Number(String(value).replace(',', '.'));
  if (numeric(savedFirst) !== 130 || numeric(savedSecond) !== 240 || numeric(savedVariant) !== 155) {
    throw new Error(`Fiyat Yönetimi değerleri kalıcı olmadı: ${JSON.stringify({ savedFirst, savedSecond, savedVariant })}`);
  }
  addStep('İki şube fiyatı ve 50 cl varyantı tek işlemde güncellendi ve yeniden okundu', true);
  await screenshot(page, 'pricing-saved');

  const summaryText = await directSummary(verifiedDetails).innerText();
  if (!summaryText.includes('155') || !summaryText.includes('50 cl')) {
    throw new Error('En yüksek varyant fiyatı ve 50 cl etiketi özet satırında görünmedi.');
  }
  addStep('Özet satırında en yüksek varyant fiyatı ve 50 cl etiketi doğru', true);
}

async function verifyAudit(page) {
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  const text = await page.locator('body').innerText();
  const ok = text.includes(productName) || text.includes(categoryName) || /Fiyatlar güncellendi/.test(text);
  if (!ok) throw new Error('Son işlemler alanında test işlemlerine ait audit kaydı görünmedi.');
  addStep('İşlem geçmişi kaydı doğrulandı', true);
  await screenshot(page, 'audit-dashboard');
}

async function archiveRecord(page, resource, text, extraText = null) {
  assertSafeTestLabel(text);
  const record = await findRecord(page, resource, text, extraText);
  await assertRecordHasExactLabel(record, resource, text);
  await ensureDetailsOpen(record, `${resource} kayıt paneli`);
  const button = record.getByRole('button', { name: 'Pasife al / arşivle' });
  if (!(await button.count())) {
    const body = await record.innerText();
    if (/Kalıcı olarak sil|Silme etkisini incele/.test(body)) return;
    throw new Error(`${resource} kaydında arşivleme düğmesi bulunamadı.`);
  }
  const form = button.locator('xpath=ancestor::form[1]');
  page.once('dialog', async (dialog) => dialog.accept());
  const outcome = await submitFormAndWait(
    page,
    form,
    `/admin/manage/${resource}`,
    'Pasife al / arşivle',
    ['notice', 'error'],
    { mode: 'click' },
  );
  if (outcome.key === 'error') throw new Error(`${resource} arşivleme hatası: ${outcome.value}`);
  report.cleanup.push({ resource, label: text, action: 'archive', ok: true });
}

async function hardDeleteRecord(page, resource, text, extraText = null) {
  assertSafeTestLabel(text);
  let record = await findRecord(page, resource, text, extraText);
  await assertRecordHasExactLabel(record, resource, text);
  await ensureDetailsOpen(record, `${resource} kayıt paneli`);

  const review = record.getByRole('link', { name: 'Silme etkisini incele' });
  if (await review.count()) {
    await Promise.all([
      page.waitForFunction(({ expectedResource }) => {
        const url = new URL(window.location.href);
        const pathname = url.pathname.replace(/\/+$/, '');
        return pathname === `/admin/manage/${expectedResource}` && url.searchParams.has('edit');
      }, { expectedResource: resource }, { timeout: 45_000 }),
      review.click(),
    ]);
    record = page.locator('details[id^="record-"][open]').first();
    await assertRecordHasExactLabel(record, resource, text);
  }

  const button = record.getByRole('button', { name: 'Kalıcı olarak sil' });
  if (!(await button.count())) {
    const textBody = await record.innerText();
    throw new Error(`${resource} kalıcı silme düğmesi bulunamadı. İçerik: ${textBody.slice(0, 500)}`);
  }
  const form = button.locator('xpath=ancestor::form[1]');
  page.once('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') await dialog.accept('KALICI SİL'); else await dialog.accept();
  });
  const outcome = await submitFormAndWait(
    page,
    form,
    `/admin/manage/${resource}`,
    'Kalıcı olarak sil',
    ['notice', 'error'],
    { mode: 'click' },
  );
  if (outcome.key === 'error') throw new Error(`${resource} kalıcı silme hatası: ${outcome.value}`);
  report.cleanup.push({ resource, label: text, action: 'hard-delete', ok: true });
}

async function resetDirtyTestForms(page) {
  await page.locator('form[data-admin-dirty-guard="true"]').evaluateAll((forms) => {
    for (const form of forms) {
      if (form instanceof HTMLFormElement) form.reset();
    }
  }).catch(() => undefined);
  await page.waitForTimeout(100);
}

async function discoverStaleCategoryLabels(page, prefix) {
  assertSafeTestLabel(prefix);
  const uniqueStamp = prefix.match(/\d{8}T\d{6}/)?.[0];
  if (!uniqueStamp) {
    throw new Error(`Güvenlik engeli: eski test önekinde tarih-saat bulunamadı: ${prefix}`);
  }

  await resetDirtyTestForms(page);
  await page.goto(resourceUrl('menu-categories', `?q=${encodeURIComponent(uniqueStamp)}`), {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  await page.waitForTimeout(500);

  const labels = new Set();
  const records = page.locator('details[id^="record-"]');
  const count = await records.count();
  for (let index = 0; index < count; index += 1) {
    const record = records.nth(index);
    await ensureDetailsOpen(record, 'Eski TEST_ kategori paneli');
    const nameField = record.locator('form[data-admin-dirty-guard="true"] [name="name"]').first();
    if (!(await nameField.count())) continue;
    const actual = (await nameField.inputValue()).trim();
    if (actual.startsWith(prefix)) {
      assertSafeTestLabel(actual);
      labels.add(actual);
    }
  }
  return [...labels];
}

async function cleanupKnownStaleRecords(page) {
  const staleLabels = new Set(knownStaleCategoryNames);

  for (const prefix of knownStaleCategoryPrefixes) {
    const discovered = await discoverStaleCategoryLabels(page, prefix);
    for (const label of discovered) staleLabels.add(label);
  }

  for (const staleCategoryName of staleLabels) {
    assertSafeTestLabel(staleCategoryName);
    const existing = await findRecord(
      page,
      'menu-categories',
      staleCategoryName,
      null,
      { optional: true },
    );

    if (!existing) {
      report.cleanup.push({
        resource: 'menu-categories',
        label: staleCategoryName,
        action: 'preflight-not-found',
        ok: true,
      });
      continue;
    }

    await assertRecordHasExactLabel(existing, 'menu-categories', staleCategoryName);
    await archiveRecord(page, 'menu-categories', staleCategoryName);
    await hardDeleteRecord(page, 'menu-categories', staleCategoryName);
    addStep('Önceki yarım testten kalan TEST_ kategori temizlendi', true, {
      value: staleCategoryName,
    });
  }
}

async function cleanup(page) {
  console.log('\nTemizlik başlatılıyor...');
  await resetDirtyTestForms(page);

  try {
    const existingProduct = await findRecord(page, 'menu-items', productName, null, { optional: true });
    if (existingProduct) {
      await archiveRecord(page, 'menu-items', productName);
      await hardDeleteRecord(page, 'menu-items', productName);
      await findRecord(page, 'menu-items', productName, null, { optional: true }).then((record) => {
        if (record) throw new Error('Ürün kalıcı silme sonrasında hâlâ bulunuyor.');
      });
      await assertNoSearchResults(page, 'menu-item-branches', prefix, 'Ürün–şube fiyat kayıtları');
      await assertNoSearchResults(page, 'menu-item-variants', prefix, 'Ürün varyant kayıtları');
      addStep('TEST_ ürün, şube fiyatları ve varyantları tamamen temizlendi', true);
    } else {
      report.cleanup.push({ resource: 'menu-items', label: productName, action: 'cleanup-not-found', ok: true });
    }
  } catch (error) {
    report.cleanup.push({ resource: 'menu-items', label: productName, action: 'cleanup', ok: false, error: error instanceof Error ? error.message : String(error) });
    addStep('TEST_ ürün temizliği', false, { message: error instanceof Error ? error.message : String(error) });
  }

  try {
    const duplicate = await findRecord(page, 'menu-categories', duplicateCategoryName, null, { optional: true });
    if (duplicate) {
      await archiveRecord(page, 'menu-categories', duplicateCategoryName);
      await hardDeleteRecord(page, 'menu-categories', duplicateCategoryName);
      addStep('Beklenmedik TEST_ doğrulama kategorisi temizlendi', true);
    } else {
      report.cleanup.push({ resource: 'menu-categories', label: duplicateCategoryName, action: 'cleanup-not-found', ok: true });
    }
  } catch (error) {
    report.cleanup.push({ resource: 'menu-categories', label: duplicateCategoryName, action: 'cleanup', ok: false, error: error instanceof Error ? error.message : String(error) });
    addStep('Beklenmedik TEST_ doğrulama kategorisi temizliği', false, { message: error instanceof Error ? error.message : String(error) });
  }

  try {
    const existingCategory = await findRecord(page, 'menu-categories', categoryName, null, { optional: true });
    if (existingCategory) {
      await archiveRecord(page, 'menu-categories', categoryName);
      await hardDeleteRecord(page, 'menu-categories', categoryName);
      await findRecord(page, 'menu-categories', categoryName, null, { optional: true }).then((record) => {
        if (record) throw new Error('Kategori kalıcı silme sonrasında hâlâ bulunuyor.');
      });
      await assertNoSearchResults(page, 'menu-category-branches', prefix, 'Kategori–şube ilişkileri');
      addStep('TEST_ kategori ve kategori–şube ilişkileri tamamen temizlendi', true);
    } else {
      report.cleanup.push({ resource: 'menu-categories', label: categoryName, action: 'cleanup-not-found', ok: true });
    }
  } catch (error) {
    report.cleanup.push({ resource: 'menu-categories', label: categoryName, action: 'cleanup', ok: false, error: error instanceof Error ? error.message : String(error) });
    addStep('TEST_ kategori temizliği', false, { message: error instanceof Error ? error.message : String(error) });
  }
}

function markdown() {
  const lines = [
    '# Kantin Canlı Admin Yazma Kabul Testi',
    '',
    `- Tarih: ${report.createdAt}`,
    `- Hedef: ${report.baseUrl}`,
    `- Test öneki: \`${report.prefix}\``,
    `- Test aracı sürümü: ${report.toolVersion}`,
    `- Genel sonuç: ${report.success ? '✅ Başarılı' : '❌ Başarısız / inceleme gerekli'}`,
    '',
    '## Adımlar',
    '',
    '| Sonuç | Adım | Açıklama |',
    '|---|---|---|',
    ...report.steps.map((step) => `| ${step.ok ? '✅' : '❌'} | ${String(step.name).replaceAll('|', '\\|')} | ${String(step.message || step.value || '').replaceAll('|', '\\|')} |`),
    '',
    '## Temizlik',
    '',
    ...(report.cleanup.length ? report.cleanup.map((item) => `- ${item.ok ? '✅' : '❌'} ${item.resource}: ${item.label} — ${item.action}${item.error ? ` — ${item.error}` : ''}`) : ['- Temizlik kaydı yok.']),
    '',
    '## Tarayıcı bulguları',
    '',
    `- Konsol hatası: ${report.consoleErrors.length}`,
    `- Sayfa hatası: ${report.pageErrors.length}`,
    `- Başarısız ağ isteği: ${report.failedRequests.length}`,
    `- İzlenen admin POST isteği: ${report.mutationRequests.length}`,
    '',
    '## Form gönderim sonuçları',
    '',
    ...(report.submitOutcomes.length
      ? report.submitOutcomes.map((item) => `- ${item.button}: HTTP ${item.status}${item.key ? ` — ${item.key}: ${item.value}` : ' — sonuç veri doğrulamasıyla kontrol edildi'}${item.redirect ? ` — ${item.redirect}` : ''}`)
      : ['- Form gönderim sonucu kaydı yok.']),
    '',
    '## Uyarılar',
    '',
    ...(report.warnings.length
      ? report.warnings.map((item) => `- ${item.step}: ${item.message}`)
      : ['- Uyarı yok.']),
    '',
    '## Admin POST tanısı',
    '',
    ...(report.mutationRequests.length
      ? report.mutationRequests.map((item) => `- ${item.state}: ${item.method} ${item.url}${item.status ? ` — HTTP ${item.status}` : ''}`)
      : ['- Admin POST isteği yakalanmadı.']),
    '',
    '## Güvenlik notu',
    '',
    'Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.',
  ];
  return lines.join('\n');
}

const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
let tracingStarted = false;
await context.tracing.start({ screenshots: true, snapshots: true }).then(() => { tracingStarted = true; }).catch(() => undefined);
let testError = null;
const mutationRequestIndex = new WeakMap();

page.on('request', (request) => {
  if (request.method() !== 'POST') return;
  let requestUrl;
  try {
    requestUrl = new URL(request.url());
  } catch {
    return;
  }
  if (requestUrl.origin !== target.origin || !requestUrl.pathname.startsWith('/admin')) return;
  const entry = {
    url: `${requestUrl.origin}${requestUrl.pathname}`,
    method: request.method(),
    startedAt: new Date().toISOString(),
    state: 'pending',
  };
  report.mutationRequests.push(entry);
  mutationRequestIndex.set(request, report.mutationRequests.length - 1);
});
page.on('response', (response) => {
  const request = response.request();
  const index = mutationRequestIndex.get(request);
  if (index === undefined) return;
  response.allHeaders().then((headers) => {
    const current = report.mutationRequests[index];
    report.mutationRequests[index] = {
      ...current,
      status: response.status(),
      redirect: headers.location || headers['x-action-redirect'] || headers['x-nextjs-redirect'] || '',
      respondedAt: new Date().toISOString(),
      state: ['finished', 'failed'].includes(current.state) ? current.state : 'responded',
    };
  }).catch(() => {
    const current = report.mutationRequests[index];
    report.mutationRequests[index] = {
      ...current,
      status: response.status(),
      respondedAt: new Date().toISOString(),
      state: ['finished', 'failed'].includes(current.state) ? current.state : 'responded',
    };
  });
});
page.on('requestfinished', (request) => {
  const index = mutationRequestIndex.get(request);
  if (index === undefined) return;
  report.mutationRequests[index] = {
    ...report.mutationRequests[index],
    finishedAt: new Date().toISOString(),
    state: 'finished',
  };
});
page.on('requestfailed', (request) => {
  const index = mutationRequestIndex.get(request);
  if (index !== undefined) {
    report.mutationRequests[index] = {
      ...report.mutationRequests[index],
      failedAt: new Date().toISOString(),
      state: 'failed',
      failure: request.failure()?.errorText || '',
    };
  }
});

page.on('console', (message) => {
  if (message.type() === 'error') report.consoleErrors.push({ url: page.url(), text: message.text() });
});
page.on('pageerror', (error) => report.pageErrors.push({ url: page.url(), text: error.message }));
page.on('requestfailed', (request) => {
  const failure = request.failure()?.errorText || '';
  if (failure.includes('ERR_ABORTED') || request.url().includes('/_next/image')) return;
  report.failedRequests.push({ url: request.url(), method: request.method(), error: failure });
});

try {
  await login(page);
  addStep('Yönetici girişi', true);
  await screenshot(page, 'login');

  await cleanupKnownStaleRecords(page);
  await createCategory(page);
  await testValidation(page);

  const branches = await branchOptions(page);
  addStep('İki aktif şube bulundu', true, { branches: branches.map((item) => item.label) });
  await createCategoryBranch(page, branches[0]);
  await createCategoryBranch(page, branches[1]);

  await createProduct(page);

  await createBranchPrice(page, branches[0], '120.00', 'Standart');
  await createBranchPrice(page, branches[1], '230.00', 'Standart');
  await createVariant(page, branches[0], '33 cl', '125.00');
  await createVariant(page, branches[0], '50 cl', '145.00');

  await testUnifiedPricing(page, branches);
  await verifyAudit(page);
  addStep('Canlı admin yazma kabul ana akışı tamamlandı', true);
  report.mainFlowCompleted = true;
  report.success = true;
} catch (error) {
  testError = error;
  const message = error instanceof Error ? error.stack || error.message : String(error);
  addStep('Test akışı durdu', false, { message, url: page.url() });
  await screenshot(page, 'failure');
} finally {
  try {
    await cleanup(page);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.cleanup.push({ resource: 'global', label: prefix, action: 'cleanup-crash', ok: false, error: message });
    addStep('Genel temizlik akışı', false, { message });
  }
  const cleanupFailed = report.cleanup.some((item) => item.ok === false);
  if (cleanupFailed) report.success = false;
  if (tracingStarted) {
    const tracePath = path.join(resultDir, 'trace.zip');
    if (testError || !report.success) await context.tracing.stop({ path: tracePath }).catch(() => undefined);
    else await context.tracing.stop().catch(() => undefined);
  }
  await context.close();
  await browser.close();
  await fs.writeFile(path.join(resultDir, 'report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(resultDir, 'REPORT.md'), markdown());
}

console.log(`\nTest tamamlandı: ${resultDir}`);
console.log(`Sonuç: ${report.success ? 'BAŞARILI' : 'BAŞARISIZ / RAPORU İNCELE'}`);
console.log(`Rapor: ${path.join(resultDir, 'REPORT.md')}`);
if (testError || !report.success) process.exitCode = 1;
