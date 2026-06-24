# Kantin Dinamik Admin Tabloları ve Kontrollü Menü Akışı

## Kapsam

Bu çalışma, admin panelindeki tablo tabanlı ekranları Fiyat Yönetimi'ndeki kullanıcı deneyimine yaklaştırırken her kaynağın kendi iş akışını korur. Temel yaklaşım; satırın tamamını tıklanabilir yapmak, düzenleme araçlarını aynı satırın altında açmak ve teknik veri ilişkilerini adminin bilgisi dışında sessizce değiştirmemektir.

## Dinamik tablo davranışı

- Generic CRUD kaynaklarında her kayıt bir genişletilebilir satırdır.
- Satır özeti, kaynağın önemli alanlarını gösterir; açılan bölüm aynı kaydın doğrulamalı düzenleme formunu içerir.
- Yeni kayıt alanı da açılır yapıdadır.
- Kariyer başvuruları aday satırından açılarak değerlendirme, CV ve retention işlemlerini aynı bağlamda sunar.
- Medya kayıtları satırdan açılarak büyük önizleme, kullanım yerleri, metadata, dosya değiştirme ve yaşam döngüsü işlemlerini gösterir.
- Masaüstü tablo ritmi ve mobil kart görünümü ortak bir kullanıcı deneyimi sağlar.

## Ürünü başka şubeye ekleme

Fiyat Yönetimi'ndeki eksik şube kartı artık doğrudan ve eksik bir bağlantı oluşturmuyor. Admin aşağıdaki kararları görerek verir:

- Hedef şube
- Menü kategorisi
- Kategori sırası
- Ürünün kategori içindeki sırası
- Ürünün ve kategorinin yayın durumu
- Başlangıç fiyatı, fiyat etiketi ve aktiflik
- İstenirse başka bir şubedeki varyantların kopyalanması

Kaydetme işlemi `public.add_admin_menu_item_to_branch` RPC'si üzerinden tek transaction içinde yürütülür. İşlem gerekli olduğunda `menu_items`, `menu_categories`, `menu_category_branches`, `menu_item_branches` ve `menu_item_variants` kayıtlarını kontrollü biçimde günceller veya oluşturur. Sonuç `admin_activity_logs` içinde audit edilir. Herhangi bir adım hata verirse yarım kayıt bırakılmaz.

## Gelişmiş varyant yönetimi düzeltmesi

“Yeni / gelişmiş yönetim” bağlantısı, tıklanan satırın `menu_item_branch_id` değerini `prefill_menu_item_branch_id` query parametresiyle taşır. Böylece daha önce başka bir üründe seçilmiş değer formda kalmaz ve her zaman tıklanan ürün-şube ilişkisi açılır.

## Medya güvenliği

Medya sayfası yeniden tasarlanırken aşağıdaki davranışlar korunmuştur:

- Aynı medya kaydını bağlantıları bozmadan yeni dosyayla değiştirme
- Bağlı içerikleri görüntüleme
- Arşivleme ve yeniden yayınlama
- Kalıcı silmede kullanım bağlantılarını güvenli biçimde kaldırma
- Mevcut RLS, RPC, audit ve Storage yaşam döngüsü sınırları

## Yeni veritabanı dosyaları

- `supabase/migrations/20260624030000_admin_menu_branch_add_flow.sql`
- `supabase/tests/menu_branch_add.test.sql`

Migration dosyası projeye eklenmiştir ancak hiçbir uzak veya production veritabanına uygulanmamıştır.

## Doğrulama

- ESLint: başarılı
- TypeScript: başarılı
- Vitest unit: 41 dosya, 135 test başarılı
- Next.js production build: başarılı
- Yerel Supabase pgTAP: yerel yığın çalışmadığı için bu turda çalıştırılmadı
- Playwright: yerel test ortamı hazırlanmadığı için bu turda çalıştırılmadı
