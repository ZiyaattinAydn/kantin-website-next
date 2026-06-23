# Changelog

## Unreleased

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
