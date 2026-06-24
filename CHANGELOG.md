# Changelog

## Unreleased

### Otomatik sıralama ve güvenli kalıcı silme

- Generic admin formlarındaki görünür `Sıra` alanları kaldırıldı; yeni kayıtlar kendi tablo ve ilişki kapsamlarında otomatik olarak listenin sonuna yerleştiriliyor.
- Ürün kategori değiştirdiğinde veya ilişkisel kayıt başka bir şube/sayfa grubuna taşındığında yeni grubun sırası otomatik yeniden hesaplanıyor.
- Fiyat Yönetimi'nde menü bağlantısı bulunmayan şubelerde yanıltıcı aktiflik kontrolü kaldırıldı; kontrollü ekleme tamamlandığında doğrudan ilgili ürün-şube varyant formu açılıyor.
- TEST adına bağlı kalıcı silme modeli kaldırıldı. Kalıcı silme yalnız pasif veya arşivlenmiş generic kayıtlarda, yazılı `KALICI SİL` onayıyla açılıyor.
- Ürün silme işlemi mevcut foreign key kurallarını kullanıyor: ürünün şube fiyatları ve varyantları cascade ile temizlenirken bağlı kategori korunuyor. Üst kaydı kullanılan kategori gibi kayıtlar DB tarafından güvenli biçimde engelleniyor.
- Dashboard güvenlik açıklaması güncel pasif/arşiv ve alt kayıt temizleme davranışını anlatacak şekilde yenilendi.
- Otomatik sıra, grup değişikliği, aktif kayıt silme engeli, pasif ürün silme ve FK cascade/restrict sözleşmeleri için regresyon testleri eklendi.

### Dinamik admin tabloları ve kontrollü şubeye ürün ekleme

- Generic admin CRUD tablolarında yalnız “Düzenle” bağlantısı yerine satırın tamamı tıklanabilir genişletilebilir düzenleme alanına dönüştürüldü; kaynak türüne uygun özet kolonları, rozetler ve mobil kart görünümü korundu.
- Kariyer başvuruları her aday satırından açılan inline değerlendirme, CV, retention ve anonimleştirme araçlarıyla dinamikleştirildi.
- Medya Kütüphanesi her görsel satırından açılan büyük önizleme, kullanım bağlantıları, bilgi güncelleme, dosya değiştirme, arşiv ve silme araçlarıyla yeniden tasarlandı; mevcut bağlantı koruma ve otomatik detach iş mantığı korunuyor.
- Fiyat Yönetimi'ndeki eksik şube akışı hedef kategori ve isteğe bağlı varyant kopyalama seçimini admin onayına sunan kontrollü forma dönüştürüldü; kategori-şube ve ürün sırası artık sistem tarafından otomatik belirleniyor.
- Yeni `add_admin_menu_item_to_branch` RPC'si ürün, kategori-şube, ürün-şube ve seçili varyant kayıtlarını tek transaction içinde oluşturuyor veya güncelliyor; bütün işlem semantic audit kaydıyla tamamlanıyor.
- Gelişmiş varyant yönetimi bağlantısı artık tıklanan ürün-şube kaydını query parametresiyle kesin olarak önceden seçiyor; daha önce seçilmiş başka ürünün formda kalması engellendi.
- Yeni migration: `20260624030000_admin_menu_branch_add_flow.sql`; yeni pgTAP: `menu_branch_add.test.sql`.
- Dinamik tablo, medya responsive davranışı, kontrollü fiyat akışı, prefill ve action yönlendirmeleri için unit regresyon testleri güncellendi.

### Medya kütüphanesi kullanım akışı

- Medya listesindeki bütün public görseller aynı medya UUID'si korunarak yeni dosyayla değiştirilebilir hâle getirildi; içerik bağlantılarını tek tek güncelleme ihtiyacı kaldırıldı.
- Yerel, harici veya Storage kaynağı yeni Storage dosyasına dönüştürülebiliyor; content block içindeki eski yol/URL referansları transaction içinde yeni public URL'ye taşınıyor.
- Kalıcı silmede menü, etkinlik, merch, Instagram ve JSON içerik bağlantıları otomatik temizleniyor; local fiziksel paket dosyasına dokunulmadan DB/public kullanım kaldırılıyor.
- 1280 px ve üzerindeki ekranlarda medya editörü listenin sağına sticky panel olarak alındı; dar ekranda listenin üstüne taşınıyor.
- Düzenleme bağlantıları `#media-editor` hedefiyle yumuşak geçiş yapıyor; yeni görsel, yayındakiler, arşiv ve tüm görseller için hızlı kısayollar eklendi.
- Merch ön ve arka tişört görselleri aktif medya kayıtlarından çözülüyor; arşiv/silme sonrasında eski hardcoded görsele dönmek yerine kontrollü placeholder gösteriliyor.
- Yeni migration: `20260624020000_media_replace_and_auto_detach.sql`.
- Medya replacement, otomatik detach, responsive editör ve hardcoded public fallback engeli için unit kontratları eklendi.

