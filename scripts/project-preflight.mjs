import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];
const ok = (name, detail) => results.push({ ok: true, name, detail });
const warn = (name, detail) => results.push({ ok: true, warning: true, name, detail });
const fail = (name, detail) => results.push({ ok: false, name, detail });

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const required = [
  "package.json",
  "package-lock.json",
  ".env.example",
  "README.md",
  "CHANGELOG.md",
  "vitest.config.ts",
  "playwright.config.ts",
  "scripts/assert-local-test-target.mjs",
  "scripts/backup-supabase.sh",
  "scripts/restore-supabase-to-test-project.sh",
  "scripts/run-local-regression.sh",
  "scripts/finalize-release-tree.mjs",
  "src/lib/admin/pagination.ts",
  "src/lib/admin/revision-actions.ts",
  "src/lib/public-data/merch.ts",
  "supabase/config.toml",
  "supabase/seed.sql",
  "supabase/tests/rls_policies.test.sql",
  "supabase/tests/storage_policies.test.sql",
  "supabase/tests/career_rpc.test.sql",
  "supabase/tests/career_retention.test.sql",
  "supabase/tests/admin_audit.test.sql",
  "supabase/tests/admin_record_revisions.test.sql",
  "supabase/tests/admin_record_revision_restore.test.sql",
  "supabase/tests/service_role_profiles.test.sql",
  "supabase/verification/verify_release_readiness.sql",
  "src/app/page.tsx",
  "src/app/menu/page.tsx",
  "src/app/events/page.tsx",
  "src/app/careers/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/login/page.tsx",
  "src/proxy.ts",
];

const missing = required.filter((file) => !exists(file));
if (missing.length) fail("Gerekli proje dosyaları", `Eksik: ${missing.join(", ")}`);
else ok("Gerekli proje dosyaları", `${required.length} dosya mevcut`);

const readme = exists("README.md")
  ? fs.readFileSync(path.join(root, "README.md"), "utf8")
  : "";
if (/^# Kantin Website\s*$/m.test(readme) && /test:regression:local/.test(readme)) {
  ok("Ana README", "Proje kurulumu, test ve release durumu belgelenmiş");
} else {
  fail("Ana README", "README proje belgesi değil veya güncel test komutlarını içermiyor");
}

if (exists(".env.local")) {
  warn("Gizli environment dosyası", ".env.local yerelde mevcut; release arşivine ve Git'e eklenmemeli");
} else {
  ok("Gizli environment dosyası", ".env.local release ağacında yok");
}

const envExample = exists(".env.example")
  ? fs.readFileSync(path.join(root, ".env.example"), "utf8")
  : "";
const envNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "SITE_ENV",
];
const missingEnvNames = envNames.filter((name) => !envExample.includes(name));
if (missingEnvNames.length) fail("Environment şablonu", `Eksik: ${missingEnvNames.join(", ")}`);
else if (/sb_secret_|service_role|DATABASE_PASSWORD/i.test(envExample.replace(/^#.*$/gm, ""))) {
  fail("Environment şablonu", "Public environment şablonunda secret/service-role alanı bulunuyor");
} else {
  ok("Environment şablonu", "Yalnız gerekli public değişkenler belgelenmiş");
}

const migrationDir = path.join(root, "supabase", "migrations");
const migrationFiles = exists("supabase/migrations")
  ? fs.readdirSync(migrationDir).filter((name) => /^\d{14}_.+\.sql$/.test(name)).sort()
  : [];
const versions = new Map();
for (const file of migrationFiles) {
  const version = file.slice(0, 14);
  versions.set(version, [...(versions.get(version) ?? []), file]);
}
const duplicates = [...versions.entries()].filter(([, files]) => files.length > 1);
if (!migrationFiles.length) fail("Migration zinciri", "Migration dosyası bulunamadı");
else if (duplicates.length) {
  fail(
    "Migration zinciri",
    `Çakışan sürümler: ${duplicates.map(([version, files]) => `${version} (${files.join(", ")})`).join("; ")}`,
  );
} else {
  ok("Migration zinciri", `${migrationFiles.length} benzersiz migration sıralı`);
}

const scanRoots = ["src", "scripts", "supabase", "docs"];
const textExtensions = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".md", ".txt",
  ".sql", ".sh", ".ps1", ".toml", ".bat", ".yml", ".yaml",
]);
const files = [];
function walk(relativeDir) {
  if (!exists(relativeDir)) return;
  for (const entry of fs.readdirSync(path.join(root, relativeDir), { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "coverage", "test-results", "playwright-report"].includes(entry.name)) continue;
      walk(relativePath);
    } else if (textExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(relativePath);
    }
  }
}
for (const directory of scanRoots) walk(directory);

const secretPatterns = [
  /sb_secret_[A-Za-z0-9_-]{20,}/g,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
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
else ok("Secret taraması", `${files.length} metin dosyasında gömülü secret bulunmadı`);

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

const obsoleteRuntimeFiles = [
  "public/assets/css/style.css",
  "public/assets/js/admin.js",
  "public/assets/js/firebase-config.js",
  "public/data/events.json",
  "scripts/inspect-storage-listing.mjs",
  "scripts/verify-storage-copy.mjs",
].filter(exists);
if (obsoleteRuntimeFiles.length) {
  fail("Eski runtime artefactları", `Kaldırılmalı: ${obsoleteRuntimeFiles.join(", ")}`);
} else {
  ok("Eski runtime artefactları", "Kullanılmayan Firebase/demo katmanı bulunmuyor");
}

const localOnly = [
  ".vercel",
  "supabase/.branches",
  "supabase/.temp",
  "qa-live-write",
  "supabase-backups",
].filter(exists);
if (localOnly.length) {
  warn("Yerel-only dosyalar", `Git/release kapsamı dışında tutulmalı: ${localOnly.join(", ")}`);
} else {
  ok("Yerel-only dosyalar", "Yerel platform ve kabul testi metadatası release ağacında yok");
}

console.log("\nKantin proje preflight\n");
for (const result of results) {
  const icon = result.ok ? (result.warning ? "!" : "✓") : "✗";
  console.log(`${icon} ${result.name}`);
  console.log(`  ${result.detail}`);
}

const failures = results.filter((result) => !result.ok);
console.log(`\nSonuç: ${results.length - failures.length}/${results.length} kontrol başarılı.`);
if (failures.length) process.exit(1);
