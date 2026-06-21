# Production Kapanış Rehberi

## Mevcut durum

`develop` Preview ortamında Supabase bağlantısı ve public data doğrulanmıştır. Production için `main` branch ve production environment kullanılmalıdır.

## 1. Merge öncesi

```bash
npm ci
npm run check
npm run preflight
```

Faz 9 test kayıtlarını temizle ve doğru fiyat/şube içeriklerini son kez kontrol et.

## 2. Git akışı

- `develop` branch'inin güncel ve temiz olduğundan emin ol.
- Pull request veya kontrollü merge ile `main` branch'ine aktar.
- Merge çatışmasında migration ve güncel responsive CSS sürümlerini koru.

## 3. Vercel Production environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJE_REFERANSI.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://PRODUCTION-ADRESI
SITE_ENV=production
```

Database password, `service_role` ve `sb_secret_...` eklenmez.

## 4. Supabase Auth

- Site URL: production adresi
- Redirect URL: `https://PRODUCTION-ADRESI/**`
- Local geliştirme için `http://localhost:3000/**` korunabilir
- Public sign-up ve anonymous sign-in kapalı kalır

## 5. Deployment

- Main commit sonrası Production deployment'ı bekle.
- Domain otomatik atanmadıysa deployment'ı Promote et.
- Environment değişkeni değiştiyse mutlaka yeni deployment oluştur.

## 6. Sağlık kontrolleri

```bash
npm run verify:deployment -- https://PRODUCTION-ADRESI production
```

Beklenen:

- environment=production
- indexable=true
- Supabase Auth ok
- public data degraded=false
- robots ve sitemap doğru
- `/admin` oturumsuz login'e yönleniyor

## 7. Son smoke test

- Ana sayfa ve iki menü
- Admin login/çıkış
- Bir TEST kaydı ekle/düzenle/sil
- Kariyer formunu test kişisel verisiyle gönder; sonra test kaydını ve CV'yi temizle
- Mobil 360/375 px ve masaüstü 1440 px kontrolü

## 8. Sürüm

Bütün kapanış kriterleri geçerse package sürümünü `1.0.0` yap, changelog'a production tarihini ekle ve Git tag oluştur.