### Admin işlem geri bildirimi ve sadeleştirme

- Medya yükleme, güncelleme, arşivleme, geri alma ve kalıcı silme sonrasındaki Türkçe başarı/hata mesajları `URLSearchParams` ile güvenli biçimde encode ediliyor; başarılı veritabanı işleminden sonra `This page couldn’t load` ekranına düşme sorunu giderildi.
- Generic admin tablolarında teknik `sort_order` alanı form ve liste görünümünden kaldırıldı; mevcut değer hidden sistem alanı olarak korunuyor ve veritabanı sıralama davranışı bozulmuyor.
- Medya kütüphanesindeki görünür sıra numarası ve sıra girişi kaldırıldı.
- Medya yönetimi dar iki kolon yerine güvenli tek kolon düzene geçirildi; 899 px altında kayıtlar okunabilir kart görünümüne dönüşüyor ve aksiyonlar mobil genişliğe uyarlanıyor.
- Türkçe yönlendirme kodlaması, teknik alan gizleme ve medya responsive kontratı için yeni unit testler eklendi.

### Birleşik fiyat yönetimi

- Admin paneline `/admin/pricing` altında ürün odaklı tek fiyat yönetimi ekranı eklendi.
- Ürün arama, kategori, şube, aktiflik ve eksik fiyat filtreleri tek akışta toplandı.
- Aynı ürünün bütün aktif şube fiyatları, fiyat etiketleri, notları ve aktiflik durumu aynı kartta düzenlenebiliyor.
- Eksik ürün-şube bağlantısı fiyat ekranından oluşturulabiliyor; varyant fiyatları ürün ve şube bağlamında inline güncellenebiliyor.
- Eski teknik şube/varyant tabloları silinmedi; gelişmiş yönetim bağlantıları olarak korunuyor.
- Türkçe ondalık fiyatların güvenli `price_cents` dönüşümü, UUID ve dönüş URL doğrulaması için unit testler eklendi.

### Medya yönetimi, public görünürlük ve karikatür katmanları

- Kariyer başvuru formu kendi stacking context'ine alındı; hareketli karikatürler form kartının arkasında kalırken parallax davranışı korundu.
- Public medya adaptörleri yalnız `published + is_active` kayıtları okuyacak şekilde güçlendirildi.
- Home content block içindeki Storage görsel yolları aktif medya allowlist'iyle doğrulanıyor; arşivlenen galeri/konum/şube görselleri raw URL üzerinden yeniden görünmüyor.
- Medya kütüphanesine ad, alt metin, yayın durumu ve aktiflik düzenleme ekranı eklendi.
- Bağlantılı medya public görünümden kaldırılabilecek şekilde arşivlenebilir; kalıcı silme yalnız bağlantısız, arşivlenmiş Storage görsellerine açıldı.
- Storage silme ile DB silme arasındaki yarım kalmış işlemler `_admin_delete` işareti ve güvenli yeniden deneme akışıyla yönetiliyor.
- Medya güncelleme ve kalıcı silme işlemleri admin yetkili, auditli RPC'lere taşındı; public route revalidation kapsamı genişletildi.
- Etkinlik + duyuru migration dosyası transaction içine alındı; production uygulama sırası teknik notla belgelendi.

### Final paket QA ve tasarım temizliği

- Kullanılmayan eski content/component katmanı, eski Firebase/static admin varlıkları, demo etkinlik JSON'u ve referanssız galeri görselleri kaldırıldı.
- Header masaüstü kırılımı dinamik navigasyon taşmasını önleyecek şekilde yükseltildi; mobil menü daha erken devreye giriyor.
- Ana sayfa hero alanındaki viewport tabanlı aşırı yükseklik kaldırıldı ve masaüstü/tablet/mobil dikey ritmi dengelendi.
- Canlı veri fallback uyarısı daha sakin, kompakt ve erişilebilir bir durum bandına dönüştürüldü.
- Ana çalışma akışı `main` branch'ine güncellendi; README ve proje kuralları mevcut sürece göre yenilendi.
- Unit test, coverage, ESLint, TypeScript, production build ve npm audit kontrolleri yeniden doğrulandı.
- Ana sayfa hero başlık ölçüsü ve kolon oranları geniş ekranda daha dengeli satır kırılımı verecek şekilde inceltildi.
- Mobil hero alanında metnin arkasına düşen üst doodle görselleri gizlendi; meta bağlantıları düzenli iki sütun yapısına geçirildi.
- Mobil admin hızlı erişim düğmesi içerik solundan sağ alta taşınarak hero illüstrasyonuyla çakışması azaltıldı.

