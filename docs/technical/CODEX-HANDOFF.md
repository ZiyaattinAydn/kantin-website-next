# Codex Handoff

### Görev

Görev 3 - Etkinlikler sayfasını etkinlik + duyuru merkezi yap.

### Durum

implementasyon ve kod commit'i mevcut; local DB testi engelli

### Yapılanlar

`events` veri modeli etkinlik ve duyuru içerik tiplerini destekleyecek şekilde genişletildi. Yeni public içerik tipi `event | announcement`; etkinliklerde başlangıç tarihi hâlâ zorunlu, duyurularda tarih zorunlu değil. Duyurular `publish_start_at` / `publish_end_at` yayın penceresine göre görünür; süresi geçmiş duyurular public normalizasyonda gizlenir.

`/events` sayfası artık iki filtre grubu gösteriyor: içerik tipi (`Tümü`, `Etkinlikler`, `Duyurular`) ve şube (`Tüm şubeler`, şube seçenekleri). Boş durum artık yalnız etkinlik yok diye duyuruları gizlemiyor; hiç içerik yoksa genel “yayınlanmış içerik yok” durumu gösteriliyor.

Etkinlik kartı duyuru rozeti, duyuru tarih alanı ve opsiyonel CTA etiketi/link desteği aldı. Tarihsiz duyurularda tarih bloğu yerine duyuru işareti gösteriliyor. Ana sayfadaki “Yaklaşan etkinlikler” bölümü yalnız gerçek etkinlikleri göstermeye devam ediyor; duyurular ana sayfa etkinlik kartlarına karışmıyor.

Admin generic resource `events` kaynağı “Etkinlikler ve duyurular” olarak genişletildi. Admin formuna `content_type`, `cta_label`, `publish_start_at`, `publish_end_at` alanları eklendi. Payload validasyonu tablo kurallarıyla hizalandı: etkinlik için açıklama ve başlangıç zorunlu, duyuru için açıklama/tarih opsiyonel, bitiş tarihleri başlangıçlardan sonra olmalı.

Public Supabase adapter yeni kolonları okuyacak şekilde güncellendi. Yeni kolonlar bulunamazsa public tarafta eski kolon setine fallback denemesi var; ancak admin CRUD resource yeni kolonları select edeceği için admin duyuru yönetimi migration uygulanmadan production şemada hazır kabul edilmemeli.

Ara düzeltme: Task 4'e geçmeden önce `/menu` Alsancak Kahve Barı bölümünün zemininin mavi panel altında kaybolduğu görüldü. `theme.css` içindeki public dotted background override'ı `.coffee-bar-section` ve bağlı Merch section için fazla agresif şekilde `transparent !important` uyguluyordu. Kahve/Merch bölümleri bu genel transparent listeden çıkarıldı; kahve bölümü tekrar `var(--cream)` zemin ve ortak dot pattern ile çiziliyor, Merch shell ise transparan kalıp kahve zeminiyle kesintisiz devam ediyor.

### Değişen dosyalar

