import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

import {
  EXPECTED_STORAGE_BUCKETS,
  REQUIRED_DATABASE_FILES,
  buildStorageUri,
  findDuplicateMigrationVersions,
  inspectStorageListing,
  verifySupabaseBackup,
} from "../../../scripts/lib/supabase-backup.mjs";

const execFile = promisify(execFileCallback);
const tempDirs: string[] = [];

const bucketDefinitions = EXPECTED_STORAGE_BUCKETS.map((id) => ({
  id,
  name: id,
  public: id !== "career-cvs",
  fileSizeLimit: id === "career-cvs" ? 5_242_880 : 8_388_608,
  allowedMimeTypes:
    id === "career-cvs"
      ? ["application/pdf"]
      : ["image/jpeg", "image/png", "image/webp", "image/avif"],
}));

async function createBackupFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kantin-backup-"));
  tempDirs.push(root);

  await fs.mkdir(path.join(root, "database"), { recursive: true });
  await fs.mkdir(path.join(root, "metadata", "storage-listings"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(root, "metadata", "backup.json"),
    JSON.stringify({
      formatVersion: 2,
      sourceProjectRef: "abcdefghijklmnopqrst",
      createdAt: "2026-06-25T00:00:00Z",
      includes: {
        migrationHistory: false,
        storageBucketDefinitions: bucketDefinitions,
      },
    }),
  );

  for (const fileName of REQUIRED_DATABASE_FILES) {
    await fs.writeFile(
      path.join(root, "database", fileName),
      `-- ${fileName}\nselect 1;\n`,
    );
  }

  await fs.writeFile(
    path.join(root, "database", "auth_storage_changes.sql"),
    "-- no diff\n",
  );

  for (const bucket of EXPECTED_STORAGE_BUCKETS) {
    const bucketDir = path.join(root, "storage", bucket);
    await fs.mkdir(bucketDir, { recursive: true });
    await fs.writeFile(
      path.join(root, "metadata", "storage-listings", `${bucket}.json`),
      "[]\n",
    );
  }

  await fs.writeFile(
    path.join(root, "storage", "menu-images", "sample.webp"),
    "image-content",
  );
  await fs.writeFile(
    path.join(root, "metadata", "storage-listings", "menu-images.json"),
    JSON.stringify([
      {
        name: "sample.webp",
        id: "11111111-1111-1111-1111-111111111111",
        metadata: { size: 13 },
      },
    ]),
  );

  return root;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("Supabase yedek doğrulayıcısı", () => {
  it("tam yedek klasörünü doğrular ve manifest üretir", async () => {
    const root = await createBackupFixture();

    const result = await verifySupabaseBackup(root);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.totals.storageFiles).toBe(1);
    const storage = result.storage as Record<
      string,
      { fileCount: number; remoteFileCount: number }
    >;
    expect(storage["menu-images"].fileCount).toBe(1);
    expect(storage["menu-images"].remoteFileCount).toBe(1);
    expect(storage["career-cvs"].fileCount).toBe(0);
    await expect(fs.stat(path.join(root, "manifest.json"))).resolves.toBeTruthy();
    await expect(
      fs.readFile(path.join(root, "VERIFY_REPORT.md"), "utf8"),
    ).resolves.toContain("BAŞARILI");
  });

  it("zorunlu SQL dosyası eksikse yedeği geçersiz sayar", async () => {
    const root = await createBackupFixture();
    await fs.rm(path.join(root, "database", "data.sql"));

    const result = await verifySupabaseBackup(root, { writeReports: false });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("database/data.sql bulunamadı.");
  });

  it("Storage URI değerini CLI'ın zorunlu üç eğik çizgi biçiminde üretir", () => {
    expect(buildStorageUri("menu-images")).toBe("ss:///menu-images");
    expect(buildStorageUri("menu-images", "/nested/path/")).toBe(
      "ss:///menu-images/nested/path",
    );
    expect(() => buildStorageUri("bad bucket")).toThrow(
      "Geçersiz Storage bucket adı",
    );
  });

  it("aynı sürüm numarasını kullanan migration dosyalarını reddeder", () => {
    expect(
      findDuplicateMigrationVersions([
        "20260624030000_first.sql",
        "20260624030000_second.sql",
      ]),
    ).toEqual([
      {
        version: "20260624030000",
        files: ["20260624030000_first.sql", "20260624030000_second.sql"],
      },
    ]);
  });

  it("Storage liste çıktısından gerçek dosya yollarını ayırır", () => {
    expect(
      inspectStorageListing(
        [
          { name: "folder", id: null, metadata: null, type: "folder" },
          { name: "folder/image.webp", id: "id", metadata: { size: 10 } },
        ],
        "menu-images",
      ),
    ).toMatchObject({
      recognized: true,
      entryCount: 2,
      fileCount: 1,
      files: ["folder/image.webp"],
    });
  });

  it("uzak Storage listesinde olan dosya yerelde yoksa yedeği reddeder", async () => {
    const root = await createBackupFixture();
    await fs.writeFile(
      path.join(root, "metadata", "storage-listings", "menu-images.json"),
      JSON.stringify([
        { name: "sample.webp", id: "id-1", metadata: { size: 13 } },
        { name: "missing.webp", id: "id-2", metadata: { size: 5 } },
      ]),
    );

    const result = await verifySupabaseBackup(root, { writeReports: false });

    expect(result.valid).toBe(false);
    expect(result.errors.some((item) => item.includes("uzak dosya yerelde bulunamadı"))).toBe(true);
  });

  it("restore aracı kaynak project ref ile aynı hedefi reddeder", async () => {
    const script = await fs.readFile(
      path.join(process.cwd(), "scripts", "restore-supabase-to-test-project.sh"),
      "utf8",
    );

    expect(script).toContain('[[ "$TARGET_REF" != "$SOURCE_REF" ]]');
    expect(script).toContain(
      "Kaynak production projesine geri yükleme kesin olarak engellendi",
    );
    expect(script).toContain("YENI_TEST_PROJESINE_GERI_YUKLE $TARGET_REF");
  });

  it("backup ve restore Storage yollarında yalnız ss:/// biçimini kullanır", async () => {
    const backupScript = await fs.readFile(
      path.join(process.cwd(), "scripts", "backup-supabase.sh"),
      "utf8",
    );
    const restoreScript = await fs.readFile(
      path.join(process.cwd(), "scripts", "restore-supabase-to-test-project.sh"),
      "utf8",
    );

    expect(backupScript).toContain('storage_uri="ss:///$bucket"');
    expect(restoreScript).toContain('"ss:///$bucket"');
    expect(backupScript).not.toContain('"ss://$bucket"');
    expect(restoreScript).not.toContain('"ss://$bucket"');
    expect(backupScript.indexOf("storage ls")).toBeLessThan(
      backupScript.indexOf("db dump --db-url"),
    );
  });

  it("placeholder içeren connection string'e parolayı güvenli biçimde ekler", async () => {
    const { stdout } = await execFile(
      process.execPath,
      [path.join(process.cwd(), "scripts", "normalize-supabase-db-url.mjs")],
      {
        env: {
          ...process.env,
          DB_URL_INPUT:
            "postgresql://postgres.abcdefghijklmnopqrst:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
          DB_PASSWORD_INPUT: "Sifre@123",
          EXPECTED_PROJECT_REF: "abcdefghijklmnopqrst",
        },
      },
    );

    const result = JSON.parse(stdout);
    expect(result.needsPassword).toBe(false);
    expect(result.password).toBe("Sifre@123");
    expect(result.normalizedUrl).toContain("Sifre%40123");
  });

  it("yerel yedek klasörlerini Git dışında tutar", async () => {
    const gitignore = await fs.readFile(
      path.join(process.cwd(), ".gitignore"),
      "utf8",
    );

    expect(gitignore).toContain("/supabase-backups/");
    expect(gitignore).toContain("/supabase-restore-work/");
  });

  it("beklenen bucket klasörü eksikse yedeği geçersiz sayar", async () => {
    const root = await createBackupFixture();
    await fs.rm(path.join(root, "storage", "career-cvs"), {
      recursive: true,
      force: true,
    });

    const result = await verifySupabaseBackup(root, { writeReports: false });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("storage/career-cvs klasörü bulunamadı.");
  });
});
