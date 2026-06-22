# Faz 14C Medya Yaşam Döngüsü

Bu faz, medya kaydı ile onu kullanan içerikler arasındaki bağlantıyı admin tarafında görünür ve arşiv/silme öncesinde zorunlu hale getirir. Migration, seed veya canlı Storage işlemi uygulanmamıştır.

## Takip edilen kullanımlar

- `menu_items.image_media_id`
- `events.image_media_id`
- `merch_products.image_media_id`
- `instagram_posts.image_media_id`
- `job_applications.cv_media_id`
- `content_blocks.content` içindeki medya UUID'si, yerel yol, harici URL veya Storage nesne yolu

Kariyer başvurusu kullanımında aday adı okunmaz; medya ekranı yalnız başvuru kimliği ve CV bağlantısını kullanır.

## Durum geçişleri

| Mevcut durum | Kullanım | İzin verilen işlem |
|---|---:|---|
| Aktif/yayında | Var | İlgili içeriğe git, görseli değiştir veya bağlantıyı kaldır |
| Aktif/yayında | Yok | Arşivle |
| Arşiv/pasif | Yok | Yeniden yayına al |
| `TEST_` Storage kaydı | Yok | Storage nesnesi ve DB kaydını kalıcı sil |
| `TEST_` Storage kaydı | Var | Silme engellenir; önce bağlantı kaldırılır |
| TEST olmayan kayıt | Herhangi | Kalıcı silme sunulmaz |

Arşivlenen medya `status=archived` ve `is_active=false` olur. Yeniden yayına alma bu değerleri `published/true` yapar. Her iki işlem admin audit kaydı oluşturur ve public rotaları yeniden doğrular.

## Admin davranışı

- Medya kütüphanesi aktif/arşiv filtresi sunar.
- Her satır kullanım sayısını ve bağlı admin kaydına giden yolu gösterir.
- FK alanları için ilgili formdaki görsel seçimi değiştirilir veya boşaltılır.
- JSON içerik bloklarında doğrudan yol yeni medya yolu ile değiştirilir veya kaldırılır.
- Arşivlenmiş/pasif medya Generic CRUD seçim listelerinde gösterilmez.

## Public güvenlik davranışı

Kullanılan medya arşivlenemediği için RLS'nin medya kaydını public sorgudan gizlemesi mevcut içerikte kırık görsel oluşturmaz. Bağlantı kaldırıldıktan sonra public adaptör ilgili görseli tüketmez.

Public Storage bucket nesnesi, DB kaydı arşivlense bile doğrudan URL ile erişilebilir kalır. Arşivleme fiziksel silme değildir. Fiziksel silme yalnız bağlantısız `TEST_` kayıtlarında mevcut güvenli silme akışıyla yapılır.

## Artık risk

Kullanım kontrolü ile medya durum güncellemesi uygulama katmanında ardışıktır; aynı milisaniyelerde yeni bir içerik bağlantısı eklenmesi teorik yarış koşulu oluşturabilir. Tam atomiklik gerekirse sonraki bir migration'da referans kontrolü ve arşiv güncellemesini tek transaction/RPC içinde birleştirmek gerekir.

## Test kapsamı

- FK ve iç içe JSON yol kullanımının bulunması
- Benzer fakat farklı yolların yanlış pozitif oluşturmaması
- Kullanılan medyanın arşivlenememesi
- Bağlantısız medyanın arşivlenmesi ve geri alınması
- Arşivlenmiş medyanın içerik seçim listesinden filtrelenmesi
- Medya ekranının durum filtresi ve kullanım sütunu sunması
