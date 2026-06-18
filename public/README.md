# kantin-website-final

Bu sürümde Alsancak ve Atakent menüleri tamamen ayrılmıştır.

## Sayfalar

- `index.html`: Ana sayfa, şube ayrımı, adresler ve dinamik etkinlik alanı
- `menu.html`: Alsancak / Atakent menü seçimi
- `events.html`: Yalnızca yayınlanmış gerçek etkinlikler
- `admin.html`: Etkinlik ekleme, düzenleme, taslak/yayın ve silme paneli

## Şube ayrımı

### Alsancak

- Kokteyl gösterilmez.
- Fıçı ve şişe bira, şarap, fritöz, fırın, deli ve salata ürünleri bulunur.
- Patates kızartmasında 2 ücretsiz sos seçimi belirtilmiştir.
- Tortilla cipste 1 ücretsiz sos seçimi belirtilmiştir.
- Pretzel cheddar sos ile gösterilir.
- Tavuk kızartması ve Frankfurter coleslaw ile gösterilir.
- Çıtır Chili Tavuk “acılı” olarak işaretlenir.
- Tüm sandviçlerin ikiye bölünerek servis edildiği tatlı bir notla belirtilir.

### Atakent

- Bubble ve house kokteyller yalnızca bu şubede görünür.
- Atakent’e özel Aperitifs + Grill menüsü ayrı krem/noktalı bölümde gösterilir.
- Izgara şişlerinin 17:00’dan itibaren servis edildiği belirtilir.

## Adresler ve sosyal medya

- Alsancak: 1464. Sokak No:71/A, Alsancak, Konak / İzmir
- Atakent: 2035 Sokak No:6, Atakent, Karşıyaka / İzmir
- Instagram: https://www.instagram.com/kantinizmir/

## Yerelde çalıştırma

Dosyaları doğrudan `file://` ile açma. JavaScript modülleri ve JSON verisi için küçük bir sunucu kullan:

```bash
python -m http.server 8080
```

Sonra:

```text
http://localhost:8080
```

## Yönetici panelini hemen deneme

1. `admin.html` sayfasını aç.
2. “Demo panelini aç” butonuna bas.
3. Bir etkinlik ekle ve durumunu “Yayında” seç.
4. Aynı tarayıcıda `events.html` veya `index.html` sayfasını yenile.

Demo kayıtları yalnızca o tarayıcının `localStorage` alanında tutulur. Başka cihazlarda görünmez.

# Canlı yönetici paneli kurulumu — Firebase

Panel, Firebase Authentication + Cloud Firestore ile canlı çalışmaya hazırdır.

## 1. Firebase projesi oluştur

Firebase Console’da yeni bir proje oluştur ve bir Web App ekle.

## 2. Authentication aç

- Authentication → Sign-in method
- Email/Password sağlayıcısını etkinleştir
- Users bölümünden yönetici için bir kullanıcı oluştur

## 3. Firestore aç

Cloud Firestore veritabanını oluştur.

## 4. Web yapılandırmasını ekle

Firebase’in verdiği yapılandırma değerlerini şu dosyaya yaz:

```text
assets/js/firebase-config.js
```

Örnek:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 5. Yönetici UID belgesi oluştur

Authentication → Users bölümündeki kullanıcının UID değerini kopyala.

Firestore’da şu belgeyi oluştur:

```text
admins / KULLANICI_UID
```

Belgenin içine örnek olarak:

```text
role: "admin"
```

ekleyebilirsin. Panel yalnızca `admins/{uid}` belgesi bulunan kullanıcıları kabul eder.

## 6. Güvenlik kurallarını yayınla

Paketteki `firestore.rules` dosyasını Firestore Rules alanına yapıştırıp yayınla.

Kurallar:

- Herkes yalnızca `published` etkinlikleri okuyabilir.
- Taslakları yalnızca yönetici görebilir.
- Etkinlik ekleme, düzenleme ve silme yalnızca yetkili yöneticiye açıktır.

## 7. Siteyi yayınla

Firebase Hosting kullanmak istersen:

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

Pakette temel `firebase.json` dosyası da bulunur.

## Önemli

