# Proje Durumu - Kantin Website

## Genel durum

Proje özellik geliştirme açısından release candidate seviyesindedir. Frontend, canlı Supabase veri katmanı, kariyer sistemi, admin authentication, tam CRUD paneli ve kontrollü tema yönetimi hazırdır.

## Tamamlanan ana sistemler

- Public frontend ve responsive sayfalar
- Alsancak / Atakent şube ayrımı
- Canlı menü, merch, Instagram ve site ayarları
- Etkinliklerde yayın/boş durum altyapısı
- Supabase Postgres şeması ve seed
- RLS ve rol tabanlı erişim
- Public görsel bucket'ları ve private CV bucket'ı
- Kariyer formu, dosya doğrulaması ve spam koruması
- Admin Auth, korumalı route ve çıkış
- Admin CRUD modülleri
- Tema ve bölüm görünürlüğü yönetimi
- Vercel Preview bağlantısı ve health kontrolleri
- SEO metadata, robots ve sitemap

## Kullanıcı tarafından doğrulananlar

- Faz 9 CRUD ekranları test edildi ve sorun bildirilmedi.
- Vercel Preview deployment health sonucu başarılı.
- Supabase Auth health sonucu başarılı.
- Public data `degraded=false`; branches=2, menuSections=16, instagramPosts=5.

## Bu paket üzerinde doğrulananlar

- Temiz `npm ci`
- ESLint
- TypeScript `--noEmit`
- Next.js production build
- Yerel public route HTTP smoke testleri
- Migration ve dokümantasyon dosya bütünlüğü
- Secret ve eksik local asset ön kontrolü

## Açık kalan maddeler

### Final entegrasyon kapanışı

Güncel kaynak kod `main` branch'indedir. Release kapanışı için:

1. Docker Desktop ile yerel Supabase yığınını başlat
2. Migration zinciri ve pgTAP testlerini çalıştır
3. Yerel TEST_ admin, medya, kariyer ve CV senaryolarını doğrula
4. Playwright E2E turunu tamamla
5. Production environment ve Supabase Site URL / Redirect URL ayarlarını kontrol et
6. Production verifier çalıştır

### İçerik

- Gerçek etkinlik eklenmediyse etkinlik alanı boş durum gösterir.
- Kesin günlük çalışma saatleri işletme tarafından admin paneline girilmelidir.
- Profesyonel fotoğraflar geldiğinde medya kütüphanesi üzerinden değiştirilebilir.

### Paket güvenliği

Kontrollü PostCSS override sonrasında `npm audit` 0 güvenlik açığı raporlamaktadır. `npm audit fix --force` kullanılmamalıdır; ilerideki major yükseltmeler ayrı ve kontrollü ele alınmalıdır.

## Sürüm kararı

Mevcut paket `1.0.0-rc.1` olarak işaretlenmiştir. Yerel Supabase/pgTAP, E2E, production verifier ve final içerik kabulü tamamlandığında `1.0.0` etiketi verilebilir.
