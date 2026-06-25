# Kantin Canlı Admin Yazma Kabul Testi

- Tarih: 2026-06-25T01:05:38.076Z
- Hedef: https://kantin-website-ziyaattinaydns-projects.vercel.app
- Test öneki: `TEST_QA_20260625T010538`
- Test aracı sürümü: 4.0.0
- Genel sonuç: ❌ Başarısız / inceleme gerekli

## Adımlar

| Sonuç | Adım | Açıklama |
|---|---|---|
| ✅ | Yönetici girişi |  |
| ✅ | TEST_ kategori oluşturuldu | TEST_QA_20260625T010538_KATEGORI |
| ❌ | Test akışı durdu | Error: Gönderim sonucu 60000 ms içinde oluşmadı. Tanı: {"diagnostics":{"browserState":{"href":"https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories?new=1#new-record","readyState":"complete","activeElement":"INPUT:slug","submitProbe":{"id":"qa-1782349554979-9aceebc9f9cb5","submitEvents":1,"startedAt":"2026-06-25T01:05:54.983Z","resource":"menu-categories","submittedAt":"2026-06-25T01:05:54.987Z"}},"formState":{"action":"https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories?new=1#new-record","method":"post","valid":true,"resource":"menu-categories","id":"","submitButtonDisabled":false}},"recentMutations":[{"url":"https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories","method":"POST","startedAt":"2026-06-25T01:05:48.097Z","state":"finished","status":303,"respondedAt":"2026-06-25T01:05:49.503Z","finishedAt":"2026-06-25T01:05:49.869Z"},{"url":"https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories","method":"POST","startedAt":"2026-06-25T01:05:54.988Z","state":"failed","status":303,"respondedAt":"2026-06-25T01:05:55.922Z","failedAt":"2026-06-25T01:05:56.268Z","failure":"net::ERR_ABORTED"}]}. Asıl hata: page.waitForFunction: Timeout 60000ms exceeded.
    at waitForQueryOutcome (file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:199:11)
    at async testValidation (file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:559:19)
    at async file:///C:/Users/ziyaa/kantin-website-next/qa-live-write/live-admin-write-acceptance.mjs:963:3 |
| ✅ | TEST_ kategori ve şube ilişkileri temizlendi |  |

## Temizlik

- ✅ menu-items: TEST_QA_20260625T010538_URUN — cleanup-skipped
- ✅ menu-categories: TEST_QA_20260625T010538_KATEGORI — archive
- ✅ menu-categories: TEST_QA_20260625T010538_KATEGORI — hard-delete

## Tarayıcı bulguları

- Konsol hatası: 0
- Sayfa hatası: 0
- Başarısız ağ isteği: 0
- İzlenen admin POST isteği: 4

## Admin POST tanısı

- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303
- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303
- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303

## Güvenlik notu

Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.