- `firebaseConfig` değerlerinin tarayıcıda görünmesi normaldir; güvenliği Firestore Rules ve Authentication sağlar.
- `admin.html` bağlantısını ana navigasyona ekleme. Adresi yalnızca yetkililer bilsin.
- Güvenlik için yönetici hesabında güçlü ve benzersiz bir şifre kullan.
- Menü fiyatlarını canlıya almadan önce işletmedeki güncel listeyle tekrar karşılaştır.


## mobil düzeltmeleri

- Mobil tam ekran menünün header içine sıkışmasına neden olan `backdrop-filter` davranışı kaldırıldı.
- Mobil menü artık `100dvh` yüksekliğinde, kaydırılabilir ve güvenli alan boşluklarını destekler.
- Menü açıkken `kantin.` logosu beyaz görünür.
- Reveal animasyonları progressive enhancement biçimine çevrildi:
  JavaScript yüklenmese veya IntersectionObserver tetiklenmese bile metinler görünür kalır.
- Şube sekmesi değiştirildiğinde yeni paneldeki içerikler doğrudan görünür yapılır.
- CSS ve JavaScript bağlantılarına `?v=4` eklendi; eski tarayıcı önbelleğinin kırık dosyaları göstermesi önlenir.


## son görsel düzeltmeler

- Siyah slogan şeridi iki eş ve ekran genişliğini tamamen kaplayan gruba ayrıldı.
- Geniş monitörlerde sloganın yarıda bitip siyah boşluk bırakması giderildi.
- Animasyon döngüsündeki başlangıç/bitiş boşluğu kaldırıldı.
- Noktalı krem doku yalnızca `body` üzerinde üretiliyor.
- `dotted-paper` bölümleri artık deseni yeniden başlatmadığı için etkinlik ve şube bölümü arasındaki nokta kayması giderildi.
- CSS ve JavaScript bağlantıları `?v=5` ile önbellekten ayrıldı.


## küçük metin düzeltmesi

- Ana sayfadaki siyah slogan şeridinde en sağda görünen son ayırıcı nokta kaldırıldı.
- HTML sürümü `?v=6` ile önbellekten ayrıldı.


## .1 —  tabanlı kontrollü responsive düzeltme

- v7 ve v8 responsive kuralları kullanılmadı; çalışma doğrudan  paketinden üretildi.
- Mobil siyah slogan bandı korundu.
- Mobilde slogan bandının altındaki mavi şube bölümü, üst hero illüstrasyonuyla aynı 16 px dış boşlukla ortalandı.
- `Etkinlikler.` başlığındaki mavi noktanın alt satıra kopması engellendi.
- Sayfa hero alanı 980 px altında tek sütunda, 980 px ve üzerinde iki sütunda çalışır. Bu sayede dikey monitörde uzak görünüm masaüstü kalır; zoom arttıkça doğal biçimde tek sütuna geçer.
- Menüdeki dekoratif `01`, `02`, `03` numaraları kaldırıldı.
- Önbellek sürümü `?v=61` olarak güncellendi.


## rötuşları

- Mobilde ortalanmış mavi şube alanının alt köşeleri de ovalleştirildi.
- `Şubeni seç.` ve `Etkinlikler.` başlıkları bir miktar büyütüldü.
- Mavi menü panellerindeki başlık noktaları beyaz yapıldı.
- Kullanılabilir viewport 980 px altına düştüğünde:
  - Ana sayfadaki Alsancak / Atakent menü kartları alt alta geçer.
  - Şube adres kartları alt alta geçer.
- Menüdeki büyük `Bira + yanında.` ve `Kokteyl + fıçı.` başlıkları
  1050 px altındaki kullanılabilir genişlikte sola hizalanır.
- Normal geniş masaüstünde iki sütunlu görünüm korunur.
- Önbellek sürümü `6-final` olarak güncellendi.


## Yeni eklenen bölüm
- Sadece Alsancak şubesine özel Merch Drop bölümü eklendi.
- Ana sayfada teaser, Alsancak menü panelinde detaylı ürün/fiyat alanı mevcut.
- Tişörtün arka karikatür baskısı, açılan etkileşimli kart ile gösteriliyor.

## Merch Drop animasyonlu arka plan sürümü

