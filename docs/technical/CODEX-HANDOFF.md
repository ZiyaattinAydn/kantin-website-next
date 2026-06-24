# Teknik Handoff

### Görev

Admin medya kütüphanesinde bütün görsellerin bağlantıları korunarak değiştirilebilmesi, kalıcı silmede bağlantıların otomatik kaldırılması ve editörün responsive/kısayollu kullanım akışına geçirilmesi.

### Durum

Kod, unit testler, ESLint, TypeScript, production build ve npm audit tamamlandı. Production Supabase'e migration uygulanmadı. Docker olmadığı için pgTAP ve yerel Supabase E2E çalıştırılmadı.

### Yapılanlar

#### Görseli yerinde değiştirme

- `/admin/media` editörüne **Yerine başka görsel koy** formu eklendi.
- Yeni dosya Storage'a yüklendikten sonra `replace_admin_media_file` RPC'si aynı medya UUID'sini koruyor.
- Menü, etkinlik, merch ve Instagram gibi UUID/FK tabanlı bağlantılar değişmeden devam ediyor.
- `content_blocks` içindeki eski local path, object path veya public URL referansları yeni public URL ile transaction içinde değiştiriliyor.
- Eski Storage nesnesi replacement tamamlandıktan sonra temizleniyor. Temizlik hatası yeni görseli geri almıyor; admin kullanıcıya uyarı veriliyor.
- Local ve external medya kayıtları da aynı ekran üzerinden Storage görseline dönüştürülebiliyor.

#### Otomatik bağlantı temizleyerek kalıcı silme

- Kalıcı silme artık kullanım sayısına göre engellenmiyor; önce arşivleme ve güçlü onay zorunlu.
- Silme tamamlanırken `menu_items`, `events`, `merch_products`, `instagram_posts` ve ilgili JSON içerik bağlantıları otomatik ayrılıyor.
- Storage kaynağında fiziksel nesne önce siliniyor; ardından bağlantı temizleme + DB silme + audit transaction içinde tamamlanıyor.
- Local/external kayıtlarda Storage çağrısı yapılmadan DB/public bağlantı temizliği gerçekleştiriliyor. Repository içindeki fiziksel local dosya otomatik silinmiyor.
- Yarım kalan silme işlemleri mevcut pending-marker akışıyla tekrar tamamlanabiliyor.

#### Kullanılabilir admin arayüzü

- 1280 px ve üzerindeki ekranlarda liste solda, sticky editör sağda gösteriliyor.
- Dar ekranlarda editör listenin üstüne taşınıyor; mobil tablolar kart görünümünü koruyor.
- **Düzenle / değiştir** bağlantısı `#media-editor` anchor'ına gider; global smooth-scroll davranışıyla forma geçilir.
- Yeni görsel, yayındakiler, arşiv/pasif ve tüm görseller kısayolları eklendi.
- Seçilen satır vurgulanıyor; editör mevcut görseli ve kullanım sayısını özetliyor.
- Teknik sıra numarası kullanıcı arayüzünde gizli kalmaya devam ediyor.

#### Public merch güvenliği

- Oversize tişörtün ön ve arka yüz görselleri artık aktif medya kayıtlarından çözülüyor.
- Public bileşenlerde `tee-front.jpg` ve `tee-back.jpg` sabit fallback yolları kaldırıldı.
- Medya arşivlenir veya silinirse kırık `<img>` ya da eski görsel yerine kontrollü placeholder render ediliyor.

### Önemli değişen dosyalar

- `supabase/migrations/20260624020000_media_replace_and_auto_detach.sql`
- `src/lib/admin/media-actions.ts`
- `src/app/admin/(panel)/media/page.tsx`
- `src/app/admin/(panel)/media/MediaLibrary.module.css`
- `src/lib/supabase/database.types.ts`
- `src/lib/public-data/helpers.ts`
- `src/lib/public-data/home.ts`
- `src/lib/public-data/merch.ts`
- `src/types/content.ts`
- `src/components/home/HomeMerchDrop.tsx`
- `src/components/merch/MenuMerchShowcase.tsx`
- `src/components/cards/MerchCard.tsx`
- `src/styles/legacy.css`
- `tests/unit/admin/media-actions.test.ts`
- `tests/unit/styles/admin-media-responsive.test.ts`
- `tests/unit/public-data/merch-media-replacement.test.ts`
- `docs/backend/20260624-media-ve-duyuru-migration-uygulama.md`
- `docs/technical/20260624-medya-yerinde-degistirme-ve-otomatik-baglanti-temizleme.md`
- `docs/operations/admin-kullanim-rehberi.md`
- `CHANGELOG.md`