- `src/types/domain.ts`: Event domain tipi duyuru alanlarıyla genişletildi.
- `src/lib/events.ts`: içerik tipi, duyuru yayın penceresi, tarihsiz duyuru ve sıralama normalizasyonu eklendi.
- `src/lib/public-data/events.ts`: yeni event kolonları, legacy public select fallback’i, CTA/yayın penceresi mapping’i eklendi.
- `src/app/events/page.tsx`: client tarafına yeni alanların serialize edilmesi eklendi.
- `src/components/events/EventsPageClient.tsx`: içerik tipi ve şube filtreleri, yeni boş durum mesajları eklendi.
- `src/components/events/EventsPageClient.module.css`: iki satırlı sticky filtre düzeni eklendi.
- `src/components/cards/EventCard.tsx`: duyuru rozeti, tarihsiz duyuru görünümü, opsiyonel CTA ve genel boş durum varyantları eklendi.
- `src/components/cards/EventCard.module.css`: duyuru tarih bloğu ve tip rozeti stilleri eklendi.
- `src/components/home/HomeEvents.tsx`: ana sayfa yalnız `event` tipini gösterecek şekilde korundu.
- `src/lib/admin/resources.ts`: events admin kaynağı etkinlik/duyuru alanlarıyla genişletildi.
- `src/lib/admin/resource-validation.ts`: events payload için çapraz alan validasyonu eklendi.
- `src/lib/supabase/database.types.ts`: events tablo tipi yeni migration hedefiyle hizalandı.
- `supabase/migrations/20260623030000_event_announcements.sql`: events tablosuna duyuru desteği ve policy güncellemesi hazırladı.
- `supabase/tests/rls_policies.test.sql`: duyuru kolonları, public policy yayın penceresi ve constraint kontrolleri eklendi.
- `tests/unit/lib/events.test.ts`: etkinlik, duyuru ve süresi geçmiş duyuru normalizasyon testleri eklendi.
- `tests/unit/components/event-card.test.tsx`: etkinlik ve duyuru kart render testleri eklendi.
- `tests/unit/components/events-page-client.test.tsx`: içerik tipi filtresi, şube filtresi ve genel boş durum testleri eklendi.
- `tests/unit/admin/resource-data.test.ts`: admin select kolon beklentileri güncellendi.
- `tests/unit/admin/resource-validation.test.ts`: duyuru payload ve etkinlik zorunlu alan testleri eklendi.
- `tests/unit/public-data/events-query.test.ts`: public event fixture’ı yeni kolonlarla güncellendi.
- `src/styles/theme.css`: kahve barı için krem/noktalı zemin istisnası eklendi.
- `tests/unit/styles/public-background-grid.test.ts`: kahve barının mavi panel içinde kendi krem/dot zeminini koruduğu test edildi.

### Veritabanı etkisi

Yeni migration hazırlandı ama uygulanmadı:

- `supabase/migrations/20260623030000_event_announcements.sql`

Migration etkisi:

- `public.events.content_type text not null default 'event'`
- `public.events.cta_label text`
- `public.events.publish_start_at timestamptz`
- `public.events.publish_end_at timestamptz`
- `events.start_at` ve `events.description` nullable yapıldı.
- Yeni constraint’ler etkinliklerde açıklama ve başlangıcı zorunlu tutuyor; duyurularda opsiyonel bırakıyor.
- Public read policy `publish_start_at` ve `publish_end_at` yayın penceresini uygular hale getirildi.
- `event_branches_public_read` policy’si bağlı event yayın penceresini de kontrol ediyor.

Önemli: Admin CRUD yeni kolonları doğrudan select edeceği için bu kod production’a push edilmeden önce production şemasında migration sırası netleşmeli. Remote migration bu oturumda uygulanmadı.

### Test sonuçları

- `npm run test:unit`: geçti, 34 dosya / 98 test.
- `npx tsc --noEmit`: geçti.
- `npm run lint`: geçti.
- `npm run build`: geçti.
- `npm run test:unit -- public-background-grid`: geçti.
- `npm run test:db`: çalıştırılamadı. `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` ile güvenlik script’i local hedefi doğruladı, fakat local Postgres bağlantısı `LegacyDbConnectError / Failed to connect` ile başarısız oldu.
- `.\node_modules\.bin\supabase.cmd status`: çalıştırılamadı; local Docker Desktop named-pipe health check `500 Internal Server Error` döndürdü.
- `.\node_modules\.bin\supabase.cmd start`: `DOCKER_API_VERSION=1.43` ile denendi, yine Docker Desktop named-pipe `500 Internal Server Error` nedeniyle local stack başlatılamadı.

### Manuel kontrol

Mevcut yerel dev server `http://localhost:3000` üzerinde `/events` açıldı.

