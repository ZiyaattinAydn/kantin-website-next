const rawBaseUrl = process.argv[2];
const expectedEnvironment = (process.argv[3] ?? "production").toLowerCase();

if (!rawBaseUrl || !["preview", "production"].includes(expectedEnvironment)) {
  console.error("Kullanım: npm run verify:deployment -- https://site-adresi preview|production");
  process.exit(1);
}

let baseUrl;
try {
  baseUrl = new URL(rawBaseUrl);
} catch {
  console.error("Geçerli bir http/https URL girin.");
  process.exit(1);
}

if (!/^https?:$/.test(baseUrl.protocol)) {
  console.error("URL http veya https protokolü kullanmalıdır.");
  process.exit(1);
}

const checks = [];
async function request(path, options = {}) {
  return fetch(new URL(path, baseUrl), {
    redirect: options.redirect ?? "follow",
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": "kantin-deployment-verifier/1.0" },
  });
}
async function jsonCheck(name, path, validate) {
  try {
    const response = await request(path);
    const body = await response.json();
    checks.push({ name, ...validate(response, body) });
  } catch (error) {
    checks.push({ name, ok: false, detail: error instanceof Error ? error.message : "Bilinmeyen hata" });
  }
}
async function textCheck(name, path, validate, options) {
  try {
    const response = await request(path, options);
    const body = await response.text();
    checks.push({ name, ...validate(response, body) });
  } catch (error) {
    checks.push({ name, ok: false, detail: error instanceof Error ? error.message : "Bilinmeyen hata" });
  }
}

await jsonCheck("Deployment yapılandırması", "/api/health/deployment", (res, body) => ({
  ok: res.ok && body?.ok === true && body?.environment === expectedEnvironment && body?.indexable === (expectedEnvironment === "production") && Object.values(body?.checks ?? {}).every(Boolean),
  detail: JSON.stringify({ status: res.status, environment: body?.environment, indexable: body?.indexable, checks: body?.checks }),
}));
await jsonCheck("Supabase bağlantısı", "/api/health/supabase", (res, body) => ({
  ok: res.ok && body?.ok === true,
  detail: JSON.stringify({ status: res.status, service: body?.service }),
}));
await jsonCheck("Public canlı veri", "/api/health/public-data", (res, body) => ({
  ok: res.ok && body?.ok === true && body?.degraded === false,
  detail: JSON.stringify({ status: res.status, degraded: body?.degraded, sources: body?.sources, counts: body?.counts }),
}));
await textCheck("Ana sayfa", "/", (res) => {
  const robots = res.headers.get("x-robots-tag") ?? "";
  const correctIndexing = expectedEnvironment === "production" ? !/noindex/i.test(robots) : /noindex/i.test(robots);
  return { ok: res.ok && correctIndexing, detail: `HTTP ${res.status}; X-Robots-Tag=${robots || "yok"}` };
});
await textCheck("robots.txt", "/robots.txt", (res, body) => {
  const productionRules = /allow:\s*\//i.test(body) && !/disallow:\s*\/\s*$/im.test(body);
  const previewRules = /disallow:\s*\/\s*$/im.test(body);
  return { ok: res.ok && (expectedEnvironment === "production" ? productionRules : previewRules), detail: `HTTP ${res.status}` };
});
await textCheck("sitemap.xml", "/sitemap.xml", (res, body) => ({
  ok: res.ok && body.includes("<urlset") && body.includes("/menu"),
  detail: `HTTP ${res.status}`,
}));
await textCheck("Admin route koruması", "/admin", (res) => {
  const location = res.headers.get("location") ?? "";
  return { ok: [302,303,307,308].includes(res.status) && location.includes("/admin/login"), detail: `HTTP ${res.status}; Location=${location || "yok"}` };
}, { redirect: "manual" });
await textCheck("Admin giriş sayfası", "/admin/login", (res, body) => ({
  ok: res.ok && /Yönetici paneli/i.test(body),
  detail: `HTTP ${res.status}`,
}));

console.log(`\nKantin deployment doğrulaması: ${baseUrl.origin} (${expectedEnvironment})\n`);
for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✗"} ${check.name}`);
  console.log(`  ${check.detail}`);
}
const failed = checks.filter((check) => !check.ok);
console.log(`\nSonuç: ${checks.length - failed.length}/${checks.length} kontrol başarılı.`);
if (failed.length) process.exit(1);
