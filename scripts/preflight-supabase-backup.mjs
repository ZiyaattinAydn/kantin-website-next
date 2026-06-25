#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  EXPECTED_STORAGE_BUCKETS,
  buildStorageUri,
  findDuplicateMigrationVersions,
} from "./lib/supabase-backup.mjs";

const migrationsDir = path.resolve(
  process.argv[2] ?? path.join(process.cwd(), "supabase", "migrations"),
);

const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
const migrationFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
  .map((entry) => entry.name)
  .sort();

const duplicates = findDuplicateMigrationVersions(migrationFiles);
if (duplicates.length > 0) {
  for (const duplicate of duplicates) {
    console.error(
      `Aynı migration sürümü birden fazla dosyada kullanılmış: ${duplicate.version}`,
    );
    for (const fileName of duplicate.files) console.error(`  - ${fileName}`);
  }
  process.exit(1);
}

for (const bucket of EXPECTED_STORAGE_BUCKETS) {
  const uri = buildStorageUri(bucket);
  if (!uri.startsWith("ss:///")) {
    throw new Error(`Storage URI güvenlik kontrolü başarısız: ${uri}`);
  }
}

console.log(`Migration ön kontrolü: ${migrationFiles.length} dosya, çakışma yok.`);
console.log(`Storage URI ön kontrolü: ${EXPECTED_STORAGE_BUCKETS.length} bucket geçerli.`);
