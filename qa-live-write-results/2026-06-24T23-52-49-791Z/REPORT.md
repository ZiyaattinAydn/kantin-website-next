# Kantin Canlı Admin Yazma Kabul Testi

- Tarih: 2026-06-24T23:52:49.792Z
- Hedef: https://kantin-website-ziyaattinaydns-projects.vercel.app
- Test öneki: `TEST_QA_20260624T235249`
- Genel sonuç: ❌ Başarısız / inceleme gerekli

## Adımlar

| Sonuç | Adım | Açıklama |
|---|---|---|
| ✅ | Yönetici girişi |  |
| ❌ | Test akışı durdu | locator.click: Error: strict mode violation: locator('#new-record').locator('summary') resolved to 2 elements:
    1) <summary>…</summary> aka getByText('＋ Yeni kategori⌄')
    2) <summary>…</summary> aka locator('#new-record').getByText('Gelişmiş alanlarGenellikle de')

Call log:
[2m  - waiting for locator('#new-record').locator('summary')[22m

    at openNewForm (C:\Users\ziyaa\kantin-website-next\qa-live-write\live-admin-write-acceptance.mjs:110:79)
    at async createCategory (C:\Users\ziyaa\kantin-website-next\qa-live-write\live-admin-write-acceptance.mjs:158:19)
    at async file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:432:3 |
| ❌ | TEST_ ürün temizliği | menu-items içinde kayıt bulunamadı: TEST_QA_20260624T235249_URUN |
| ❌ | TEST_ kategori temizliği | menu-categories içinde kayıt bulunamadı: TEST_QA_20260624T235249_KATEGORI |

## Temizlik

- ❌ menu-items: TEST_QA_20260624T235249_URUN — cleanup — menu-items içinde kayıt bulunamadı: TEST_QA_20260624T235249_URUN
- ❌ menu-categories: TEST_QA_20260624T235249_KATEGORI — cleanup — menu-categories içinde kayıt bulunamadı: TEST_QA_20260624T235249_KATEGORI

## Tarayıcı bulguları

- Konsol hatası: 0
- Sayfa hatası: 0
- Başarısız ağ isteği: 0

## Güvenlik notu

Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.