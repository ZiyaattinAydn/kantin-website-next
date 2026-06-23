# Codex Handoff

### Görev

Ara görev - Kahve bar zemin düzeltmesi sonrası site genelinde karikatür parallax davranışı, etkinlikler alt bölüm karikatürleri ve kariyer form layering düzeltmesi.

### Durum

Kod tamamlandı, test edildi ve commitlendi. Local DB testi hâlâ Docker/Supabase erişimi nedeniyle engelli.

### Yapılanlar

Önce `/menu` Alsancak Kahve Barı bölümünde mavi panel altında kaybolan zemin düzeltildi. Public dotted background override'ı kahve bar ve bağlı merch bölümü için fazla agresif `transparent !important` uyguluyordu. Kahve bölümü tekrar `var(--cream)` zemin ve ortak dot pattern ile çiziliyor; merch shell transparan kalıp kahve zeminiyle kesintisiz devam ediyor.

Bu oturumdaki yeni istek kapsamında merch drop bölümündeki cursor'a bağlı karikatür hareketi ortak bir client bileşenine taşındı. `DoodleParallaxStage`, fine pointer ve reduced motion kontrollerini yapıyor, pointer/mouse hareketini stage parent ölçüsüne göre CSS değişkenlerine yazıyor ve alan dışına çıkınca parallax değerlerini sıfırlıyor.

`AmbientDoodles` artık bu ortak parallax stage'i kullanıyor. Böylece ana sayfa hero, lokasyonlar, anılar, home events, menü bölümleri ve etkinlikler hero gibi AmbientDoodles kullanan tüm karikatürler aynı cursor hareketini aldı.

Merch drop tarafındaki lokal parallax state/ref/handler kodu kaldırıldı ve aynı ortak stage'e bağlandı. Menü merch showcase, footer ve kariyer sayfasındaki özel karikatür katmanları da aynı davranışı kullanacak şekilde güncellendi.

`/events` sayfasının filtre/listenin bulunduğu alt bölümüne ayrıca `events-page-lower-doodles` karikatür katmanı eklendi. Bu katman empty/list card arkasında ve alt kenarlarda düşük opaklıklı karikatürleri gösteriyor.

Son ara düzeltmede `/careers#basvuru` formunun üzerine binen karikatürler arka katmana alındı. `formDoodles` parallax katmanı aynı şekilde hareket etmeye devam ediyor; `formLayout`, `formIntro` ve `form` kendi stacking context'iyle üstte duruyor. Form kartı opak beyaz zemine alındı, böylece çizgiler başlık/input/button üstünden görünmüyor.

### Değişen dosyalar

- `src/components/effects/DoodleParallaxStage.tsx`: site genelinde kullanılacak cursor parallax stage bileşeni eklendi.
- `src/components/effects/AmbientDoodles.tsx`: AmbientDoodles ortak parallax stage ile render ediliyor.
- `src/components/home/HomeMerchDrop.tsx`: lokal pointer parallax kodu kaldırıldı, ortak stage kullanıldı.
- `src/components/merch/MenuMerchShowcase.tsx`: merch showcase karikatürleri ortak stage'e bağlandı.
- `src/components/layout/SiteFooter.tsx`: footer karikatürleri ortak stage ile sarıldı.
- `src/components/layout/SiteFooter.module.css`: footer parallax stage CSS değişkenleri ve transform'u eklendi.
- `src/components/careers/CareersPage.tsx`: hero ve başvuru formu karikatürleri ortak stage ile sarıldı.
- `src/components/careers/CareersPage.module.css`: careers hero/form parallax stage stilleri eklendi; son düzeltmede form layout/card z-index'i üst katmana alındı ve form zemini opaklaştırıldı.
- `src/components/events/EventsPageClient.tsx`: alt etkinlik/list bölgesine `events-page-lower-doodles` eklendi.
- `src/components/events/EventsPageClient.module.css`: alt etkinlik karikatürlerinin konumları, z-index ve section layering'i eklendi.
- `tests/unit/components/doodle-parallax-stage.test.tsx`: parallax CSS değişkenlerinin pointer hareketiyle yazıldığı test edildi.
- `tests/unit/components/events-page-client.test.tsx`: etkinlikler alt karikatür katmanının render olduğu kontrol edildi.
- `tests/unit/styles/careers-doodles.test.ts`: careers karikatür stage'lerinin parallax CSS kontratı ve formun doodle layer üstünde kalma kontratı eklendi.
- `src/styles/theme.css`: kahve bar zemin düzeltmesi önceki commit'te yapıldı.
- `tests/unit/styles/public-background-grid.test.ts`: kahve bar zemin kontratı önceki commit'te test edildi.

