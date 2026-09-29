# Kantin yönetim paneli sadeleştirme

## Günlük kullanım

Ana sayfa “Bugün ne yapmak istiyorsunuz?” sorusuyla yedi işlem kartı sunar. Sayılar kapalı genel bakış bölümünde, kullanıcı işlem geçmişi ve küçük sistem durumu kartı aşağıdadır.

Fiyat değiştirme: **Menü fiyatı değiştir → Alsancak / Atakent → ürünü ara → Fiyatı düzenle → Ürünü kaydet.** Boyut/porsiyon ve şube fiyatları aynı formdadır. Yeni ürün dört adımda eklenir: ürün bilgileri, şubeler, fiyat/porsiyonlar, görsel/yayın. Ürünün ilgili şubede Gizle/Göster işlemi diğer şubeyi etkilemez. Yukarı/aşağı düğmeleri şubede kategori içindeki sıralamayı değiştirir.

Site İçeriği gerçek bölümlerle açılır: Ana Sayfa, Alsancak, Atakent, Etkinlikler, Anılarımız, Footer ve İletişim. Mevcut JSON verileri etiketli alanlara dönüşür; liste yapısı, tanımlayıcılar ve ek metadata korunur. Şube editörü ortak içerikteki yalnız kendi şubesinin alanlarını gönderir; diğer şube değerleri sunucuda korunur. Başlık, bağlantı, yayın durumu ve görseller düzenlenebilir. Ana sayfa hero görseli isteğe bağlıdır; görsel yoksa mevcut illüstrasyon kullanılır. Önizleme için mevcut canlı site bağlantısı bulunur; kaydedilmemiş içerik için ayrı public draft-preview altyapısı eklenmedi.

Arama görevleri, ürünleri/şubeleri ve site içeriğindeki alanları bulur. Ürün sonucu doğrudan ilgili şubede fiyat formunu açar. Kariyer kişisel verileri ve CV içerikleri arama indeksine alınmaz.

## Basit / gelişmiş ayrımı

Basit deneyim varsayılandır. Teknik kategori/şube ilişkileri, varyantlar, eski fiyat yönetimi, Site Pages, Content Blocks ve gelişmiş Site Settings ekranları silinmedi; kapalı **Gelişmiş Yönetim** altında bulunur. Bu ayrım bir kullanım tercihi; ayrı bir geliştirici rolü eklenmedi. Tüm admin ekranları mevcut sunucu taraflı aktif admin kontrolüyle korunur.

## Teknik loglar

`/admin/logs` işlem geçmişinden ayrıdır. Tarih, seviye, kullanıcı UUID, route, işlem türü, kod ve çözülme durumuna göre filtrelenir; 50 kayıtla sayfalanır. Detaylar satır içinde açılır. Uygun entity için ilgili kayda bağlantı ve çözüldü/yeniden aç işlemleri vardır.

Kayıt alanları: zaman, oturumdan belirlenen actor_id, route, operation, entity_type/entity_id, level, error_code, standart teknik mesaj, request_id, güvenli detail, resolved_at/resolved_by. Desteklenen seviyeler info/warning/error/critical. Arayüz şu anda başarısız admin eylemleri ve okuma hatalarını kaydeder; başarılı işletme işlemleri mevcut audit tablosunda kalır.

**Ham exception message, stack, request body, cookie, session, token, key, e-posta/CV veya environment kaydedilmez.** Kodlar ve bağlamlar kapalı bir katalogdan seçilir. DB RPC de bağımsız olarak route/işlem/entity/seviye kontrolü yapar, teknik mesajı kendisi üretir. Bilinmeyen kod `UNKNOWN` olur. Ayrıntılı ham hata yerine güvenli standart açıklama sunulması bilinçli bir tercihtir. Request ID uygulamada olay başına üretilir; genel dağıtılmış HTTP tracing altyapısı eklenmedi.

Log yazılamazsa ana işlem sonucu korunur ve yalnız aynı güvenli yapı sunucu konsoluna yazılır. Log tablosu okunamıyorsa dashboard “kontrol edilemiyor” gösterir; yanlışlıkla sağlıklı sayılmaz. Doğrudan log insert/update/delete yetkisi yoktur; çözülme RPC'si yalnız çözülme alanlarını değiştirir.

## Veritabanı değişiklikleri

İki yeni migration **hazırlandı, kullanıcının Supabase projesine uygulanmadı**:

