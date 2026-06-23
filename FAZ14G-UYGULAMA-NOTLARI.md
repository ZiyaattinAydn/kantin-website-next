# Faz 14G Uygulama Notları

## Kapsam

Faz 14G, mevcut Alsancak ve Atakent tasarımını koruyarak public veri ve arayüz katmanını yeni şube/kategori eklenmesine uygun hale getirir.

## Tamamlananlar

- `BranchId`, şube kodu ve public şube haritaları dinamik string modeline geçirildi.
- Public common/home/menu/events/merch adaptörlerindeki iki şube filtresi kaldırıldı.
- Menü seçici, URL `?sube=` doğrulaması ve panel ref yönetimi sınırsız şube listesine uygun hale getirildi.
- Yeni şubeler için `price_table`, `compact`, `cards`, `editorial`, `feature`, `coffee` ve `custom` kategori tiplerini güvenli biçimde gösteren genel panel eklendi.
- Alsancak/Atakent'e eklenen ancak zengin renderer tarafından tanınmayan yeni kategoriler genel renderer ile gösterilir.
- Etkinlik filtreleri ve şube/adres etiketleri canlı şube listesinden oluşturulur.
- Kariyer sayfası şube seçeneklerini public şube verisinden alır; sunucu doğrulaması yeni slug değerlerini kabul eder ve nihai varlık kontrolünü RPC'ye bırakır.
- Ana sayfa yeni şubeler için görselsiz ama işlevsel menü/konum kartı üretir.

## Test sonucu

- Unit: 29 dosya, 86 test başarılı.
- ESLint: başarılı.
- TypeScript: başarılı.
- Next.js production build: başarılı.

## Uygulama

Değişen dosya paketini proje köküne çıkar ve mevcut dosyaların üzerine yaz.

```bash
npm run test:unit
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

## Manuel kontrol

- `/menu?sube=alsancak`
- `/menu?sube=atakent`
- Geçersiz `/menu?sube=olmayan-sube` isteğinin ilk aktif şubeye düşmesi
- Admin üzerinden TEST_ üçüncü şube ve TEST_ kategori oluşturulduğunda dinamik menü sekmesi
- `/events` şube filtreleri
- `/careers` şube seçimi
- Ana sayfa menü ve şube kartları

## Not

Yeni şubede özel fotoğraf ve görsel tema bulunmadığında genel kart/panel kullanılır. Şubeye özel tasarım ve fotoğraf seti daha sonra içerik veya tasarım katmanından eklenebilir.
