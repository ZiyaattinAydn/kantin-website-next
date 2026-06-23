# Changelog

## Unreleased

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
