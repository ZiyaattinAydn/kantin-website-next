#!/usr/bin/env node
import { verifySupabaseBackup } from "./lib/supabase-backup.mjs";

const backupDir = process.argv[2];
if (!backupDir) {
  console.error("Kullanım: node scripts/verify-supabase-backup.mjs <yedek-klasörü>");
  process.exit(2);
}

try {
  const manifest = await verifySupabaseBackup(backupDir);
  console.log(`Yedek doğrulama: ${manifest.valid ? "BAŞARILI" : "BAŞARISIZ"}`);
  console.log(`Storage dosyaları: ${manifest.totals.storageFiles}`);
  console.log(`Rapor: ${backupDir}/VERIFY_REPORT.md`);
  process.exit(manifest.valid ? 0 : 1);
} catch (error) {
  console.error(`Yedek doğrulanamadı: ${error.message}`);
  process.exit(1);
}
