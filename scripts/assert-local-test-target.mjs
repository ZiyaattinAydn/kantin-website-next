const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const requireSupabase = process.argv.includes("--require-supabase");

function fail(message) {
  console.error(`[test-safety] ${message}`);
  process.exit(1);
}

function localUrl(name, value, required = false) {
  const normalized = value?.trim();
  if (!normalized) {
    if (required) fail(`${name} açıkça tanımlanmalı; .env.local değerleri kullanılmaz.`);
    return null;
  }

  let url;
  try {
    url = new URL(normalized);
  } catch {
    fail(`${name} geçerli bir URL olmalı.`);
  }

  if (!LOCAL_HOSTS.has(url.hostname)) {
    fail(`${name} yalnız localhost/127.0.0.1/::1 hedefleyebilir.`);
  }

  return url;
}

if (process.env.SITE_ENV?.toLowerCase() === "production") {
  fail("SITE_ENV=production iken test çalıştırılamaz.");
}

if (process.env.VERCEL_ENV?.toLowerCase() === "production") {
  fail("VERCEL_ENV=production iken test çalıştırılamaz.");
}

localUrl(
  "PLAYWRIGHT_BASE_URL",
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100",
  true,
);
localUrl("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
localUrl(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  requireSupabase,
);

console.log("[test-safety] Yerel test hedefi doğrulandı.");
