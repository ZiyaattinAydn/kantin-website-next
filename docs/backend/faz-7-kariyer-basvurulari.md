# Faz 7 — Kariyer başvuruları ve private CV yükleme

## Amaç

Kariyer formu artık e-posta taslağı açmak yerine başvuruyu Supabase'e kaydeder ve CV dosyasını `career-cvs` private bucket'ına yükler. Public kullanıcılar başvuruları veya CV dosyalarını okuyamaz.

## Akış

1. Tarayıcı formu `/api/careers/applications` Route Handler'ına `multipart/form-data` olarak gönderir.
2. Sunucu alanları, şube/pozisyon/vardiya uyumunu, açık rızayı ve CV'yi doğrular.
3. CV için uzantı, MIME, 5 MB sınırı ve dosya imzası kontrol edilir.
4. `begin_job_application` RPC kısa ömürlü, tekil bir private Storage yolu üretir.
5. Route Handler CV'yi yalnız bu yola yükler.
6. `complete_job_application` RPC Storage nesnesinin boyut ve MIME bilgisini doğrular; `media` ve `job_applications` kayıtlarını tek transaction içinde oluşturur.
7. Yükleme veya kayıt başarısız olursa nesne ve kısa ömürlü oturum temizlenmeye çalışılır.

## Spam ve tekrar koruması

- Görünmez honeypot alanı
- Formun insan tarafından doldurulmasına yönelik minimum süre kontrolü
- Aynı e-posta + telefon kombinasyonu için tekrar sınırı
- Sunucuda hashlenen IP için saatlik deneme sınırı
- Proje genelinde saatlik üst sınır
- Gönderim sırasında buton kilidi
- Tekil Storage yolu ve `upsert: false`

Bu korumalar temel uygulama seviyesindedir. Production trafik büyürse Cloudflare Turnstile veya benzeri bir CAPTCHA katmanı ayrıca eklenebilir.

## Güvenlik

- `career-cvs` bucket'ı private kalır.
- Anon kullanıcı `job_applications`, `media` veya `career_upload_sessions` tablolarını okuyamaz.
- Anon kullanıcı `job_applications` tablosuna doğrudan INSERT yapamaz.
- Storage INSERT yalnız veritabanının ürettiği, 15 dakika geçerli tekil nesne yolunda mümkündür.
- Başvuru ve medya kaydı `SECURITY DEFINER` fonksiyonunda doğrulanarak tamamlanır.
- Orijinal CV dosya adı Storage yoluna veya public yanıta yazılmaz.
- IP ve user-agent ham biçimde değil SHA-256 hash olarak saklanır.

## Dosyalar

- `supabase/migrations/20260620040000_career_applications.sql`
- `supabase/verification/verify_faz_7_careers.sql`
- `src/app/api/careers/applications/route.ts`
- `src/lib/careers/validation.ts`
- `src/components/careers/CareersPage.tsx`
- `src/components/careers/CareersPage.module.css`

## Test senaryoları

- Geçerli PDF ve DOCX yükleme
- Sahte PDF imzasının reddedilmesi
- 5 MB üzeri dosyanın reddedilmesi
- Eksik uygun gün ve onayın reddedilmesi
- Geçersiz vardiya/pozisyon kombinasyonunun reddedilmesi
- Çok hızlı gönderimin reddedilmesi
- Farklı origin üzerinden isteğin reddedilmesi
- Başarılı işlemde `job_applications` ve private Storage kaydının oluşması
- Public sorguda başvuru ve CV verisinin görünmemesi
