import { createHash } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

export const BACKUP_FORMAT_VERSION = 3;

export const EXPECTED_STORAGE_BUCKETS = [
  "menu-images",
  "event-images",
  "merch-images",
  "gallery-images",
  "instagram-media",
  "career-cvs",
];

export const REQUIRED_DATABASE_FILES = [
  "roles.sql",
  "schema.sql",
  "data.sql",
  "history_schema.sql",
  "history_data.sql",
];

export const OPTIONAL_DATABASE_FILES = ["auth_storage_changes.sql"];
const STORAGE_BUCKET_PATTERN = /^[a-z0-9][a-z0-9._-]{0,99}$/;

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function buildStorageUri(bucket, prefix = "") {
  if (!STORAGE_BUCKET_PATTERN.test(bucket)) {
    throw new Error(`Geçersiz Storage bucket adı: ${bucket}`);
  }
  const cleanPrefix = String(prefix).replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  return `ss:///${bucket}${cleanPrefix ? `/${cleanPrefix}` : ""}`;
}

export function findDuplicateMigrationVersions(fileNames) {
  const versions = new Map();
  for (const fileName of fileNames) {
    if (!fileName.endsWith(".sql")) continue;
    const match = fileName.match(/^(\d{14})_.+\.sql$/);
    if (!match) {
      throw new Error(`Migration dosyası 14 haneli benzersiz sürümle başlamalı: ${fileName}`);
    }
    const current = versions.get(match[1]) ?? [];
    current.push(fileName);
    versions.set(match[1], current);
  }
  return [...versions.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([version, names]) => ({ version, files: names.sort() }));
}

export async function sha256File(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

export async function listFilesRecursively(rootDir) {
  if (!(await pathExists(rootDir))) return [];
  const results = [];
  for (const entry of await fs.readdir(rootDir, { withFileTypes: true })) {
    const absolutePath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) results.push(...(await listFilesRecursively(absolutePath)));
    else if (entry.isFile()) results.push(absolutePath);
  }
  return results.sort((left, right) => left.localeCompare(right));
}