### Veritabanı etkisi

Production migration sırası:

1. `supabase/migrations/20260623030000_event_announcements.sql`
2. `supabase/migrations/20260624010000_media_management.sql`
3. `supabase/migrations/20260624020000_media_replace_and_auto_detach.sql`
4. `notify pgrst, 'reload schema';`

Üçüncü migration uygulanmadan `replace_admin_media_file` ve genişletilmiş otomatik detach silme akışı kullanılamaz.

### Test ve doğrulama

Geçen kontroller:

- Hedefli test: **3 dosya / 21 test** geçti.
- `npm run test:unit`: **41 dosya / 128 test** geçti.
- `npx tsc --noEmit`: geçti.
- `npm run lint`: geçti.
- Temiz `.next` sonrası `npm run build`: geçti; `/admin/media` ve public rotalar build edildi.
- `npm audit --audit-level=high`: geçti, **0 güvenlik bulgusu**.

Çalıştırılmayan kontroller:

- `npm run test:db`: Docker/yerel Supabase olmadığı için çalıştırılmadı.
- `npm run test:e2e`: yerel Supabase ve TEST admin oturumu olmadığı için çalıştırılmadı.
- Production migration veya canlı Storage/DB işlemi yapılmadı.

### Açık riskler

- Yeni migration gerçek PostgreSQL üzerinde pgTAP ile bu ortamda doğrulanmadı.
- Replacement ve bağlı kalıcı silme davranışı production'da yalnız `TEST_` medya kayıtlarıyla smoke test edilmelidir.
- Local medya kalıcı silindiğinde repository içindeki fiziksel dosya kalır; public/DB bağlantısı kaldırılır. Fiziksel dosya ancak ayrı kod temizliği sırasında silinmelidir.
- Migration uygulanmadan kod production'a alınırsa yeni RPC çağrıları başarısız olur.

### Sonraki görev

1. Üç migration'ı belgelenen sırada Supabase SQL Editor'da uygula.
2. PostgREST schema cache'i yenile.
3. `TEST_` görselde metadata düzenleme, yerinde replacement, arşiv/restore ve bağlantılı kalıcı silme smoke testi yap.
4. 390, 768, 1024, 1280 ve 1440 px genişliklerde `/admin/media` final görsel kontrolünü yap.

### GPT'ye aktarılacak kısa özet

Kantin Website admin medya kütüphanesi geliştirildi. Yeni `20260624020000_media_replace_and_auto_detach.sql` migration'ı aynı medya UUID'si üzerinde yeni dosya yüklemeyi ve kalıcı silmede bağlantıları otomatik temizlemeyi ekliyor. `/admin/media` içindeki **Düzenle / değiştir** işlemi smooth anchor ile editöre gidiyor. 1280 px ve üzerinde editör sağda sticky, daha dar ekranlarda listenin üstünde. Yeni görsel, yayındakiler, arşiv ve tüm görseller kısayolları var. Replacement sırasında FK bağlantıları korunuyor, `content_blocks` içindeki eski yol/URL'ler yeni public URL'ye taşınıyor ve eski Storage nesnesi temizleniyor. Kalıcı silme arşiv + güçlü onay gerektiriyor; menü, etkinlik, merch, Instagram ve JSON bağlantıları otomatik kaldırılıyor. Local dosyada fiziksel repository dosyası silinmiyor, yalnız DB/public kullanım kaldırılıyor. Oversize tişörtün ön/arka görselleri artık medya tablosundan geliyor; arşiv/silme durumunda eski hardcoded görsele dönmek yerine placeholder gösteriliyor. Unit testler 41 dosya/128 test, TypeScript, lint, production build ve npm audit geçti. Docker olmadığı için pgTAP/E2E çalıştırılmadı; production DB/Storage'a işlem yapılmadı. Migration sırası: event announcements, media management, media replace/auto detach, ardından `notify pgrst, 'reload schema';`.
