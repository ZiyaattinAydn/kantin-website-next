# Kantin Otomatik Sıralama ve Güvenli Kalıcı Silme

## Kullanıcı arayüzü

- Admin form ve tablolarında teknik `sort_order` / “Sıra” alanı kullanıcıya gösterilmez.
- Yeni kayıtlar kaynak türüne göre otomatik olarak uygun listenin sonuna eklenir.
- Kategori, şube, sayfa veya ürün-şube kapsamı değişen bir kayıt yeni kapsamın sonuna otomatik taşınır.
- Fiyat Yönetimi'nde henüz menü bağlantısı olmayan şubelerde aktiflik kutusu gösterilmez.
- Kontrollü ürün-şube ekleme işlemi başarıyla tamamlandığında ilgili `menu_item_branch_id` ile Fiyat Varyantları yeni kayıt alanı açılır.

## Kalıcı silme güvenliği

- `TEST_` / `test-` adına bağlı özel silme butonları kaldırılmıştır.
- Generic kaynaklarda kalıcı silme yalnız kayıt pasif veya arşiv durumundayken görünür.
- İşlem `KALICI SİL` yazılı onayı ister.
- Uygulama yalnız seçilen ana kaydı siler; alt kayıtların temizliği mevcut veritabanı foreign key kurallarıyla transaction içinde yapılır.
- `menu_items.category_id` ilişkisi `ON DELETE RESTRICT` olduğu için bir ürün silindiğinde kategori korunur.
- Ürüne bağlı `menu_item_branches` ve bunlara bağlı `menu_item_variants` kayıtları `ON DELETE CASCADE` ile temizlenir.
- Kullanılan kategori gibi üst kayıtların silinmesi veritabanı tarafından güvenli biçimde engellenir ve kullanıcıya anlaşılır hata gösterilir.
- Mevcut audit trigger sistemi korunmuştur.

## Medya ve özel ekranlar

- Medya Kütüphanesi'nin bağlantı çözme, dosya değiştirme, arşivleme ve kalıcı silme yaşam döngüsüne dokunulmadı.
- Kariyer başvurularının retention ve anonimleştirme kuralları generic silme sistemine dahil edilmedi.

## Doğrulama

- ESLint başarılı.
- TypeScript kontrolü başarılı.
- Vitest: 42 test dosyasında 140 test başarılı.
- Production build başarılı.
- Yerel Supabase/pgTAP ve Playwright testleri bu turda çalıştırılmadı.
- Production veritabanında migration uygulanmadı ve canlı veri silinmedi.