async function inspectFile(filePath, baseDir) {
  const stat = await fs.stat(filePath);
  return {
    path: path.relative(baseDir, filePath).replaceAll(path.sep, "/"),
    bytes: stat.size,
    sha256: await sha256File(filePath),
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
}

export async function verifySupabaseBackup(backupDir, options = {}) {
  const absoluteBackupDir = path.resolve(backupDir);
  const databaseDir = path.join(absoluteBackupDir, "database");
  const storageDir = path.join(absoluteBackupDir, "storage");
  const metadataDir = path.join(absoluteBackupDir, "metadata");
  const metadataPath = path.join(metadataDir, "backup.json");
  const inventoryPath = path.join(metadataDir, "storage-inventory.json");
  const errors = [];
  const warnings = [];

  let metadata = null;
  try {
    metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
  } catch (error) {
    errors.push(`metadata/backup.json okunamadı: ${error.message}`);
  }
  if (metadata?.formatVersion !== BACKUP_FORMAT_VERSION) {
    errors.push(`Desteklenmeyen yedek formatı: ${metadata?.formatVersion ?? "yok"}.`);
  }
  if (!metadata?.sourceProjectRef) errors.push("Kaynak Supabase project ref bilgisi eksik.");
  if (metadata?.includes?.storageInventory !== true) errors.push("Storage inventory işareti eksik.");

  let inventory = null;
  try {
    inventory = JSON.parse(await fs.readFile(inventoryPath, "utf8"));
  } catch (error) {
    errors.push(`metadata/storage-inventory.json okunamadı: ${error.message}`);
  }
  const inventoryByBucket = new Map(
    Array.isArray(inventory?.buckets) ? inventory.buckets.map((item) => [item.id, item]) : [],
  );

  const databaseFiles = [];
  for (const fileName of REQUIRED_DATABASE_FILES) {
    const filePath = path.join(databaseDir, fileName);
    if (!(await pathExists(filePath))) {
      errors.push(`database/${fileName} bulunamadı.`);
      continue;
    }
    const inspected = await inspectFile(filePath, absoluteBackupDir);
    if (inspected.bytes === 0) errors.push(`database/${fileName} boş.`);
    databaseFiles.push(inspected);
  }
  for (const fileName of OPTIONAL_DATABASE_FILES) {
    const filePath = path.join(databaseDir, fileName);
    if (!(await pathExists(filePath))) {
      warnings.push(`database/${fileName} bulunamadı.`);
      continue;
    }
    databaseFiles.push(await inspectFile(filePath, absoluteBackupDir));
  }

  const storage = {};
  let totalStorageFiles = 0;
  let totalStorageBytes = 0;

  for (const bucket of EXPECTED_STORAGE_BUCKETS) {
    const bucketDir = path.join(storageDir, bucket);
    const accessPath = path.join(metadataDir, "storage-access", `${bucket}.txt`);
    const inventoryBucket = inventoryByBucket.get(bucket);
    if (!inventoryBucket || inventoryBucket.exists !== true || !Array.isArray(inventoryBucket.objects)) {
      errors.push(`${bucket}: geçerli uzak envanter kaydı yok.`);
    }
    if (!(await pathExists(accessPath))) errors.push(`metadata/storage-access/${bucket}.txt bulunamadı.`);
    if (!(await pathExists(bucketDir))) {
      errors.push(`storage/${bucket} klasörü bulunamadı.`);
      storage[bucket] = { files: [], fileCount: 0, bytes: 0, remoteFileCount: null };
      continue;
    }

    const expectedObjects = Array.isArray(inventoryBucket?.objects) ? inventoryBucket.objects : [];
    const expectedMap = new Map(expectedObjects.map((item) => [item.name, item.size == null ? null : Number(item.size)]));
    const files = await listFilesRecursively(bucketDir);
    const localMap = new Map();
    const inspectedFiles = [];
    let bucketBytes = 0;

    for (const filePath of files) {
      const relative = path.relative(bucketDir, filePath).replaceAll(path.sep, "/");
      const inspected = await inspectFile(filePath, absoluteBackupDir);
      localMap.set(relative, inspected.bytes);
      inspectedFiles.push(inspected);
      bucketBytes += inspected.bytes;
    }

    const missing = [...expectedMap.keys()].filter((name) => !localMap.has(name));
    const extra = [...localMap.keys()].filter((name) => !expectedMap.has(name));
    const sizeMismatches = [];
    for (const [name, expectedSize] of expectedMap) {
      if (expectedSize == null || !localMap.has(name)) continue;
      const actualSize = localMap.get(name);
      if (actualSize !== expectedSize) sizeMismatches.push(`${name} (${actualSize}/${expectedSize})`);
    }
    if (missing.length) errors.push(`${bucket}: ${missing.length} uzak dosya yerelde eksik: ${missing.slice(0, 5).join(", ")}`);
    if (extra.length) errors.push(`${bucket}: ${extra.length} beklenmeyen yerel dosya: ${extra.slice(0, 5).join(", ")}`);
    if (sizeMismatches.length) errors.push(`${bucket}: ${sizeMismatches.length} boyut uyuşmazlığı: ${sizeMismatches.slice(0, 3).join(", ")}`);

    totalStorageFiles += inspectedFiles.length;
    totalStorageBytes += bucketBytes;
    storage[bucket] = {
      fileCount: inspectedFiles.length,
      remoteFileCount: expectedMap.size,
      bytes: bucketBytes,
      files: inspectedFiles,
    };
  }

  const manifest = {
    formatVersion: BACKUP_FORMAT_VERSION,
    verifiedAt: new Date().toISOString(),
    sourceProjectRef: metadata?.sourceProjectRef ?? null,
    createdAt: metadata?.createdAt ?? null,
    database: {
      fileCount: databaseFiles.length,
      bytes: databaseFiles.reduce((sum, item) => sum + item.bytes, 0),
      files: databaseFiles,
    },
    storage,
    totals: { storageFiles: totalStorageFiles, storageBytes: totalStorageBytes },
    warnings,
    errors,
    valid: errors.length === 0,
  };

  if (options.writeReports !== false) {
    await fs.writeFile(path.join(absoluteBackupDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
    const rows = EXPECTED_STORAGE_BUCKETS.map((bucket) => {
      const item = storage[bucket];
      return `| ${bucket} | ${item.fileCount} | ${item.remoteFileCount ?? "?"} | ${formatBytes(item.bytes)} |`;
    }).join("\n");
    const report = `# Supabase yedek doğrulama raporu\n\n` +
      `- Sonuç: **${manifest.valid ? "BAŞARILI" : "BAŞARISIZ"}**\n` +
      `- Kaynak proje: \`${manifest.sourceProjectRef ?? "bilinmiyor"}\`\n` +
      `- Yedek zamanı: ${manifest.createdAt ?? "bilinmiyor"}\n` +
      `- Doğrulama zamanı: ${manifest.verifiedAt}\n` +
      `- Veritabanı dosyaları: ${manifest.database.fileCount}\n` +
      `- Storage dosyaları: ${manifest.totals.storageFiles}\n` +
      `- Storage boyutu: ${formatBytes(manifest.totals.storageBytes)}\n\n` +
      `## Storage özeti\n\n| Bucket | Yerel dosya | Uzak envanter | Boyut |\n|---|---:|---:|---:|\n${rows}\n\n` +
      `## Uyarılar\n\n${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- Yok"}\n\n` +
      `## Hatalar\n\n${errors.length ? errors.map((item) => `- ${item}`).join("\n") : "- Yok"}\n`;
    await fs.writeFile(path.join(absoluteBackupDir, "VERIFY_REPORT.md"), report, { mode: 0o600 });
  }

  return manifest;
}
