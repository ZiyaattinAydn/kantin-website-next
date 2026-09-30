# Kantin admin — birleşik yönetim teslim raporu

Tarih: 30 Eylül 2026. Branch: `fix/admin-unified-management`.

Bu ilk teslim raporunun test/kurulum durumu tarihseldir. Son kullanıcı QA düzeltmeleri ve güncel migration durumu [QA2 raporunda](20260930-admin-qa2.md) bulunur; önceki migration'ların uzak projede kurulu olduğu doğrulandı.

Kod ve arayüz kontrolleri tamamlandı. Ayrı test veritabanında migration kurulumu, gerçek Supabase/Storage ve oturumlu kabul testleri bekliyor. Main'e merge veya production deploy yapılmadı. Bu branch önceki admin sadeleştirmesini de içerir; PR #6 ve #7 ayrı ayrı merge edilmemelidir.

## 1. Kaldırılan gereksiz menüler

Sol menüde tek **Menü** ve tek **Site** bulunur. Yeni ürün/fiyat/içerik/tema/ayar girişlerinin aynı işi tekrar eden menüleri ve geniş Gelişmiş Yönetim grubu kaldırıldı. Kategori, kategori-şube, ürün-şube, varyant, etkinlik-şube, merch-şube, sayfa ve içerik tablosu bağlantıları günlük navigasyondan çıkarıldı. Teknik Loglar en altta ikincil araç olarak kaldı. İş odaklı dashboard kısayolları aynı birleşik ekranlara açılır.

## 2. Birleştirilen sayfalar

Ürün ekleme/düzenleme ve fiyat yönetimi Menü içinde toplandı. Site İçeriği, Tema ve Site Ayarları tek Site alanına taşındı. Etkinlik ve şube seçimleri aynı kayıt formunda; kategori ve şube seçimleri aynı Menü formundadır. Mevcut medya, kariyer ve şube yetenekleri ortak tasarımla sunulur.

## 3. Menü yönetimi

Şube seçimi, ürün arama, kategori ve görünürlük filtreleri aynı ekrandadır. Yeni ürün ve mevcut ürün penceresinde ürün bilgisi, kategori, şube fiyatları, varyantlar, görsel ve yayın durumu yönetilir. Mevcut ürün transaction'ı korunur. Şube bazlı gizle/göster ve sıralama işlemleri devam eder; üst başlık farklı kısayollardan gelince değişmez. Kategori kapalıysa ürün görünürlük etiketi bunu hesaba katar.

## 4. Kategori + şube

Ad, şubeler, sıralama ve yayın durumu tek formdan `save_admin_menu_category` RPC'sine gider. Kategori ve bağlantıları aynı transaction'da kaydedilir. Eski `updated_at` veya değişmiş ilişki snapshot'ı yazmayı durdurur. Hata durumunda kısmi kayıt kalmaz. Kapatılan bağlantılar silinmez; mevcut metadata ve ürünler korunur.

## 5. Hızlı fiyat düzenleme

Ürün kartındaki **Fiyatları değiştir** kompakt pencere açar. Şubelerin ana fiyat ve varyant fiyatları yan yana karşılaştırılır. Yalnız değişen satırlar, kendi kayıt sürümleriyle `save_admin_menu_prices` RPC'sine gönderilir. Ürün adı, açıklama, kategori, not, metadata ve görünürlük değiştirilmez. Bir satır eskiyse bütün işlem geri alınır.

## 6. Site ekranı

**İçerik / Bölümler / Tasarım** sekmeleri tek üst başlık altında bulunur. İçerik kartları bölüm bazlıdır ve düzenleme penceresi açar. Bölümler görünürlük/sıra; Tasarım renk/yazı tipi/ölçek/yoğunluk içindir. Aynı bölüm görünürlüğü İçerik ve Tasarım'da tekrar gösterilmez. Mevcut JSON yapısı ve kimlik alanları korunur. Değişiklik geçmişi/geri alma içeriğin yanında bulunur. Varsayılana dön düğmesinin **tüm site ayarlarını** sıfırladığı açıkça belirtilir.

## 7. Görsel seçim UX'i

Mevcut ve yeni seçilen görsel birlikte önizlenir; seçim adı ve kullanım alanı görünür. Geri al/kaldır/seçim kontrolleri vardır. Koleksiyon alanlarının etiketleri içerik adına göre anlamlandırılır. Medya değiştirme dosya formunda da mevcut/yeni önizleme bulunur. Mevcut ID, otomatik bağlantı güncelleme, replacement ve Storage yaşam döngüsü sunucu kuralları korunmuştur.

