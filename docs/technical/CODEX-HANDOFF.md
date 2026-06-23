# Teknik Handoff

### Görev

Kariyer formu karikatür katmanının kapatılması; etkinlik + duyuru migration hazırlığı; medya ayarları, güvenli kalıcı silme ve public arşiv görünürlüğü düzeltmesi; birleşik fiyat yönetimi ekranı.

### Durum

Kod, unit testler ve production build tamamlandı. Production Supabase'e migration uygulanmadı. Docker kullanılmadığı için pgTAP ve yerel Supabase E2E testleri çalıştırılmadı.

### Yapılanlar

#### Karikatür katmanları

- `/careers#basvuru` form bölümü `isolation: isolate` ile ayrı stacking context'e alındı.
- Doodle/parallax katmanı altta, form layout ve opak form kartı üstte kalıyor.
- Hareket ve reduced-motion davranışı korunuyor.

#### Etkinlikler ve duyurular

- Daha önce hazırlanan etkinlik + duyuru sistemi korunup migration transaction sınırına alındı.
- Bekleyen migration: `supabase/migrations/20260623030000_event_announcements.sql`.
- Production uygulama ve smoke test sırası teknik nota yazıldı.

#### Medya yönetimi

- Public medya sorguları `status = published` ve `is_active = true` filtrelerini açıkça uyguluyor.
- Home ve merch content block görsel yolları aktif medya referans allowlist'iyle doğrulanıyor. Arşivli Storage URL'si JSON içinde bağlı kalsa bile public alanda render edilmiyor.
- Arşivlenmiş Instagram medyası boş `src` üretmeden listeden çıkarılıyor.
- `/admin/media` ekranında medya adı, alt metin, yayın durumu, aktiflik ve sıralama düzenlenebiliyor.
- Kaynak, bucket ve object path salt okunur bırakıldı.
- Bağlantılı medya arşivlenebiliyor; kullanım bağlantıları kalıcı silmeyi engellemeye devam ediyor.
- Kalıcı silme yalnız bağlantısız, arşivlenmiş ve pasif public Storage görsellerinde açılıyor ve yazılı onay istiyor.
- Silme begin → Storage remove → DB complete akışında yürütülüyor. Storage nesnesi zaten yoksa DB tamamlama güvenli şekilde devam ediyor. Storage hatasında pending marker kaldırılıyor; DB tamamlama yarıda kalırsa `SİLMEYİ TAMAMLA` ile tekrar denenebiliyor.
- Metadata güncelleme ve kalıcı silme admin kontrolü ve semantic audit içeren SECURITY DEFINER RPC'lere taşındı.
- `/`, `/menu`, `/events`, `/careers` ve `/admin/media` medya işlemlerinden sonra revalidate ediliyor.

#### Birleşik fiyat yönetimi

- `/admin/pricing` ekranı eklendi.
- Ürün arama, kategori, şube, aktiflik ve eksik fiyat filtreleri eklendi.
- Aynı ürünün bütün aktif şube fiyatları tek kartta düzenlenebiliyor.
- Temel fiyat, fiyat etiketi, fiyat/bulunabilirlik notu ve şube aktifliği güncellenebiliyor.
- Eksik ürün-şube fiyat bağlantısı aynı ekrandan oluşturulabiliyor.
- Varyant fiyatı, fiyat notu ve aktifliği ürün/şube bağlamında inline güncellenebiliyor.
- `Ürünler`, `Şube fiyatları` ve `Fiyat varyantları` generic ekranları silinmedi; gelişmiş yönetim bağlantıları olarak korundu.
- Türkçe ondalık fiyatlar güvenli şekilde `price_cents` değerine çevriliyor.
- Fiyat ekranı mevcut RLS ve transaction audit trigger'larını kullanıyor; yeni migration gerektirmiyor.

### Önemli değişen dosyalar

- `src/components/careers/CareersPage.module.css`
- `src/lib/public-data/helpers.ts`
- `src/lib/public-data/home.ts`
- `src/lib/public-data/menu.ts`
- `src/lib/public-data/merch.ts`
- `src/lib/public-data/events.ts`
- `src/app/admin/(panel)/media/page.tsx`
- `src/app/admin/(panel)/media/MediaLibrary.module.css`
- `src/components/admin/crud/TypedConfirmSubmitButton.tsx`
- `src/lib/admin/media-actions.ts`
- `src/lib/supabase/database.types.ts`
- `supabase/migrations/20260623030000_event_announcements.sql`
- `supabase/migrations/20260624010000_media_management.sql`
- `supabase/tests/transactional_admin_mutations.test.sql`
- `src/app/admin/(panel)/pricing/page.tsx`
- `src/app/admin/(panel)/pricing/PricingManagement.module.css`
- `src/lib/admin/pricing.ts`
- `src/lib/admin/pricing-actions.ts`
- `src/components/admin/AdminShell.tsx`
- `src/app/admin/page.tsx`
- `tests/unit/admin/media-actions.test.ts`
- `tests/unit/public-data/media-visibility.test.ts`
- `tests/unit/admin/pricing.test.ts`
- `tests/unit/admin/pricing-actions.test.ts`
- `tests/e2e/media-lifecycle.spec.ts`

