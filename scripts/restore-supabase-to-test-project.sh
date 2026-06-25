#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
umask 077

SUPABASE_CLI=(npx --no-install supabase)
EXPECTED_BUCKETS=(menu-images event-images merch-images gallery-images instagram-media career-cvs)

fail() { printf '\nHATA: %s\n' "$1" >&2; exit 1; }
require_command() { command -v "$1" >/dev/null 2>&1 || fail "'$1' komutu bulunamadı."; }
json_get() {
  JSON_INPUT="$1" JSON_KEY="$2" node -e '
    const value = JSON.parse(process.env.JSON_INPUT || "{}")[process.env.JSON_KEY];
    if (typeof value === "boolean") process.stdout.write(value ? "true" : "false");
    else if (value != null) process.stdout.write(String(value));
  '
}

require_command node
require_command npx
require_command psql

BACKUP_DIR="${1:-${SUPABASE_BACKUP_DIR:-}}"
if [[ -z "$BACKUP_DIR" ]]; then read -r -p "Geri yüklenecek yedek klasörü: " BACKUP_DIR; fi
BACKUP_DIR="$(cd "$BACKUP_DIR" 2>/dev/null && pwd)" || fail "Yedek klasörü bulunamadı."
[[ -f "$BACKUP_DIR/metadata/STATUS.txt" ]] || fail "Yedek durum dosyası eksik."
[[ "$(tr -d '\r\n' < "$BACKUP_DIR/metadata/STATUS.txt")" == "COMPLETE" ]] || fail "Yedek tamamlanmış değil."
node scripts/verify-supabase-backup.mjs "$BACKUP_DIR" >/dev/null || fail "Yedek doğrulaması başarısız."

SOURCE_REF="$(node -e 'const m=require(process.argv[1]); process.stdout.write(m.sourceProjectRef || "")' "$BACKUP_DIR/metadata/backup.json")"
[[ -n "$SOURCE_REF" ]] || fail "Kaynak project ref okunamadı."
SOURCE_INVENTORY="$BACKUP_DIR/metadata/storage-inventory.json"
node scripts/storage-inventory.mjs validate "$SOURCE_INVENTORY" >/dev/null

TARGET_REF="${TARGET_SUPABASE_PROJECT_REF:-}"
if [[ -z "$TARGET_REF" ]]; then read -r -p "YENİ ve geçici hedef Supabase project ref: " TARGET_REF; fi
[[ "$TARGET_REF" =~ ^[a-z0-9]{10,40}$ ]] || fail "Hedef project ref biçimi geçersiz."
[[ "$TARGET_REF" != "$SOURCE_REF" ]] || fail "Kaynak production projesine geri yükleme kesin olarak engellendi."

TARGET_DB_URL_INPUT="${TARGET_SUPABASE_DB_URL:-}"
if [[ -z "$TARGET_DB_URL_INPUT" ]]; then
  read -r -s -p "Hedef projenin Session pooler/direct connection string değeri: " TARGET_DB_URL_INPUT
  printf '\n'
fi
CREDENTIAL_JSON="$(DB_URL_INPUT="$TARGET_DB_URL_INPUT" EXPECTED_PROJECT_REF="$TARGET_REF" node scripts/normalize-supabase-db-url.mjs)" \
  || fail "Hedef database connection string doğrulanamadı."
if [[ "$(json_get "$CREDENTIAL_JSON" needsPassword)" == "true" ]]; then
  read -r -s -p "Hedef database parolası: " TARGET_DB_PASSWORD_INPUT
  printf '\n'
  [[ -n "$TARGET_DB_PASSWORD_INPUT" ]] || fail "Hedef database parolası boş olamaz."
  CREDENTIAL_JSON="$(DB_URL_INPUT="$TARGET_DB_URL_INPUT" DB_PASSWORD_INPUT="$TARGET_DB_PASSWORD_INPUT" EXPECTED_PROJECT_REF="$TARGET_REF" node scripts/normalize-supabase-db-url.mjs)" \
    || fail "Hedef database bağlantısı parola ile oluşturulamadı."
  unset TARGET_DB_PASSWORD_INPUT
