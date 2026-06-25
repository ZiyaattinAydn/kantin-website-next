# Kantin Canlı Admin Yazma Kabul Testi

- Tarih: 2026-06-25T00:56:04.173Z
- Hedef: https://kantin-website-ziyaattinaydns-projects.vercel.app
- Test öneki: `TEST_QA_20260625T005604`
- Test aracı sürümü: 3.1.0
- Genel sonuç: ❌ Başarısız / inceleme gerekli

## Adımlar

| Sonuç | Adım | Açıklama |
|---|---|---|
| ✅ | Yönetici girişi |  |
| ✅ | Önceki yarım testten kalan TEST_ kategori temizlendi | TEST_QA_20260625T003921_DUPLICATEtest-qa-20260625t003921-kategori |
| ✅ | TEST_ kategori oluşturuldu | TEST_QA_20260625T005604_KATEGORI |
| ✅ | Tekrarlanan URL adı doğrulaması kontrollü gösterildi |  |
| ✅ | İki aktif şube bulundu |  |
| ❌ | Test akışı durdu | page.waitForFunction: Timeout 45000ms exceeded.
    at waitForQueryOutcome (C:\Users\ziyaa\kantin-website-next\qa-live-write\live-admin-write-acceptance.mjs:154:29)
    at submitCreate (C:\Users\ziyaa\kantin-website-next\qa-live-write\live-admin-write-acceptance.mjs:330:5)
    at async createCategoryBranch (C:\Users\ziyaa\kantin-website-next\qa-live-write\live-admin-write-acceptance.mjs:438:3)
    at async file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:813:3 |
| ✅ | TEST_ kategori ve şube ilişkileri temizlendi |  |

## Temizlik

- ✅ menu-categories: TEST_QA_20260625T003921_DUPLICATEtest-qa-20260625t003921-kategori — archive
- ✅ menu-categories: TEST_QA_20260625T003921_DUPLICATEtest-qa-20260625t003921-kategori — hard-delete
- ✅ menu-items: TEST_QA_20260625T005604_URUN — cleanup-skipped
- ✅ menu-categories: TEST_QA_20260625T005604_KATEGORI — archive
- ✅ menu-categories: TEST_QA_20260625T005604_KATEGORI — hard-delete

## Tarayıcı bulguları

- Konsol hatası: 0
- Sayfa hatası: 0
- Başarısız ağ isteği: 0

## Güvenlik notu

Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.