- Desktop DOM kontrolü: hero metni, iki filtre grubu, genel boş durum ve footer render oldu.
- Desktop görsel kontrol: filtreler ve boş durum kartı taşma/üst üste binme olmadan göründü.
- Mobil 390 px kontrol: hero ve mobil header render oldu; filtrelere inen ek screenshot denemesi browser screenshot timeout verdi, ama ilk mobil render ve desktop görsel kontrol sağlıklıydı.
- `/menu#kahve-bari` görsel kontrolü: computed style `background-color: rgb(244, 239, 230)`, `background-image: /assets/ui/kantin-dot-pattern.png`, metin rengi mavi. Screenshot ile kahve intro ve listelerin krem/noktalı zeminde okunur olduğu doğrulandı.

### Git durumu

- branch: `main`
- başlangıç HEAD: `f863d67`
- mevcut HEAD: `2fdd1c2`
- mevcut kod commit'i: `2fdd1c2 fix: restore coffee bar background`
- önceki Task 3 commit'i: `c702ca2 codex tasarimsal duzenlemeler`

Not: Bu devam adımında kahve barı zemin düzeltmesi `2fdd1c2` commit'iyle kaydedildi. Handoff güncellemesi ayrıca commitlenecek.

Önemli risk: Bu görev production şema migration’ına bağımlı. Public adapter eski kolon setine fallback yapıyor, fakat admin resource yeni kolonları select edeceği için production şemada migration hazır değilse admin yüzeyi kırılabilir. Remote migration bu oturumda uygulanmadı.

Not: Görev başında kapsam dışı olan `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md` değişiklikleri de mevcut `c702ca2` commit'i içinde görünüyor.

### Açık riskler

- `test:db` local URL ile denendi ama yerel Supabase Postgres bağlantısı kurulamadı; migration ve RLS pgTAP testi henüz yerel DB’de doğrulanmadı.
- Local Supabase CLI, Docker Desktop named-pipe üzerinden container health/service inspect yaparken 500 Internal Server Error alıyor. Bu giderilmeden `supabase start/status/test db` tamamlanamıyor.
- Migration uygulanmadan admin CRUD duyuru alanları production şemada kullanıma hazır değildir.
- Mobil filtre/boş durum bölümü DOM ve desktop full-page görsel ile doğrulandı; mobil alt bölüm screenshot denemesi timeout verdi.
- Local dev build sırasında `.env.local` Next tarafından ortam olarak algılandı; dosya içeriği okunmadı veya yazdırılmadı.

### Sonraki görev

Görev 3’ü tamamlamak için önce yerel Docker/Supabase stack erişimi düzeltilmeli, ardından `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 npm run test:db` eşdeğeri PowerShell env ile çalıştırılmalı. Sonra migration uygulama/push sırası netleşmeli. Production schema hazır olmadan bu değişiklikler remote’a push edilmemeli ve Task 4’e geçilmemeli.

### GPT'ye aktarılacak kısa özet