fi
TARGET_DB_URL_NO_PASSWORD="$(json_get "$CREDENTIAL_JSON" passwordlessUrl)"
TARGET_DB_PASSWORD="$(json_get "$CREDENTIAL_JSON" password)"
[[ -n "$TARGET_DB_URL_NO_PASSWORD" && -n "$TARGET_DB_PASSWORD" ]] || fail "Hedef database bağlantı bilgileri oluşturulamadı."
unset CREDENTIAL_JSON TARGET_DB_URL_INPUT

"${SUPABASE_CLI[@]}" projects list >/dev/null 2>&1 || fail "Supabase CLI oturumu bulunamadı."
TARGET_HAS_APP_SCHEMA="$(PGPASSWORD="$TARGET_DB_PASSWORD" psql "$TARGET_DB_URL_NO_PASSWORD" -X -A -t -v ON_ERROR_STOP=1 \
  -c "select case when to_regclass('public.branches') is null then 'no' else 'yes' end;" | tr -d '\r\n')"
[[ "$TARGET_HAS_APP_SCHEMA" == "no" ]] || fail "Hedef proje boş değil; public.branches zaten var. Yeni/geçici proje kullan."

printf '\nDİKKAT: Bu işlem yalnız YENİ ve GEÇİCİ test projesine geri yükleme içindir.\n'
printf 'Kaynak production projesi: %s\nHedef test projesi: %s\n' "$SOURCE_REF" "$TARGET_REF"
read -r -p "Devam etmek için YENI_TEST_PROJESINE_GERI_YUKLE $TARGET_REF yaz: " CONFIRMATION
[[ "$CONFIRMATION" == "YENI_TEST_PROJESINE_GERI_YUKLE $TARGET_REF" ]] || fail "Onay metni eşleşmedi."

WORK_DIR="$ROOT_DIR/supabase-restore-work/$(date -u +%Y-%m-%dT%H-%M-%SZ)"
mkdir -p "$WORK_DIR"
cleanup() { unset TARGET_DB_PASSWORD TARGET_DB_URL_NO_PASSWORD PGPASSWORD; }
trap cleanup EXIT

printf '\n[1/5] Veritabanı rolleri, şeması ve verisi geri yükleniyor...\n'
PGPASSWORD="$TARGET_DB_PASSWORD" psql "$TARGET_DB_URL_NO_PASSWORD" \
  --single-transaction --variable ON_ERROR_STOP=1 \
  --file "$BACKUP_DIR/database/roles.sql" \
  --file "$BACKUP_DIR/database/schema.sql" \
  --command 'SET session_replication_role = replica' \
  --file "$BACKUP_DIR/database/data.sql"

MIGRATION_HISTORY_AVAILABLE="$(node -e 'const m=require(process.argv[1]); process.stdout.write(m?.includes?.migrationHistory === true ? "true" : "false")' "$BACKUP_DIR/metadata/backup.json")"
if [[ "$MIGRATION_HISTORY_AVAILABLE" == "true" ]]; then
  printf '[2/5] Migration geçmişi geri yükleniyor...\n'
  PGPASSWORD="$TARGET_DB_PASSWORD" psql "$TARGET_DB_URL_NO_PASSWORD" --single-transaction --variable ON_ERROR_STOP=1 \
    --file "$BACKUP_DIR/database/history_schema.sql" --file "$BACKUP_DIR/database/history_data.sql"
else
  printf '[2/5] Kaynak projede supabase_migrations şeması yok; adım atlandı.\n'
fi

if [[ -s "$BACKUP_DIR/database/auth_storage_changes.sql" ]]; then
  printf '[3/5] auth/storage özel şema değişiklikleri uygulanıyor...\n'
  PGPASSWORD="$TARGET_DB_PASSWORD" psql "$TARGET_DB_URL_NO_PASSWORD" --single-transaction --variable ON_ERROR_STOP=1 \
    --file "$BACKUP_DIR/database/auth_storage_changes.sql"
