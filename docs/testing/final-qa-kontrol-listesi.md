# Final QA Kontrol Listesi

## Kod kalitesi

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npm run preflight`
- [ ] `npm audit` sonucu incelendi; otomatik `--force` uygulanmadı

## Public sayfalar

- [ ] Ana sayfa
- [ ] Alsancak menüsü
- [ ] Atakent menüsü
- [ ] Etkinlikler dolu ve boş durum
- [ ] Kariyer formu
- [ ] Footer adres, harita, e-posta ve sosyal linkler
- [ ] Merch ve galeri lightbox
- [ ] Instagram carousel
- [ ] Aynı sayfa linkine/logo tekrar basıldığında yukarı dönüş

## Responsive

- [ ] 320 px dar Android
- [ ] 360/375 px telefon
- [ ] 390/430 px büyük telefon
- [ ] 768 px tablet
- [ ] 1024 px küçük masaüstü
- [ ] 1440 px masaüstü
- [ ] Yatay taşma yok
- [ ] Uzun başlık/açıklama kart dışına çıkmıyor
- [ ] Mobil menü, lightbox ve admin navigasyonu kullanılabilir

## Veri durumları

- [ ] Supabase canlı veri
- [ ] Bağlantı kesintisinde fallback
- [ ] Boş etkinlik listesi
- [ ] Eksik görsel
- [ ] Çok uzun metin
- [ ] Yavaş bağlantı/loading
- [ ] Yayından kaldırılmış/pasif içerik public görünmüyor

## Kariyer ve güvenlik

- [ ] Geçerli PDF/DOC/DOCX
- [ ] 5 MB üzeri CV reddi
- [ ] Sahte uzantı / dosya imzası reddi
- [ ] Hızlı tekrar gönderim reddi
- [ ] Başvuru public okunamıyor
- [ ] CV public URL ile açılamıyor
- [ ] Admin signed URL ile CV indirebiliyor

## Admin

- [ ] Oturumsuz `/admin` login'e yönleniyor
- [ ] Admin olmayan kullanıcı erişemiyor
- [ ] Admin giriş/çıkış
- [ ] Faz 9 TEST CRUD kayıtları
- [ ] Görsel yükleme ve kullanılma kontrolü
- [ ] Tema ayarı ve güvenli varsayılana dönüş
- [ ] Mobil admin navigasyonu
- [ ] İşlem logları oluşuyor

## Deployment

- [ ] Preview verifier başarılı
- [ ] `develop -> main` merge
- [ ] Production environment variable'ları
- [ ] Supabase Site URL / Redirect URL
- [ ] Production verifier 8/8
- [ ] robots.txt ve sitemap
- [ ] Production'da fallback uyarısı yok
- [ ] Admin canlı adreste çalışıyor

## Teslim

- [ ] Final ZIP'te `.env.local`, `.next`, `node_modules`, `.git` yok
- [ ] Migration, seed ve verification dosyaları var
- [ ] README ve kullanım belgeleri güncel
- [ ] Teknik rapor güncel
- [ ] Test/veri kayıtları temizlendi
