# Kantin Website

Kantin Alsancak ve Atakent şubeleri için geliştirilen, canlı içerik yönetimi ve yönetici paneli bulunan Next.js web uygulaması.

**Sürüm:** `1.0.0-rc.1`  
**Durum:** Özellik geliştirme tamamlandı; Preview ortamı Supabase ile doğrulandı. Production'a geçiş için `develop -> main` birleştirmesi ve son kapanış kontrolleri bekleniyor.

## Teknoloji yığını

- Next.js 16 App Router
- React 19
- TypeScript
- CSS Modules + global tasarım tokenları
- Supabase Postgres, Auth, Storage ve Row Level Security
- Vercel Preview / Production deployment

## Hazır özellikler

- Responsive ana sayfa, şube menüleri, etkinlikler, merch, galeri, Instagram alanı ve detaylı footer
- Supabase canlı veri katmanı ve bağlantı hatasında doğrulanmış statik fallback
- Admin kontrollü sayfa SEO'su, menü ürün görselleri ve public şube iletişim/saat bilgileri
- FK ve JSON içerik yollarını izleyen güvenli medya arşivleme/geri alma akışı
- Kariyer başvurularında 180 gün retention incelemesi ve private CV silmeli iki aşamalı anonimleştirme
- Request-level public veri deduplication ve 25 kayıtlı server-side admin pagination
- Kariyer başvurusu, spam önleme ve private CV yükleme
- Supabase Auth ile rol kontrollü yönetici girişi
- Menü, kategori, fiyat/varyant, etkinlik, merch, Instagram, şube, site ayarı, medya ve kariyer CRUD
- Kontrollü tema, bölüm görünürlüğü ve ana sayfa sıralaması
- RLS politikaları, public/private Storage bucket'ları ve admin işlem kayıtları
- Preview/Production health endpoint'leri, robots.txt, sitemap.xml ve deployment doğrulama scriptleri

## Hızlı başlangıç

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Windows'ta `.env.example` dosyasını `.env.local` adıyla kopyalayıp Supabase değerlerini elle doldurabilirsin.

Yerel adres: `http://localhost:3000`

## Gerekli environment variable'lar

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJE_REFERANSI.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_ENV=development
```

Projede `service_role`, `sb_secret_...` veya database password kullanılmaz. `.env.local` Git'e gönderilmez.

## Kalite komutları

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run preflight
```

Otomatik regresyon testleri:

```bash
npm run test:unit
npm run test:unit:coverage
npm run test:db
npm run test:e2e
npm run verify:local
```

`test:db` ve `test:e2e` yalnız yerel Supabase yığını kabul eder. Docker Desktop açıkken `npx supabase start` ile yerel servisler başlatılmalı; `NEXT_PUBLIC_SUPABASE_URL`, `PLAYWRIGHT_BASE_URL` ve test anahtarları komut ortamında açıkça yerel değerlere ayarlanmalıdır. Uzak Preview veya Production URL'leri güvenlik kontrolü tarafından reddedilir.

Test katmanları ve gerekli process değişkenleri için [Faz 14A test stratejisine](docs/testing/faz-14a-test-stratejisi.md) bak.

Tek komutla lint + TypeScript + production build:

```bash
npm run check
```

Canlı Preview veya Production deployment kontrolü:

```bash
npm run verify:deployment -- https://SITE-ADRESI preview
npm run verify:deployment -- https://SITE-ADRESI production
```

Production'a özel eski komut da korunur:

```bash
npm run verify:production -- https://SITE-ADRESI
```

## Ana rotalar

| Rota | Açıklama |
|---|---|
| `/` | Ana sayfa |
| `/menu?sube=alsancak` | Alsancak menüsü |
| `/menu?sube=atakent` | Atakent menüsü |
| `/events` | Etkinlikler |
| `/careers` | Kariyer başvurusu |
| `/admin/login` | Yönetici girişi |
| `/admin` | Yönetici dashboard |
| `/admin/manage/[resource]` | CRUD modülleri |
| `/admin/media` | Medya kütüphanesi |
| `/admin/applications` | Kariyer başvuruları |
| `/admin/theme` | Kontrollü tema yönetimi |

## Veritabanı kurulumu

Migration dosyaları `supabase/migrations/` altında kronolojik sıradadır. Yeni bir projede sırayla uygulanmalı, ardından `supabase/seed.sql` çalıştırılmalıdır.

Doğrulama sorguları `supabase/verification/` altındadır. Manuel ve yalnızca gerektiğinde kullanılacak işlemler `supabase/manual/` klasöründedir.

## Deployment düzeni

- `develop`: Vercel Preview
- `main`: Vercel Production
- Preview ortamı `SITE_ENV=preview` ve `noindex` kullanır.
- Production ortamı `SITE_ENV=production` ile indexlenebilir.
- Production'a geçmeden önce `docs/deployment/production-kapanis.md` izlenmelidir.

## Dokümantasyon

- [Proje durumu](docs/PROJECT_STATUS.md)
- [Admin kullanım rehberi](docs/operations/admin-kullanim-rehberi.md)
- [Bakım ve yedekleme](docs/operations/bakim-ve-yedekleme.md)
- [Bug/debugging rehberi](docs/debugging/bug-debugging-rehberi.md)
- [Final QA kontrol listesi](docs/testing/final-qa-kontrol-listesi.md)
- [Faz 14A otomatik test stratejisi](docs/testing/faz-14a-test-stratejisi.md)
- [Faz 14F tipli CRUD ve kontrollü formlar](docs/testing/faz-14f-typed-crud-ve-kontrollu-formlar.md)
- [Production kapanış rehberi](docs/deployment/production-kapanis.md)
- [Güvenlik ve kişisel veri notları](docs/security/guvenlik-ve-kisisel-veri.md)
- [Sürüm notları](CHANGELOG.md)

## Bilinen açık maddeler

- `develop` Preview doğrulandı; final `main` Production promotion henüz yapılmadı.
- Etkinlik tablosunda yayınlanmış kayıt yoksa etkinlik sayfası kontrollü boş durum gösterir.
- `npm audit` iki moderate uyarı bildiriyor; otomatik `--force` düzeltmesi uyumsuz Next.js downgrade önerdiği için uygulanmadı. Ayrıntı proje durum belgesinde kayıtlıdır.
- İçerik ve görsel kalite çalışmaları yönetici panelinden sürdürülebilir; yeni özellik geliştirme şu aşamada kapalıdır.