else
  printf '[3/5] auth/storage özel şema farkı yok; adım atlandı.\n'
fi

printf '[4/5] Storage bucket tanımları ve dosyaları geri yükleniyor...\n'
BUCKET_SQL="$WORK_DIR/storage-buckets.sql"
node scripts/storage-inventory.mjs bucket-sql "$SOURCE_INVENTORY" "$BUCKET_SQL"
PGPASSWORD="$TARGET_DB_PASSWORD" psql "$TARGET_DB_URL_NO_PASSWORD" --variable ON_ERROR_STOP=1 --file "$BUCKET_SQL"
SUPABASE_DB_PASSWORD="$TARGET_DB_PASSWORD" "${SUPABASE_CLI[@]}" link --project-ref "$TARGET_REF" >/dev/null

for bucket in "${EXPECTED_BUCKETS[@]}"; do
  bucket_dir="$BACKUP_DIR/storage/$bucket"
  [[ -d "$bucket_dir" ]] || fail "Storage klasörü eksik: $bucket"
  count="$(node scripts/storage-inventory.mjs count "$SOURCE_INVENTORY" "$bucket")"
  printf '  - %s: %s dosya\n' "$bucket" "$count"
  while IFS= read -r -d '' object_path; do
    [[ -f "$bucket_dir/$object_path" ]] || fail "Yerel Storage dosyası eksik: $bucket/$object_path"
    (
      cd "$bucket_dir"
      "${SUPABASE_CLI[@]}" storage cp "./$object_path" "ss:///$bucket/$object_path" --experimental --linked
    )
  done < <(node scripts/storage-inventory.mjs paths0 "$SOURCE_INVENTORY" "$bucket")
done

printf '[5/5] Hedef Storage envanteri veritabanından doğrulanıyor...\n'
TARGET_INVENTORY="$WORK_DIR/target-storage-inventory.json"
STORAGE_INVENTORY_SQL="$(cat <<'SQL'
with expected(bucket_id) as (
  values ('menu-images'), ('event-images'), ('merch-images'), ('gallery-images'), ('instagram-media'), ('career-cvs')
), bucket_rows as (
  select e.bucket_id, b.name, b.public, b.file_size_limit, b.allowed_mime_types,
    coalesce((select jsonb_agg(jsonb_build_object('name', o.name, 'size', case when coalesce(o.metadata ->> 'size', '') ~ '^[0-9]+$' then (o.metadata ->> 'size')::bigint else null end) order by o.name)
      from storage.objects o where o.bucket_id = e.bucket_id), '[]'::jsonb) as objects
  from expected e left join storage.buckets b on b.id = e.bucket_id
)
select jsonb_build_object('formatVersion', 1, 'buckets', jsonb_agg(jsonb_build_object(
  'id', bucket_id, 'exists', name is not null, 'name', name, 'public', public,
  'fileSizeLimit', file_size_limit, 'allowedMimeTypes', coalesce(to_jsonb(allowed_mime_types), '[]'::jsonb),
  'objects', objects) order by bucket_id))::text from bucket_rows;
SQL
)"
PGPASSWORD="$TARGET_DB_PASSWORD" psql "$TARGET_DB_URL_NO_PASSWORD" -X -q -A -t -v ON_ERROR_STOP=1 -c "$STORAGE_INVENTORY_SQL" > "$TARGET_INVENTORY"
node scripts/storage-inventory.mjs compare "$SOURCE_INVENTORY" "$TARGET_INVENTORY"

unset TARGET_DB_PASSWORD TARGET_DB_URL_NO_PASSWORD PGPASSWORD
trap - EXIT
printf '\nSonuç: GERİ YÜKLEME VE STORAGE ENVANTER KARŞILAŞTIRMASI BAŞARILI\n'
printf 'Hedef projeyi production olarak kullanma; yalnız kurtarma provasını doğrulamak için kullan.\n'
