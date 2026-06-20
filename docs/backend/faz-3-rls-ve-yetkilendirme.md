# Faz 3 — RLS ve yetkilendirme özeti

Bu aşama, Faz 2'de oluşturulan 17 uygulama tablosuna açık ve denetlenebilir erişim kuralları ekler.

## Rol modeli

- `viewer`: Oturum açmış olsa bile içerik değiştiremez.
- `editor`: Public içerik tablolarını ve public medya kayıtlarını yönetebilir.
- `admin`: Editor yetkilerine ek olarak kullanıcı rolleri, iş başvuruları ve private CV medyasını yönetebilir.

Rol kontrolü `profiles` tablosu üzerinden yapılır. `is_admin()` ve `is_content_manager()` yardımcı fonksiyonları `security definer` olarak tanımlanır; böylece `profiles` RLS politikası içinde recursive sorgu oluşmaz.

## Public okuma

`anon` ve `authenticated` rolleri yalnızca şu koşulları sağlayan satırları okuyabilir:

- `status = 'published'`
- `is_active = true`
- varsa `published_at <= now()`
- ilişki tablolarında bağlı kategori, ürün, etkinlik, merch ürünü ve şube de public koşullarını sağlamalıdır

`media` tablosunda public kullanıcılar yalnız yayınlanmış `image` ve `video` kayıtlarını okuyabilir. `document` türü ve `career-cvs` bucket kayıtları public policy kapsamı dışındadır.

## İş başvuruları

- Public `SELECT` yoktur.
- Anonim veya normal authenticated kullanıcı doğrudan başvuruları okuyamaz.
- Yalnız `admin` rolü başvuruları okuyabilir ve durum/not güncelleyebilir.
- Doğrudan public `INSERT` bu aşamada bilinçli olarak kapalıdır. Private CV Storage, dosya doğrulaması ve spam korumalı sunucu endpoint'i kurulmadan kişisel veri tablosuna açık yazma yolu bırakılmaz.
- Faz 4 ve kariyer entegrasyonu tamamlandığında başvurular kontrollü server endpoint'i veya dar yetkili RPC üzerinden eklenecektir.

## Data API grant modeli

Proje oluşturulurken yeni tabloların otomatik açılması kapatıldığı için migration gerekli `GRANT` yetkilerini açıkça verir:

- Public içerik tablolarına `anon` ve `authenticated` için `SELECT`
- Yönetim işlemleri için `authenticated` role tablo yetkileri
- Satır bazındaki gerçek izinler RLS policy'leriyle sınırlandırılır

Bu iki katman birlikte çalışır: SQL `GRANT` nesneye erişimi, RLS ise erişilebilecek satırları belirler.

## Doğrulama

`supabase/verification/verify_faz_3_rls.sql` salt okunur kontrol sorgusudur. Beklenen temel sonuçlar:

- 17/17 tabloda RLS açık
- 34 policy mevcut
- anon public içerik okuyabilir
- anon içerik yazamaz
- anon iş başvurularını okuyamaz veya doğrudan ekleyemez
- rol yardımcıları yalnız authenticated tarafından kullanılabilir
