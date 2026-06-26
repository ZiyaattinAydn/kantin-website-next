import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("yerel regresyon çalıştırıcısı", () => {
  it("uzak Supabase URL'siyle TEST admin hazırlamayı reddeder", async () => {
    await expect(
      execFileAsync(process.execPath, [path.join(process.cwd(), "scripts", "ensure-local-test-admin.mjs")], {
        env: {
          ...process.env,
          NEXT_PUBLIC_SUPABASE_URL: "https://production-example.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "TEST_only_local_key",
          E2E_ADMIN_EMAIL: "test-admin@example.com",
          E2E_ADMIN_PASSWORD: "TEST_password_1234",
        },
      }),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("yalnız yerel Supabase hedefinde"),
    });
  });

  it("yerel reset için açık onay ve production hedef koruması içerir", async () => {
    const source = await fs.readFile(
      path.join(process.cwd(), "scripts", "run-local-regression.sh"),
      "utf8",
    );

    expect(source).toContain("YEREL_TEST_VERITABANINI_SIFIRLA");
    expect(source).toContain("assert-local-test-target.mjs --require-supabase");
    expect(source).toContain("supabase db reset");
    expect(source).toContain("npm run test:db");
    expect(source).toContain("npm run test:e2e");
  });


  it("legacy service-role anahtarını opaque secret anahtarından önce kullanır", async () => {
    const source = await fs.readFile(
      path.join(process.cwd(), "scripts", "run-local-regression.sh"),
      "utf8",
    );

    expect(source).toContain(
      'SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY:-${SECRET_KEY:-}}"',
    );
  });

  it("service_role için profiles GRANT migration'ı ve pgTAP testi içerir", async () => {
    const migration = await fs.readFile(
      path.join(
        process.cwd(),
        "supabase",
        "migrations",
        "20260625030000_service_role_profile_management.sql",
      ),
      "utf8",
    );
    const dbTest = await fs.readFile(
      path.join(process.cwd(), "supabase", "tests", "service_role_profiles.test.sql"),
      "utf8",
    );

    expect(migration).toContain(
      "grant select, insert, update on table public.profiles to service_role",
    );
    expect(dbTest).toContain(
      "has_table_privilege('service_role', 'public.profiles', 'UPDATE')",
    );
  });

  it("Playwright yerel regresyonda tek worker ile çalışır ve eski raporları temizler", async () => {
    const runSource = await fs.readFile(
      path.join(process.cwd(), "scripts", "run-local-regression.sh"),
      "utf8",
    );
    const resumeSource = await fs.readFile(
      path.join(process.cwd(), "scripts", "resume-local-regression.sh"),
      "utf8",
    );
    const configSource = await fs.readFile(
      path.join(process.cwd(), "playwright.config.ts"),
      "utf8",
    );

    for (const source of [runSource, resumeSource]) {
      expect(source).toContain('export PLAYWRIGHT_WORKERS="1"');
      expect(source).toContain("rm -rf test-results playwright-report");
    }
    expect(configSource).toContain("process.env.PLAYWRIGHT_WORKERS");
  });

  it("package script'i tek komutla yerel regresyonu başlatır", async () => {
    const packageJson = JSON.parse(await fs.readFile(path.join(process.cwd(), "package.json"), "utf8"));
    expect(packageJson.scripts["test:regression:local"]).toBe(
      "bash scripts/run-local-regression.sh",
    );
  });
});
