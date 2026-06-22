# Kantin Website Çalışma Kuralları

## Branch ve ortam

- Ana geliştirme branch'i `develop`'tır. Açık onay olmadan `main` branch'ine geçme.
- Production deploy, production verifier, canlı veri yazma/silme ve canlı Storage işlemi yapma.
- `.env.local` dosyasını okuma, yazdırma, değiştirme veya commit kapsamına alma.
- Secret, service role key, database parolası ve token'ları komut çıktısına taşıma.

## Veri güvenliği

- Test verilerinin görünür adı `TEST_`, slug değeri `test-` ile başlamalıdır.
- Seed kayıtlarını değiştirme veya silme.
- Migration dosyası yazılabilir; ancak açık onay olmadan migration uygulama, destructive SQL çalıştırma veya Storage nesnesi silme.
- Kişisel veri ve CV testleri yalnız yerel Supabase yığını hedeflemelidir.

## Test kuralları

- Unit test: `npm run test:unit`
- Coverage: `npm run test:unit:coverage`
- Yerel Supabase pgTAP: `npm run test:db`
- Yerel Playwright: `npm run test:e2e`
- Tam yerel kontrol: `npm run verify:local`
- `test:db`, `test:e2e` ve `verify:local` için `NEXT_PUBLIC_SUPABASE_URL` açıkça `localhost`, `127.0.0.1` veya `::1` olmalıdır. Uzak Supabase URL'si kabul edilmez.
- E2E admin testleri için yalnız yerel TEST admin hesabını `E2E_ADMIN_EMAIL` ve `E2E_ADMIN_PASSWORD` process değişkenleriyle ver; değerleri dosyaya yazma.
- Playwright artefact'ları, coverage ve test sonuçları Git'e eklenmez.

## Uygulama ilkeleri

- Public tasarımı ve mevcut admin yeteneklerini geriye uyumsuz biçimde kaldırma.
- RLS, RPC, medya/CV yaşam döngüsü veya audit değişiklerinde ilgili pgTAP regresyon testini aynı değişik setinde güncelle.
- Admin action ve public fallback davranışlarında Vitest regresyon testi ekle.
- Bağımlılık uyarıları için `npm audit fix --force` kullanma; güncellemeleri ayrı ve kontrollü ele al.
