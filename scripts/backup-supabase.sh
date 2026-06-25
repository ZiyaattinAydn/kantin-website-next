#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
umask 077

SUPABASE_CLI=(npx --no-install supabase)
DB_CLIENT_IMAGE="${SUPABASE_DB_CLIENT_IMAGE:-public.ecr.aws/supabase/postgres:17.6.1.127}"
EXPECTED_BUCKETS=(
  menu-images
  event-images
  merch-images
  gallery-images
  instagram-media
  career-cvs
)

fail() {
  printf '\nHATA: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "'$1' komutu bulunamadı."
}

json_get() {
  JSON_INPUT="$1" JSON_KEY="$2" node -e '
    const value = JSON.parse(process.env.JSON_INPUT || "{}")[process.env.JSON_KEY];
    if (typeof value === "boolean") process.stdout.write(value ? "true" : "false");
    else if (value != null) process.stdout.write(String(value));
  '
}

require_command node
require_command npx
require_command docker

docker info >/dev/null 2>&1 || fail "Docker Desktop çalışmıyor. Supabase db dump için Docker gereklidir."
if ! "${SUPABASE_CLI[@]}" --version >/dev/null 2>&1; then
  fail "Yerel Supabase CLI bulunamadı. Önce 'npm install' çalıştır."
fi

node scripts/preflight-supabase-backup.mjs "$ROOT_DIR/supabase/migrations" \
  || fail "Yerel migration/Storage ön kontrolü başarısız. Yedek başlatılmadı."

PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
if [[ -z "$PROJECT_REF" ]]; then
  read -r -p "Kaynak Supabase project ref: " PROJECT_REF
fi
[[ "$PROJECT_REF" =~ ^[a-z0-9]{10,40}$ ]] || fail "Project ref biçimi geçersiz."

DB_URL_INPUT="${SUPABASE_DB_URL:-}"
if [[ -z "$DB_URL_INPUT" ]]; then
  read -r -s -p "Session pooler veya direct database connection string: " DB_URL_INPUT
  printf '\n'
fi

CREDENTIAL_JSON="$(
  DB_URL_INPUT="$DB_URL_INPUT" \
  EXPECTED_PROJECT_REF="$PROJECT_REF" \
  node scripts/normalize-supabase-db-url.mjs
)" || fail "Database connection string doğrulanamadı."

if [[ "$(json_get "$CREDENTIAL_JSON" needsPassword)" == "true" ]]; then
  read -r -s -p "Database parolası: " DB_PASSWORD_INPUT
  printf '\n'
  [[ -n "$DB_PASSWORD_INPUT" ]] || fail "Database parolası boş olamaz."

  CREDENTIAL_JSON="$(
    DB_URL_INPUT="$DB_URL_INPUT" \
    DB_PASSWORD_INPUT="$DB_PASSWORD_INPUT" \
    EXPECTED_PROJECT_REF="$PROJECT_REF" \
    node scripts/normalize-supabase-db-url.mjs
  )" || fail "Database bağlantısı parola ile oluşturulamadı."
  unset DB_PASSWORD_INPUT
fi

DB_URL="$(json_get "$CREDENTIAL_JSON" normalizedUrl)"
DB_URL_NO_PASSWORD="$(json_get "$CREDENTIAL_JSON" passwordlessUrl)"
DB_PASSWORD="$(json_get "$CREDENTIAL_JSON" password)"
[[ -n "$DB_URL" && -n "$DB_URL_NO_PASSWORD" && -n "$DB_PASSWORD" ]] \
  || fail "Database bağlantı bilgileri oluşturulamadı."
unset CREDENTIAL_JSON DB_URL_INPUT

printf '\nBu işlem production veritabanını ve altı Storage bucket\x27ını yalnızca OKUR.\n'
printf 'Private career-cvs içeriği kişisel veri içerebilir; çıktı klasörünü Git\x27e veya açık buluta koyma.\n'
read -r -p "Devam etmek için YEDEK_ALMAYI_ONAYLIYORUM yaz: " CONFIRMATION
[[ "$CONFIRMATION" == "YEDEK_ALMAYI_ONAYLIYORUM" ]] || fail "Onay metni eşleşmedi."

if ! "${SUPABASE_CLI[@]}" projects list >/dev/null 2>&1; then
  fail "Supabase CLI oturumu bulunamadı. Önce 'npx supabase login' çalıştır."
fi

TIMESTAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
BACKUP_ROOT="$ROOT_DIR/supabase-backups"
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
DATABASE_DIR="$BACKUP_DIR/database"
STORAGE_DIR="$BACKUP_DIR/storage"
METADATA_DIR="$BACKUP_DIR/metadata"
ACCESS_DIR="$METADATA_DIR/storage-access"
INVENTORY_FILE="$METADATA_DIR/storage-inventory.json"
mkdir -p "$DATABASE_DIR" "$STORAGE_DIR" "$ACCESS_DIR"

