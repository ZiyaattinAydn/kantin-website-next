# Faz 9 — Admin CRUD paneli

## Amaç

Faz 8'de oluşturulan Supabase Auth ve admin rol kontrolünün üzerine, public sitedeki canlı içeriklerin tamamını yönetebilen modüler bir panel kurulmuştur.

## Yönetim modülleri

### Dashboard

- Menü ürünü, kategori, etkinlik, merch, Instagram ve kariyer başvurusu sayıları
- Yeni başvuru sayısı
- Hızlı işlem bağlantıları
- Son admin işlem kayıtları

### Menü

- Kategori CRUD
- Kategori–şube ilişkileri
- Menü ürünü CRUD
- Ürün görseli seçimi
- Alerjenler ve etiketler
- Şubeye özel temel fiyat
- Fiyat etiketi ve bulunabilirlik notu
- Yarım/tam, hacim ve diğer fiyat varyantları

### Etkinlik

- Etkinlik CRUD
- Taslak, yayın ve arşiv durumu
- Tarih ve saat
- Şube ilişkileri
- Görsel ve harici URL

### Merch ve Instagram

- Merch ürün/paket CRUD
- Fiyat, stok ve satış durumu
- Şube görünürlüğü
- Instagram gönderi URL'si, açıklama, görsel ve sıra

### Şube ve site içeriği

- Şube adresi, harita URL'si, iletişim ve çalışma saatleri
- Public site ayarları
- Site sayfaları ve SEO alanları
- Hero, Anılarımız, galeri ve diğer `content_blocks` kayıtları

### Medya kütüphanesi

- Menü, etkinlik, merch, galeri ve Instagram bucket'larına görsel yükleme
- JPEG, PNG, WebP ve AVIF desteği
- Maksimum 8 MB kontrolü
- Arşivleme
- Yalnız `TEST_` adlı ve kullanılmayan Storage görsellerinde kalıcı silme

### Kariyer başvuruları

- Başvuru listesi ve filtreleme
- Başvuru detayı
- Durum değiştirme
- Admin notu
- Private CV için 60 saniyelik signed URL ile güvenli indirme

## Güvenlik kararları

- Her admin sayfası server-side admin kontrolünden geçer.
- Veritabanı yazma işlemleri mevcut RLS politikalarıyla ayrıca korunur.
- Public/seed içeriklerde kalıcı silme yerine pasife alma veya arşivleme kullanılır.
- Kalıcı silme yalnız adı `TEST_` veya slug değeri `test-` ile başlayan kayıtlarla sınırlandırılmıştır.
- Medya silinmeden önce ürün, etkinlik, merch, Instagram veya başvuru bağlantısı kontrol edilir.
- Her create/update/archive/test-delete/CV indirme işlemi `admin_activity_logs` tablosuna yazılır.
- Faz 9 migration'ı mevcut Kantin verilerini değiştirmez.

## Faz 9 migration

```text
supabase/migrations/20260620060000_admin_crud_support.sql
```

Migration yalnız `admin_activity_logs` tablosunu ve politikalarını oluşturur.

## Doğrulama

```text
supabase/verification/verify_faz_9_admin_crud.sql
```

Bütün `basarili` değerleri `true` olmalıdır.

## Test verisi yaklaşımı

Ayrı staging projesi kullanılmayacaktır. Test sırasında yalnız yeni kayıtlar oluşturulur:

- `TEST_ Menü Ürünü`
- `test-menu-urunu`
- `TEST_ Etkinlik`
- `test-etkinlik`
- `TEST_ Merch`
- `TEST_ Instagram`

Bu kayıtlar düzenleme ve public görünüm testinden sonra admin panelinden kalıcı olarak silinebilir. İhtiyaç halinde yalnız test öneklerini hedefleyen şu SQL kullanılabilir:

```text
supabase/manual/cleanup_faz_9_test_records.sql
```

## Rollback

```text
supabase/manual/rollback_faz_9_admin_crud.sql
```

Bu dosya yalnız Faz 9'da eklenen audit tablosunu kaldırır. Çalıştırılması admin işlem geçmişini kalıcı olarak siler.