### Faz 14A

- Vitest unit/coverage, yerel Supabase pgTAP ve Playwright regresyon altyapısı eklendi.
- Admin yetkilendirmesi, kariyer doğrulaması, medya/CRUD güvenliği ve public fallback için otomatik senaryolar eklendi.
- Test komutları Preview/Production hedeflerini reddeden yerel ortam korumasıyla sınırlandırıldı.
- Proje çalışma ve test kuralları `AGENTS.md` ile belgelendi.

### Faz 14B

- `site_pages` SEO başlığı ve açıklaması Home, Menu, Events ve Careers metadata akışına bağlandı.
- Admin'de seçilen menü ürünü görselleri public şube menülerinde erişilebilir alt metinle gösterilmeye başlandı.
- Şube açıklama, adres, harita, telefon, e-posta, çalışma saati ve özellik alanları public kartlara bağlandı.
- Admin-public eşleşmeleri için unit ve render regresyon testleri eklendi.

### Faz 14C

- Menü, etkinlik, merch, Instagram, kariyer CV ve JSON içerik blokları için merkezi medya kullanım haritası eklendi.
- Kullanılan medyanın arşivlenmesi ve TEST_ kaydının kalıcı silinmesi engellendi.
- Medya kütüphanesine kullanım bağlantıları, durum filtresi ve arşivden geri alma eylemi eklendi.
- Arşivlenmiş/pasif medya yeni içeriklerin medya seçim listesinden çıkarıldı.
- Medya yaşam döngüsü için unit ve Playwright kabul kontrolleri eklendi.

### Faz 14D

- Kariyer başvurularına 180 günlük retention inceleme tarihi ve gizlilik durumları eklendi.
- Admin ekranına DB, Storage veya audit yazmadan çalışan anonimleştirme dry-run ön kontrolü eklendi.
- Private CV silme ile DB anonimleştirmeyi ayıran, hata halinde devam/geri alma destekli iki aşamalı admin akışı eklendi.
- Aday PII, teknik parmak izleri, admin notu ve CV medya kaydını temizleyen admin-only RPC'ler eklendi.
- CV signed URL erişimi anonimleştirme bekleyen ve tamamlanmış kayıtlarda kapatıldı.
- Retention/RPC yetkileri için pgTAP; admin eylemi için unit ve Playwright kabul kontrolleri eklendi.

### Faz 14E

- Public common/home/menu/events adaptörlerine request-level React cache eklendi.
- Public medya sorguları tüm tablo yerine yalnız bağlı medya UUID'leriyle sınırlandırıldı ve gereksiz kolon/ilişki sorguları kaldırıldı.
- Menu rotası etkinlik ve Instagram verisini yüklemeyen dedicated merch adaptörüne geçirildi.
- Generic CRUD, medya kütüphanesi ve kariyer listelerine 25 kayıtlı server-side pagination eklendi.
- Admin arama/durum filtreleri DB katmanına taşındı; kariyer listesinde yalnız görünen PII kolonları okunmaya başlandı.
- Pagination ve dar medya sorguları için unit regresyon testleri eklendi.

### Faz 14F

- Generic CRUD yazma akışı kaynak ve alan bazlı doğrulama katmanına taşındı.
- UUID ilişkileri, select seçenekleri, slug/e-posta/HTTPS, metin uzunluğu, pozitif para ve tam sayı kuralları DB yazımından önce doğrulanmaya başladı.
- Çalışma saatleri, içerik blokları, sayfa metadata'sı ve kontrollü site ayarları için JSON biçim şemaları eklendi.
- JSON editörüne canlı sözdizimi kontrolü ve biçimlendirme eylemi; formlara alan bazlı erişilebilir hata geri bildirimi eklendi.
- Dinamik Supabase CRUD erişimi tek repository sınırında toplandı; admin CRUD ve tema yazma akışlarındaki `as never` / `as unknown` tip kaçışları kaldırıldı.
- Resource alan, liste, arama ve sıralama kolonları tabloya özel generated Database tipleriyle derleme zamanında sınırlandı.
- Doğrulama, güvenli JSON ve kontrollü editör davranışı için unit regresyon testleri eklendi.
- CV signed URL erişimi audit kaydı yazılamadığında fail-closed davranacak şekilde güçlendirildi.
- Generic içerik ve site ayarı mutasyonları transaction içi DB trigger audit katmanına taşındı.
- Tema ve kariyer başvurusu güncellemeleri semantic audit kaydıyla aynı RPC transaction'ında tamamlanmaya başladı.
- Medya oluşturma, arşivleme ve geri alma işlemleri auditli RPC'lere; TEST_ medya silme işlemi telafi edilebilir iki aşamalı akışa taşındı.
- Media ve job_applications tablolarında authenticated doğrudan yazma yetkileri kaldırılarak auditli RPC sınırı zorunlu hale getirildi.
- Transaction audit, tema, kariyer ve medya akışları için Vitest ve pgTAP regresyonları eklendi.

