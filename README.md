# Kantin Website

Kantin Alsancak ve Atakent şubeleri için geliştirilen Next.js, React ve TypeScript tabanlı web sitesi.

## Yerel çalışma

```bash
npm install
npm run dev
```

Tarayıcı: `http://localhost:3000`

## Kalite kontrolleri

```bash
npm run lint
npm run build
```

Her teslimden önce iki komutun da hatasız tamamlanması beklenir.

## Sayfalar

- `/` — Ana sayfa
- `/menu` — Şubeye özel menüler
- `/events` — Etkinlik listesi
- `/admin` — Geçici etkinlik yönetimi

## Proje yapısı

```text
src/
├─ app/                 Next.js sayfaları ve metadata
├─ components/
│  ├─ cards/            Tekrar kullanılabilir kartlar
│  ├─ effects/          Görsel efekt ve reveal davranışları
│  ├─ events/           Etkinlik sayfasına özel bileşenler
│  ├─ home/             Ana sayfa bölümleri
│  ├─ layout/           Header, footer ve sayfa kabuğu
│  ├─ menu/             Menü sayfası bölümleri
│  ├─ merch/            Merch alanına özel etkileşimler
│  └─ ui/               Ortak buton ve bölüm başlıkları
├─ content/             Geçici admin HTML içeriği
├─ data/                Site, şube, menü, merch ve etkinlik verileri
├─ lib/                 Veri dönüştürme ve yardımcı fonksiyonlar
├─ styles/              Global tasarım tokenları ve sayfa stilleri
└─ types/               Domain, içerik ve menü TypeScript modelleri
```

## Veri katmanı

Arayüz metinleri ve statik veriler component dosyalarının dışında tutulur:

- `src/data/branches.ts` — Şubelerin tek doğruluk kaynağı
- `src/data/menu.ts` — Menü içerikleri ve şube seçimi
- `src/data/merch.ts` — Merch ürünleri, bundle fiyatları ve doodle görselleri
- `src/data/events.ts` — Etkinlik filtreleri, şube etiketleri ve adresleri
- `src/data/home.ts` — Ana sayfaya özel içerikler
- `src/data/site.ts` — Navigasyon, footer ve site kimliği

Etkinliklerin geçici çalışma verisi `public/data/events.json` dosyasındadır. Supabase bağlantısından sonra bu dosyanın yerini veritabanı sorguları alacaktır.

## TypeScript modelleri

`src/types/domain.ts` içinde backend ve yönetici paneline temel olacak modeller bulunur:

- `Branch`
- `Category`
- `MenuItem`
- `Event`
- `MerchProduct`

Arayüze özel veri biçimleri `src/types/content.ts` ve `src/types/menu.ts` altında ayrılmıştır. Böylece veritabanı modelleri ile ekranda kullanılan sunum modelleri birbirine karışmaz.

## Ortak componentler

- `ActionLink` — Ortak link/buton varyantları
- `SectionHeader` — Tekrarlanan bölüm başlıkları
- `MenuCard` — Ana sayfadaki şube menüsü kartları
- `EventCard` — Ana sayfa ve etkinlik listesi varyantları
- `MerchCard` — Ana sayfa ve menü detay varyantları

## Yayın düzeni

- `develop` branch'i Vercel Preview ortamına gider.
- `main` production branch'idir ve şimdilik kullanılmaz.
- `.env*`, `.vercel`, `.next` ve `node_modules` GitHub'a gönderilmez.
- Vercel ile ilgili mevcut proje dosyaları korunur.

## Backend yol haritası

1. Tasarım ve içeriklerin son kontrollerini tamamla.
2. Supabase tablolarını domain modellerine göre oluştur.
3. Menü, etkinlik, merch, şube ve form verilerini Supabase'e taşı.
4. Supabase Authentication ile yönetici girişini kur.
5. Admin panelinde ekleme, güncelleme, silme ve görsel yükleme işlemlerini bağla.
6. Demo/Firebase uyumluluk katmanını kaldır.

Mevcut admin sayfası geçici demo/Firebase uyumluluk katmanını kullanır. Gerçek yönetici sistemi Supabase aşamasında geliştirilecektir.

## 4. gün — ilk tasarım paketi

Tamamlanan düzenlemeler:

- Marka sloganı tüm görünür alanlarda `Savor the sip. Share the bite.` olarak standartlaştırıldı.
- Header navigasyonu sadeleştirildi: “Menü” bağlantısı korundu; yinelenen “Şubeler” ve “Şubeni seç” yönlendirmeleri kaldırıldı.
- Header logosu Kantin marka mavisine geçirildi.
- Şube değişiminde seçilen menünün başlangıcına, hareket azaltma tercihine saygılı yumuşak geçiş eklendi.
- Menü sonundaki “Şube seçimine dön” bağlantısı kaldırıldı.
- Alsancak menüsünün mobil akışı bira, şarap, fritöz, fırın, deli + salata, sos, kahve ve merch sırasına getirildi.
- Ana sayfa hero etiketleri gerçek bağlantılara dönüştürülerek hover, focus ve dokunma durumları geliştirildi.
- Reveal animasyonları mobil için kısaltıldı ve görünmeyen/kapalı içeriklerin gereksiz gözlemlenmesi önlendi.

## 4. gün — Merch görsel önizleme paketi

- Ana sayfadaki tote çanta ve baseball şapka görselleri büyütülebilir hale getirildi.
- Menü sayfasındaki aynı ürünlere küçük görsel önizleme düğmeleri eklendi.
- Ortak `MerchImageLightbox` bileşeni ile iki sayfada aynı erişilebilir modal kullanıldı.
- Modal arka plana tıklama, Escape tuşu, kapatma düğmesi ve klavye odak döngüsünü destekler.
- Modal açıkken sayfa kaydırması kilitlenir; kapatıldığında odak açan ürüne geri döner.
- Mobil ekranlarda dialog düzeni tek sütuna geçer ve ekran yüksekliğine göre kaydırılabilir.

## 4. gün — ana sayfa fotoğraf değerlendirmesi

- Mevcut iki Alsancak ve iki Atakent fotoğrafı geçici kullanım için yeterli bulundu; yeni çekimler gelene kadar korundu.
- Menü kartları ile şube kartlarında masaüstü ve mobil kadraj odakları yeniden ayarlandı.
- Atakent görsellerinin ışık farkı hafif parlaklık/kontrast dengesiyle eşitlendi.
- Şube fotoğraflarındaki mavi alt zemin kaynaklı solukluk kaldırıldı; çok hafif marka tonu katmanı korundu.
- Dosya boyutları mevcut kullanım için kabul edilebilir olduğundan yeniden sıkıştırma yapılmadı; gelecekteki yüksek kaliteli çekimler doğrudan aynı veri alanlarından değiştirilebilir.

### 4. Gün — İllüstratif beyaz alan düzenlemesi
- Ana sayfadaki etkinlik alanı, okunabilirliği bozmayan noktalı zemin ve seçili Kantin karikatürleriyle zenginleştirildi.
- Tüm karikatürleri her alana yığmak yerine etkinlik bölümüne özel düşük yoğunluklu bir doodle preset'i tanımlandı.
- Mobil görünümde illüstrasyon sayısı ve boyutları azaltıldı; `prefers-reduced-motion` desteği korundu.
- Etkinlik kartlarına hafif yarı saydam zemin verilerek arka plan çizimleri üzerinde metin kontrastı güvenceye alındı.