### Veritabanı etkisi

Bu ara görevde yeni migration yazılmadı, migration uygulanmadı, remote Supabase veya production veri üzerinde işlem yapılmadı.

Önceki Task 3 migration'ı hâlâ bekliyor:

- `supabase/migrations/20260623030000_event_announcements.sql`

Kritik not: Admin `events` resource yeni kolonları doğrudan select ettiği için production şemada bu migration hazır değilse admin yüzeyi kırılabilir. Remote migration bu oturumda uygulanmadı.

### Test sonuçları

- `npm run test:unit -- tests/unit/components/doodle-parallax-stage.test.tsx tests/unit/components/events-page-client.test.tsx tests/unit/styles/careers-doodles.test.ts`: geçti, 3 dosya / 5 test.
- `npm run test:unit -- tests/unit/styles/careers-doodles.test.ts`: geçti, 1 dosya / 1 test.
- `npm run test:unit`: geçti, 35 dosya / 99 test.
- `npx tsc --noEmit`: geçti.
- `npm run lint`: geçti.
- Browser manuel kontrol: `http://127.0.0.1:3000/events` üzerinde hero ve alt etkinlik bölümü render edildi. DOM kontrolünde hero karikatürleri 9, alt bölüm karikatürleri 9 adet göründü. Screenshot ile empty card arkasında ve alt kenarda karikatürlerin göründüğü doğrulandı.
- Browser manuel kontrol: `http://127.0.0.1:3000/careers#basvuru` üzerinde form layering doğrulandı. DOM'da `formDoodles` z-index `0`, `formLayout` ve `form` z-index `1`, form background `rgb(255, 255, 255)` döndü; screenshot'ta karikatürler form kartının içine binmeden arka zeminde kaldı.

Önceki blokaj aynen sürüyor:

- `npm run test:db`: önceki denemede `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` local hedefi doğrulandı, fakat local Postgres bağlantısı `LegacyDbConnectError / Failed to connect` verdi.
- `.\node_modules\.bin\supabase.cmd status` ve `.\node_modules\.bin\supabase.cmd start`: Docker Desktop named-pipe `500 Internal Server Error` nedeniyle tamamlanamadı.

### Manuel kontrol

- `/menu#kahve-bari`: önceki commit sonrası kahve bar computed style krem zemin + dot pattern + mavi metin döndürdü; screenshot'ta intro/listeler okunur göründü.
- `/events`: bu görev sonrası alt etkinlik/list bölgesinde ek karikatürler göründü. İn-app browser otomasyonunda fiziksel cursor hareketi CSS değişkenlerini güvenilir şekilde raporlamadı; davranış `DoodleParallaxStage` unit testiyle doğrulandı.
- `/careers#basvuru`: form alanında karikatürler arka planda kaldı; hareket katmanı DOM'da 18 karikatürle korunuyor.

### Git durumu

- branch: `main`
- kahve bar düzeltme commit'i: `2fdd1c2 fix: restore coffee bar background`
- kahve bar handoff commit'i: `64c196a docs: update codex handoff for coffee bar fix`
- karikatür parallax commit'i: `1185be3 feat: add sitewide doodle parallax`
- kariyer form layering commit'i: `5fd4aaa fix: keep career form above doodles`
- önceki Task 3 commit'i: `c702ca2 codex tasarimsal duzenlemeler`

### Açık riskler

- `test:db` local Docker/Supabase bağlantı problemi nedeniyle hâlâ çalıştırılamadı.
- Task 3 migration'ı local DB'de pgTAP ile doğrulanmadı ve remote'a uygulanmadı.
- Production schema migration sırası netleşmeden Task 3'teki admin duyuru yönetimi production için hazır kabul edilmemeli.
- Browser otomasyonunda cursor hareketi CSS değişkenini ölçmek güvenilir sinyal vermedi; parallax davranışı unit test ile doğrulandı ve render görsel olarak kontrol edildi.

### Sonraki görev

Task 3'ü gerçekten kapatmak için önce yerel Docker/Supabase named-pipe erişimi düzeltilmeli. Ardından PowerShell'de local env açıkça verilerek `npm run test:db` çalıştırılmalı. Migration uygulama/push sırası netleşmeden Task 4'e geçilmemeli.

