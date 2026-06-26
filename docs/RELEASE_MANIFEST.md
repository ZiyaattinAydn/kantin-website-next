# Release Manifest — 1.0.0-rc.1

## Teslim kapsamı

- Next.js / React / TypeScript kaynak kodu
- Responsive public site ve yönetim paneli
- Supabase migration, seed, pgTAP, verification ve rollback dosyaları
- RLS, Auth, kariyer/CV, medya, fiyat ve audit sistemleri
- Kritik kayıt snapshot ve geri yükleme altyapısı
- Database + Storage yedekleme/doğrulama araçları
- Yerel masaüstü/mobil Playwright regresyon paketi
- Operasyon, güvenlik, deployment ve debugging belgeleri

## Bilerek Git/release kapsamı dışında tutulanlar

- `.env.local` ve gerçek environment dosyaları
- `node_modules`, `.next`, coverage ve Playwright çıktıları
- `.git`, `.vercel`, `supabase/.branches` ve `supabase/.temp`
- `supabase-backups` ve restore çalışma klasörleri
- Database password, service-role/secret anahtarlar ve kurtarma kodları
- `qa-live-write` yerel canlı kabul aracı ve sonuç klasörleri
- Paket aktarım notları (`README-STEP*.txt`, `VALIDATION.txt`)

## Son test özeti

- Unit: 56 dosya / 223 test başarılı
- Coverage: satır %76.53 / branch %55.92
- pgTAP: 12 dosya / 157 test başarılı
- Playwright: 16 başarılı / 2 kontrollü skipped
- TypeScript: başarılı
- ESLint: başarılı
- Production build: başarılı
- Migration zinciri: 19 benzersiz dosya
- Backup mock ve gerçek production backup doğrulaması: başarılı
- npm audit: 0 vulnerability

## Release engeli olmayan bilinen durumlar

- Fallback E2E senaryosu yalnız bilinçli Supabase kesintisi hedefinde çalıştığı için normal regresyonda iki kez skipped olur.
- Supabase CLI yeni sürüm bildirimi test sonucu değildir.
- Yerel/production migration geçmişi şema durumundan ayrı tutulur ve production kapanışında senkronize edilmelidir.

## Production için kalanlar

- Production release-readiness SQL
- Migration history baseline ve son migration push
- Vercel production deploy
- Production verifier ve son smoke test
- İsteğe bağlı fakat güçlü biçimde önerilen gerçek boş test projesine restore provası
