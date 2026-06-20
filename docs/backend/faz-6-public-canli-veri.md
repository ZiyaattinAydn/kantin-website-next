# Faz 6 — Public site canlı Supabase verisi

Bu fazda mevcut tasarım korunarak public sayfalar Supabase verisine bağlandı.
Statik TypeScript verileri kaldırılmadı; bağlantı veya sorgu hatasında doğrulanmış
yerel içerik fallback olarak kullanılmaya devam eder.

## Canlı veri kaynakları

- Ortak site verisi: şubeler, navigasyon, footer ve bölüm görünürlükleri
- Ana sayfa: hero, şube kartları, merch, Anılarımız, Instagram ve etkinlikler
- Menü: kategoriler, ürünler, şube ilişkileri, fiyatlar ve varyantlar
- Etkinlikler: etkinlik kayıtları, şube ilişkileri ve medya

## Durum yönetimi

- `src/app/loading.tsx`: route geçişlerinde yükleniyor görünümü
- `PublicDataNotice`: Supabase kullanılamazsa ziyaretçiye kısa bilgilendirme
- Boş veri bileşenleri: yayınlanmış kayıt bulunmadığında kontrollü görünüm
- Public sorgular için 8 saniyelik zaman aşımı
- Statik fallback: mevcut frontend verileri korunur

## Sağlık kontrolü

`GET /api/health/public-data`

Bu endpoint anahtar veya proje URL'si döndürmez. Kullanılan veri kaynaklarını ve
public kayıt sayılarını özetler. Tüm kaynaklar Supabase olduğunda HTTP 200,
herhangi bir kaynak fallback kullandığında HTTP 503 döner.

## Güvenlik

Public sorgular yalnız publishable key kullanır. Kullanıcı oturumu veya yüksek
yetkili anahtar taşınmaz. Okunabilen satırlar Faz 3 RLS politikaları tarafından
sınırlandırılır.
