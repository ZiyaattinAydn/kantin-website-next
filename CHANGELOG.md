# Changelog

Bu proje için önemli değişiklikler bu dosyada tutulur.

## [Unreleased]

- Production migration geçmişini yerel migration dosyalarıyla senkronize etme
- Son production migration push ve Vercel production doğrulaması
- Başarılı production kapanışından sonra `1.0.0` etiketi

## [1.0.0-rc.1] - 2026-06-26

### Eklendi

- Supabase tabanlı public veri katmanı ve yönetim paneli
- Menü, fiyat, varyant, etkinlik/duyuru, merch, Instagram, medya ve kariyer yönetimi
- RLS, transaction RPC’leri, işlem geçmişi ve güvenli kalıcı silme
- Kritik sistem alanı ve teknik JSON korumaları
- Yayınlama/pasife alma için güçlü onay akışı
- Kritik kayıt snapshotları ve önceki sürüme dönme
- Database + Storage yedekleme ve doğrulama araçları
- Yerel pgTAP ve masaüstü/mobil Playwright regresyon paketi

### Düzeltildi

- Mobil admin menüsü kapatma katmanı
- Fiyat yönetimi transaction ve özet davranışı
- Sayfalama, otomatik sıralama ve aranabilir ilişki alanları
- Medya değiştirme, bağlantı temizleme ve yaşam döngüsü
- İçerik bloklarının geri getirilemez biçimde kalıcı silinmesi engellendi

### Doğrulandı

- 223 unit test
- 157 pgTAP testi
- 16 Playwright testi; 2 kontrollü fallback testi koşula bağlı olarak skipped
- TypeScript, ESLint, production build ve bağımlılık güvenlik denetimi
