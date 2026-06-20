const rawBaseUrl = process.argv[2];

if (!rawBaseUrl) {
  console.error(
    "Kullanım: npm run verify:production -- https://proje-adresi.vercel.app",
  );
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
  const response = await fetch(new URL(path, baseUrl), {
    redirect: options.redirect ?? "follow",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "User-Agent": "kantin-production-verifier/1.0",
    },
  });

  return response;
}

async function addJsonCheck(name, path, validate) {
  try {
    const response = await request(path);
    const body = await response.json();
    const result = validate(response, body);
    checks.push({ name, ...result });
  } catch (error) {
    checks.push({
      name,
      ok: false,
      detail: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
}

async function addTextCheck(name, path, validate, options) {
  try {
    const response = await request(path, options);
    const body = await response.text();
    const result = validate(response, body);
    checks.push({ name, ...result });
  } catch (error) {
    checks.push({
      name,
      ok: false,
      detail: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
}

await addJsonCheck("Deployment yapılandırması", "/api/health/deployment", (res, body) => ({
  ok:
    res.ok &&
    body?.ok === true &&
    body?.environment === "production" &&
    body?.indexable === true,
  detail: JSON.stringify({
    status: res.status,
    environment: body?.environment,
    indexable: body?.indexable,
    checks: body?.checks,
  }),
}));

await addJsonCheck("Supabase bağlantısı", "/api/health/supabase", (res, body) => ({
  ok: res.ok && body?.ok === true,
  detail: JSON.stringify({ status: res.status, service: body?.service }),
}));

await addJsonCheck("Public canlı veri", "/api/health/public-data", (res, body) => ({
  ok: res.ok && body?.ok === true && body?.degraded === false,
  detail: JSON.stringify({
    status: res.status,
    degraded: body?.degraded,
    sources: body?.sources,
    counts: body?.counts,
  }),
}));

await addTextCheck("Ana sayfa", "/", (res) => {
  const robotsHeader = res.headers.get("x-robots-tag") ?? "";
  return {
    ok: res.ok && !/noindex/i.test(robotsHeader),
    detail: `HTTP ${res.status}; X-Robots-Tag=${robotsHeader || "yok"}`,
  };
});

await addTextCheck("robots.txt", "/robots.txt", (res, body) => ({
  ok:
    res.ok &&
    /allow:\s*\//i.test(body) &&
    !/disallow:\s*\/\s*$/im.test(body) &&
    /sitemap:/i.test(body),
  detail: `HTTP ${res.status}`,
}));

await addTextCheck("sitemap.xml", "/sitemap.xml", (res, body) => ({
  ok: res.ok && body.includes("<urlset") && body.includes("/menu"),
  detail: `HTTP ${res.status}`,
}));

await addTextCheck(
  "Admin route koruması",
  "/admin",
  (res) => {
    const location = res.headers.get("location") ?? "";
    return {
      ok: [302, 303, 307, 308].includes(res.status) && location.includes("/admin/login"),
      detail: `HTTP ${res.status}; Location=${location || "yok"}`,
    };
  },
  { redirect: "manual" },
);

await addTextCheck("Admin giriş sayfası", "/admin/login", (res, body) => ({
  ok: res.ok && /Yönetici paneli/i.test(body),
  detail: `HTTP ${res.status}`,
}));

console.log(`\nKantin production doğrulaması: ${baseUrl.origin}\n`);
for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✗"} ${check.name}`);
  console.log(`  ${check.detail}`);
}

const failed = checks.filter((check) => !check.ok);
console.log(`\nSonuç: ${checks.length - failed.length}/${checks.length} kontrol başarılı.`);

if (failed.length > 0) process.exit(1);