### Faz 14G

- Public şube modeli sabit Alsancak/Atakent union tiplerinden çıkarılarak veritabanındaki aktif şubeleri destekleyecek şekilde dinamikleştirildi.
- Menü sekmeleri, URL `sube` seçimi, etkinlik filtreleri, merch ilişkileri ve kariyer şube seçenekleri dinamik şube listesine bağlandı.
- Alsancak ve Atakent'in mevcut zengin menü tasarımları korunurken yeni şubeler için kategori `display_type` değerini kullanan genel menü renderer'ı eklendi.
- Mevcut iki şubeye sonradan eklenen yeni kategoriler, sabit slug listesinde olmasa bile genel kategori alanında gösterilmeye başlandı.
- Ana sayfa menü ve konum kartları, içerik bloklarında bulunmayan üçüncü şubeler için güvenli genel kart üretecek şekilde genişletildi.
- Üçüncü şube, yeni kategori, etkinlik filtresi ve kariyer başvurusu için unit regresyon testleri eklendi.

### Faz 14H

- Kullanılmayan eski content katmanı ve yinelenen menü/etkinlik componentleri kaldırıldı.
- Kariyer ve etkinlik şube seçeneklerindeki artık kullanılmayan statik exportlar temizlendi.
- Aktif veri kaynakları `src/data`, `src/lib/public-data` ve `src/components/cards` altında tekilleştirildi.
- `legacy.css`, seed/fallback ve deployment scriptleri için güvenli temizlik sınırları teknik envanterle belgelendi.

### Faz 14I

- Bağımlılık güvenlik taramasındaki iki moderate PostCSS bulgusu kontrollü `overrides` kaydıyla güvenli sürüme taşındı.
- Next.js'in transitive PostCSS bağımlılığı `8.5.15` sürümüne sabitlendi; `npm audit` sonucu sıfır bulguya indirildi.
- Kırıcı ESLint, TypeScript ve Node tip yükseltmeleri sunum öncesi risk oluşturmaması için ertelendi.
- Bağımlılık kararı, doğrulama komutları ve geri alma yöntemi teknik notla belgelendi.

## 1.0.0-rc.1 - 2026-06-22

### Tamamlananlar

- Frontend v1 ve responsive public sayfalar
- Supabase browser/server istemcileri ve health kontrolleri
- İlişkisel veritabanı şeması, seed ve TypeScript database tipleri
- RLS, rol modeli ve public/private Storage politikaları
- Public sayfaların canlı Supabase verisine bağlanması ve fallback sistemi
- Kariyer başvurusu, spam koruması ve private CV akışı
- Supabase Auth admin girişi ve korumalı route'lar
- Tam admin CRUD paneli ve admin activity log
- Kontrollü tema/bölüm yönetimi
- Vercel Preview/Production yapılandırması, SEO ve deployment kontrolleri
- Mobil hero/merch taşma düzeltmeleri ve public admin hızlı erişimi
- Final operasyon, QA ve debugging dokümantasyonu

### Doğrulananlar

- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Faz 9 CRUD testleri kullanıcı tarafından başarıyla tamamlandı
- Vercel Preview health: deployment, Supabase Auth ve public data başarılı

### Production öncesi

- `develop` branch'ini `main` ile birleştir
- Production environment variable'larını doğrula
- Supabase production Site URL / Redirect URL ayarlarını kontrol et
- `npm run verify:deployment -- <url> production` komutunu çalıştır
- Final responsive ve içerik kabul turunu tamamla

- Generic CRUD liste ve detay sorguları yalnız ihtiyaç duyulan kolonları okuyacak şekilde daraltıldı.
- Medya listesi ve kariyer detay sorgularındaki gereksiz kolon okumaları kaldırıldı.
- Admin ilişki seçimleri güvenli kayıt sınırı ve açık sorgu hata yönetimiyle güçlendirildi.
- Public adaptörlerdeki tekrar eden şube sorguları ortak request-level cache katmanında birleştirildi.
