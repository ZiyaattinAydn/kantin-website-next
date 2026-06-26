# Production kapanış rehberi

## Mevcut durum

Ana çalışma branch’i `main`’dir. Kod ve yerel regresyon tamamlanmıştır. Production’a geçmeden önce veritabanı migration geçmişi, şema doğrulaması ve son deployment kontrolleri aşağıdaki sırayla yapılır.

## 1. Ön koşullar

- Doğrulanmış production yedeği mevcut olmalı.
- `metadata/STATUS.txt` içeriği `COMPLETE` olmalı.
- Docker Desktop ve Supabase CLI çalışmalı.
- Çalışma ağacı final temizlikten sonra gözden geçirilmeli.

```bash
npm run cleanup:release -- --apply
npm run verify:release
git status --short
```

`qa-live-write` yerelde saklanabilir ancak Git’e commit edilmez. Daha önce track edildiyse:

```bash
git rm -r --cached qa-live-write
```

Bu komut yerel klasörü silmez; yalnız Git index’inden çıkarır.

## 2. Production şemasını salt okunur doğrula

Supabase Dashboard → SQL Editor içinde çalıştır:

```text
supabase/verification/verify_release_readiness.sql
```

İlk çalıştırmada şunlar false olabilir:

- `20260625030000_service_role_profiles`
- `migration_history_table`

Bunların dışındaki eski migration kontrollerinden biri false ise dur; migration history repair veya `db push` yapma.

## 3. Migration geçmişini baseline et

Proje daha önce SQL Editor üzerinden kurulduğu için remote migration history eksik olabilir.

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase migration list
```

İlk 18 migration’ın şemada gerçekten mevcut olduğu readiness SQL ile doğrulandıktan sonra yalnız geçmiş tablosunu onar:

```bash
npx supabase migration repair \
  20260620010000 \
  20260620020000 \
  20260620030000 \
  20260620040000 \
  20260620050000 \
  20260620060000 \
  20260620070000 \
  20260622080000 \
  20260623010000 \
  20260623020000 \
  20260623030000 \
  20260624010000 \
  20260624020000 \
  20260624030000 \
  20260624040000 \
  20260624050000 \
  20260625010000 \
  20260625020000 \
  --status applied --linked
```

`migration repair` yalnız migration tracking tablosunu günceller; migration SQL’ini yeniden çalıştırmaz.

## 4. Son migration’ı kontrollü uygula

Önce dry-run:

```bash
npx supabase db push --dry-run
```

Beklenen tek yeni migration:

```text
20260625030000_service_role_profile_management.sql
```

Başka eski migration görünürse dur ve geçmiş listesini tekrar incele.

Beklenen sonuç doğruysa:

```bash
npx supabase db push
npx supabase migration list
```

Ardından `verify_release_readiness.sql` dosyasını yeniden çalıştır. Bütün `basarili` değerleri true olmalı.

## 5. Git ve Vercel deployment

```bash
git add -A
git status --short
git commit -m "chore: finalize admin safety and release readiness"
git push origin main
```

Vercel Production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://PRODUCTION-ADRESI
SITE_ENV=production
```

Database password, service-role ve `sb_secret_...` değerleri Vercel public değişkenlerine eklenmez.

## 6. Supabase Auth ayarları

- Site URL: production adresi
- Redirect URL: `https://PRODUCTION-ADRESI/**`
- Public sign-up: kapalı
- Anonymous sign-in: kapalı

## 7. Production doğrulaması

```bash
npm run verify:production -- https://PRODUCTION-ADRESI
```

Beklenen:

- environment=production
- indexable=true
- Supabase health başarılı
- public data `degraded=false`
- robots ve sitemap doğru
- oturumsuz `/admin` isteği login’e yönleniyor

Ardından canlı admin hesabıyla yalnız kontrollü bir `TEST_` smoke kaydı oluşturup temizle veya daha önce başarılı olan `qa-live-write` v5 aracını yerelden çalıştır.

## 8. Sürümü kapat

Bütün kontroller geçince:

```bash
npm version 1.0.0 --no-git-tag-version
npm run verify:release
git add package.json package-lock.json CHANGELOG.md docs
git commit -m "release: 1.0.0"
git tag v1.0.0
git push origin main --tags
```

Production verifier geçmeden sürümü `1.0.0` yapma.

## 9. Restore provası

Tam disaster-recovery kabulü için yeni ve boş bir Supabase test projesinde:

```bash
npm run restore:supabase:test -- /tam/yol/supabase-backups/<tarih-saat>
```

Production project ref hedef olarak kullanılmaz.
