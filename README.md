# Kantin Website

Kantin’in public web sitesi ve yönetim paneli. Proje Next.js, React, TypeScript, Supabase ve Vercel üzerinde çalışır.

## Başlıca özellikler

- Alsancak ve Atakent için dinamik menü ve fiyat yönetimi
- Etkinlik/duyuru, merch, Instagram ve şube içerikleri
- Supabase Auth ile korunan yönetim paneli
- Rol tabanlı RLS, işlem geçmişi ve transaction tabanlı kritik güncellemeler
- Güvenli medya ve kariyer/CV yaşam döngüsü
- Kritik sistem kayıtlarında sürüm geçmişi ve önceki sürüme dönme
- Veritabanı + Storage yedekleme/doğrulama araçları
- Masaüstü ve Pixel 7 mobil regresyon testleri

## Gereksinimler

- Node.js 20 veya üzeri
- npm
- Yerel Supabase ve tam regresyon için Docker Desktop
- Supabase CLI proje bağımlılığı üzerinden `npx supabase`

## Yerel kurulum

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local` içinde yalnız public değişkenleri kullan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_ENV=development
```

Database parolası, `service_role` veya `sb_secret_...` değerleri frontend değişkenlerine ve Git’e yazılmaz.

## Temel komutlar

```bash
npm run dev                    # Yerel geliştirme
npm run check                  # Lint + TypeScript + production build
npm run test:unit              # Vitest
npm run test:unit:coverage     # Unit coverage
npm run test:regression:local  # Yerel Supabase reset + pgTAP + Playwright
npm run backup:supabase        # Production veritabanı ve Storage yedeği
npm run verify:release         # Statik final release doğrulaması
npm run cleanup:release        # Temizlenmesi gereken yerel/release artefactlarını listeler
```

`npm run cleanup:release -- --apply` yalnız sabit ve önceden tanımlı eski/geçici artefactları siler. Gerçek Supabase yedeklerine ve `.env.local` dosyasına dokunmaz.

## Yönetim paneli güvenliği

- Normal içerikler eklenebilir, düzenlenebilir, pasife alınabilir ve desteklenen alanlarda güvenli biçimde silinebilir.
- Site ayarı anahtarları, kritik slug/key alanları ve teknik kimlikler mevcut kayıtlarda kilitlidir.
- Teknik JSON alanları bilinçli açma ve doğrulama akışı kullanır.
- Yayınlama, pasife alma, kalıcı silme ve sürüm geri yükleme işlemleri yazılı onay ister.
- Şubeler, site ayarları, site sayfaları ve içerik blokları kalıcı silmeye karşı korunur.
- Kritik kayıt değişiklikleri snapshot olarak tutulur.

## Test durumu

Son yerel regresyon turu:

- Unit: 56 dosya / 223 test
- pgTAP: 12 dosya / 157 test
- Playwright: 16 başarılı / 2 bilinçli skipped
- TypeScript, ESLint ve production build: başarılı
- `npm audit`: 0 güvenlik açığı

İki skipped Playwright testi, yalnız Supabase kesintisi bilinçli olarak hazırlanmış bir fallback hedefinde çalıştırılır.

## Release durumu

Kod ve yerel regresyon aşaması tamamlandı. Sürüm, production migration geçmişinin senkronizasyonu, son migration push, Vercel production deploy ve production verifier tamamlanana kadar `1.0.0-rc.1` olarak kalır.

Ayrıntılı kapanış sırası:

- `docs/deployment/production-kapanis.md`
- `docs/testing/final-risk-audit-20260626.md`
- `docs/operations/supabase-backup-restore.md`

Dokümantasyon dizini: `docs/README.md`
