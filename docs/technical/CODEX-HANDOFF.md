# Codex Handoff

### Görev

Görev 1 - Ortak nokta deseni ve arka plan hizası.

### Durum

tamamlandı

### Yapılanlar

Public sayfalardaki mavi nokta deseni section seviyesinde yeniden başlayan parçalardan çıkarılıp `.public-theme-root` üzerinde ortak bir koordinat sistemine bağlandı. `.dotted-paper`, events hero, home events, coffee bar, menu truth note, Atakent food ve Anılarımız gibi eski override alanları root desenini gösterecek şekilde şeffaflaştırıldı.

Kariyer sayfasında hero ve form section içinde ayrı `kantin-dot-pattern.png` başlatan local background tanımları kaldırıldı; careers sayfası da public root desenini kullanır hale geldi. Doodle katmanları ve koyu/mavi kart zeminleri korunarak yalnız nokta deseni tek kaynağa alındı.

Bu kontratı korumak için unit seviyesinde CSS regresyon testi eklendi. Test, root pattern değişkenini, section background resetini ve careers sayfasında local pattern başlatılmadığını doğruluyor.

### Değişen dosyalar

- `src/styles/theme.css`: public root dot pattern değişkenleri ve root background eklendi; section bazlı dotted background tekrarları kapatıldı.
- `src/components/careers/CareersPage.module.css`: careers hero/form local dot pattern tanımları kaldırıldı, wrapper transparan hale getirildi.
- `tests/unit/styles/public-background-grid.test.ts`: ortak public background grid kontratı için regresyon testi eklendi.

### Veritabanı etkisi

migration yok; mevcut şemayla çalışıyor.

### Test sonuçları

- `npm run test:unit -- public-background-grid`: geçti.
- `npm run test:unit`: geçti, 30 dosya / 87 test.
- `npm run lint`: geçti.
- `npx tsc --noEmit`: geçti.
- `npm run build`: geçti.

Not: İlk sandbox içi test denemesi Node/NVM yolundaki `AppData` erişim kısıtı nedeniyle başlamadan düştü; aynı komutlar dış izinle başarıyla çalıştı.

### Manuel kontrol

Yerel mevcut dev server `http://localhost:3000` üzerinden Playwright ile kontrol edildi.

- Sayfalar: `/`, `/events`, `/careers`, `/menu`.
- Genişlikler: 390, 768, 1024, 1440, 1920 px.
- Sonuç: `documentElement.scrollWidth === clientWidth` tüm sayfa/genişlik kombinasyonlarında doğrulandı; yatay scrollbar yok.
- Sonuç: `.public-theme-root` üzerinde `kantin-dot-pattern.png` aktif; `.dotted-paper` section'ları kendi background image değerini başlatmıyor.
- Görsel kesitler ayrıca 1440 px events/careers/menu-merch ve 390 px events/home için gözle kontrol edildi.

In-app Browser plugin bağlantısı `node_repl` tarafında `AppData` EPERM hatasıyla başlamadan kapandı; manuel doğrulama Playwright ile yapıldı.

### Git durumu

- branch: `main`
- commit hash: `b492300`
- commit mesajı: `style: unify public page background grid`
- push sonucu: başarılı, `origin/main` `68c614a..b492300` aralığına ilerledi.

Not: Task 1 commit'ine yalnız Task 1 dosyaları alındı. Çalışma ağacında benden önce mevcut olan ayrı değişiklikler hâlâ duruyor: `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md`.

### Açık riskler

- Görsel doğrulama Playwright/headless ve alınan ekran görüntüsü kesitleriyle yapıldı; gerçek cihaz/elle tarayıcı kaydırma kontrolü yapılmadı.
- Önceden mevcut uncommitted görsel cila değişiklikleri çalışma ağacında kaldığı için sonraki göreve başlamadan önce bu değişikliklerin commit/stash/ayrıştırma durumu netleştirilmeli.
- Production/Vercel kontrolü bu görev kapsamında yapılmadı; yalnız local doğrulama ve GitHub push yapıldı.

### Sonraki görev

Görev 2 - Kariyer sayfasındaki doodle animasyonları. Başlamadan önce çalışma ağacındaki mevcut uncommitted değişiklikler temizlenmeli veya açıkça kapsamlandırılmalı; ardından ana sayfadaki doodle hareket sistemi incelenip careers doodle'larına düşük hareketli, reduced-motion destekli animasyon uygulanmalı.

### GPT'ye aktarılacak kısa özet

Kantin Website Task 1 tamamlandı ve `main` üzerinde `b492300` commit'i normal push ile `origin/main`e gönderildi.
Görev: Public sayfalarda ortak nokta deseni ve arka plan hizası.
Yapılan ana değişiklik: `src/styles/theme.css` içinde dot pattern `.public-theme-root` seviyesine taşındı.
`.dotted-paper`, events/home/menu özel section override'ları root desenini kullanacak şekilde şeffaflaştırıldı.
`#anilarimiz.section.dotted-paper` ve `.atakent-food.dotted-paper` gibi yüksek özgüllüklü eski kurallar ayrıca bastırıldı.
`src/components/careers/CareersPage.module.css` içindeki hero/form local `kantin-dot-pattern.png` background başlatmaları kaldırıldı.
Yeni test: `tests/unit/styles/public-background-grid.test.ts`.
Geçen kontroller: `npm run test:unit -- public-background-grid`, `npm run test:unit`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
Manuel Playwright kontrolü: `/`, `/events`, `/careers`, `/menu` 390/768/1024/1440/1920 px.
Sonuç: tüm kontrol genişliklerinde yatay taşma yok; root pattern aktif; dotted section'lar kendi pattern'ini başlatmıyor.
In-app Browser plugin `AppData` EPERM nedeniyle açılamadı; doğrulama Playwright ile yapıldı.
Migration yok, veritabanı etkisi yok.
Çalışma ağacında Task 1 dışında önceden var olan değişiklikler kaldı: `CHANGELOG.md`, `src/components/admin/AdminQuickAccess.module.css`, `src/styles/legacy.css`, `FINAL-TASARIM-TUR-1-NOTLARI.md`.
Sonraki görev: Görev 2 - Kariyer sayfasındaki doodle animasyonları; başlamadan önce mevcut uncommitted değişikliklerin durumu netleştirilmeli.
