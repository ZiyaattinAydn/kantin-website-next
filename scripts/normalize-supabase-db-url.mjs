#!/usr/bin/env node
const rawInput = (process.env.DB_URL_INPUT ?? "").trim();
const suppliedPassword = process.env.DB_PASSWORD_INPUT ?? "";
const expectedRef = process.env.EXPECTED_PROJECT_REF ?? "";

if (!rawInput.startsWith("postgres://") && !rawInput.startsWith("postgresql://")) {
  console.error("Database connection string postgres:// veya postgresql:// ile başlamalı.");
  process.exit(1);
}

const placeholderToken = "__SUPABASE_PASSWORD_PLACEHOLDER__";
const sanitized = rawInput
  .replace(/:\[(?:YOUR-PASSWORD|YOUR_PASSWORD)\]@/gi, `:${placeholderToken}@`)
  .replace(/:<YOUR-PASSWORD>@/gi, `:${placeholderToken}@`);

let url;
try {
  url = new URL(sanitized);
} catch {
  console.error(
    "Connection string okunamadı. Supabase Connect penceresindeki orijinal URI'yi [YOUR-PASSWORD] yer tutucusuyla yapıştır; parola ayrıca sorulacaktır.",
  );
  process.exit(1);
}

const embeddedPassword =
  url.password === placeholderToken
    ? ""
    : decodeURIComponent(url.password || "");
const password = suppliedPassword || embeddedPassword;

const fromUser = url.username.startsWith("postgres.")
  ? url.username.slice("postgres.".length)
  : "";
const directMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
const projectRef = fromUser || directMatch?.[1] || "";

if (expectedRef && projectRef && expectedRef !== projectRef) {
  console.error(
    `Connection string başka projeye ait. Beklenen: ${expectedRef}, bulunan: ${projectRef}`,
  );
  process.exit(1);
}

if (!password) {
  process.stdout.write(
    `${JSON.stringify({ needsPassword: true, projectRef })}\n`,
  );
  process.exit(0);
}

url.password = password;
const normalizedUrl = url.toString();
url.password = "";
const passwordlessUrl = url.toString();
process.stdout.write(
  `${JSON.stringify({
    needsPassword: false,
    normalizedUrl,
    passwordlessUrl,
    password,
    projectRef,
  })}\n`,
);