### Veritabanı etkisi

Bekleyen production migration sırası:

1. `20260623030000_event_announcements.sql`
2. `20260624010000_media_management.sql`
3. `notify pgrst, 'reload schema';`

Birleşik fiyat yönetimi mevcut menü tablolarını kullanır ve ek migration gerektirmez.

### Test ve doğrulama

Geçen kontroller:

- `npm ci --ignore-scripts`: geçti, 475 paket kuruldu.
- `npm run test:unit`: geçti, **38 test dosyası / 117 test**.
- `npm run lint`: geçti.
- `npx tsc --noEmit`: geçti.
- Temiz `.next` sonrası `npm run build`: geçti; `/admin/pricing` dynamic route olarak build listesinde yer aldı.
- `npm audit --audit-level=high`: geçti, 0 güvenlik bulgusu.
- 161 TypeScript/TSX dosyası compiler parser ile ayrıca tarandı: sözdizimi temiz.
- CSS brace ve SQL transaction/dollar-quote statik kontrolleri temiz.

Çalıştırılmayan kontroller:

- `npm run test:db`: Docker/yerel Supabase olmadığı için çalıştırılmadı.
- `npm run test:e2e`: yerel Supabase ve TEST admin oturumu olmadığı için çalıştırılmadı.
- Production migration, canlı Storage silme ve canlı veri değişikliği yapılmadı.

### Açık riskler

- Production schema event ve medya migration'ları uygulanmadan yeni duyuru alanları ve medya RPC'leri kullanılamaz.
- RPC davranışı gerçek PostgreSQL üzerinde pgTAP ile bu ortamda doğrulanmadı.
- Kalıcı Storage silme yalnız bağlantısız `TEST_` medya ile production smoke test edilmelidir.
- Fiyat ekranı build ve unit düzeyinde doğrulandı; gerçek admin oturumunda responsive smoke test otomasyonda tamamlanmalıdır.

### Sonraki görev

1. İki migration'ı belgelenen sırada Supabase SQL Editor'da uygula.
2. PostgREST schema cache'i yenile.
3. Yalnız `TEST_` verilerle etkinlik/duyuru, medya arşiv/restore/delete ve birleşik fiyat yönetimi smoke testlerini çalıştır.
4. 390, 768, 1024 ve 1440 piksel genişliklerde `/admin/media` ve `/admin/pricing` final görsel kontrolünü yap.

### GPT'ye aktarılacak kısa özet

Kantin Website güncel kaynak paketinde planlanan karikatür, medya ve fiyat yönetimi işleri tamamlandı. Kariyer formu ayrı stacking context'e alındı; hareketli karikatürler form arkasında kalıyor. Public medya adaptörleri yalnız published+active kayıtları okuyor ve content block içindeki arşivli Storage URL'lerini allowlist ile engelliyor. Admin medya ekranına metadata/status/aktiflik/sıra düzenleme, bağlantılı medyayı arşivleme ve bağlantısız arşiv Storage görselini yazılı onayla kalıcı silme eklendi. Silme işlemi retry-safe begin/remove/complete RPC akışı kullanıyor. Yeni medya migration'ı `20260624010000_media_management.sql`; önce `20260623030000_event_announcements.sql`, sonra medya migration'ı uygulanmalı ve schema cache yenilenmeli. `/admin/pricing` birleşik fiyat ekranı eklendi: ürün arama, kategori/şube/aktiflik/eksik fiyat filtreleri; bütün şube fiyatları; eksik ilişki oluşturma ve inline varyant fiyat güncelleme aynı akışta. Fiyat ekranı yeni migration gerektirmiyor. `npm run test:unit` 38 dosya/117 test, lint, TypeScript, temiz production build ve npm audit geçti. Docker olmadığı için pgTAP/E2E çalıştırılmadı ve production DB/Storage'a işlem yapılmadı.
