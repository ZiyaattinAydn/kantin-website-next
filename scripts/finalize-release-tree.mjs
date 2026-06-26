#!/usr/bin/env node

import {
  findReleaseCleanupTargets,
  removeReleaseCleanupTargets,
} from "./lib/release-cleanup.mjs";

const apply = process.argv.includes("--apply");
const root = process.cwd();
const targets = findReleaseCleanupTargets(root);

if (!targets.length) {
  console.log("Release temizliği: kaldırılması gereken eski/geçici artefact bulunmadı.");
  process.exit(0);
}

console.log("Release ağacında kaldırılması gereken dosya/dizinler:");
for (const target of targets) console.log(`  - ${target}`);

if (!apply) {
  console.log("\nSilmek için: npm run cleanup:release -- --apply");
  process.exit(1);
}

const removed = removeReleaseCleanupTargets(root);
console.log(`\nRelease temizliği tamamlandı: ${removed.length} hedef kaldırıldı.`);
