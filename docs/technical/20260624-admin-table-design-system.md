# Admin tablo tasarım sistemi

## Amaç

Admin panelindeki tablo tabanlı ekranları aynı kullanım mantığında toplamak; fakat her kaynağı Fiyat Yönetimi ekranının birebir kopyasına zorlamadan kendi verisine uygun sunmak.

## Kapsam

- Generic CRUD ekranları (`/admin/manage/[resource]`)
- Kariyer başvuruları (`/admin/applications`)
- Mevcut Fiyat Yönetimi ve Medya Kütüphanesi özel akışlarının korunması

## Generic CRUD görünümü

Kaynak başına kullanıcı dostu kolon grupları tanımlandı. Örneğin:

- Menü ürünleri: ürün, kategori, durum, sıra, son güncelleme
- Etkinlikler: içerik, tür, başlangıç, durum, son güncelleme
- Merch ürünleri: ürün, tür, fiyat, stok, durum, son güncelleme
- Şubeler: şube, konum, durum, sıra, son güncelleme
- İçerik blokları: blok, sayfa, tür, durum, sıra, son güncelleme

Teknik slug, kod ve anahtar değerleri ana başlığın altında ikincil bilgi olarak gösterilir. Yayın, aktiflik, stok ve görünürlük alanları renkli rozetlerle okunur.

## Responsive davranış

- Masaüstünde tablo ve sticky düzenleme paneli kullanılır.
- 899 px altında generic tablolar veri etiketli kartlara dönüşür.
- Kariyer tablosu 959 px altında kart görünümüne geçer.
- İşlem düğmeleri mobilde tam genişlikte kullanılabilir kalır.

## Veri ve güvenlik

- Veritabanı şeması değiştirilmedi.
- Mevcut CRUD action, doğrulama, RLS ve audit akışları korunur.
- Liste sorgularına yalnız son güncelleme göstergesi için `updated_at` alanı eklendi.
- Medya Kütüphanesi'nin aynı UUID ile görsel değiştirme ve otomatik bağlantı temizleme davranışlarına dokunulmadı.

## Kontroller

- ESLint
- TypeScript `--noEmit`
- Production build
- 134 unit test
