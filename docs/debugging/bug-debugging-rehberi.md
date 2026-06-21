# Bug ve Debugging Rehberi

## 1. Önce sorunu sınıflandır

Her hata için şu bilgileri kaydet:

- Hangi URL / admin modülü?
- Local, Preview veya Production mı?
- Hangi kullanıcı rolü?
- Beklenen ve gerçekleşen davranış?
- Tarayıcı console hatası?
- Network isteğinin status kodu ve response gövdesi?
- Vercel / Supabase log zamanı?
- Sorun tekrar edilebilir mi?

Gerçek `.env.local`, şifre, CV veya kişisel veriyi hata raporuna ekleme.

## 2. Standart ilk kontroller

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run preflight
```

Canlı ortam:

```bash
npm run verify:deployment -- https://SITE-ADRESI preview
npm run verify:deployment -- https://SITE-ADRESI production
```

## Canlı veri uyarısı görünürse

1. `/api/health/deployment` kontrol et.
2. `siteUrlConfigured`, `supabaseUrlConfigured`, `supabaseKeyConfigured` true olmalı.
3. `/api/health/supabase` `ok:true` dönmeli.
4. `/api/health/public-data` içinde `degraded:false` ve `sources.*=supabase` olmalı.
5. Environment variable doğru ortama mı eklendi? Preview ve Production ayrıdır.
6. Değişken eklendikten sonra yeni deployment alındı mı?

## Admin 500 veya login açılmıyorsa

- `NEXT_PUBLIC_SUPABASE_URL` ve publishable key tanımlı mı?
- Publishable key `sb_publishable_` ile başlıyor mu?
- Supabase Auth kullanıcısı var mı?
- `profiles.role=admin` ve `is_active=true` mi?
- Browser'da eski cookie varsa çıkış yap veya gizli sekmede dene.
- Vercel function logunda ilk server hatasını incele.

## 401 / 403 hataları

- 401: Oturum yok veya session süresi dolmuş olabilir.
- 403: Oturum var ancak rol/RLS işlemi reddediyor olabilir.
- İlgili migration ve verification SQL çalıştırılmış mı?
- İşlem server action üzerinden mi, doğrudan client sorgusuyla mı yapılıyor?
- `profiles` ve policy koşullarını kontrol et.

## CRUD kaydı public sitede görünmüyorsa

- `is_active=true` mi?
- `status=published` mı?
- `published_at` gelecekte mi?
- Şube/kategori ilişki kaydı var mı ve o da aktif mi?
- Sıra alanı doğru mu?
- Public health sorgusu fallback'e mi düştü?
- Next.js cache / deployment eski sürüm mü? Yeni deploy ve hard refresh dene.

## Görsel yüklenmiyorsa

- Dosya MIME türü ve uzantısı izinli mi?
- Public görseller 8 MB, CV 5 MB sınırında mı?
- Doğru bucket seçildi mi?
- Admin rolü ve Storage policy doğru mu?
- Media kaydı ile Storage nesnesi aynı yolu mu gösteriyor?
- CV bucket'ı public URL ile açılmaz; signed URL gerekir.

## Mobil taşma varsa

Tarayıcı responsive modda 320, 360, 375, 390 ve 430 px genişliklerini kontrol et.

Console'da:

```js
[...document.querySelectorAll('*')].filter(
  (el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1,
)
```

Taşan öğenin fixed width, min-width, absolute konum, uzun kelime veya flex shrink ayarını incele. Global `overflow-x:hidden` ile problemi saklamak yerine kaynağı düzelt.

## Build yalnız Vercel'de bozuluyorsa

- Branch ve commit gerçekten doğru mu?
- Environment variable hedef ortamda var mı?
- Dosya adı büyük/küçük harf farkı Linux build'de hata veriyor olabilir.
- Localde temiz `npm ci` ve `npm run build` çalıştır.
- Vercel build cache'i temizleyerek redeploy et.

## Güvenli hata düzeltme akışı

1. Hata için küçük, tekrar edilebilir test oluştur.
2. Ayrı branch veya temiz proje kopyasında düzelt.
3. Lint + TypeScript + build çalıştır.
4. İlgili route ve ekranı kontrol et.
5. RLS/Storage değişiyorsa verification SQL ekle.
6. Patch'i küçük tut ve rollback yolunu yaz.
7. Production'a geçmeden önce Preview'da doğrula.