1. `20260930010000_unified_admin_menu.sql`: `save_admin_menu_product` ve `move_admin_menu_product`. Mevcut beş menü tablosunu kullanır, yeni menü tablosu oluşturmaz. Tek transaction, sunucuda admin kontrolü, mevcut RLS/audit/sıra triggerları, ürün ve tüm alt kayıtların sürüm kontrolü vardır. Kategori bağlantısı otomatik eklenir; mevcut kapalı kategori bağlantısı açılmaz. Kaldırılan şube/porsiyon ilişkileri silinmez, gizlenir. Notlar ve metadata korunur.
2. `20260930020000_admin_system_logs.sql`: yeni log tablosu, indeksleri, yalnız admin SELECT politikası ve iki kontrollü RPC. Actor oturumdan alınır. Mevcut public/audit/revision politikaları değiştirilmez.

Yeni menü değişiklikleri mevcut audit triggerlarına dahildir. Menü için yeni revision-restore yeteneği eklenmedi; mevcut site sayfası/içerik/ayar/şube revision desteği korunur ve basit editörden erişilir. Kalıcı silme eski korumalı gelişmiş akışta kalır.

Güvenli geri dönüş: önce uygulamayı önceki sürüme döndürün. İstenirse `supabase/manual/rollback_admin_simplification.sql` yeni RPC yetkilerini kapatır. Mevcut menü verisi, son başarılı değişiklikler ve log kayıtları saklanır; otomatik DROP/DELETE yoktur. Geri dönüş dosyası da uygulanmadı.

## Doğrulama

- Vitest: 63 dosyada 255 test geçti. Yeni menü girdileri/eylemleri, fiyat değiştirme, dört adımlı ürün oluşturma, porsiyon/şube seçimi, gizleme onayı, medya seçimi, içerik kaydı/yapı koruması, stale kontrolü, basit/gelişmiş navigasyon, mobil menü ve log gizliliği testleri.
- Eski fallback testi main'deki son bira sıralaması değişikliğinden önceki beklentiyi taşıyordu. Başlangıç main checkout'unda aynı başarısızlık doğrulandı; test mevcut **Efes → Becks → Stella** sırasına güncellendi. Public menü sırası değiştirilmedi.
- ESLint ve TypeScript kontrolü geçti. Next.js build, yalnız yerel dummy Supabase hedefiyle başarılı.
- İzole PGlite PostgreSQL motorunda migration derlemesi ve `unified_admin_menu_and_logs.test.sql` içindeki 24 kontrol geçti: atomic rollback, yetkiler, RLS, porsiyon fiyatı, metadata/not koruması, stale kontrolü, gizleme onayı ve log sanitizasyonu. Auth helperları bu izole testte taklit edilir; gerçek Supabase Auth/Storage uçtan uca testi yerine geçmez.
- Yerel tarayıcı görsel kontrolü: 1440×1000 masaüstü, 1024×768 tablet, 390×844 mobil. Menü/listeler/ürün formunda yatay taşma ve browser page error görülmedi. Mobil drawer/Escape kontrolü geçti. Bu kontrol sentetik TEST verisi kullandı; geçici fixture rotası teslimden kaldırıldı.
- Gerçek Supabase pgTAP ve oturumlu Playwright: yerel Supabase/Docker ve TEST admin hesabı mevcut olmadığından çalıştırılamadı. Yeni `tests/e2e/admin-simplification.spec.ts` yerel ortamda hazır.

İzole SQL tekrar çalıştırma (uygulama bağımlılığı eklemeden):

```bash
npm install --prefix /tmp/kantin-admin-sql @electric-sql/pglite --no-audit --no-fund
node scripts/validate-admin-simplification-pglite.mjs /tmp/kantin-admin-sql
```

Gerçek yerel Supabase ortamında mevcut kurallara uygun migration kurulumundan sonra `npm run test:db` ve TEST admin process değişkenleriyle `npm run test:e2e` çalıştırılmalıdır. Uzak/canlı Supabase hedefinde test çalıştırmayın.

## Yayın öncesi manuel kontrol

### Önizleme oturum hatası düzeltmesi

Vercel build/deployment check başarılı olmasına rağmen `/admin` ve `/admin/login` HTTP 500 döndürdü. Supabase istemci kurulumu ve auth sorgusu proxy/login katmanında korumasızdı. Bu katmanlar artık ayar/bağlantı hatasında korunan sayfaya erişim vermeden güvenli giriş hata durumuna yönlenir. API güvenli 503 döndürür. Login formu bağlantı kurulamadığında gösterilmez; geçici tarayıcı auth hatalarında düğme tekrar kullanılabilir olur. Auth fallback logu yalnız standart mesaj/kod ve olay kimliği içerir; exception, e-posta, session veya secret yazdırılmaz.

