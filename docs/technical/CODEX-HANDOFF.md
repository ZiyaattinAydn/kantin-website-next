# Codex Handoff

### Görev

Görev 2 - Kariyer sayfasındaki doodle animasyonları.

### Durum

tamamlandı

### Yapılanlar

Ana sayfadaki mevcut doodle hareket sistemindeki yavaş `transform` tabanlı drift yaklaşımı incelendi ve kariyer sayfasına module CSS içinde aynı tasarım dilinde uygulandı. Hero ve başvuru formu çevresindeki kariyer doodle'ları artık küçük x/y hareketleri ve hafif rotasyon farklarıyla yavaşça süzülüyor.

Animasyonlar yalnız `transform` ve `opacity` üzerinden çalışıyor. Absolute konumlar korunarak layout shift oluşması engellendi. Hero kartı, form kartı ve mavi bilgilendirme kartının layout değerleri değiştirilmedi. Her doodle için farklı süre, gecikme, yön ve rotasyon değişkeni tanımlandı; böylece bütün doodle'lar aynı fazda hareket etmiyor.

Mobilde hareket mesafesi CSS değişkeniyle düşürüldü: 899 px altında `0.58`, 679 px altında `0.42` ölçek kullanılıyor. `prefers-reduced-motion: reduce` durumunda tüm kariyer doodle animasyonları tamamen kapatılıyor ve `will-change` temizleniyor.

### Değişen dosyalar

- `src/components/careers/CareersPage.module.css`: hero ve form doodle'ları için yavaş float animasyonu, farklı delay/duration/yön değişkenleri, mobil hareket ölçeği ve reduced-motion kapatma kuralı eklendi.
- `tests/unit/styles/careers-doodles.test.ts`: kariyer doodle animasyon kontratı, mobil ölçek ve reduced-motion kuralı için CSS regresyon testi eklendi.

### Veritabanı etkisi

migration yok; mevcut şemayla çalışıyor.

### Test sonuçları

- `npm run test:unit -- careers-doodles public-background-grid`: geçti.
- `npm run test:unit`: geçti, 31 dosya / 88 test.
- `npm run lint`: geçti.
- `npx tsc --noEmit`: geçti.
- `npm run build`: geçti.

Not: Node/NVM kurulumu `AppData` altında olduğu için npm/npx/node komutları sandbox içinde başlayamadı; kontroller dış izinle başarıyla çalıştı.

### Manuel kontrol

Yerel mevcut dev server `http://localhost:3000` üzerinden `/careers` kontrol edildi.

- Genişlikler: 1440 px desktop ve 390 px mobil.
- Playwright computed-style kontrolü: hero/form doodle'larında `careersDoodleFloat` animasyonu aktif, `pointer-events: none`, yatay taşma yok.
- Mobil computed-style kontrolü: form doodle hareket ölçeği `0.42`.
- Reduced-motion emülasyonu: ilk 6 doodle için `animation-name: none` ve `will-change: auto`.
- Görsel kesitler: 1440 px hero, 390 px hero ve 1440 px form bölümü gözle kontrol edildi; form ve mavi bilgilendirme kartı sabit kaldı, doodle'lar düşük opaklıkta arka katmanda kaldı.

In-app Browser plugin bu oturumda yalnız talimat okumak için kullanıldı; önceki Task 1'de `node_repl`/`AppData` EPERM nedeniyle açılamadığı için manuel doğrulama yine Playwright ile yapıldı.

### Git durumu

- branch: `main`
- commit hash: `275d0cf`
- commit mesajı: `style: animate careers page doodles safely`
- push sonucu: başarılı, `origin/main` `8bbbf5e..275d0cf` aralığına ilerledi.

Not: Task 2 commit'ine yalnız Task 2 dosyaları alındı. Çalışma ağacında benden önce mevcut olan ayrı değişiklikler hâlâ duruyor: `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md`.

### Açık riskler

- Görsel doğrulama Playwright/headless ve alınan kesitlerle yapıldı; gerçek cihazda elle kaydırma kontrolü yapılmadı.
- Önceden mevcut uncommitted görsel cila değişiklikleri çalışma ağacında kaldığı için sonraki göreve başlamadan önce bu değişikliklerin commit/stash/ayrıştırma durumu yine netleştirilmeli.
- Production/Vercel kontrolü bu görev kapsamında yapılmadı; yalnız local doğrulama ve GitHub push yapıldı.

### Sonraki görev

Görev 3 - Etkinlikler sayfasını etkinlik + duyuru merkezi yap. Başlamadan önce çalışma ağacındaki mevcut uncommitted değişiklikler temizlenmeli veya açıkça kapsamlandırılmalı. Ardından mevcut `events` tablo şeması, admin resource tanımı, public data adapter, kart componentleri, filtreleme yapısı ve seed/fallback verileri incelenmeli. Mevcut şemayla çözüm mümkün değilse yalnız additive ve geriye uyumlu migration hazırlanmalı; remote migration uygulanmamalı.

### GPT'ye aktarılacak kısa özet

Kantin Website Task 2 tamamlandı ve `main` üzerinde `275d0cf` commit'i normal push ile `origin/main`e gönderildi.
Görev: `/careers` sayfasındaki doodle animasyonları.
Yapılan ana değişiklik: `src/components/careers/CareersPage.module.css` içinde hero ve form doodle'ları için `careersDoodleFloat` animasyonu eklendi.
Animasyon yalnız `transform` ve `opacity` kullanıyor; layout/konum değiştirilmedi.
Her doodle farklı delay, duration, yön ve rotasyon değişkenleri aldı; aynı fazda hareket etmiyorlar.
Mobilde hareket azaltıldı: 899 px altında `--career-doodle-scale: 0.58`, 679 px altında `0.42`.
`prefers-reduced-motion: reduce` altında `.doodle` ve `.formDoodle` animasyonları `none !important`; `will-change: auto`.
Yeni test: `tests/unit/styles/careers-doodles.test.ts`.
Geçen kontroller: `npm run test:unit -- careers-doodles public-background-grid`, `npm run test:unit`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
Manuel Playwright kontrolü: `/careers` 1440 px ve 390 px; computed style ile animasyon, mobil scale, reduced-motion ve yatay taşma doğrulandı.
Görsel kesitler: desktop hero, mobile hero ve desktop form bölümü kontrol edildi.
Migration yok, veritabanı etkisi yok.
Çalışma ağacında Task 2 dışında önceden var olan değişiklikler kaldı: `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md`.
Sonraki görev: Görev 3 - Etkinlikler sayfasını etkinlik + duyuru merkezi yap; başlamadan önce mevcut uncommitted değişikliklerin durumu netleştirilmeli.
