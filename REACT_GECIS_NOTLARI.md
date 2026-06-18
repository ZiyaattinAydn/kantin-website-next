# React geçişi — Aşama 1

Bu paket, sitenin görünümünü korurken ortak yerleşim katmanını gerçek React davranışına taşır.

## Bu aşamada tamamlananlar

- Header artık tamamen React Client Component olarak çalışıyor.
- Mobil menü `useState`, `useEffect` ve `useRef` ile yönetiliyor.
- Escape ile kapatma, odak geri dönüşü ve klavye odak döngüsü React tarafına taşındı.
- Sayfa kaydırıldığında header görünümü React state ile güncelleniyor.
- Aktif sayfa Next.js `usePathname` ile belirleniyor.
- Header ve footer bağlantıları `next/link` kullanıyor.
- Eski `main.js` içindeki header/mobil menü DOM kodu kaldırıldı; çift çalışma riski kapatıldı.
- Global `noindex` ve `nofollow` metadata eklendi.
- Tek tıkla yerel test için `baslat.bat` eklendi.

## Bilerek henüz değiştirilmemiş alanlar

Ana sayfa, menü ve etkinlik içeriklerinin büyük HTML blokları görsel eşitliği korumak amacıyla geçici içerik katmanında duruyor. Sonraki aşamada önce ana sayfa Hero ve şube kartları gerçek React bileşenlerine ayrılacak.