### GPT'ye aktarılacak kısa özet

Kantin Website `main` üzerinde çalışılıyor. Son stabil commitler:
- `c702ca2 codex tasarimsal duzenlemeler`: Task 3 etkinlik + duyuru merkezi implementasyonu.
- `2fdd1c2 fix: restore coffee bar background`: `/menu#kahve-bari` zemin düzeltmesi.
- `64c196a docs: update codex handoff for coffee bar fix`: önceki handoff dokümanı.
- `1185be3 feat: add sitewide doodle parallax`: bu oturumdaki karikatür parallax işi.
- `5fd4aaa fix: keep career form above doodles`: kariyer başvuru formunu karikatür layer üstüne alma düzeltmesi.

Bu oturumda önceki kahve bar bozulması düzeltilmiş durumdaydı. Yeni istek: etkinlikler sayfasının aşağı kısmına karikatür eklemek ve merch drop'taki cursor'a göre aşağı/yukarı hareket davranışını sitedeki bütün karikatürlere yaymak.

Ek ara istek: iş başvurusu sayfasında formun üzerine binen karikatürleri formun arka planına almak, hareket özelliklerini bozmamak.

Yapılanlar:
- `src/components/effects/DoodleParallaxStage.tsx` eklendi. Fine pointer ve reduced motion kontrolü yapıyor, `pointermove`/`mousemove` ile `--parallax-x` ve `--parallax-y` CSS değişkenlerini güncelliyor, alan dışına çıkınca sıfırlıyor.
- `AmbientDoodles` ortak stage'e taşındı; AmbientDoodles kullanan site karikatürleri artık cursor parallax alıyor.
- `HomeMerchDrop` içindeki lokal parallax handler/ref kodu kaldırıldı; ortak stage kullanıldı.
- `MenuMerchShowcase`, `SiteFooter`, `CareersPage` hero/form karikatürleri ortak stage'e bağlandı.
- `/events` alt section içine `AmbientDoodles className="events-page-lower-doodles" preset="memories"` eklendi.
- `EventsPageClient.module.css` içinde alt karikatürlerin konumları, layering ve z-index düzenlendi.
- `CareersPage.module.css` içinde form layout ve form kartı `z-index: 1` ile doodle layer'ın üstüne alındı; form background `var(--white)` yapıldı. `formDoodles` parallax katmanı ve animasyonları korunuyor.
- Unit testler eklendi/güncellendi: `tests/unit/components/doodle-parallax-stage.test.tsx`, `tests/unit/components/events-page-client.test.tsx`, `tests/unit/styles/careers-doodles.test.ts`.

Geçen kontroller:
- `npm run test:unit -- tests/unit/components/doodle-parallax-stage.test.tsx tests/unit/components/events-page-client.test.tsx tests/unit/styles/careers-doodles.test.ts`: geçti, 3 dosya / 5 test.
- `npm run test:unit -- tests/unit/styles/careers-doodles.test.ts`: geçti, 1 dosya / 1 test.
- `npm run test:unit`: geçti, 35 dosya / 99 test.
- `npx tsc --noEmit`: geçti.
- `npm run lint`: geçti.
- Browser manuel kontrol: `http://127.0.0.1:3000/events` üzerinde hero ve alt bölüm render edildi; DOM'da hero 9 karikatür, alt bölüm 9 karikatür gördü; screenshot'ta empty card arkasında/altında karikatürler göründü.
- Browser manuel kontrol: `http://127.0.0.1:3000/careers#basvuru` üzerinde formun opak beyaz zeminde ve karikatürlerin arka planda kaldığı doğrulandı.

Çalışmayan/ertelenen kontrol:
- `npm run test:db` önceki denemelerde local Docker/Supabase named-pipe `500 Internal Server Error` ve Postgres `LegacyDbConnectError / Failed to connect` nedeniyle çalıştırılamadı. Remote Supabase migration uygulanmadı.

Önemli risk:
- Task 3 migration'ı `supabase/migrations/20260623030000_event_announcements.sql` hâlâ local DB'de pgTAP ile doğrulanmadı ve remote'a uygulanmadı. Admin events resource yeni kolonları select ettiği için production schema migration hazır değilse admin duyuru yönetimi kırılabilir.

Sonraki görev:
- Önce local Docker/Supabase named-pipe erişimini düzelt.
- Sonra local Supabase env açıkça verilerek `npm run test:db` çalıştır.
- Migration uygulama ve production schema sırası netleşmeden Task 4'e geçme.
