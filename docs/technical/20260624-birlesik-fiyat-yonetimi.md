# 24 Haziran 2026 — Birleşik fiyat yönetimi

## Amaç

Admin kullanıcısının ürün içeriği, şube fiyatı ve fiyat varyantı arasında teknik tablolarda dolaşmadan fiyatları ürün bağlamında yönetebilmesi.

## Yeni ekran

- Route: `/admin/pricing`
- Sol menü etiketi: `Fiyat yönetimi`
- Ürün arama
- Kategori filtresi
- Şube filtresi
- Aktif/pasif ürün filtresi
- Fiyatı eksik ürün filtresi
- 12 ürünlük server-side sayfalama görünümü

Her ürün kartında aktif şubeler ayrı alanlarda gösterilir. Var olan bağlantıda temel fiyat, fiyat etiketi, fiyat notu, bulunabilirlik notu ve aktiflik güncellenir. Bağlantı yoksa aynı ekrandan `menu_item_branches` kaydı oluşturulur. Bağlı varyantların fiyatı, fiyat notu ve aktifliği inline değiştirilebilir.

## Veri modeli

Yeni tablo veya migration eklenmedi. Ekran mevcut tabloları kullanır:

- `menu_items`
- `menu_categories`
- `branches`
- `menu_item_branches`
- `menu_item_variants`

Yazma işlemleri mevcut RLS ve transaction audit trigger katmanından geçer. Generic CRUD sayfaları gelişmiş yönetim için korunmuştur.

## Fiyat dönüşümü

Form fiyatları `85`, `85,50` veya `85.50` biçiminde kabul edilir ve tam sayı `price_cents` değerine çevrilir. Negatif, üçten fazla ondalık basamaklı ve aşırı büyük değerler reddedilir. Şube temel fiyatı boş bırakılabilir; varyant fiyatı zorunludur.

## Doğrulama

- `tests/unit/admin/pricing.test.ts`
- `tests/unit/admin/pricing-actions.test.ts`

Production smoke testinde yalnız `TEST_` ürün/şube ilişkileri kullanılmalıdır.