- Alsancak Merch Drop alanına krem noktalı arka plan teması uygulandı.
- Tişört baskısındaki karikatürler ayrı şeffaf görsellere dönüştürülerek bölüm arka planına dağıtıldı.
- Karakterlere yumuşak süzülme animasyonları, hareketli kesik çizgiler ve küçük parıltılar eklendi.
- Masaüstünde imleç hareketine göre hafif paralaks efekti çalışır.
- Mobilde kalabalığı önlemek için karakter sayısı ve görünürlüğü otomatik azaltılır.
- `prefers-reduced-motion` desteğiyle hareket azaltma tercihi olan cihazlarda animasyonlar kapatılır.


## Aşama 1 — İçerik ve Kahve Barı
- Fotoğraftaki Alsancak menü panosuna göre Belfast, Efes Pilsen, Bud ve Ege Sandviç fiyatları düzeltildi.
- Alsancak menüsüne Kahve Barı kategorisi eklendi.
- Kahve, spesiyal, matcha, tatlı, ekstra ve alternatif süt fiyatları pano verilerine göre girildi.
- Ana sayfadaki Alsancak tanıtımına Kahve Barı vurgusu eklendi.


## Kahve Barı sıralama güncellemesi
- Kahve Barı, Alsancak menüsünde Merch Drop bölümünün üstüne taşındı.
- Merch Drop, Alsancak panelinin en son bölümü olarak bırakıldı.
- Kahve alanındaki noktalı zemin ve animasyonlu karikatür katmanları korundu.
- Kahve ile Merch Drop arasındaki gereksiz boşluk kaldırıldı.


## Kahve / Merch / Atakent geçiş güncellemesi
- Kahve ve Merch Drop arasında oluşan açık-koyu krem farkı kaldırıldı.
- İki bölüm aynı krem ve noktalı arka planı kullanacak şekilde birleştirildi.
- Atakent yemek menüsüne kahve bölümündeki üst oval geçiş eklendi.
- Animasyonlu karikatür katmanları korunmuştur.

---

## Phase 2 — Ana sayfa şube görselleri

Bu turda yapılanlar:
- Ana sayfadaki mavi şube seçim kartlarına gerçek şube fotoğrafları arka plan olarak eklendi.
- `ALS` ve `ATA` tipografileri korunarak görseller yarı saydam katman altında bırakıldı.
- `Şubeler` bölümündeki kart görselleri soyut çizimlerden gerçek mekân fotoğraflarına geçirildi.
- Her şube kartında iki fotoğraf birlikte kullanıldı; kart boyutları korunurken `object-fit: cover` ile temiz yerleşim sağlandı.
- Yeni görseller `assets/img/branches/` klasörüne eklendi.

Dokunulan dosyalar:
- `index.html`
- `assets/css/style.css`
- `assets/img/branches/alsancak-1.jpg`
- `assets/img/branches/alsancak-2.jpg`
- `assets/img/branches/atakent-1.png`
- `assets/img/branches/atakent-2.png`


---

## Phase 2.1 — ALS / ATA iki katmanlı yazı

- Şube kartlarındaki ALS ve ATA ifadeleri iki katmanlı hale getirildi.
- Arka katman fotoğrafların gerisinde, ön katman fotoğrafların üzerinde düşük opaklıkla görünür.
- Fotoğraf boyutları, kart ölçüleri ve şube renkleri korunmuştur.
- Mobil ekranlarda watermark boyutu ayrıca sınırlandırılmıştır.


## Phase 2.3 — ALS / ATA fotoğraf üstü görünürlük

- Ön watermark katmanı fotoğraf grubunun merkezine taşındı.
- Opaklık artırılarak ALS / ATA yazıları fotoğrafların üzerinde görünür hale getirildi.
- Arka watermark katmanı korunarak iki katmanlı görünüm devam ettirildi.
- Mobil görünümde merkezleme ve yazı boyutu ayrıca ayarlandı.


---

## Merch Drop etkileşim düzeltmesi

- Tişört kartı artık yalnızca imleç doğrudan fotoğrafın üzerindeyken hover ile döner.
- Metin veya kartın boş alanı fotoğraf dönüşünü tetiklemez.
- “Tasarımı aç” butonu kalıcı aç/kapat işleviyle çalışır.
- Mobilde fotoğrafa dokunarak, klavyede Enter/Boşluk ile kart açılıp kapatılabilir.
- Escape tuşu açık kartı kapatır.


