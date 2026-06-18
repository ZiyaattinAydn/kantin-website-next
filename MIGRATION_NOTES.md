# Kantin Next.js geçişi — Aşama 1

## Bu sürümde tamamlananlar

- Ana sayfa `/` route'una taşındı.
- Menü `/menu` route'una taşındı.
- Etkinlikler `/events` route'una taşındı.
- Geçici etkinlik yönetimi `/admin` route'una taşındı.
- Header ve footer tekrar kullanılabilir React + TypeScript bileşenlerine dönüştürüldü.
- Sayfa metadata ve favicon ayarları Next.js'e taşındı.
- Mevcut görseller ve marka CSS'i korunarak `public` klasörüne alındı.
- GitHub Pages'teki göreli dosya yolu sorunlarını engellemek için varlık yolları kökten başlayan URL'lere dönüştürüldü.
- Menü şube seçimi, mobil menü, reveal animasyonları, Merch Drop kartı ve etkinlik demo sistemi korunuyor.
- Supabase için `src/lib/supabase/client.ts` ve `server.ts` iskeleti korundu.

## Bilinçli olarak geçici bırakılan katman

Sayfaların ana içerikleri ilk aşamada güvenilir statik HTML'den gelen bir geçiş katmanıyla render ediliyor. Bunun amacı, tasarımı ve çalışan özellikleri kaybetmeden Next.js'e geçmek.

Sonraki aşamada aşağıdaki sırayla gerçek TSX bileşenlerine ayrılacak:

1. Hero ve şube seçimi
2. Merch Drop
3. Menü kategori ve ürün bileşenleri
4. Etkinlik kartları
5. Mobil menü ve Merch etkileşimlerinin React state'e taşınması
6. Supabase üzerinden etkinlik verisi
7. Supabase Auth ile yönetici girişi

## Şube kuralları

- Alsancak ve Atakent içerikleri birbirine karıştırılmadı.
- Merch Drop yalnızca Alsancak olarak korunuyor.
- Atakent kokteyl ve grill içeriği ayrı kalıyor.
