import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const guardScript = path.join(
  process.cwd(),
  "scripts",
  "assert-local-test-target.mjs",
);

function runGuard(environment: Record<string, string>) {
  const env = { ...process.env };
  for (const key of [
    "SITE_ENV",
    "VERCEL_ENV",
    "PLAYWRIGHT_BASE_URL",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ]) {
    delete env[key];
  }

  return spawnSync(process.execPath, [guardScript, "--require-supabase"], {
    encoding: "utf8",
    env: { ...env, ...environment },
  });
}

describe("yerel test hedefi koruması", () => {
  it("açıkça yerel Supabase ve site hedefini kabul eder", () => {
    const result = runGuard({
      SITE_ENV: "test",
      PLAYWRIGHT_BASE_URL: "http://127.0.0.1:3100",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Yerel test hedefi doğrulandı");
  });

  it("production ortamını hedefleyen komutu durdurur", () => {
    const result = runGuard({
      SITE_ENV: "production",
      PLAYWRIGHT_BASE_URL: "http://127.0.0.1:3100",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("production");
  });

  it("uzak Supabase URL'sini reddeder", () => {
    const result = runGuard({
      SITE_ENV: "test",
      PLAYWRIGHT_BASE_URL: "http://127.0.0.1:3100",
      NEXT_PUBLIC_SUPABASE_URL: "https://TEST_project.supabase.co",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("localhost/127.0.0.1/::1");
  });
});