## Menü içerik güncellemesi — v10

- Şube fotoğraflarının opaklığı masaüstü ve mobilde hafifçe azaltıldı.
- Header `kantin.` logosu footer logosuyla aynı boyuta getirildi.
- Kaşar Sandviç adı Kasap Sandviç olarak düzeltildi.
- Ege, Kasap ve Ballı Jambon sandviç içerikleri eklendi.
- Sanayi Tabağı, peynirler ve tüm deli şişleri detaylandırıldı.
- Bira Salataları Pasta Fredda ve Patates Salata olarak ayrıldı; vegan, yarım porsiyon ve yarım+yarım seçenekleri eklendi.
- Mexican hazırlanabilme bilgisi iki şubenin fıçı bira alanına eklendi.


## Menü içerik ve Merch etkileşim düzeltmesi
- Menü sayfasındaki “Tasarımı aç” butonu ve fotoğraf tetikleyicisi sağlamlaştırıldı.
- Tulum, eski kaşar ve karışık küp peynir porsiyonları bağımsız menü satırlarına dönüştürüldü.
- Fiyat bilgisi verilmediği için küp peynir porsiyonlarına tahmini fiyat eklenmedi.


---

## Menü içerik güncellemesi — v13

- Küp peynir porsiyon fiyatları yarım ₺50, tam ₺100 olarak güncellendi.
- Eski Kaşar Peyniri açıklaması referans görseldeki metinle değiştirildi: Antep Fıstığı Ezmesi, Stracciatella Peyniri, Mortadella ve Roka.


---

## Menü yerleşimi güncellemesi

Alsancak menüsündeki uzunluk ve boşluk sorunu için içerikler bağımsız iki sütun halinde düzenlendi:
- Sol sütun: Deli + Salata, ardından Fritöz
- Sağ sütun: Şaraplar, ardından Fırın

Masaüstünde iki sütun birbirinden bağımsız akar; mobilde tek sütuna geçer.

## Menü yerleşimi — v15

- Sol sütunda Deli + Salata ve Bira Salataları korunmuştur.
- Sağ sütun sırası Şaraplar, Fritöz ve Fırın olarak düzenlenmiştir.
- Fritöz, Fırın bölümünün hemen üstüne taşınmıştır.
- Ardışık bölümlerde oluşan çift ayırıcı çizgi tek çizgi görünümüne indirilmiştir.
- Mobil görünüm tek sütunlu akışını korur.


## v16 — Menü sütun hizası
- Çerez ile Bira Salataları arasındaki çift ayırıcı çizgi tek çizgiye indirildi.
- Sol sütundaki gereksiz dikey boşluk azaltıldı.
- Sol ve sağ içerik sütunlarının alt bitişleri daha dengeli hale getirildi.


---

## Mobil Merch kartı dokunma düzeltmesi

- Ana sayfa ve menüdeki tişört kartı her dokunuşta açılıp kapanır.
- Mobil tarayıcılardaki kalıcı hover/focus davranışı kaldırıldı.
- Hover önizlemesi yalnızca fare destekleyen cihazlarda çalışır.
- Klavye erişilebilirliği ve odak görünümü korunur.


---

## Kısa tester / bug-fix turu

- Menü sayfasının ilk açılışta otomatik olarak aşağı kayması engellendi.
- Mobil navigasyona odak döngüsü, Escape ile kapanma ve odak geri yükleme eklendi.
- `100vw` kullanan tam genişlikte bölümlerin yatay taşma ihtimali `overflow-x: clip` ile kapatıldı.
- Güncel CSS/JS dosyalarının GitHub Pages önbelleğinde eski kalmaması için sürüm parametreleri yenilendi.
- Devam eden etkinliklerin başlangıç saatinden sonra kaybolmaması sağlandı.
- Yönetici panelindeki etkinlik görseli alanı artık ana sayfa ve etkinlik listesindeki kartlarda kullanılabiliyor.
- Atakent şube görselleri WebP formatına çevrilerek toplam boyutları düşürüldü.
- Şube görsellerine doğal genişlik/yükseklik bilgileri eklenerek yerleşim kayması azaltıldı.
- Klavye kullanıcıları için görünür odak stilleri güçlendirildi.
