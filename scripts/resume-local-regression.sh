#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

fail() {
  echo "HATA: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker komutu bulunamadı."
command -v node >/dev/null 2>&1 || fail "Node.js bulunamadı."
docker info >/dev/null 2>&1 || fail "Docker Engine çalışmıyor. Docker Desktop'ı aç."

npx --no-install supabase status >/dev/null 2>&1 \
  || fail "Yerel Supabase çalışmıyor. Önce npm run test:regression:local komutunu başlat."

STATUS_ENV="$(npx --no-install supabase status -o env)"
eval "$STATUS_ENV"

export NEXT_PUBLIC_SUPABASE_URL="${API_URL:-}"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${PUBLISHABLE_KEY:-${ANON_KEY:-}}"
export SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY:-${SECRET_KEY:-}}"
export NEXT_PUBLIC_SITE_URL="http://127.0.0.1:3100"
export PLAYWRIGHT_BASE_URL="http://127.0.0.1:3100"
export SITE_ENV="test"
export PLAYWRIGHT_WORKERS="1"
unset VERCEL_ENV

node scripts/assert-local-test-target.mjs --require-supabase

read -r -p "Yerel TEST admin e-posta [test-admin@example.com]: " E2E_ADMIN_EMAIL_INPUT
export E2E_ADMIN_EMAIL="${E2E_ADMIN_EMAIL_INPUT:-test-admin@example.com}"
read -r -s -p "Yerel TEST admin şifre (en az 12 karakter): " E2E_ADMIN_PASSWORD
printf '\n'
export E2E_ADMIN_PASSWORD

node scripts/ensure-local-test-admin.mjs

printf '\n[1/2] Yerel Supabase pgTAP testleri yeniden çalışıyor...\n'
npm run test:db

printf '\n[2/2] Masaüstü ve Pixel 7 Playwright testleri çalışıyor...\n'
rm -rf test-results playwright-report
npm run test:e2e

printf '\nYerel regresyon devam sonucu: BAŞARILI\n'