## 8. Etkinlik tarih mantığı

`event-availability.ts` admin etiketleri, dashboard güncel sayısı ve public normalleştirme için ortak kurala sahiptir. Yayın/aktif flag'leri tek başına “Yayında” anlamına gelmez. Süresi geçmiş etkinlik **Sona erdi**, henüz yayın aralığına girmemiş kayıt **Yayın bekliyor**, süresi dolan duyuru **Yayın süresi doldu** görünür. Gelecek etkinlikler ve devam eden etkinlikler doğru sınıflanır. Bitiş olmayan etkinlikte başlangıç son eşiktir. Bitiş anı dahil kayıt listeden çıkar; bozuk veya ters tarih aralığı görünmez. Duyurunun etkinlik tarihi olmayabilir. Orijinal `published_at` zamanı da admin hesabında dikkate alınır; public RLS bu koşulu zaten uygular. Dashboard toplam kayıt sayısını gerçek güncel sayıdan ayırır. Anasayfa ve `/events` aynı filtrelenen public veriyi kullanır.

## 9. Sistem Kayıtları

Teknik araç, günlük navigasyonun altında ayrı kaldı. Tarih, seviye, kullanıcı, route, işlem, kod ve çözülme filtreleri; güvenli arama, kompakt detay penceresi, request ID kopyalama ve ilgili kayıt bağlantıları vardır. Çözülme sonrası filtreler korunur. DB'den gelen mesaj/detay görüntüleme öncesinde tekrar sanitize edilir. Stack trace, token, cookie, secret ve hassas başvuru bilgileri gösterilmez. İşlem geçmişi/revisions ve teknik log ayrı tutulur. Normal işlemlerde kısa Türkçe hata gösterilir; bağlantı/transport hataları da taslağı kaybetmeden yakalanır. Çözülme durumu açık/çözüldüdür; isteğe bağlı “inceleniyor” durumu eklenmedi.

## 10. Eski route'lar

| Eski giriş | Yeni davranış |
| --- | --- |
| `/admin/pricing` | `/admin/menu`; ürün seçiliyse fiyat penceresi |
| `/admin/content` | `/admin/site`; mevcut sorgu bağlamı korunur |
| `/admin/theme` | `/admin/site?tab=design` |
| `manage/menu-items`, `menu-item-branches`, `menu-item-variants` | Menü ve ilgili ana ürün |
| `manage/menu-categories`, `menu-category-branches` | Menü ve ilgili kategori |
| `manage/site-pages`, `content-blocks`, `site-settings` | Site ve ilgili içerik bölümü/kartı |
| `manage/event-branches` | İlgili etkinlik |
| `manage/merch-product-branches` | İlgili merch ürünü; bağımsız ilişki ekranı kaldırıldı |

Sunucu action, audit, revision ve backend kaynak tanımları uyumluluk için korunur. Medya, başvuru, etkinlik ve şube ana route'ları aynı kalır.

## 11. Değişen dosyalar

Yeni çalışmanın dosya listesi aşağıdaki ekte bulunur. PR diff'i önceki sadeleştirme çalışmasını da içerir.

## 12. Migration

Yeni hazırlanan dosya: `supabase/migrations/20260930030000_admin_category_and_prices.sql`. Üç admin-only, security-invoker RPC içerir: kategori+şube, dar fiyat güncellemesi ve etkinlik+şube. RLS ve mevcut audit trigger'ları çalışmaya devam eder.

Önceki çalışmadan bu branch'te bulunan dosyalar: `20260930010000_unified_admin_menu.sql` ve `20260930020000_admin_system_logs.sql`. Uzak veritabanına tarafımdan uygulanmadılar. Kurulum durumu doğrulanıp yalnız gerekli dosyalar doğru sırayla ayrı test ortamına kurulmalıdır. Yeni RPC'ler kurulmadan birleşik kayıt işlemleri uzak ortamda çalışmış kabul edilemez.

`AGENTS.md`: “Migration dosyası yazılabilir; ancak açık onay olmadan migration uygulama, destructive SQL çalıştırma veya Storage nesnesi silme.” Bu nedenle dosyalar hazırlanıp izole SQL motorunda test edildi; uzak migration kurulumu bekliyor.

## 13. Test sonuçları

