# Faz 14E Sorgu Ölçeklenebilirliği ve Pagination

Bu faz public veri adaptörlerindeki gereksiz sorguları azaltır ve admin listelerini server-side pagination ile sınırlar. Migration veya canlı veri işlemi gerektirmez.

## Public veri değişiklikleri

- Common, home, menu ve events adaptörleri React `cache` ile aynı request içinde tekilleştirilir.
- Cache request kapsamındadır; farklı ziyaretçiler arasında eski içerik saklamaz.
- Common sorgusu yalnız public Branch modelinin kullandığı kolonları seçer.
- Events sorgusu yalnız render edilen etkinlik, şube ve ilişki kolonlarını okur.
- Event medyası tüm `media` tablosu yerine yalnız `events.image_media_id` UUID listesiyle sorgulanır.
- Home merch/Instagram medyası yalnız bağlı medya UUID listesiyle sorgulanır.
- Menu item medyası yalnız bağlı UUID listesiyle sorgulanır.
- Kullanılmayan `menu_category_branches` public menu sorgusu kaldırıldı.
- Menu rotası artık `getHomePublicData` çağırmaz; etkinlik ve Instagram sorgularını tetiklemeden dedicated merch adaptörünü kullanır.

## Admin liste değişiklikleri

Liste sayfa boyutu 25 kayıttır.

### Generic CRUD

- Arama `resource.searchFields` üzerinden PostgREST `or + ilike` filtresine dönüştürülür.
- `count: exact`, sıralama ve `range(from, to)` DB sorgusunda uygulanır.
- Tarayıcıya yalnız aktif sayfanın satırları gönderilir.

### Medya kütüphanesi

- Arama ve aktif/arşiv filtresi DB sorgusunda uygulanır.
- Kullanım haritası yalnız mevcut sayfadaki medya UUID'leri için FK sorgusu yapar.
- JSON içerik yollarını bulabilmek için `content_blocks.content` taraması korunur.

### Kariyer başvuruları

- Liste sorgusu yalnız tabloda gösterilen kolonları ve mevcut sayfadaki 25 kaydı okur.
- Tam başvuru, tanıtım metni ve admin notu yalnız `İncele` paneli açıldığında ayrı sorgulanır.
- Durum, privacy durumu, retention süresi dolanlar ve metin araması DB tarafında filtrelenir.
- Bu sınırlama kişisel verinin gereğinden fazla okunmasını azaltır.

## Güvenli arama

Arama metni 100 karakterle sınırlanır. PostgREST filtre gramerindeki virgül, yüzde, alt çizgi ve parantez ayraçları sorguya eklenmeden normalize edilir. Tablo ve kolon adları kullanıcıdan değil, statik admin resource tanımından gelir.

## Kalan riskler

- Generic foreign-key seçenek listeleri henüz pagination kullanmaz; form select alanları için async arama dinamik şube/kategori çalışmasıyla birlikte ele alınmalıdır.
- JSON içindeki doğrudan medya yolları yapısal FK olmadığı için medya ekranı `content_blocks` içeriğini taramaya devam eder.
- `%metin%` aramaları veri hacmi büyürse `pg_trgm` indeksleri gerektirebilir. Bu faz kullanım verisi olmadan yeni indeks migration'ı eklemez.
- React `cache` yalnız request deduplication sağlar; cross-request ISR/Data Cache politikası içerik güncelliği SLA'sı belirlendikten sonra ayrı tasarlanmalıdır.

## Test kapsamı

- Sayfa numarası, 25 kayıtlık range ve toplam sayfa hesabı
- PostgREST arama ayraçlarının normalize edilmesi
- Generic CRUD sorgusunda DB araması, exact count ve range uygulanması
- Etkinlik medyasının yalnız bağlı UUID ile sorgulanması
- Dedicated merch adaptörünün bağlantı hatası fallback'i
- Masaüstü ve mobil Playwright senaryolarının güncel rotaları keşfetmesi
