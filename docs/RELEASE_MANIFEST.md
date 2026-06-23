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
- unit test: 29 dosya / 86 test başarılı
- coverage: satır %64.10 / branch %43.66
- npm audit: 0 vulnerability
- user Faz 9 CRUD acceptance: başarılı
- Vercel Preview deployment/Supabase/public-data health: başarılı

## Açık production adımı

Kaynak kod `main` branch'indedir. Yerel Supabase migration/pgTAP, Playwright E2E, Production environment kontrolü ve production verifier tamamlandığında `1.0.0` etiketi verilebilir.
