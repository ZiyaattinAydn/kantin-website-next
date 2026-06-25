# Bakım ve Yedekleme Rehberi

## Haftalık

- Admin paneline giriş ve çıkışı kontrol et.
- Ana sayfa, iki menü, etkinlikler ve kariyer sayfasını aç.
- `/api/health/supabase` ve `/api/health/public-data` sonuçlarını kontrol et.
- Yeni kariyer başvurularını incele.
- Kırık görsel veya yanlış fiyat olup olmadığını gözden geçir.
- `npm run backup:supabase` ile doğrulanmış tam Supabase yedeği al.
- `VERIFY_REPORT.md` sonucunun **BAŞARILI** olduğunu kontrol et.

## Aylık

- `npm audit` ve bağımlılık güncellemelerini ayrı bir branch'te değerlendir.
- Vercel build ve function loglarında tekrarlayan hata ara.
- Supabase Database ve Auth loglarını kontrol et.
- Storage kullanımını ve gereksiz test görsellerini kontrol et.
- Admin kullanıcı listesini ve aktif rolleri gözden geçir.
- CV saklama süresi dolan başvurular için silme/anonimleştirme kararı uygula.
- Aylık yedeği şifreli ve erişimi sınırlı arşive taşı.

## Veritabanı yedeği

- Migration ve `seed.sql` kaynak kod yedeğidir; gerçek başvuru ve sonradan girilen içeriklerin yedeği değildir.
- Production migration veya toplu içerik değişikliği öncesinde tam yedek al.
- Yedek dosyasını Git repository'sine veya public buluta koyma.
- Geri yükleme işlemini önce yeni/geçici test projesinde doğrula.
- Ayrıntılı prosedür: `docs/operations/supabase-backup-restore.md`

## Storage yedeği

Database dump gerçek Storage dosyalarını içermez. Public medya ve private CV bucket'ları ayrıca yedeklenmelidir.

- CV yedeği şifreli ve erişimi sınırlı tutulmalıdır.
- Gereksiz veya saklama süresi dolmuş CV dosyaları silinmelidir.
- `storage.objects` tablosunda doğrudan SQL DELETE kullanmayın; Storage API veya Dashboard kullanın.
- Yedek doğrulamasında altı beklenen bucket'ın tamamı bulunmalıdır.

## Anahtar ve hesap bakımı

- Admin parolasını şüphe halinde hemen değiştir.
- Supabase publishable key public kullanım içindir; secret/service role client'a eklenmez.
- Vercel ve Supabase owner hesaplarında iki faktörlü doğrulama kullan.
- Proje devrinde eski kullanıcı erişimlerini kaldır, deploy token ve kurtarma yöntemlerini yenile.
