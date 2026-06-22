# Faz 14B Admin-Public Alan Eşleşmeleri

Bu faz, admin panelinde düzenlenebildiği halde public tarafta etkisiz kalan alanları mevcut tasarımı değiştirmeden veri akışına bağlar. Veritabanı şeması ve seed verileri değiştirilmemiştir.

## Tamamlanan eşleşmeler

| Admin kaynağı | Alan | Public tüketici | Davranış |
|---|---|---|---|
| `site_pages` | `seo_title` | Home, Menu, Events, Careers metadata | Doluysa sayfa başlığı olur |
| `site_pages` | `seo_description` | Home, Menu, Events, Careers metadata | Doluysa meta description olur |
| `site_pages` | `title` | Metadata fallback zinciri | SEO başlığı boşsa kullanılır |
| `menu_items` | `image_media_id` | Public menü şube paneli | Yalnız RLS ile okunabilen medya ürün adı ve alt metniyle gösterilir |
| `branches` | `short_description` | Ana sayfa menü/konum kartı, footer, menü şube seçici | Statik açıklamaların yerine geçer |
| `branches` | `address_line`, `district`, `city`, `maps_url` | Ana sayfa konum kartı ve footer | Admin değişikliği public adrese ve yol tarifine yansır |
| `branches` | `phone`, `public_email` | Footer şube kartı | `tel:` ve `mailto:` bağlantıları olarak gösterilir |
| `branches` | `opening_hours` | Footer şube kartı | `notice`/`note` ve `items[{label,hours}]` yapıları gösterilir |
| `branches` | `features` | Ana sayfa menü kartı ve footer | Admin etiketleri public kartlara yansır |

## Güvenli fallback davranışı

- `site_pages` sorgusu başarısızsa rotaların mevcut statik metadata değerleri korunur.
- Bir menü medyası arşivliyse veya RLS tarafından okunamıyorsa public görsel listesine eklenmez.
- Çalışma saati boşsa mevcut Instagram bilgilendirme metni gösterilir.
- Branch/content block verisi eksikse `src/data` fallback kartları korunur.

## Test kapsamı

- SEO alanı önceliği, Supabase sorgusu ve bağlantı hatası fallback'i
- Çalışma saati JSON normalizasyonu
- Telefon, e-posta ve kısa açıklamanın public Branch modeline taşınması
- Ana sayfa menü ve konum kartlarının admin şube verisiyle birleşmesi
- Menü medya bağlantısının public görsel modeline ve render edilen `<img>` etiketine ulaşması

Bu faz migration gerektirmez ve geriye uyumludur. Public RLS mevcut `published + is_active` sınırını uygulamaya devam eder.
