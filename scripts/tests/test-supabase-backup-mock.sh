#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

PROJECT="$TMP_DIR/project"
BIN="$TMP_DIR/bin"
mkdir -p "$PROJECT/scripts/lib" "$PROJECT/supabase/migrations" "$BIN"
cp "$ROOT_DIR/scripts/backup-supabase.sh" "$PROJECT/scripts/"
cp "$ROOT_DIR/scripts/normalize-supabase-db-url.mjs" "$PROJECT/scripts/"
cp "$ROOT_DIR/scripts/preflight-supabase-backup.mjs" "$PROJECT/scripts/"
cp "$ROOT_DIR/scripts/storage-inventory.mjs" "$PROJECT/scripts/"
cp "$ROOT_DIR/scripts/verify-supabase-backup.mjs" "$PROJECT/scripts/"
cp "$ROOT_DIR/scripts/lib/supabase-backup.mjs" "$PROJECT/scripts/lib/"
printf '%s\n' 'select 1;' > "$PROJECT/supabase/migrations/20260626010000_mock.sql"

cat > "$BIN/docker" <<'MOCK'
#!/usr/bin/env bash
set -e
case "${1:-}" in
  info|image) exit 0 ;;
  run)
    cat <<'JSON'
{"formatVersion":1,"buckets":[{"id":"menu-images","exists":true,"name":"menu-images","public":true,"fileSizeLimit":8388608,"allowedMimeTypes":["image/png"],"objects":[{"name":"nested/a.png","size":3}]},{"id":"event-images","exists":true,"name":"event-images","public":true,"fileSizeLimit":8388608,"allowedMimeTypes":[],"objects":[]},{"id":"merch-images","exists":true,"name":"merch-images","public":true,"fileSizeLimit":8388608,"allowedMimeTypes":[],"objects":[]},{"id":"gallery-images","exists":true,"name":"gallery-images","public":true,"fileSizeLimit":8388608,"allowedMimeTypes":[],"objects":[]},{"id":"instagram-media","exists":true,"name":"instagram-media","public":true,"fileSizeLimit":8388608,"allowedMimeTypes":[],"objects":[]},{"id":"career-cvs","exists":true,"name":"career-cvs","public":false,"fileSizeLimit":5242880,"allowedMimeTypes":["application/pdf"],"objects":[{"name":"private/cv.pdf","size":4}]}]}
JSON
    ;;
  *) exit 1 ;;
esac
MOCK

cat > "$BIN/npx" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
[[ "$1" == "--no-install" && "$2" == "supabase" ]] || exit 1
shift 2
if [[ "$1" == "--version" ]]; then echo 2.107.0; exit 0; fi
if [[ "$1" == "projects" && "$2" == "list" ]]; then exit 0; fi
if [[ "$1" == "link" ]]; then exit 0; fi
if [[ "$1" == "storage" && "$2" == "ls" ]]; then echo "${3#ss:///}"; exit 0; fi
if [[ "$1" == "storage" && "$2" == "cp" ]]; then
  src="$3"; dst="$4"; mkdir -p "$(dirname "$dst")"
  case "$src" in *nested/a.png) printf abc > "$dst" ;; *private/cv.pdf) printf pdfx > "$dst" ;; *) exit 1 ;; esac
  exit 0
fi
if [[ "$1" == "db" && "$2" == "dump" ]]; then
  out=""; for ((i=1;i<=$#;i++)); do if [[ "${!i}" == "-f" ]]; then j=$((i+1)); out="${!j}"; fi; done
  mkdir -p "$(dirname "$out")"; printf '%s\n' '-- mock dump' > "$out"; exit 0
fi
if [[ "$1" == "db" && "$2" == "diff" ]]; then echo '-- no schema changes'; exit 0; fi
exit 1
MOCK

cat > "$BIN/git" <<'MOCK'
#!/usr/bin/env bash
echo deadbeef
MOCK
chmod +x "$BIN/docker" "$BIN/npx" "$BIN/git"

(
  cd "$PROJECT"
  PATH="$BIN:$PATH" \
  SUPABASE_PROJECT_REF=abcdefghijklmnopqrst \
  SUPABASE_DB_URL='postgresql://postgres.abcdefghijklmnopqrst:pass@db.example.com:5432/postgres' \
  bash scripts/backup-supabase.sh <<<'YEDEK_ALMAYI_ONAYLIYORUM'
)

STATUS="$(cat "$PROJECT"/supabase-backups/*/metadata/STATUS.txt)"
[[ "$STATUS" == "COMPLETE" ]]
grep -q 'Sonuç: \*\*BAŞARILI\*\*' "$PROJECT"/supabase-backups/*/VERIFY_REPORT.md
printf 'Mock uçtan uca yedek testi: BAŞARILI\n'