266 unit testi, lint, TypeScript ve ortam değişkenleri verilmeden Next.js build geçti. Gerçek yerel production HTTP kontrolünde `/admin` → `/admin/login?next=%2Fadmin&reason=unavailable` → 200, kısa bağlantı mesajı, parola formu yok ve ham ayar hatası yok doğrulandı. Bu düzeltme eksik Supabase ayarlarını kendisi oluşturmaz. Vercel runtime loglarına erişilmeden önizleme bağlantı hatasının kesin nedeni doğrulanmış sayılmaz.

Önizleme için Vercel projesinde `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` değerlerinin **Preview** kapsamı ve gerekirse bu branch için geçerli olması gerekir. Değerleri göstermeden kapsamı kontrol edin. Güvenli yazma testleri ayrı test Supabase projesini hedeflemelidir; production anahtarlarını önizlemeye kopyalamak test ortamı oluşturmaz. Ayar değişirse yeni preview build gerekir.

- İki migration'ı ayrı test Supabase ortamında uygulayın; mevcut public Alsancak/Atakent menüleriyle karşılaştırın.
- Efes fiyatını değiştirin; sadece hedef şube/porsiyonun değiştiğini kontrol edin.
- TEST ürününü iki şubede oluşturun; taslak/yayın ve gizle/göster davranışlarını doğrulayın.
- Kategori kapalıysa ürünün yanlışlıkla yayına çıkmadığını doğrulayın.
- Site içerikleri ve görsel seçimi, geri alma, footer/Instagram bağlantılarını kontrol edin.
- Bilinçli başarısız işlemle kısa kullanıcı mesajı ve güvenli teknik log kaydını kontrol edin; hassas veri bulunmadığını teyit edin.
- Vercel preview check başarılı olmadan main'e merge etmeyin.

## Değişen dosyalar

- `docs/technical/20260930-admin-simplification.md`
- `scripts/validate-admin-simplification-pglite.mjs`
- `src/app/admin/(panel)/content/page.tsx`
- `src/app/admin/(panel)/error.tsx`
- `src/app/admin/(panel)/logs/page.tsx`
- `src/app/admin/(panel)/menu/page.tsx`
- `src/app/admin/(panel)/search/page.tsx`
- `src/app/admin/AdminDashboard.module.css`
- `src/app/admin/page.tsx`
- `src/components/admin/AdminShell.module.css`
- `src/components/admin/AdminShell.tsx`
- `src/components/admin/simple/ContentEditor.tsx`
- `src/components/admin/simple/MediaPicker.tsx`
- `src/components/admin/simple/MenuManager.tsx`
- `src/components/admin/simple/MenuProductForm.tsx`
- `src/components/admin/simple/SimpleAdmin.module.css`
- `src/components/home/HomeHero.tsx`
- `src/lib/admin/application-actions.ts`
- `src/lib/admin/content-actions.ts`
- `src/lib/admin/content-data.ts`
- `src/lib/admin/content-model.ts`
- `src/lib/admin/log-actions.ts`
- `src/lib/admin/log-safety.ts`
- `src/lib/admin/media-actions.ts`
- `src/lib/admin/media-choices.ts`
- `src/lib/admin/menu-actions.ts`
- `src/lib/admin/menu-data.ts`
- `src/lib/admin/menu-model.ts`
- `src/lib/admin/navigation.ts`
- `src/lib/admin/pricing-actions.ts`
- `src/lib/admin/render-error-actions.ts`
- `src/lib/admin/resource-actions.ts`
- `src/lib/admin/resource-repository.ts`
- `src/lib/admin/resource-validation.ts`
- `src/lib/admin/resources.ts`
- `src/lib/admin/revision-actions.ts`
- `src/lib/admin/system-logs.ts`
- `src/lib/admin/theme-actions.ts`
- `src/lib/admin/user-error.ts`
- `src/lib/public-data/home.ts`
- `src/lib/public-data/types.ts`
- `supabase/manual/rollback_admin_simplification.sql`
- `supabase/migrations/20260930010000_unified_admin_menu.sql`
- `supabase/migrations/20260930020000_admin_system_logs.sql`
- `supabase/tests/unified_admin_menu_and_logs.test.sql`
- `tests/e2e/admin-simplification.spec.ts`
- `tests/unit/admin/application-actions.test.ts`
- `tests/unit/admin/content-actions.test.ts`
- `tests/unit/admin/content-model.test.ts`
- `tests/unit/admin/media-actions.test.ts`
- `tests/unit/admin/menu-actions.test.ts`
- `tests/unit/admin/menu-model.test.ts`
- `tests/unit/admin/pricing-actions.test.ts`
- `tests/unit/admin/resource-actions.test.ts`
- `tests/unit/admin/revision-actions.test.ts`
- `tests/unit/admin/simple-admin-ui.test.tsx`
- `tests/unit/admin/system-logs.test.ts`
- `tests/unit/admin/theme-actions.test.ts`
- `tests/unit/public-data/menu.test.ts`
