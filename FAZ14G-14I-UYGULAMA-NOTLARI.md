# Faz 14G-14I Uygulama Notları

## Genel durum

Bu paket, Faz 14F tamamlanmış kaynak üzerine Faz 14G, Faz 14H ve Faz 14I çalışmalarını uygular.

- Faz 14G: dinamik şube ve kategori altyapısı
- Faz 14H: güvenli teknik temizlik
- Faz 14I: kontrollü bağımlılık güvenlik denetimi

Docker gerektiren migration, pgTAP, gerçek Storage ve authenticated Playwright doğrulamaları bu pakette çalıştırılmamıştır; yarınki entegrasyon aşamasına bırakılmıştır.

## Faz 14G

- Şube kimlikleri sabit Alsancak/Atakent union tipinden dinamik string modeline geçirildi.
- Menü şube sekmeleri ve `?sube=` seçimi canlı aktif şube listesine bağlandı.
- Alsancak ve Atakent'in özel tasarımları korundu.
- Yeni şubeler ve yeni kategoriler için genel kategori renderer'ı eklendi.
- Etkinlik filtreleri, merch ilişkileri, kariyer şube seçenekleri ve ana sayfa kartları dinamikleştirildi.
- Üçüncü şube ve yeni kategori regresyon testleri eklendi.

## Faz 14H

- Kullanılmayan eski content dosyaları kaldırıldı.
- Kullanılmayan menü/etkinlik componentleri kaldırıldı.
- Kariyer ve etkinlik katmanlarındaki artık kullanılmayan statik exportlar temizlendi.
- `legacy.css`, seed/fallback ve deployment scriptleri körlemesine silinmedi; güvenli temizlik sınırları belgelendi.

## Faz 14I

- `npm audit` başlangıcında PostCSS zincirinden gelen iki moderate bulgu tespit edildi.
- `package.json` içinde PostCSS `8.5.15` sürümüne kontrollü override eklendi.
- Next.js 16.2.9 ve Vite aynı güvenli PostCSS sürümünde tekilleşti.
- Son `npm audit` sonucu sıfır güvenlik bulgusu verdi.
- Sunum öncesinde kırılma riski oluşturmaması için major ESLint, TypeScript ve Node tip yükseltmeleri uygulanmadı.

## Otomatik doğrulama

- Unit test: 29 dosya, 86 test başarılı
- ESLint: başarılı
- TypeScript: başarılı
- Next.js production build: başarılı
- `npm audit`: 0 vulnerability

## Uygulama sırası

1. Değişen dosyalar ZIP'ini proje köküne çıkar ve mevcut dosyaların üzerine yaz.
2. `FAZ14G-14I-SILINECEK-DOSYALAR.txt` içindeki yedi eski dosyayı sil.
3. Bağımlılık kilidi değiştiği için `npm install` çalıştır.
4. Aşağıdaki kontrolleri çalıştır:

```bash
npm run test:unit
npm run lint
npx tsc --noEmit
npm run build
npm audit
git diff --check
git status --short
```

## Silme komutu — Git Bash

```bash
rm -f \
  src/content/admin.ts \
  src/content/home.ts \
  src/content/menu.ts \
  src/content/site.ts \
  src/components/events/EventCards.tsx \
  src/components/home/HomeMenuBranchCard.tsx \
  src/components/layout/navigation.ts
```

## Manuel kontrol — Docker öncesi

- `/`
- `/menu?sube=alsancak`
- `/menu?sube=atakent`
- `/menu?sube=olmayan-sube`
- `/events`
- `/careers`
- Mobil ve masaüstü header

Canlı veri uyarısı, gerçek Supabase bağlantısı ve migration doğrulaması Docker aşamasında ayrıca incelenecektir.
