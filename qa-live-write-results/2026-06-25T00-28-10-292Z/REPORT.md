# Kantin Canlı Admin Yazma Kabul Testi

- Tarih: 2026-06-25T00:28:10.294Z
- Hedef: https://kantin-website-ziyaattinaydns-projects.vercel.app
- Test öneki: `TEST_QA_20260625T002810`
- Genel sonuç: ❌ Başarısız / inceleme gerekli

## Adımlar

| Sonuç | Adım | Açıklama |
|---|---|---|
| ✅ | Yönetici girişi |  |
| ✅ | TEST_ kategori oluşturuldu | TEST_QA_20260625T002810_KATEGORI |
| ❌ | Test akışı durdu | Error: menu-categories içinde kayıt bulunamadı: TEST_QA_20260625T002810_KATEGORI
    at findRecord (file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:230:9)
    at async file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:519:26 |
| ❌ | TEST_ kategori temizliği | menu-categories içinde kayıt bulunamadı: TEST_QA_20260625T002810_KATEGORI |

## Temizlik

- ✅ menu-items: TEST_QA_20260625T002810_URUN — cleanup-skipped
- ❌ menu-categories: TEST_QA_20260625T002810_KATEGORI — cleanup — menu-categories içinde kayıt bulunamadı: TEST_QA_20260625T002810_KATEGORI

## Tarayıcı bulguları

- Konsol hatası: 0
- Sayfa hatası: 0
- Başarısız ağ isteği: 0

## Güvenlik notu

Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.