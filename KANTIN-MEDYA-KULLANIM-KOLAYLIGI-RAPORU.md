# Kantin Website — Medya Kullanım Kolaylığı ve Otomatik Bağlantı Yönetimi

**Tarih:** 24 Haziran 2026  
**Kapsam:** `/admin/media`, medya replacement, otomatik detach/silme, responsive editör ve public görsel güvenliği

## Tamamlanan kullanıcı istekleri

### 1. Bütün medya kayıtlarını bağlantıları bozmadan değiştirme

- Her medya satırındaki **Düzenle / değiştir** işlemi editör alanını açar.
- Editördeki **Yerine başka görsel koy** formu yeni dosyayı Storage'a yükler.
- Medya kaydının UUID'si değişmez; FK tabanlı mevcut bağlantılar korunur.
- JSON `content_blocks` içindeki eski local path, object path ve public URL referansları yeni URL'ye transaction içinde taşınır.
- Local veya external kaynaklı görsel de yeni Storage görseline dönüştürülebilir.
- Replacement tamamlandıktan sonra eski Storage nesnesi temizlenir.

### 2. Kalıcı silmede bağlantıları otomatik kaldırma

- Kullanım sayısı artık kalıcı silmeyi teknik olarak engellemez.
- Görselin önce arşivlenmesi ve güçlü onay verilmesi gerekir.
- Silme tamamlanırken menü, etkinlik, merch, Instagram ve JSON içerik bağlantıları otomatik ayrılır.
- Public içerik kırık UUID veya kırık URL üretmez.
- Storage kaynaklı dosya fiziksel olarak silinir.
- Local kaynakta repository içindeki fiziksel dosya otomatik silinmez; DB ve public kullanım kaldırılır.
- Bütün işlem audit kaydı üretir ve yarım kalan silme tekrar tamamlanabilir.

### 3. Admin medya ekranını daha kullanışlı yapma

- 1280 px ve üzerindeki ekranlarda medya listesi solda, editör sağda sticky paneldir.
- Dar ekranda editör listenin üstüne taşınır.
- **Düzenle / değiştir** seçilince `#media-editor` hedefine yumuşak geçiş yapılır.
- Hızlı kısayollar eklendi:
  - Yeni görsel
  - Yayındakiler
  - Arşiv / pasif
  - Tüm görseller
- Seçili medya satırı vurgulanır.
- Editör mevcut önizleme, kullanım sayısı, metadata formu ve replacement formunu tek yerde toplar.
- Mobil medya tablosu kart görünümünü korur.

### 4. Arşiv/silme sonrasında eski görselin geri gelmesini önleme

- Oversize tişörtün ön ve arka yüz görselleri aktif medya kayıtlarından okunur.
- Public merch bileşenlerindeki sabit `tee-front.jpg` ve `tee-back.jpg` fallback yolları kaldırıldı.
- Görsel arşivlenmiş veya silinmişse eski/kırık görsel yerine kontrollü placeholder gösterilir.

## Yeni migration

```text
supabase/migrations/20260624020000_media_replace_and_auto_detach.sql
```

### Production uygulama sırası

1. `20260623030000_event_announcements.sql`
2. `20260624010000_media_management.sql`
3. `20260624020000_media_replace_and_auto_detach.sql`
4. Yeni SQL sorgusunda:

```sql
notify pgrst, 'reload schema';
```

Ayrıntılı uygulama ve smoke test rehberi:

```text
docs/backend/20260624-media-ve-duyuru-migration-uygulama.md
```

## Başlıca teknik değişiklikler

- Yeni RPC: `replace_admin_media_file(...)`
- Genişletilmiş RPC: `begin_admin_media_delete(uuid)`
- Yenilenen RPC: `complete_admin_media_delete(uuid)`
- Recursive JSONB yardımcıları ile content block referans değiştirme/kaldırma
- Replacement ve silme sonrası public route revalidation
- Responsive/sticky medya editörü
- Active-media metadata sorgusu ile merch arka yüz görseli çözümleme
- Kırık görsel yerine erişilebilir placeholder

## Test sonuçları

```text
Hedefli testler: 3 dosya / 21 test geçti
Tüm unit testler: 41 dosya / 128 test geçti
TypeScript: geçti
ESLint: geçti
Production build: geçti
npm audit --audit-level=high: 0 güvenlik bulgusu
Whitespace ve SQL statik yapı kontrolleri: geçti
```

## Çalıştırılmayan testler

- Docker/yerel Supabase olmadığı için `npm run test:db` çalıştırılmadı.
- Yerel Supabase ve TEST admin oturumu olmadığı için E2E çalıştırılmadı.
- Production veritabanına veya Storage'a işlem yapılmadı.

## Production smoke testi

Yalnız `TEST_` medya kaydıyla:

1. Medya metadata'sını düzenle.
2. **Düzenle / değiştir** ile yeni dosya yükle.
3. Aynı kaydın bağlı içerikte yeni görseli gösterdiğini doğrula.
4. Arşivle ve public görünümden kalktığını doğrula.
5. Geri yükle ve tekrar göründüğünü doğrula.
6. Bağlantılı TEST medyayı arşivleyip kalıcı sil.
7. Bağlı içerik kaydının kırılmadığını ve bağlantının otomatik kaldırıldığını doğrula.
8. Audit loglarında `media_file_replace`, `media_delete_started` ve `media_delete` kayıtlarını kontrol et.

## Açık risk

Yeni migration gerçek PostgreSQL üzerinde bu ortamda pgTAP ile çalıştırılmadı. Kod ve SQL statik olarak kontrol edildi; production doğrulaması yalnız `TEST_` verileriyle yapılmalıdır. Migration uygulanmadan yeni replacement/delete kodu production'a alınmamalıdır.
