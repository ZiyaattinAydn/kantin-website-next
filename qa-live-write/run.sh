#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f package.json ]]; then
  echo "Bu komutu kantin-website-next proje kökünde çalıştır."
  exit 1
fi

cat <<'BANNER'
Kantin canlı admin yazma kabul aracı v5.0.0 (final sağlamlaştırılmış sürüm)

UYARI: Bu test canlı admin panelinde yalnız TEST_QA_ önekli geçici kayıtlar oluşturur,
günceller, arşivler ve temizlemeyi dener. Gerçek kayıtlara dokunmaz.
BANNER

read -r -p "Devam etmek için TEST_YAZMA_TESTI_ONAYLI yaz: " QA_WRITE_CONFIRM
if [[ "$QA_WRITE_CONFIRM" != "TEST_YAZMA_TESTI_ONAYLI" ]]; then
  echo "Onay eşleşmedi; test iptal edildi."
  exit 1
fi

read -r -p "Admin e-posta: " E2E_ADMIN_EMAIL
read -r -s -p "Admin şifre: " E2E_ADMIN_PASSWORD
echo

cleanup_secrets() {
  unset QA_WRITE_CONFIRM E2E_ADMIN_EMAIL E2E_ADMIN_PASSWORD
}
trap cleanup_secrets EXIT

export QA_WRITE_CONFIRM
export E2E_ADMIN_EMAIL
export E2E_ADMIN_PASSWORD
export QA_BASE_URL="${QA_BASE_URL:-https://kantin-website-ziyaattinaydns-projects.vercel.app}"

node qa-live-write/live-admin-write-acceptance.mjs