STATUS_FILE="$METADATA_DIR/STATUS.txt"
printf 'IN_PROGRESS\n' > "$STATUS_FILE"

cleanup_on_error() {
  local exit_code=$?
  unset DB_PASSWORD DB_URL DB_URL_NO_PASSWORD PGPASSWORD
  if [[ $exit_code -ne 0 ]]; then
    printf 'FAILED\n' > "$STATUS_FILE"
    printf '\nYedek yarıda kaldı: %s\n' "$BACKUP_DIR" >&2
    printf 'Bu klasörü geçerli yedek olarak kullanma.\n' >&2
  fi
  exit "$exit_code"
}
trap cleanup_on_error EXIT

CLI_VERSION="$("${SUPABASE_CLI[@]}" --version | tr -d '\r')"
GIT_COMMIT="$(git rev-parse HEAD 2>/dev/null || printf 'unknown')"
CREATED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

SOURCE_PROJECT_REF="$PROJECT_REF" \
BACKUP_CREATED_AT="$CREATED_AT" \
BACKUP_CLI_VERSION="$CLI_VERSION" \
BACKUP_GIT_COMMIT="$GIT_COMMIT" \
BACKUP_METADATA_PATH="$METADATA_DIR/backup.json" \
node <<'NODE'
import { writeFile } from "node:fs/promises";
const metadata = {
  formatVersion: 3,
  sourceProjectRef: process.env.SOURCE_PROJECT_REF,
  createdAt: process.env.BACKUP_CREATED_AT,
  supabaseCliVersion: process.env.BACKUP_CLI_VERSION,
  gitCommit: process.env.BACKUP_GIT_COMMIT,
  includes: {
    databaseRoles: true,
    databaseSchema: true,
    databaseData: true,
    migrationHistory: false,
    authStorageDiff: true,
    storageInventory: false,
    storageBuckets: [
      "menu-images",
      "event-images",
      "merch-images",
      "gallery-images",
      "instagram-media",
      "career-cvs"
    ],
    storageBucketDefinitions: []
  }
};
await writeFile(process.env.BACKUP_METADATA_PATH, `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 });
NODE

printf '\n[1/5] Proje bağlantısı, bucket erişimi ve Storage envanteri doğrulanıyor...\n'
SUPABASE_DB_PASSWORD="$DB_PASSWORD" "${SUPABASE_CLI[@]}" link --project-ref "$PROJECT_REF" >/dev/null

if ! docker image inspect "$DB_CLIENT_IMAGE" >/dev/null 2>&1; then
  printf '  - PostgreSQL istemci imajı indiriliyor...\n'
  docker pull "$DB_CLIENT_IMAGE" >/dev/null
fi

STORAGE_INVENTORY_SQL="$(cat <<'SQL'
with expected(bucket_id) as (
  values
    ('menu-images'),
    ('event-images'),
    ('merch-images'),
    ('gallery-images'),
    ('instagram-media'),
    ('career-cvs')
), bucket_rows as (
  select
    e.bucket_id,
    b.name,
    b.public,
    b.file_size_limit,
    b.allowed_mime_types,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', o.name,
          'size', case
            when coalesce(o.metadata ->> 'size', '') ~ '^[0-9]+$'
              then (o.metadata ->> 'size')::bigint
            else null
          end
        ) order by o.name
      )
      from storage.objects o
      where o.bucket_id = e.bucket_id
    ), '[]'::jsonb) as objects
  from expected e
  left join storage.buckets b on b.id = e.bucket_id
)
select jsonb_build_object(
  'formatVersion', 1,
  'buckets', jsonb_agg(
    jsonb_build_object(
      'id', bucket_id,
      'exists', name is not null,
      'name', name,
      'public', public,
      'fileSizeLimit', file_size_limit,
      'allowedMimeTypes', coalesce(to_jsonb(allowed_mime_types), '[]'::jsonb),
      'objects', objects
    ) order by bucket_id
  )
)::text
from bucket_rows;
SQL
)"

if ! PGPASSWORD="$DB_PASSWORD" docker run --rm --env PGPASSWORD \
  "$DB_CLIENT_IMAGE" psql "$DB_URL_NO_PASSWORD" \
  -X -q -A -t -v ON_ERROR_STOP=1 -c "$STORAGE_INVENTORY_SQL" \
  > "$INVENTORY_FILE"; then
  fail "Storage envanteri veritabanından okunamadı. Database dump başlatılmadı."
fi

node scripts/storage-inventory.mjs validate "$INVENTORY_FILE" \
  || fail "Storage envanteri güvenlik doğrulamasından geçmedi. Database dump başlatılmadı."
node scripts/storage-inventory.mjs merge-metadata "$INVENTORY_FILE" "$METADATA_DIR/backup.json"

for bucket in "${EXPECTED_BUCKETS[@]}"; do
  storage_uri="ss:///$bucket/"
  printf '  - %s erişimi kontrol ediliyor\n' "$bucket"
  if ! "${SUPABASE_CLI[@]}" storage ls "$storage_uri" -r \
    --experimental --linked > "$ACCESS_DIR/$bucket.txt"; then
    fail "$bucket bucket erişim kontrolü başarısız. Database dump başlatılmadı."
  fi
done

printf '[2/5] Veritabanı dump dosyaları hazırlanıyor...\n'
"${SUPABASE_CLI[@]}" db dump --db-url "$DB_URL" -f "$DATABASE_DIR/roles.sql" --role-only
"${SUPABASE_CLI[@]}" db dump --db-url "$DB_URL" -f "$DATABASE_DIR/schema.sql"
"${SUPABASE_CLI[@]}" db dump --db-url "$DB_URL" -f "$DATABASE_DIR/data.sql" --use-copy --data-only \
  -x "storage.buckets_vectors" -x "storage.vector_indexes"

MIGRATION_HISTORY_AVAILABLE=false
HISTORY_ERROR_FILE="$METADATA_DIR/history-dump-error.txt"
if "${SUPABASE_CLI[@]}" db dump --db-url "$DB_URL" \
  -f "$DATABASE_DIR/history_schema.sql" --schema supabase_migrations \
  2>"$HISTORY_ERROR_FILE"; then
  "${SUPABASE_CLI[@]}" db dump --db-url "$DB_URL" \
    -f "$DATABASE_DIR/history_data.sql" --use-copy --data-only \
    --schema supabase_migrations
  MIGRATION_HISTORY_AVAILABLE=true
  rm -f "$HISTORY_ERROR_FILE"
else
  if grep -qi "no matching schemas were found" "$HISTORY_ERROR_FILE"; then
    printf '  - supabase_migrations şeması bulunmadı; migration geçmişi atlandı.\n'
    printf '%s\n' '-- Bu projede supabase_migrations şeması bulunmadı.' > "$DATABASE_DIR/history_schema.sql"
    printf '%s\n' '-- Migration geçmişi bu yedekte mevcut değildir.' > "$DATABASE_DIR/history_data.sql"
    rm -f "$HISTORY_ERROR_FILE"
  else
    cat "$HISTORY_ERROR_FILE" >&2
    fail "Migration geçmişi dump işlemi beklenmeyen bir nedenle başarısız oldu."
  fi
fi

BACKUP_MIGRATION_HISTORY="$MIGRATION_HISTORY_AVAILABLE" \
BACKUP_METADATA_PATH="$METADATA_DIR/backup.json" \
node <<'NODE'
import { readFile, writeFile } from "node:fs/promises";
const filePath = process.env.BACKUP_METADATA_PATH;
const metadata = JSON.parse(await readFile(filePath, "utf8"));
metadata.includes.migrationHistory = process.env.BACKUP_MIGRATION_HISTORY === "true";
await writeFile(filePath, `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 });
NODE

