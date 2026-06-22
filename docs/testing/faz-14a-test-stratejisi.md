# Faz 14A Otomatik Test Stratejisi

Bu faz, mevcut davranışı değiştirmeden regresyon ve güvenlik doğrulama altyapısı kurar. Testlerin hiçbiri Preview veya Production ortamına yazma yetkisiyle çalıştırılmamalıdır.

## Katmanlar

### Vitest

`npm run test:unit` aşağıdaki hızlı ve izole kontrolleri çalıştırır:

- Admin rolü ve oturum kararları
- Generic CRUD payload dönüşümleri ve geçersiz JSON
- Medya/CV MIME, uzantı, boyut ve TEST_ silme sınırları
- Kariyer formu, honeypot, hızlı gönderim ve dosya imzası
- Public veri adaptörlerinin Supabase kesintisindeki fallback davranışı
- Yerel test hedefi koruma scripti

Coverage raporu `npm run test:unit:coverage` ile `coverage/` altında üretilir ve Git'e eklenmez. Bu ilk baz çizgide coverage eşiği bilinçli olarak zorlanmaz; sonraki fazlarda kritik modül bazında yükseltilir.

### Supabase pgTAP

`npm run test:db`, `supabase/tests/` altındaki SQL testlerini yalnız yerel Supabase veritabanında çalıştırır:

- Tablo RLS durumları, policy setleri ve rol grant'leri
- Private `career-cvs` ve public medya bucket sınırları
- Kariyer RPC izinleri ve hatalı payload reddi
- Admin audit tablosunun append-only izin modeli

SQL testleri transaction içinde çalışır ve `rollback` ile biter. Test girdileri `TEST_` öneki taşır.

### Playwright

`npm run test:e2e` masaüstü Chromium ve Pixel 7 profillerinde şunları doğrular:

- Public fallback sayfaları ve health sonucu
- Oturumsuz admin yönlendirmesi
- Yerel admin hesabıyla CRUD modüllerinin açılması
- Medya yükleme formunun güvenli dosya sınırları
- Kariyer formu ve admin başvuru listesi erişimi

Fallback senaryosu yalnız `E2E_EXPECT_FALLBACK=1` iken; yetkili senaryolar yalnız `E2E_ADMIN_EMAIL` ve `E2E_ADMIN_PASSWORD` process değişkenleri verildiğinde çalışır. Bu değerler repoya yazılmaz.

## Yerel çalıştırma

1. Docker Desktop'ı aç.
2. `npx supabase start` ile `supabase/config.toml` yığını başlat.
3. Supabase CLI'ın verdiği yerel URL ve publishable/anon key'i yalnız mevcut terminal process'ine tanımla.
4. `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100`, `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100` ve `SITE_ENV=test` kullan.
5. `npm run verify:local` komutunu çalıştır.

`scripts/assert-local-test-target.mjs`; site, Playwright ve Supabase host'ları için yalnız `localhost`, `127.0.0.1` veya `::1` kabul eder. `SITE_ENV=production` ve `VERCEL_ENV=production` her durumda reddedilir.

## CI için sonraki adım

CI işi ayrı bir değişiklikte Docker destekli runner üzerinde kurulmalıdır. Sıra: temiz kurulum, lint, TypeScript, Vitest, yerel Supabase start/reset, pgTAP ve Playwright. Test artefact'ları yalnız başarısız işlerde saklanmalı; herhangi bir Preview/Production secret'ı bu işe verilmemelidir.
