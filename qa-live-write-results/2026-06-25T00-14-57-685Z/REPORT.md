# Kantin Canlı Admin Yazma Kabul Testi

- Tarih: 2026-06-25T00:14:57.686Z
- Hedef: https://kantin-website-ziyaattinaydns-projects.vercel.app
- Test öneki: `TEST_QA_20260625T001457`
- Genel sonuç: ❌ Başarısız / inceleme gerekli

## Adımlar

| Sonuç | Adım | Açıklama |
|---|---|---|
| ✅ | Yönetici girişi |  |
| ❌ | Test akışı durdu | locator.fill: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#new-record').locator('form').first().locator('input[name="name"]')[22m
[2m    - locator resolved to <input value="" required="" type="text" name="name" maxlength="500" aria-invalid="false" id="new-menu-categories-name"/>[22m
[2m    - fill("TEST_QA_20260625T001457_KATEGORI")[22m
[2m  - attempting fill action[22m
[2m    2 × waiting for element to be visible, enabled and editable[22m
[2m      - element is not visible[22m
[2m    - retrying fill action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and editable[22m
[2m      - element is not visible[22m
[2m    - retrying fill action[22m
[2m      - waiting 100ms[22m
[2m    59 × waiting for element to be visible, enabled and editable[22m
[2m       - element is not visible[22m
[2m     - retrying fill action[22m
[2m       - waiting 500ms[22m

    at createCategory (C:\Users\ziyaa\kantin-website-next\qa-live-write\live-admin-write-acceptance.mjs:181:44)
    at async file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:489:3 |

## Temizlik

- ✅ menu-items: TEST_QA_20260625T001457_URUN — cleanup-skipped
- ✅ menu-categories: TEST_QA_20260625T001457_KATEGORI — cleanup-skipped

## Tarayıcı bulguları

- Konsol hatası: 0
- Sayfa hatası: 0
- Başarısız ağ isteği: 0

## Güvenlik notu

Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.