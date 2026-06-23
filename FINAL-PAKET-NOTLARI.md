# Kantin Website — Final Kaynak Paket Notları

Bu paket güncel kaynak kodu, Supabase migration/test dosyalarını, otomatik testleri ve proje dokümantasyonunu içerir.

## Uygulanan son işlemler

- Kullanılmayan eski içerik/component katmanları kaldırıldı.
- Eski Firebase/static admin varlıkları ve demo etkinlik veri katmanı temizlendi.
- Referanssız medya varlıkları kaldırıldı.
- Header taşma riski azaltıldı; mobil menü 1180 px altında devreye giriyor.
- Ana sayfa hero dikey boşluğu ve responsive ölçüleri dengelendi.
- Fallback veri uyarısı sadeleştirildi.
- README, AGENTS ve durum belgeleri `main` çalışma düzenine göre güncellendi.

## Doğrulama sonucu

- `npm run test:unit`: 29 dosya / 86 test başarılı
- `npm run test:unit:coverage`: satır %64.10 / branch %43.66
- `npm run lint`: başarılı
- `npx tsc --noEmit`: başarılı
- `npm run build`: başarılı
- `npm audit`: 0 vulnerability

## Pakete bilinçli olarak dahil edilmeyenler

- `.git`
- `node_modules`
- `.next`
- coverage / Playwright raporları
- `.vercel`
- `.env.local` ve gerçek erişim anahtarları
- Vercel recovery code dosyası

## Kurulum

```bash
npm ci
```

`.env.example` dosyasını `.env.local` olarak kopyalayıp kendi Supabase public değerlerini ekledikten sonra:

```bash
npm run dev
```

Docker aşamasında yerel Supabase başlatılarak `npm run test:db` ve `npm run test:e2e` çalıştırılmalıdır.
