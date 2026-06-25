# Kantin Canlı Admin Yazma Kabul Testi

- Tarih: 2026-06-25T00:39:21.950Z
- Hedef: https://kantin-website-ziyaattinaydns-projects.vercel.app
- Test öneki: `TEST_QA_20260625T003921`
- Genel sonuç: ❌ Başarısız / inceleme gerekli

## Adımlar

| Sonuç | Adım | Açıklama |
|---|---|---|
| ✅ | Yönetici girişi |  |
| ✅ | Önceki yarım testten kalan TEST_ kategori temizlendi | TEST_QA_20260625T002810_KATEGORI |
| ✅ | TEST_ kategori oluşturuldu | TEST_QA_20260625T003921_KATEGORI |
| ❌ | Test akışı durdu | page.waitForURL: Timeout 45000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
    at testValidation (C:\Users\ziyaa\kantin-website-next\qa-live-write\live-admin-write-acceptance.mjs:341:14)
    at async file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:590:3 |
| ✅ | TEST_ kategori ve şube ilişkileri temizlendi |  |

## Temizlik

- ✅ menu-categories: TEST_QA_20260625T002810_KATEGORI — archive
- ✅ menu-categories: TEST_QA_20260625T002810_KATEGORI — hard-delete
- ✅ menu-items: TEST_QA_20260625T003921_URUN — cleanup-skipped
- ✅ menu-categories: TEST_QA_20260625T003921_KATEGORI — archive
- ✅ menu-categories: TEST_QA_20260625T003921_KATEGORI — hard-delete

## Tarayıcı bulguları

- Konsol hatası: 0
- Sayfa hatası: 0
- Başarısız ağ isteği: 0

## Güvenlik notu

Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.