| Kontrol | Sonuç ve sınır |
| --- | --- |
| `npm run test:unit` | 68 dosya, **297 test başarılı**; yeni action yetki/RPC/hata mesajı ve başarısız içerik taslağı regresyonları dahil |
| `npm run lint` | Başarılı |
| `npx tsc --noEmit` | Başarılı; geçici QA route'u ve eski geliştirme route tipleri kaldırıldı |
| İzole PGlite SQL | 10 migration, **44 assertion başarılı**; 24 mevcut + 20 yeni kontrol |
| Tarayıcı / sentetik TEST verisi | 1440×1000, 1024×768, 390×844: ortak pencereler, üç taslak seçeneği, scroll koruma, kategori formu, expiry etiketi, görsel karşılaştırma, şube ve tasarım ayrımı başarılı; runtime hata/taşma yok |
| Gerçek Supabase pgTAP / oturumlu E2E | **Çalıştırılmadı**: Docker/local Supabase ve TEST admin hesabı yok. PGlite, Supabase Auth/Storage veya gerçek pgTAP paketi yerine geçmez |

Sentetik tarayıcı fixture'ı uygulama tesliminden kaldırıldı. Mevcut medya replacement, CV/saklama, revision ve audit unit regresyonları test paketinde geçti; gerçek Storage ve oturumlu işlemler ayrıca doğrulanmalıdır. E2E spec'i yeni navigasyon/pencere akışlarına güncellendi. `test:db` / `test:e2e` yalnız yerel hedef ve TEST hesaplarıyla çalıştırılmalıdır.

## 14. Build

`npm run build` başarılı. Geçici QA ekranı build'e dahil değildir. `.env.local` okunmadı/değiştirilmedi; yeni uygulama bağımlılığı eklenmedi.

## 15. Vercel Preview

