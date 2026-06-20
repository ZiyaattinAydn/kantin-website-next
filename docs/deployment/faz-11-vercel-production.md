# Faz 11 — Vercel Production ve Supabase Auth Yapılandırması

Bu aşama kodu production ortamına hazırlamak, Vercel environment variable'larını tanımlamak, Supabase Auth URL ayarlarını güncellemek ve canlı deployment'ı doğrulamak içindir.

## Production environment variable'ları

Vercel Dashboard > Project > Settings > Environment Variables bölümünde yalnız **Production** ortamına şu değerleri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJE_REFERANSI.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://PROJE-ADRESI.vercel.app
SITE_ENV=production
```

- Database password, `service_role` veya `sb_secret_...` eklemeyin.
- `NEXT_PUBLIC_` değişkenleri istemci bundle'ına girebilir; burada yalnız publishable değerler kullanılmalıdır.
- Preview ortamını aynı production veritabanına bağlamamak için bu dört değişkeni başlangıçta Preview'a eklemeyin.

## Production branch

Vercel Dashboard > Project > Settings > Git bölümünde **Production Branch** değerini kontrol edin. Canlıya çıkacak kod hangi branch'teyse production branch o olmalıdır. Branch değiştirildiğinde yeni production deployment başlatın.

## Redeploy

Environment variable değişiklikleri mevcut deployment'a geriye dönük uygulanmaz. Değişkenleri ekledikten sonra:

1. Deployments bölümünü açın.
2. Son production deployment'ının menüsünden Redeploy seçin.
3. Yeni build'in başarıyla tamamlanmasını bekleyin.

## Supabase Auth URL Configuration

Supabase Dashboard > Authentication > URL Configuration bölümünde:

- Site URL: `https://PROJE-ADRESI.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://PROJE-ADRESI.vercel.app/**`

Özel domain eklendiğinde Site URL özel domain'e çevrilmeli ve özel domain redirect listesine de eklenmelidir.

## Canlı sağlık kontrolleri

Aşağıdaki adresler 200 ve `ok: true` dönmelidir:

- `/api/health/deployment`
- `/api/health/supabase`
- `/api/health/public-data`

Production ortamında ayrıca:

- `/robots.txt` public sayfalara izin vermeli, `/admin/` ve `/api/` yollarını engellemelidir.
- `/sitemap.xml` ana sayfa, menü, etkinlikler ve kariyer rotalarını içermelidir.
- Ana sayfada `X-Robots-Tag: noindex` bulunmamalıdır.
- Preview ve development ortamları noindex kalmalıdır.

## Komut satırı doğrulaması

```bash
npm run verify:production -- https://PROJE-ADRESI.vercel.app
```

Komut deployment, Supabase, public veri, robots, sitemap ve admin route korumasını denetler.

## Canlı admin erişimi

```text
https://PROJE-ADRESI.vercel.app/admin
```

Oturum yoksa `/admin/login` adresine yönlendirilir. Giriş Supabase Auth hesabı ve `profiles.role = admin` kontrolüyle yapılır.

## Özel domain

Domain satın alındığında Vercel Dashboard > Project > Settings > Domains bölümünden eklenir. Apex ve `www` birlikte kullanılacaksa biri ana domain, diğeri yönlendirme olarak ayarlanmalıdır. Domain aktif olduktan sonra:

- `NEXT_PUBLIC_SITE_URL`
- Supabase Site URL
- Supabase Redirect URLs

özel domain ile güncellenmeli ve deployment yeniden alınmalıdır.
