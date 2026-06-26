import fs from "node:fs";
import path from "node:path";

export const RELEASE_CLEANUP_PATHS = Object.freeze([
  ".next",
  "coverage",
  "playwright-report",
  "test-results",
  "supabase/.temp",
  "tsconfig.tsbuildinfo",
  "BACKUP-TOOL-VERSION.txt",
  "README-STEP6C.txt",
  "README-STEP7B.txt",
  "README-STEP7C.txt",
  "README-STEP7D.txt",
  "VALIDATION.txt",
  "KANTIN-CANLI-ADMIN-KABUL-TESTI-SONUC-RAPORU.md",
  "scripts/inspect-storage-listing.mjs",
  "scripts/verify-storage-copy.mjs",
  "public/assets/css/style.css",
  "public/assets/js/admin.js",
  "public/assets/js/firebase-config.js",
  "public/data/events.json",
  "public/assets/img/memories/merch-wall.webp",
  "public/assets/img/memories/night-team.webp",
  "public/assets/img/memories/outside-team.webp",
  "public/assets/img/memories/pretzel-counter.webp",
  "public/assets/img/memories/team-door-refresh.webp",
]);

function normaliseRoot(root) {
  return path.resolve(root);
}

function readPackageName(root) {
  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(packagePath)) return null;

  try {
    const value = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return typeof value?.name === "string" ? value.name : null;
  } catch {
    return null;
  }
}

export function assertKantinProjectRoot(root) {
  const resolvedRoot = normaliseRoot(root);
  if (readPackageName(resolvedRoot) !== "kantin-website-next") {
    throw new Error("Temizlik yalnız kantin-website-next proje kökünde çalıştırılabilir.");
  }
  return resolvedRoot;
}

export function findReleaseCleanupTargets(root) {
  const resolvedRoot = assertKantinProjectRoot(root);
  return RELEASE_CLEANUP_PATHS.filter((relativePath) =>
    fs.existsSync(path.join(resolvedRoot, relativePath)),
  );
}

export function removeReleaseCleanupTargets(root) {
  const resolvedRoot = assertKantinProjectRoot(root);
  const targets = findReleaseCleanupTargets(resolvedRoot);

  for (const relativePath of targets) {
    const absolutePath = path.resolve(resolvedRoot, relativePath);
    if (!absolutePath.startsWith(`${resolvedRoot}${path.sep}`)) {
      throw new Error(`Güvensiz temizlik yolu reddedildi: ${relativePath}`);
    }
    fs.rmSync(absolutePath, { recursive: true, force: true });
  }

  return targets;
}
