# Faz 9 hızlı test listesi

## Kurulum

1. Patch dosyalarını ana projeye kopyala.
2. `20260620060000_admin_crud_support.sql` migration'ını çalıştır.
3. `verify_faz_9_admin_crud.sql` sorgusundaki bütün kontrollerin `true` olduğunu doğrula.
4. `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run dev` çalıştır.

## Dashboard

- `/admin` açılıyor.
- Sayı kartları dolu geliyor.
- Yeni başvuru sayısı görünüyor.
- Hızlı bağlantılar doğru sayfalara gidiyor.

## Menü CRUD

1. `TEST_ Kategori` / `test-kategori` oluştur.
2. Şubeyle ilişkilendir.
3. `TEST_ Menü Ürünü` / `test-menu-urunu` oluştur.
4. Alsancak ve Atakent fiyat bağlantılarını oluştur.
5. Yarım/tam veya hacim varyantı ekle.
6. Ürünü yayınla ve public menüde kontrol et.
7. Düzenle, pasife al ve tekrar etkinleştir.
8. Test ürününü kalıcı sil; ardından boş test kategorisini sil.

## Etkinlik

- `TEST_ Etkinlik` oluştur.
- Şube ilişkisi ekle.
- Yayın durumu ve tarih değişikliğini public sayfada kontrol et.
- Test etkinliğini kalıcı sil.

## Merch ve Instagram

- TEST merch ürünü oluştur, fiyatını değiştir ve Alsancak ilişkisi ekle.
- TEST Instagram gönderisi oluştur ve sırasını değiştir.
- Public ana sayfada görünürlüğü doğrula.
- Test kayıtlarını sil.

## Medya

- `TEST_ Görsel` adıyla küçük bir WebP/JPG yükle.
- Görseli test içeriklerinden birine bağla.
- Kullanılırken silinmesinin engellendiğini doğrula.
- Bağlantıyı kaldırdıktan sonra TEST görselini kalıcı sil.

## Şube ve site ayarları

- Mevcut harita URL'lerini değiştirmeden küçük bir açıklama veya çalışma saati notu güncelle.
- Public footer/site alanına yansımasını doğrula.
- Test bittikten sonra önceki doğru değeri geri yaz.

## Kariyer

- Başvuruyu aç.
- Durumu `İnceleniyor` yap.
- Admin notu ekle.
- CV'yi indir.
- Public kullanıcı olarak başvurulara erişilemediğini doğrula.

## Kapanış

- Console ve network hatası yok.
- Yetkisiz `/admin` erişimi login'e yönleniyor.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` yeniden başarılı.
