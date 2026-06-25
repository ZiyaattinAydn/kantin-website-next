#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f package.json ]]; then
  echo "Bu komutu kantin-website-next proje kökünde çalıştır."
  exit 1
fi

read -r -p "Admin e-posta: " E2E_ADMIN_EMAIL
read -r -s -p "Admin şifre: " E2E_ADMIN_PASSWORD
echo

export E2E_ADMIN_EMAIL
export E2E_ADMIN_PASSWORD
export QA_BASE_URL="${QA_BASE_URL:-https://kantin-website-ziyaattinaydns-projects.vercel.app}"

node qa-live/live-admin-smoke.mjs
