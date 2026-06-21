# Changelog

## 1.0.0-rc.1 - 2026-06-22

### Tamamlananlar

- Frontend v1 ve responsive public sayfalar
- Supabase browser/server istemcileri ve health kontrolleri
- İlişkisel veritabanı şeması, seed ve TypeScript database tipleri
- RLS, rol modeli ve public/private Storage politikaları
- Public sayfaların canlı Supabase verisine bağlanması ve fallback sistemi
- Kariyer başvurusu, spam koruması ve private CV akışı
- Supabase Auth admin girişi ve korumalı route'lar
- Tam admin CRUD paneli ve admin activity log
- Kontrollü tema/bölüm yönetimi
- Vercel Preview/Production yapılandırması, SEO ve deployment kontrolleri
- Mobil hero/merch taşma düzeltmeleri ve public admin hızlı erişimi
- Final operasyon, QA ve debugging dokümantasyonu

### Doğrulananlar

- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Faz 9 CRUD testleri kullanıcı tarafından başarıyla tamamlandı
- Vercel Preview health: deployment, Supabase Auth ve public data başarılı

### Production öncesi

- `develop` branch'ini `main` ile birleştir
- Production environment variable'larını doğrula
- Supabase production Site URL / Redirect URL ayarlarını kontrol et
- `npm run verify:deployment -- <url> production` komutunu çalıştır
- Final responsive ve içerik kabul turunu tamamla