printf '[3/5] auth/storage özel şema farkları hazırlanıyor...\n'
"${SUPABASE_CLI[@]}" db diff --linked --schema auth,storage \
  > "$DATABASE_DIR/auth_storage_changes.sql"

printf '[4/5] Storage nesneleri envantere göre tek tek indiriliyor...\n'
for bucket in "${EXPECTED_BUCKETS[@]}"; do
  bucket_dir="$STORAGE_DIR/$bucket"
  mkdir -p "$bucket_dir"
  remote_file_count="$(node scripts/storage-inventory.mjs count "$INVENTORY_FILE" "$bucket")"
  printf '  - %s: %s uzak dosya\n' "$bucket" "$remote_file_count"

  while IFS= read -r -d '' object_path; do
    mkdir -p "$bucket_dir/$(dirname "$object_path")"
    (
      cd "$bucket_dir"
      "${SUPABASE_CLI[@]}" storage cp \
        "ss:///$bucket/$object_path" "./$object_path" \
        --experimental --linked
    )
  done < <(node scripts/storage-inventory.mjs paths0 "$INVENTORY_FILE" "$bucket")
done

printf '[5/5] Hash manifesti ve veritabanı envanteri karşılaştırması yapılıyor...\n'
node scripts/storage-inventory.mjs verify-local "$INVENTORY_FILE" "$STORAGE_DIR" >/dev/null
node scripts/verify-supabase-backup.mjs "$BACKUP_DIR"
printf 'COMPLETE\n' > "$STATUS_FILE"

unset DB_PASSWORD DB_URL DB_URL_NO_PASSWORD PGPASSWORD
trap - EXIT
printf '\nSonuç: BAŞARILI\n'
printf 'Yedek klasörü: %s\n' "$BACKUP_DIR"
printf 'Doğrulama raporu: %s\n' "$BACKUP_DIR/VERIFY_REPORT.md"
