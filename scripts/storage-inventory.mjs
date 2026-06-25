#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  EXPECTED_STORAGE_BUCKETS,
  listFilesRecursively,
} from "./lib/supabase-backup.mjs";

const [command, inventoryPath, arg3, arg4] = process.argv.slice(2);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function isSafePortableObjectPath(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.includes("\0") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith("/") || /^[a-zA-Z]:/.test(value)) return false;
  if (value.length > 240) return false;

  const segments = value.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")) {
    return false;
  }

  for (const segment of segments) {
    if (/[<>:"|?*]/.test(segment)) return false;
    if (/[. ]$/.test(segment)) return false;
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(segment)) return false;
  }

  return true;
}

export function validateStorageInventory(value) {
  const errors = [];
  if (!value || typeof value !== "object") {
    return { valid: false, errors: ["Storage inventory JSON nesnesi değil."], buckets: [] };
  }
  if (value.formatVersion !== 1) {
    errors.push(`Desteklenmeyen Storage inventory sürümü: ${value.formatVersion ?? "yok"}.`);
  }
  if (!Array.isArray(value.buckets)) {
    return { valid: false, errors: [...errors, "Storage inventory buckets dizisi eksik."], buckets: [] };
  }

  const byId = new Map();
  for (const bucket of value.buckets) {
    if (!bucket || typeof bucket !== "object" || typeof bucket.id !== "string") {
      errors.push("Geçersiz bucket kaydı bulundu.");
      continue;
    }
    if (byId.has(bucket.id)) errors.push(`Tekrarlanan bucket kaydı: ${bucket.id}.`);
    byId.set(bucket.id, bucket);
  }

  for (const expected of EXPECTED_STORAGE_BUCKETS) {
    const bucket = byId.get(expected);
    if (!bucket) {
      errors.push(`Storage inventory içinde bucket yok: ${expected}.`);
      continue;
    }
    if (bucket.exists !== true) {
      errors.push(`Uzak projede beklenen bucket bulunamadı: ${expected}.`);
    }
    if (!Array.isArray(bucket.objects)) {
      errors.push(`${expected}: objects dizisi eksik.`);
      continue;
    }

    const names = new Set();
    for (const object of bucket.objects) {
      const name = object?.name;
      if (!isSafePortableObjectPath(name)) {
        errors.push(`${expected}: Windows üzerinde güvenli yedeklenemeyen nesne yolu: ${JSON.stringify(name)}.`);
        continue;
      }
      if (names.has(name)) errors.push(`${expected}: tekrarlanan nesne yolu: ${name}.`);
      names.add(name);
      if (object.size != null && (!Number.isSafeInteger(Number(object.size)) || Number(object.size) < 0)) {
        errors.push(`${expected}/${name}: geçersiz boyut bilgisi.`);
      }
    }
  }

  return { valid: errors.length === 0, errors, buckets: value.buckets };
}

async function readInventory(filePath) {
  if (!filePath) fail("Storage inventory dosyası belirtilmedi.");
  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    fail(`Storage inventory okunamadı: ${error.message}`);
  }
  const result = validateStorageInventory(parsed);
  if (!result.valid) fail(result.errors.join("\n"));
  return parsed;
}

function getBucket(inventory, bucketId) {
  const bucket = inventory.buckets.find((item) => item.id === bucketId);
  if (!bucket) fail(`Storage inventory içinde bucket bulunamadı: ${bucketId}.`);
  return bucket;
}

async function verifyLocal(inventory, storageRoot) {
  const errors = [];
  const summary = {};

  for (const bucketId of EXPECTED_STORAGE_BUCKETS) {
    const bucket = getBucket(inventory, bucketId);
    const bucketDir = path.join(storageRoot, bucketId);
    const localFiles = await listFilesRecursively(bucketDir);
    const localMap = new Map(
      await Promise.all(localFiles.map(async (filePath) => {
        const relative = path.relative(bucketDir, filePath).replaceAll(path.sep, "/");
        const stat = await fs.stat(filePath);
        return [relative, stat.size];
      })),
    );
    const remoteMap = new Map(bucket.objects.map((item) => [item.name, item.size == null ? null : Number(item.size)]));

    const missing = [...remoteMap.keys()].filter((name) => !localMap.has(name));
    const extra = [...localMap.keys()].filter((name) => !remoteMap.has(name));
    const sizeMismatches = [];
    for (const [name, expectedSize] of remoteMap) {
      if (expectedSize == null || !localMap.has(name)) continue;
      const actualSize = localMap.get(name);
      if (actualSize !== expectedSize) sizeMismatches.push({ name, expectedSize, actualSize });
    }

    if (missing.length) errors.push(`${bucketId}: ${missing.length} dosya yerelde eksik: ${missing.slice(0, 5).join(", ")}`);
    if (extra.length) errors.push(`${bucketId}: ${extra.length} beklenmeyen yerel dosya: ${extra.slice(0, 5).join(", ")}`);
    if (sizeMismatches.length) {
      errors.push(`${bucketId}: ${sizeMismatches.length} dosyanın boyutu farklı: ${sizeMismatches.slice(0, 3).map((item) => `${item.name} (${item.actualSize}/${item.expectedSize})`).join(", ")}`);
    }

    summary[bucketId] = {
      remoteFileCount: remoteMap.size,
      localFileCount: localMap.size,
      missing: missing.length,
      extra: extra.length,
      sizeMismatches: sizeMismatches.length,
    };
  }

  if (errors.length) fail(errors.join("\n"));
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}


