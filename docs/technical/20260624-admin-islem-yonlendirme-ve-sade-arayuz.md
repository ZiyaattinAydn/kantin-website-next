# Admin işlem yönlendirmesi ve sade arayüz düzeltmesi

## Kök neden

Medya yükleme, güncelleme, arşivleme, geri alma ve kalıcı silme işlemleri veritabanında tamamlandıktan sonra `/admin/media` adresine Türkçe başarı mesajı ile yönlendirme yapıyordu. Bazı başarı adresleri ham boşluk ve Türkçe karakter içerdiği için redirect response güvenli biçimde üretilemiyor, işlem başarılı olsa bile tarayıcı `This page couldn’t load` ekranına düşebiliyordu.

## Uygulanan düzeltmeler

- Medya sonuç adresleri `URLSearchParams` ile üretiliyor. Başarı ve hata mesajlarının tamamı güvenli encode ediliyor.
- Generic admin eylemlerindeki geçersiz istek yönlendirmeleri de aynı güvenli URL üretim yaklaşımına geçirildi.
- Teknik `sort_order` alanı generic CRUD formlarında ve liste tablolarında kullanıcıya gösterilmiyor.
- Mevcut `sort_order` değeri hidden sistem alanıyla korunuyor; kayıt güncellenirken sıra davranışı bozulmuyor, yeni kayıtlarda mevcut DB varsayılanı kullanılmaya devam ediyor.
- Medya kütüphanesindeki görünür sıra etiketi ve sıra inputu kaldırıldı; değer hidden olarak korunuyor.
- Medya yönetimi tek kolonlu güvenli layout'a geçirildi. 899 px altında tablo satırları kart görünümüne dönüşüyor; filtreler ve aksiyonlar dar ekranlara uyarlanıyor.
- Yarım kalmış silme uyarısındaki yinelenen metin temizlendi.

## Veritabanı etkisi

- Yeni migration yok.
- Tablo veya kolon değişikliği yok.
- Production verisine dokunulmadı.
- Mevcut `sort_order` kolonları veri katmanında ve sorgu sıralamasında korunuyor; yalnız admin arayüzünden gizleniyor.

## Test sonuçları

- Hedefli testler: 3 dosya / 16 test geçti.
- Tüm unit testler: 40 dosya / 121 test geçti.
- ESLint: geçti.
- TypeScript `npx tsc --noEmit`: geçti.
- Next.js production build: geçti.
- `npm audit`: 0 güvenlik bulgusu.
- Docker gerektiren `test:db` ve local Supabase E2E çalıştırılmadı.

## Manuel kontrol listesi

1. `/admin/media` sayfasında arşivle, geri al ve bağlantısız arşiv Storage görselinde kalıcı sil işlemlerini `TEST_` kayıtla dene.
2. İşlemden sonra sayfanın hata ekranına düşmediğini ve yeşil başarı mesajını gösterdiğini doğrula.
3. `/admin/manage/event-branches` ve diğer generic CRUD sayfalarında `Sıra` kolonu/inputu görünmediğini doğrula.
4. Medya sayfasını 1440, 1024, 768 ve 390 px genişliklerde kontrol et.
5. Mobilde medya kayıtlarının kart görünümüne dönüştüğünü ve bütün aksiyonların erişilebilir kaldığını doğrula.
