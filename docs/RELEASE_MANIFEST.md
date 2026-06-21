# Release Manifest - 1.0.0-rc.1

## Teslim kapsamı

- Next.js / React / TypeScript kaynak kodu
- Public site ve responsive stiller
- Supabase migration, seed, verification ve manual SQL dosyaları
- Admin CRUD, kariyer, Storage ve tema yönetimi
- Vercel deployment / health scriptleri
- Teknik, operasyon, test ve debugging belgeleri
- 6. gün ayrıntılı gelişim raporu

## Bilerek dahil edilmeyenler

- `.env.local` ve diğer gerçek environment dosyaları
- `node_modules`
- `.next`
- `.git`
- Vercel local metadata
- Database password
- `service_role` / `sb_secret_...`
- Hesap kurtarma kodları

## Son test özeti

- npm ci: başarılı
- lint: başarılı
- TypeScript: başarılı
- production build: başarılı
- project preflight: 6/6
- user Faz 9 CRUD acceptance: başarılı
- Vercel Preview deployment/Supabase/public-data health: başarılı

## Açık production adımı

Release candidate production değildir. `develop -> main` merge, Production environment kontrolü ve production verifier tamamlandığında `1.0.0` etiketi verilebilir.
