# Admin Kullanım Rehberi

## Giriş

Canlı veya Preview site adresinin sonuna `/admin` ekleyin. Oturum yoksa `/admin/login` sayfasına yönlendirilirsiniz.

Giriş Supabase Authentication kullanır. Vercel hesabı admin girişi değildir.

## Güvenli kullanım kuralları

- Admin şifresini paylaşmayın; benzersiz ve güçlü parola kullanın.
- Ortak bilgisayarda işlem bittikten sonra çıkış yapın.
- Mevcut gerçek içerikleri test amacıyla kalıcı silmeyin.
- Deneme kayıtlarında `TEST_` ad veya `test-` slug kullanın.
- Public/seed içeriklerde silme yerine pasife alma veya arşivleme tercih edin.
- CV dosyalarını yalnız iş başvurusu değerlendirmesi amacıyla indirin.

## Dashboard

Dashboard toplam içerik ve başvuru sayılarını, hızlı bağlantıları ve son admin işlemlerini gösterir.

## Menü yönetimi

1. Gerekirse kategoriyi oluşturun veya mevcut kategoriyi seçin.
2. Kategorinin şube ilişkisini ve sırasını belirleyin.
3. Menü ürününü oluşturun; ad, açıklama, alerjen ve görsel alanlarını doldurun.
4. Ürün-şube kaydında fiyatı, görünürlüğü ve sıralamayı tanımlayın.
5. Yarım/tam, hacim veya porsiyon gerekiyorsa varyant ekleyin.
6. Yayın ve aktiflik durumunu kontrol edin.
7. Public menüde iki şubeyi ayrı ayrı doğrulayın.

## Etkinlikler

- Taslak, yayın veya arşiv durumunu seçin.
- Başlangıç/bitiş zamanı ile şube ilişkisini ekleyin.
- Geçmiş veya taslak etkinlikler public listede görünmez.
- Görsel yoksa kontrollü boş görsel davranışını kontrol edin.

## Merch ve Instagram

- Merch ürünlerinde tür, fiyat, stok/durum, görsel ve şube ilişkisini yönetin.
- Instagram kayıtlarında gerçek gönderi URL'si, görsel, açıklama ve sıralama kullanın.
- Görsel önce Medya Kütüphanesine yüklenip içerik formundan seçilebilir.

## Şubeler ve site ayarları

- Adres ve harita URL'sini değiştirirken doğrulanmış bağlantıyı koruyun.
- Çalışma saatleri kesinleştiğinde şube kaydına ekleyin.
- Footer e-posta ve sosyal medya alanları site ayarlarından yönetilir.

## Tema

`/admin/theme` ekranında yalnız izin verilen palet, font, yazı boyutu, yoğunluk, görünürlük ve bölüm sırası seçenekleri vardır. Serbest CSS kabul edilmez.

## Kariyer başvuruları

- Başvuruyu açıp durumunu `new`, `reviewing`, `positive`, `negative` gibi izin verilen değere güncelleyin.
- Admin notuna yalnız değerlendirmeyle ilgili gerekli bilgileri yazın.
- CV indirme bağlantısı kısa süreli signed URL üretir.
- Başvuru ve CV verisini public alanda paylaşmayın.

## Test kaydı temizliği

Yalnız `TEST_` / `test-` kayıtlarını panelden silin. Çok sayıda test kaydı oluşmuşsa `supabase/manual/cleanup_faz_9_test_records.sql` dosyasını inceleyip hedef projenin SQL Editor'ında bilinçli olarak çalıştırın.