[Preview](https://kantin-website-git-fix-admin-uni-9919dc-ziyaattinaydns-projects.vercel.app) GitHub/Vercel kontrolünde **Ready / success** durumundadır. Kontrol edilen uygulama commit'i `9175186a751be88b5900a73b7ead07c0435392b4`; sonraki rapor commit'i yalnız dokümantasyonu değiştirir.

Salt okunur HTTP doğrulaması: `/`, `/events`, `/admin/login` 200; `/admin/site` giriş sayfasına yönlenip 200. Internal Server Error veya eksik bağlantı ayarı mesajı görülmedi. Bu kontrol oturumlu admin veya DB kayıt kabul testi değildir. Vercel eklentisi ilgili takım için scope yetkisi vermediği için runtime logları connector üzerinden okunamadı; deployment durumu GitHub'daki Vercel kontrolüyle doğrulandı. Production deploy yapılmadı.

## 16. PR

[PR #7 — Admin yönetimini tek Menü ve Site akışında birleştir](https://github.com/ZiyaattinAydn/kantin-website-next/pull/7). Draft; main'e merge edilmedi. Kod, test ve rapor ayrı commit gruplarındadır. Önceki [PR #6](https://github.com/ZiyaattinAydn/kantin-website-next/pull/6) bu PR'a dahil olduğundan birlikte ayrı ayrı merge edilmemeli.

## 17. Manuel kabul kontrolü

- Ayrı test DB'de gerekli migration'ları kur; gerçek yerel pgTAP ve TEST admin E2E'yi çalıştır.
- TEST ürün ve kategori ekle: iki şube, ana fiyat, varyant, görsel ve yayın; hata/eşzamanlı değişiklikte kısmi kayıt kalmamasını kontrol et.
- Şube/arama/kategori/görünürlük filtresiyle listeyi aşağı kaydır; düzenle/kaydet/iptal/Escape sonrası konumu ve seçili filtreleri karşılaştır. Taslak için kaydet/devam/kaydetmeden çık seçeneklerini dene. Tarayıcı yenileme/sekme kapamada tarayıcının standart uyarısı kullanılır.
- Site İçerik/Bölümler/Tasarım, eski/yeni görsel ve geçmişten geri alma. Şube kapsamındaki içerik düzenlemesinin diğer şubeyi değiştirmediğini doğrula. Tüm ayarları varsayılana döndür işlemini yalnız test verisiyle dene.
- Geçmiş, gelecek, devam eden etkinlik; tarihli/tarihsiz duyuru; yayın aralığı ve `published_at`. Admin etiketleri, dashboard güncel sayı, anasayfa ve `/events` tutarlı olmalı.
- TEST medya replacement/bağlantılar ve gerçek Storage yaşam döngüsü; TEST başvurunun durum/not/CV/saklama ön kontrolü yalnız yerel ortamda.
- Log filtreleri, entity bağlantısı, request ID, çözülme, güvenli mesaj ve hassas verinin görünmemesi. İşlem geçmişi ayrı kalmalı.
- Son branch commit'inin Vercel kontrolü başarılı ve oturumlu kabul tamamlanmış olmadan merge etme.

## Dosya eki

- `scripts/validate-admin-simplification-pglite.mjs`
- `src/app/admin/(panel)/applications/Applications.module.css`
- `src/app/admin/(panel)/applications/page.tsx`
- `src/app/admin/(panel)/content/page.tsx`
- `src/app/admin/(panel)/logs/page.tsx`
- `src/app/admin/(panel)/manage/[resource]/page.tsx`
- `src/app/admin/(panel)/media/MediaLibrary.module.css`
- `src/app/admin/(panel)/media/page.tsx`
- `src/app/admin/(panel)/menu/page.tsx`
- `src/app/admin/(panel)/pricing/page.tsx`
- `src/app/admin/(panel)/search/page.tsx`
- `src/app/admin/(panel)/site/page.tsx`
- `src/app/admin/(panel)/theme/ThemeSettingsForm.tsx`
- `src/app/admin/(panel)/theme/page.tsx`
- `src/app/admin/page.tsx`
- `src/components/admin/AdminInteractionGuard.module.css`
- `src/components/admin/AdminInteractionGuard.tsx`
- `src/components/admin/AdminShell.tsx`
- `src/components/admin/crud/AdminResource.module.css`
- `src/components/admin/crud/AdminResourceEditor.module.css`
- `src/components/admin/crud/AdminResourceEditor.tsx`
- `src/components/admin/simple/ContentEditor.tsx`
- `src/components/admin/simple/ContentImagePicker.tsx`
- `src/components/admin/simple/MediaPicker.tsx`
- `src/components/admin/simple/MenuCategoryForm.tsx`
- `src/components/admin/simple/MenuManager.tsx`
- `src/components/admin/simple/MenuPriceForm.tsx`
- `src/components/admin/simple/MenuProductForm.tsx`
- `src/components/admin/simple/SimpleAdmin.module.css`
- `src/components/admin/ui/AdminDialog.module.css`
- `src/components/admin/ui/AdminDialog.tsx`
- `src/components/admin/ui/AdminListState.tsx`
- `src/components/admin/ui/CopyRequestId.tsx`
- `src/components/admin/ui/MediaFileInput.tsx`
- `src/components/admin/ui/RecordHistory.tsx`
- `src/components/admin/ui/RecordMediaField.tsx`
- `src/lib/admin/application-actions.ts`
- `src/lib/admin/client-action.ts`
- `src/lib/admin/content-data.ts`
- `src/lib/admin/content-model.ts`
- `src/lib/admin/form-state.ts`
- `src/lib/admin/history-actions.ts`
- `src/lib/admin/log-actions.ts`
- `src/lib/admin/log-safety.ts`
- `src/lib/admin/management-routing.ts`
- `src/lib/admin/media-actions.ts`
- `src/lib/admin/menu-actions.ts`
- `src/lib/admin/menu-management.ts`
- `src/lib/admin/navigation.ts`
- `src/lib/admin/options.ts`
- `src/lib/admin/resource-actions.ts`
- `src/lib/admin/result-path.ts`
- `src/lib/admin/revision-actions.ts`
- `src/lib/admin/theme-actions.ts`
- `src/lib/admin/visibility.ts`
- `src/lib/event-availability.ts`
- `src/lib/events.ts`
- `supabase/migrations/20260930030000_admin_category_and_prices.sql`
- `supabase/tests/admin_unified_management.test.sql`
- `tests/e2e/admin-simplification.spec.ts`
- `tests/setup.ts`
- `tests/unit/admin/admin-dialog.test.tsx`
- `tests/unit/admin/interaction-guard.test.tsx`
- `tests/unit/admin/menu-actions.test.ts`
- `tests/unit/admin/resource-actions.test.ts`
- `tests/unit/admin/simple-admin-ui.test.tsx`
- `tests/unit/admin/unified-management.test.ts`
- `tests/unit/admin/visibility.test.ts`
- `tests/unit/lib/event-availability.test.ts`
- `tests/unit/styles/admin-media-responsive.test.ts`
- `tests/unit/styles/admin-table-design.test.ts`
- `docs/technical/20260930-admin-unified-management.md`
