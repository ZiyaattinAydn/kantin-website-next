# Kantin Canlı Admin Kabul Testi — Sonuç ve Risk Raporu

## Test özeti

- Hedef: Vercel production admin paneli
- Test zamanı: 24 Haziran 2026
- Test modu: Salt okunur
- Profiller: Masaüstü ve Pixel 7 mobil
- Kontrol edilen rota: 19 masaüstü + 19 mobil = 38
- Başarılı HTTP 200: 38/38
- Giriş: Her iki profilde başarılı
- Konsol hatası: 0
- Sayfa hatası: 0
- Yatay taşma: 0
- Dinamik satır denemesi: 34/34 başarılı

## Başarılı kabul maddeleri

1. Yönetici girişi canlı ortamda çalışıyor.
2. Test edilen bütün admin rotaları yetkili oturumla açılıyor.
3. Hiçbir rota giriş sayfasına beklenmedik biçimde dönmüyor.
4. Fiyat Yönetimi, Medya Kütüphanesi, Kariyer Başvuruları ve generic tabloların açılır düzenleme satırları hem masaüstü hem mobilde açılıyor.
5. Test edilen sayfalarda JavaScript konsol hatası veya yakalanmamış sayfa hatası oluşmuyor.
6. Masaüstü ve mobil ekranlarda yatay taşma tespit edilmedi.
7. Responsive kart düzeni, filtre alanları ve temel tablo yapısı çalışıyor.
8. Test salt okunur çalıştığı için gerçek işletme verisi değiştirilmedi.

## Bulunan hata ve riskler

### ADM-LIVE-001 — Mobil yönetim menüsü üstteki “Kapat” düğmesiyle kapatılamıyor

- Öncelik: P2 — Orta
- Durum: Düzeltme hazırlandı
- Tekrarlama:
  1. Mobil genişlikte `/admin` açılır.
  2. `Yönetim` düğmesine basılır.
  3. Üst çubukta görünen `Kapat` düğmesine basılmaya çalışılır.
- Gerçekleşen: Sayfa karartma katmanı düğmenin önünde kaldığı için tıklamayı yakalıyor. Playwright 30 saniye sonunda zaman aşımına uğruyor.
- Beklenen: Menü içerisinde veya erişilebilir bir alanda çalışan açık bir kapatma düğmesi bulunmalı.
- Teknik neden: `backdrop` katmanı mobil üst çubuktan daha yüksek katmanda bulunuyor; kapatma düğmesi yan panel içinde değil.
- Çözüm: Yan panelin üst kısmına mobilde görünen bağımsız `Kapat` düğmesi eklendi. Üst çubuk düğmesi yalnız `Yönetim` olarak bırakıldı; böylece kapatma işlemi karartma katmanının arkasındaki düğmeye bağlı değil.

### ADM-LIVE-002 — “Başarısız istek” sayıları gerçek hata değil

- Öncelik: P3 — Test aracı iyileştirmesi
- Durum: Ürün hatası değil
- Raporlanan: Masaüstü 304, mobil 193 başarısız istek
- Analiz: Kayıtların tamamı `net::ERR_ABORTED` ile iptal edilmiş Next.js RSC ön yükleme istekleri. Rota değişirken kullanılmayan ön yükleme isteklerinin iptal edilmesi normaldir.
- Etki: Admin panelinde kullanıcıya yansıyan hata yok; konsol ve sayfa hataları sıfır.
- Öneri: Kabul testi aracı `_rsc` içeren ve `ERR_ABORTED` olan istekleri rapor dışında bırakmalı.

### ADM-LIVE-003 — Kaydedilmemiş değişiklik koruması testi kesin sonuç üretmedi

- Öncelik: P3 — Doğrulama gerekli
- Durum: Manuel/yazmalı kabul testinde tekrar kontrol edilecek
- Rapor: `dialogSeen=false`, `stayed=true`, değiştirilmiş değer korunmuş.
- Yorum: Kullanıcı sayfada kalmış ve yazdığı değer kaybolmamış; ancak test aracı beklenen tarayıcı onay penceresini yakalayamamış.
- Risk: Korumanın çalıştığına dair güçlü işaret var, fakat otomasyon çıktısı tek başına kesin kanıt değil.
- Sonraki kontrol: TEST_ kaydında alan değiştirip başka sayfaya geçme, iptal ve devam seçeneklerini ayrı ayrı doğrulamak.

### ADM-LIVE-004 — Uzun mobil listelerde kullanım maliyeti

- Öncelik: P3 — İyileştirme
- Durum: Takip listesi
- Gözlem: Özellikle Medya Kütüphanesi ve ilişki tablolarında tam sayfa ekran görüntüleri çok uzun. İlk düzenleme satırı açıldığında sayfa yüksekliği daha da artıyor.
- Etki: Fonksiyonel hata yok, yatay taşma yok; ancak çok sayıda kayıtta mobil kaydırma yorucu olabilir.
- Öneri: Son kabul turundan sonra mobilde daha küçük sayfa boyutu, “başa dön” kontrolü veya filtrelerin sticky yapılması değerlendirilebilir.

## Performans gözlemi

- Masaüstü giriş: yaklaşık 8,2 saniye
- Mobil giriş: yaklaşık 3,2 saniye
- Masaüstü rota medyanı: yaklaşık 3,7 saniye
- Mobil rota medyanı: yaklaşık 3,3 saniye

Bu değerler test aracının `networkidle` beklemesini, Vercel/Supabase ağ gecikmesini ve ön yükleme isteklerini içerir. Doğrudan kullanıcı algılanan performans skoru olarak değerlendirilmemelidir. Kritik bir zaman aşımı yalnız mobil menü kapatma testinde oluşmuştur.

## Risk kararı

- P0 kritik hata: 0
- P1 yüksek hata: 0
- P2 orta hata: 1
- P3 düşük/test iyileştirmesi: 3

Canlı admin paneli salt okunur kabul turunu genel olarak geçti. Yazma işlemlerine geçmeden önce ADM-LIVE-001 düzeltmesinin deploy edilmesi önerilir.

## Sonraki aşama

1. Mobil menü hotfix’ini deploy et.
2. Salt okunur kabul testini yeniden çalıştır ve mobil menünün açılıp kapandığını doğrula.
3. Yalnız `TEST_` önekli kayıtlarla kontrollü yazma kabul testine geç:
   - kategori oluşturma ve düzenleme
   - ürün oluşturma
   - ürünü şubeye ekleme
   - iki şube fiyatı kaydetme
   - varyant oluşturma ve güncelleme
   - pasife alma
   - silme etkisi önizleme
   - güvenli kalıcı silme
   - audit doğrulama
4. Sonuçları tekrar P0–P3 sınıflandır ve kalan küçük hataları temizle.
