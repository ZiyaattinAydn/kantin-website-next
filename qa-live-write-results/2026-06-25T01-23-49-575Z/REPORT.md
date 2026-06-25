# Kantin Canlı Admin Yazma Kabul Testi

- Tarih: 2026-06-25T01:23:49.576Z
- Hedef: https://kantin-website-ziyaattinaydns-projects.vercel.app
- Test öneki: `TEST_QA_20260625T012349`
- Test aracı sürümü: 5.0.0
- Genel sonuç: ✅ Başarılı

## Adımlar

| Sonuç | Adım | Açıklama |
|---|---|---|
| ✅ | Yönetici girişi |  |
| ✅ | TEST_ kategori oluşturuldu ve listede doğrulandı | TEST_QA_20260625T012349_KATEGORI |
| ✅ | Tekrarlanan URL adı reddedildi ve ikinci kayıt oluşmadığı doğrulandı |  |
| ✅ | İki aktif şube bulundu |  |
| ✅ | Kategori Alsancak (ALS) şubesine bağlandı ve doğrulandı |  |
| ✅ | Kategori Atakent (ATA) şubesine bağlandı ve doğrulandı |  |
| ✅ | TEST_ ürün oluşturuldu ve listede doğrulandı | TEST_QA_20260625T012349_URUN |
| ✅ | Alsancak (ALS) fiyat bağlantısı oluşturuldu ve doğrulandı |  |
| ✅ | Atakent (ATA) fiyat bağlantısı oluşturuldu ve doğrulandı |  |
| ✅ | 33 cl varyantı oluşturuldu ve doğrulandı |  |
| ✅ | 50 cl varyantı oluşturuldu ve doğrulandı |  |
| ✅ | İki şube fiyatı ve 50 cl varyantı tek işlemde güncellendi ve yeniden okundu |  |
| ✅ | Özet satırında en yüksek varyant fiyatı ve 50 cl etiketi doğru |  |
| ✅ | İşlem geçmişi kaydı doğrulandı |  |
| ✅ | Canlı admin yazma kabul ana akışı tamamlandı |  |
| ✅ | TEST_ ürün, şube fiyatları ve varyantları tamamen temizlendi |  |
| ✅ | TEST_ kategori ve kategori–şube ilişkileri tamamen temizlendi |  |

## Temizlik

- ✅ menu-items: TEST_QA_20260625T012349_URUN — archive
- ✅ menu-items: TEST_QA_20260625T012349_URUN — hard-delete
- ✅ menu-categories: TEST_QA_20260625T012349_DUPLICATE — cleanup-not-found
- ✅ menu-categories: TEST_QA_20260625T012349_KATEGORI — archive
- ✅ menu-categories: TEST_QA_20260625T012349_KATEGORI — hard-delete

## Tarayıcı bulguları

- Konsol hatası: 0
- Sayfa hatası: 0
- Başarısız ağ isteği: 0
- İzlenen admin POST isteği: 14

## Form gönderim sonuçları

- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-categories?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Kaydı oluştur: HTTP 303 — error: Aynı benzersiz değere sahip başka bir kayıt bulunuyor. — /admin/manage/menu-categories?error=Ayn%C4%B1+benzersiz+de%C4%9Fere+sahip+ba%C5%9Fka+bir+kay%C4%B1t+bulunuyor.&new=1
- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-category-branches?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-category-branches?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-items?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-item-branches?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-item-branches?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-item-variants?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Kaydı oluştur: HTTP 303 — notice: Yeni kayıt oluşturuldu. — /admin/manage/menu-item-variants?notice=Yeni+kay%C4%B1t+olu%C5%9Fturuldu.
- Görünen tüm fiyatları kaydet: HTTP 303 — notice: 0 yeni şube bağlantısı, 2 şube fiyatı ve 1 varyant güncellendi. — /admin/pricing?q=20260625T012349&notice=0+yeni+%C5%9Fube+ba%C4%9Flant%C4%B1s%C4%B1%2C+2+%C5%9Fube+fiyat%C4%B1+ve+1+varyant+g%C3%BCncellendi.
- Pasife al / arşivle: HTTP 303 — notice: Kayıt pasife alındı / arşivlendi. — /admin/manage/menu-items?notice=Kay%C4%B1t+pasife+al%C4%B1nd%C4%B1+%2F+ar%C5%9Fivlendi.
- Kalıcı olarak sil: HTTP 303 — notice: Kayıt ve ona ait alt bağlantılar kalıcı olarak silindi. — /admin/manage/menu-items?notice=Kay%C4%B1t+ve+ona+ait+alt+ba%C4%9Flant%C4%B1lar+kal%C4%B1c%C4%B1+olarak+silindi.
- Pasife al / arşivle: HTTP 303 — notice: Kayıt pasife alındı / arşivlendi. — /admin/manage/menu-categories?notice=Kay%C4%B1t+pasife+al%C4%B1nd%C4%B1+%2F+ar%C5%9Fivlendi.
- Kalıcı olarak sil: HTTP 303 — notice: Kayıt ve ona ait alt bağlantılar kalıcı olarak silindi. — /admin/manage/menu-categories?notice=Kay%C4%B1t+ve+ona+ait+alt+ba%C4%9Flant%C4%B1lar+kal%C4%B1c%C4%B1+olarak+silindi.

## Uyarılar

- Uyarı yok.

## Admin POST tanısı

- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303
- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-category-branches — HTTP 303
- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-category-branches — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-items — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-item-branches — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-item-branches — HTTP 303
- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-item-variants — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-item-variants — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/pricing — HTTP 303
- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-items — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-items — HTTP 303
- failed: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303
- finished: POST https://kantin-website-ziyaattinaydns-projects.vercel.app/admin/manage/menu-categories — HTTP 303

## Güvenlik notu

Araç yalnız otomatik oluşturduğu `TEST_QA_` önekli kayıtları arşivlemeyi ve silmeyi dener. Şifre, erişim anahtarı ve oturum çerezi rapora yazılmaz.