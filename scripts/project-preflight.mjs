import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];
const ok = (name, detail) => results.push({ ok: true, name, detail });
const fail = (name, detail) => results.push({ ok: false, name, detail });

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const required = [
  "package.json",
  "package-lock.json",
  ".env.example",
  "src/app/page.tsx",
  "src/app/menu/page.tsx",
  "src/app/events/page.tsx",
  "src/app/careers/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/login/page.tsx",
  "src/proxy.ts",
  "supabase/seed.sql",
  "supabase/migrations/20260620010000_initial_schema.sql",
  "supabase/migrations/20260620020000_rls_policies.sql",
  "supabase/migrations/20260620030000_storage_buckets_and_policies.sql",
  "supabase/migrations/20260620040000_career_applications.sql",
  "supabase/migrations/20260620050000_admin_auth_hardening.sql",
  "supabase/migrations/20260620060000_admin_crud_support.sql",
  "supabase/migrations/20260620070000_controlled_theme_settings.sql",
];

const missing = required.filter((file) => !exists(file));
if (missing.length) fail("Gerekli proje dosyaları", `Eksik: ${missing.join(", ")}`);
else ok("Gerekli proje dosyaları", `${required.length} dosya mevcut`);

if (exists(".env.local")) {
  fail("Gizli environment dosyası", ".env.local proje klasöründe mevcut; release ZIP'e eklenmemeli");
} else {
  ok("Gizli environment dosyası", ".env.local release ağacında yok");
}

const envExample = exists(".env.example") ? fs.readFileSync(path.join(root, ".env.example"), "utf8") : "";
const envNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "SITE_ENV",
];
const missingEnvNames = envNames.filter((name) => !envExample.includes(name));
if (missingEnvNames.length) fail("Environment şablonu", `Eksik: ${missingEnvNames.join(", ")}`);
else ok("Environment şablonu", "Gerekli dört değişken belgelenmiş");

const scanRoots = ["src", "scripts"];
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json"]);
const files = [];
function walk(dir) {
  if (!exists(dir)) return;
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel);
    else if (textExtensions.has(path.extname(entry.name))) files.push(rel);
  }
}
for (const dir of scanRoots) walk(dir);

const secretPatterns = [
  /sb_secret_[A-Za-z0-9_-]{12,}/g,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g,
];
const secretHits = [];
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) secretHits.push(file);
    pattern.lastIndex = 0;
  }
}
if (secretHits.length) fail("Secret taraması", `Şüpheli değer: ${[...new Set(secretHits)].join(", ")}`);
else ok("Secret taraması", `${files.length} kaynak dosyasında gömülü secret bulunmadı`);

const assetRegex = /["'`](\/[A-Za-z0-9_@%+.,()\-\/ ]+\.(?:png|jpe?g|webp|avif|svg|ico))["'`]/gi;
const referenced = new Set();
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of text.matchAll(assetRegex)) referenced.add(match[1]);
}
const missingAssets = [...referenced].filter((asset) => {
  if (asset.startsWith("//")) return false;
  return !fs.existsSync(path.join(root, "public", asset.slice(1)));
});
if (missingAssets.length) fail("Yerel görsel referansları", `Eksik: ${missingAssets.join(", ")}`);
else ok("Yerel görsel referansları", `${referenced.size} referansın tamamı mevcut`);

const forbiddenDirs = [".git", ".next"];
const presentGenerated = forbiddenDirs.filter(exists);
if (presentGenerated.length) {
  results.push({ ok: true, warning: true, name: "Release temizliği", detail: `ZIP hazırlarken çıkarılmalı: ${presentGenerated.join(", ")}` });
} else ok("Release temizliği", "Generated/Git dizinleri yok");

console.log("\nKantin proje preflight\n");
for (const result of results) {
  const icon = result.ok ? (result.warning ? "!" : "✓") : "✗";
  console.log(`${icon} ${result.name}`);
  console.log(`  ${result.detail}`);
}

const failures = results.filter((result) => !result.ok);
console.log(`\nSonuç: ${results.length - failures.length}/${results.length} kontrol başarılı.`);
if (failures.length) process.exit(1);