async function compareInventories(source, target) {
  const errors = [];
  for (const bucketId of EXPECTED_STORAGE_BUCKETS) {
    const left = getBucket(source, bucketId);
    const right = getBucket(target, bucketId);
    const leftMap = new Map(left.objects.map((item) => [item.name, item.size == null ? null : Number(item.size)]));
    const rightMap = new Map(right.objects.map((item) => [item.name, item.size == null ? null : Number(item.size)]));
    const missing = [...leftMap.keys()].filter((name) => !rightMap.has(name));
    const extra = [...rightMap.keys()].filter((name) => !leftMap.has(name));
    const sizeMismatches = [];
    for (const [name, expectedSize] of leftMap) {
      if (expectedSize == null || !rightMap.has(name)) continue;
      const actualSize = rightMap.get(name);
      if (actualSize != null && actualSize !== expectedSize) sizeMismatches.push(name);
    }
    if (missing.length) errors.push(`${bucketId}: hedefte ${missing.length} dosya eksik.`);
    if (extra.length) errors.push(`${bucketId}: hedefte ${extra.length} fazladan dosya var.`);
    if (sizeMismatches.length) errors.push(`${bucketId}: hedefte ${sizeMismatches.length} boyut uyuşmazlığı var.`);
  }
  if (errors.length) fail(errors.join("\n"));
  console.log("Kaynak ve hedef Storage envanterleri eşleşiyor.");
}

switch (command) {
  case "validate": {
    const inventory = await readInventory(inventoryPath);
    const count = inventory.buckets.reduce((sum, bucket) => sum + bucket.objects.length, 0);
    console.log(`Storage inventory doğrulandı: ${inventory.buckets.length} bucket, ${count} nesne.`);
    break;
  }
  case "count": {
    const inventory = await readInventory(inventoryPath);
    process.stdout.write(String(getBucket(inventory, arg3).objects.length));
    break;
  }
  case "paths0": {
    const inventory = await readInventory(inventoryPath);
    for (const object of getBucket(inventory, arg3).objects) process.stdout.write(`${object.name}\0`);
    break;
  }
  case "verify-local": {
    const inventory = await readInventory(inventoryPath);
    if (!arg3) fail("Yerel Storage kök klasörü belirtilmedi.");
    await verifyLocal(inventory, arg3);
    break;
  }
  case "merge-metadata": {
    const inventory = await readInventory(inventoryPath);
    if (!arg3) fail("backup.json yolu belirtilmedi.");
    const metadata = JSON.parse(await fs.readFile(arg3, "utf8"));
    metadata.includes.storageBucketDefinitions = inventory.buckets.map((bucket) => ({
      id: bucket.id,
      name: bucket.name,
      public: bucket.public === true,
      fileSizeLimit: bucket.fileSizeLimit == null ? null : Number(bucket.fileSizeLimit),
      allowedMimeTypes: Array.isArray(bucket.allowedMimeTypes) ? bucket.allowedMimeTypes : null,
    }));
    metadata.includes.storageInventory = true;
    await fs.writeFile(arg3, `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 });
    break;
  }
  case "compare": {
    const source = await readInventory(inventoryPath);
    const target = await readInventory(arg3);
    await compareInventories(source, target);
    break;
  }
  case "bucket-sql": {
    const inventory = await readInventory(inventoryPath);
    const outputPath = arg3;
    if (!outputPath) fail("SQL çıktı yolu belirtilmedi.");
    const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
    const rows = inventory.buckets.map((bucket) => {
      const mimeTypes = Array.isArray(bucket.allowedMimeTypes)
        ? `array[${bucket.allowedMimeTypes.map(literal).join(", ")}]::text[]`
        : "null";
      const limit = bucket.fileSizeLimit == null ? "null" : String(Number(bucket.fileSizeLimit));
      return `(${literal(bucket.id)}, ${literal(bucket.name)}, ${bucket.public === true ? "true" : "false"}, ${limit}, ${mimeTypes})`;
    });
    const sql = `begin;\ninsert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)\nvalues\n  ${rows.join(",\n  ")}\non conflict (id) do update set\n  name = excluded.name,\n  public = excluded.public,\n  file_size_limit = excluded.file_size_limit,\n  allowed_mime_types = excluded.allowed_mime_types;\ncommit;\n`;
    await fs.writeFile(outputPath, sql, { mode: 0o600 });
    break;
  }
  default:
    fail("Kullanım: storage-inventory.mjs <validate|count|paths0|verify-local|merge-metadata|compare|bucket-sql> ...");
}
