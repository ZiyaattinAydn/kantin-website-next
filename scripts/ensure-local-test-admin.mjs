#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

function fail(message) {
  console.error(`HATA: ${message}`);
  process.exit(1);
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} tanımlı değil.`);
  return value;
}

function assertLocalUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    fail("Yerel Supabase URL'si geçerli değil.");
  }

  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
  if (!localHosts.has(parsed.hostname)) {
    fail("Bu araç yalnız yerel Supabase hedefinde çalışır; uzak/production URL reddedildi.");
  }

  return parsed.toString().replace(/\/$/, "");
}

const supabaseUrl = assertLocalUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.API_URL?.trim() || "",
);
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SERVICE_ROLE_KEY?.trim() ||
  process.env.SECRET_KEY?.trim() ||
  "";
const email = required("E2E_ADMIN_EMAIL").toLowerCase();
const password = required("E2E_ADMIN_PASSWORD");

if (!serviceRoleKey) fail("Yerel service-role/secret key bulunamadı.");
if (!email.includes("test")) {
  fail("Yerel E2E admin e-postası güvenlik için 'test' ifadesi içermeli.");
}
if (password.length < 12) {
  fail("Yerel E2E admin şifresi en az 12 karakter olmalı.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

let user = null;
for (let page = 1; page <= 20 && !user; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) fail(`Yerel kullanıcı listesi alınamadı: ${error.message}`);
  user = data.users.find((candidate) => candidate.email?.toLowerCase() === email) ?? null;
  if (data.users.length < 1000) break;
}

if (user) {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: { display_name: "TEST E2E Admin" },
  });
  if (error || !data.user) {
    fail(`Yerel TEST admin güncellenemedi: ${error?.message ?? "bilinmeyen hata"}`);
  }
  user = data.user;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "TEST E2E Admin" },
  });
  if (error || !data.user) {
    fail(`Yerel TEST admin oluşturulamadı: ${error?.message ?? "bilinmeyen hata"}`);
  }
  user = data.user;
}

const { error: profileError } = await supabase.from("profiles").upsert(
  {
    id: user.id,
    display_name: "TEST E2E Admin",
    role: "admin",
    is_active: true,
  },
  { onConflict: "id" },
);

if (profileError) {
  const permissionHint =
    profileError.code === "42501" || /permission denied/i.test(profileError.message)
      ? " 20260625030000_service_role_profile_management.sql migration'ının uygulandığını doğrula."
      : "";
  fail(`Yerel TEST admin profili hazırlanamadı: ${profileError.message}.${permissionHint}`);
}

console.log(`Yerel TEST admin hazır: ${email}`);
