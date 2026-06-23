# Codex Handoff

### Görev

Görev 3 - Etkinlikler sayfasını etkinlik + duyuru merkezi yap.

### Durum

yerel implementasyon tamamlandı; push beklemede

### Yapılanlar

`events` veri modeli etkinlik ve duyuru içerik tiplerini destekleyecek şekilde genişletildi. Yeni public içerik tipi `event | announcement`; etkinliklerde başlangıç tarihi hâlâ zorunlu, duyurularda tarih zorunlu değil. Duyurular `publish_start_at` / `publish_end_at` yayın penceresine göre görünür; süresi geçmiş duyurular public normalizasyonda gizlenir.

`/events` sayfası artık iki filtre grubu gösteriyor: içerik tipi (`Tümü`, `Etkinlikler`, `Duyurular`) ve şube (`Tüm şubeler`, şube seçenekleri). Boş durum artık yalnız etkinlik yok diye duyuruları gizlemiyor; hiç içerik yoksa genel “yayınlanmış içerik yok” durumu gösteriliyor.

Etkinlik kartı duyuru rozeti, duyuru tarih alanı ve opsiyonel CTA etiketi/link desteği aldı. Tarihsiz duyurularda tarih bloğu yerine duyuru işareti gösteriliyor. Ana sayfadaki “Yaklaşan etkinlikler” bölümü yalnız gerçek etkinlikleri göstermeye devam ediyor; duyurular ana sayfa etkinlik kartlarına karışmıyor.

Admin generic resource `events` kaynağı “Etkinlikler ve duyurular” olarak genişletildi. Admin formuna `content_type`, `cta_label`, `publish_start_at`, `publish_end_at` alanları eklendi. Payload validasyonu tablo kurallarıyla hizalandı: etkinlik için açıklama ve başlangıç zorunlu, duyuru için açıklama/tarih opsiyonel, bitiş tarihleri başlangıçlardan sonra olmalı.

Public Supabase adapter yeni kolonları okuyacak şekilde güncellendi. Yeni kolonlar bulunamazsa public tarafta eski kolon setine fallback denemesi var; ancak admin CRUD resource yeni kolonları select edeceği için admin duyuru yönetimi migration uygulanmadan production şemada hazır kabul edilmemeli.

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
- `npm run test:db`: çalıştırılamadı; güvenlik script’i `NEXT_PUBLIC_SUPABASE_URL` process değişkeninin açıkça tanımlanmasını istiyor. `.env.local` okunmadı ve uzak Supabase hedefi kullanılmadı.

### Manuel kontrol

Mevcut yerel dev server `http://localhost:3000` üzerinde `/events` açıldı.

- Desktop DOM kontrolü: hero metni, iki filtre grubu, genel boş durum ve footer render oldu.
- Desktop görsel kontrol: filtreler ve boş durum kartı taşma/üst üste binme olmadan göründü.
- Mobil 390 px kontrol: hero ve mobil header render oldu; filtrelere inen ek screenshot denemesi browser screenshot timeout verdi, ama ilk mobil render ve desktop görsel kontrol sağlıklıydı.

### Git durumu

- branch: `main`
- başlangıç HEAD: `f863d67`
- push: yapılmadı
- commit: henüz yapılmadı

Push yapılmama nedeni: Bu görev production şema migration’ına bağımlı. Public adapter eski kolon setine fallback yapıyor, fakat admin resource yeni kolonları select edeceği için migration uygulanmadan push etmek production admin yüzeyini kırabilir.

Not: Görev başlamadan önce mevcut olan uncommitted değişiklikler hâlâ kapsam dışı tutuldu: `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md`.

### Açık riskler

- `test:db` yerel Supabase env değişkeni verilmediği için çalışmadı; migration ve RLS pgTAP testi henüz yerel DB’de doğrulanmadı.
- Migration uygulanmadan admin CRUD duyuru alanları production şemada kullanıma hazır değildir.
- Mobil filtre/boş durum bölümü DOM ve desktop full-page görsel ile doğrulandı; mobil alt bölüm screenshot denemesi timeout verdi.
- Local dev build sırasında `.env.local` Next tarafından ortam olarak algılandı; dosya içeriği okunmadı veya yazdırılmadı.

### Sonraki görev

Görev 3’ü tamamlamak için önce yerel Supabase hedefi açıkça process değişkeniyle verilerek `npm run test:db` çalıştırılmalı. Ardından migration uygulama/push sırası netleşmeli. Production schema hazır olmadan bu değişiklikler remote’a push edilmemeli ve Task 4’e geçilmemeli.

### GPT'ye aktarılacak kısa özet

Kantin Website Task 3 üzerinde yerel implementasyon tamamlandı ama commit/push yapılmadı; başlangıç HEAD `main` üzerinde `f863d67`.
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
Çalışmayan kontrol: `npm run test:db`; güvenlik script’i `NEXT_PUBLIC_SUPABASE_URL` process değişkeninin açıkça tanımlanmasını istedi. `.env.local` okunmadı, uzak Supabase kullanılmadı.
Manuel kontrol: `http://localhost:3000/events` desktop DOM/görsel sağlıklı; mobil 390 px hero render sağlıklı; mobil alt bölüm screenshot denemesi timeout verdi.
Kritik not: Public adapter eski kolon setine fallback yapıyor ama admin resource yeni kolonları doğrudan select edeceği için migration uygulanmadan production’a push etme. Önce local `test:db`, sonra migration/push sırası netleşmeli.
Kapsam dışı eski dirty dosyalar hâlâ var: `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md`.
Sonraki görev: Task 3’ü bitirmek için local Supabase env açıkça verilerek `npm run test:db` çalıştır; migration uygulama sırası netleşmeden Task 4’e geçme.