Kantin Website Task 3 implementasyonu `main` / `origin/main` üzerinde `c702ca2` commit'inde görünüyordu. Başlangıç HEAD `f863d67` idi.
Ara kahve barı düzeltmesi `2fdd1c2 fix: restore coffee bar background` commit'iyle yapıldı.
Görev: `/events` sayfasını etkinlik + duyuru merkezi yapmak.
Yapılan ana değişiklikler: `events` modeli `contentType: event | announcement`, opsiyonel duyuru tarihi, `ctaLabel`, `publishStartAt`, `publishEndAt` destekli hale geldi.
`src/lib/events.ts` artık etkinliklerde `startAt` zorunlu tutuyor; duyurularda tarih zorunlu değil; duyuruları `publish_start_at` / `publish_end_at` penceresine göre gizliyor; süresi geçmiş duyurular public listeden düşüyor.
`/events` client sayfası iki filtre grubu gösteriyor: içerik tipi (`Tümü`, `Etkinlikler`, `Duyurular`) ve şube (`Tüm şubeler`, Alsancak, Atakent).
Boş durum genelleştirildi; etkinlik yokken duyurular gizlenmiyor, hiç içerik yoksa “Şu an yayınlanmış içerik yok” gösteriliyor.
`EventCard` duyuru rozeti, tarihsiz duyuru tarih bloğu, opsiyonel CTA label/link ve boş durum varyantları aldı.
Ana sayfa `HomeEvents` yalnız `contentType === "event"` olan gerçek etkinlikleri göstermeye devam ediyor.
Admin `events` resource “Etkinlikler ve duyurular” olarak genişletildi; `content_type`, `cta_label`, `publish_start_at`, `publish_end_at` alanları eklendi.
Admin payload validasyonu eklendi: event için açıklama + başlangıç zorunlu; announcement için tarih/açıklama opsiyonel; tarih bitişleri başlangıçtan sonra olmalı.
Hazırlanan migration: `supabase/migrations/20260623030000_event_announcements.sql`.
Migration `public.events` tablosuna `content_type`, `cta_label`, `publish_start_at`, `publish_end_at` ekliyor; `start_at` ve `description` nullable yapıyor; event zorunlu alan constraint’leri ve yayın pencereli public policies ekliyor.
`database.types.ts` migration hedefiyle hizalandı.
RLS pgTAP dosyası `supabase/tests/rls_policies.test.sql` yeni duyuru kolon/policy/constraint kontrolleriyle güncellendi.
Yeni unit testler: `tests/unit/lib/events.test.ts`, `tests/unit/components/event-card.test.tsx`, `tests/unit/components/events-page-client.test.tsx`.
Güncellenen unit testler: admin resource data/validation ve public events query testleri.
Geçen kontroller: `npm run test:unit` (34 dosya / 98 test), `npx tsc --noEmit`, `npm run lint`, `npm run build`.
Ara kahve barı düzeltmesi: `src/styles/theme.css` içinde `.coffee-bar-section` genel transparent dotted override'dan çıkarıldı ve krem/dot pattern istisnası eklendi. `tests/unit/styles/public-background-grid.test.ts` bu kontratı kontrol ediyor. Geçen ek kontroller: `npm run test:unit -- public-background-grid`, `npx tsc --noEmit`, `npm run lint`.
Manuel kahve kontrolü: `http://localhost:3000/menu` üzerinde `#kahve-bari` computed style krem zemin + dot pattern + mavi metin döndürdü; screenshot'ta intro/listeler okunur göründü.
Çalışmayan kontrol: `npm run test:db`; `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` ile güvenlik script’i local hedefi doğruladı ama local Postgres bağlantısı `LegacyDbConnectError / Failed to connect` verdi.
Ek local Supabase denemeleri: `.\node_modules\.bin\supabase.cmd status` ve `.\node_modules\.bin\supabase.cmd start` Docker Desktop named-pipe `500 Internal Server Error` nedeniyle tamamlanmadı. `DOCKER_API_VERSION=1.43` ile start tekrar denendi, sonuç değişmedi.
Manuel kontrol: `http://localhost:3000/events` desktop DOM/görsel sağlıklı; mobil 390 px hero render sağlıklı; mobil alt bölüm screenshot denemesi timeout verdi.
Kritik not: Public adapter eski kolon setine fallback yapıyor ama admin resource yeni kolonları doğrudan select edeceği için production şemada migration hazır değilse admin yüzeyi kırılabilir. Remote migration uygulanmadı. Önce local `test:db`, sonra migration/production schema durumu netleşmeli.
Başta kapsam dışı olan eski dirty dosyalar mevcut `c702ca2` commit'i içinde görünüyor: `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md`.
Sonraki görev: Task 3’ü bitirmek için önce yerel Docker/Supabase named-pipe erişimini düzelt; sonra local Supabase env açıkça verilerek `npm run test:db` çalıştır. Migration uygulama sırası netleşmeden Task 4’e geçme.
