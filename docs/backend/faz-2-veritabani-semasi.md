# Faz 2 — Veritabanı şeması özeti

Bu şema mevcut frontend verilerini kaybetmeden Supabase'e taşımak ve ileride admin paneli üzerinden yönetmek için tasarlandı.

## Ana ilişkiler

- `branches`: Alsancak ve Atakent'in temel bilgileri.
- `menu_categories`: Bira, şişe bira, fritöz, kahve, kokteyl gibi kategoriler.
- `menu_category_branches`: Bir kategorinin hangi şubede ve hangi sırada gösterileceği.
- `menu_items`: Ürünün ortak adı, açıklaması, alerjenleri ve görseli.
- `menu_item_branches`: Ürünün şubeye göre fiyatı, görünürlüğü ve sırası.
- `menu_item_variants`: 30 cl / 50 cl, yarım / tam, kadeh / karaf gibi fiyat seçenekleri.
- `events` + `event_branches`: Bir etkinliğin tek veya iki şubede yayınlanabilmesi.
- `merch_products` + `merch_product_branches`: Merch ürünlerinin yalnızca uygun şubede gösterilmesi.
- `media`: Yerel görseller, ilerideki Storage dosyaları ve harici medya için ortak kayıt.
- `job_applications`: Public olarak okunamayacak kişisel başvuru verileri.
- `profiles`: Supabase Auth kullanıcısı ile admin/editor rolünün bağlantısı.
- `site_settings`, `site_pages`, `content_blocks`: Footer, site metinleri ve kontrollü içerik yönetimi.

## Neden fiyat doğrudan `menu_items` içinde değil?

Aynı ürünün Alsancak ve Atakent fiyatı değişebilir. Bu nedenle fiyat `menu_item_branches` içinde tutulur. Bir ürünün birden fazla porsiyon veya hacmi varsa fiyatlar `menu_item_variants` içine ayrılır.

Örnek:

- Menü ürünü: `Becks`
- Şube kaydı: `Alsancak`
- Varyantlar: `küçük`, `orta`, `büyük`

Bu yapı, admin panelinde tek ürünün farklı şube ve hacim fiyatlarını güvenli şekilde değiştirmeyi sağlar.

## RLS durumu

İlk migration bütün uygulama tablolarında RLS'yi açar fakat henüz erişim politikası oluşturmaz. Bu güvenli varsayılan nedeniyle Faz 2 sonunda Data API sorguları veri döndürmez.

Faz 3'te:

- yayınlanmış public içeriklere `SELECT`,
- kariyer formuna kontrollü `INSERT`,
- admin kullanıcılarına gerekli CRUD

politikaları ayrı ve denetlenebilir SQL ile eklenecektir.
