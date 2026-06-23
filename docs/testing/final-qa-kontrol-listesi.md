# Final QA Kontrol Listesi

## Kod kalitesi

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npm run preflight`
- [ ] `npm run test:unit:coverage`
- [ ] Yerel Docker/Supabase ile `npm run test:db`
- [ ] Yerel Supabase ve TEST admin hesabıyla `npm run test:e2e`
- [ ] Tam yerel regresyon için `npm run verify:local`
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
- [ ] `site_pages` SEO değişiklikleri public metadata'ya yansıyor
- [ ] Menü ürünü görseli doğru şube panelinde ve alt metinle görünüyor
- [ ] Şube adresi, harita, telefon, e-posta ve çalışma saati public kartlara yansıyor

## Kariyer ve güvenlik

- [ ] Geçerli PDF/DOC/DOCX
- [ ] 5 MB üzeri CV reddi
- [ ] Sahte uzantı / dosya imzası reddi
- [ ] Hızlı tekrar gönderim reddi
- [ ] Başvuru public okunamıyor
- [ ] CV public URL ile açılamıyor
- [ ] Admin signed URL ile CV indirebiliyor
- [ ] Retention tarihi dolan aktif başvuru admin ekranında uyarılıyor
- [ ] Arşivlenmemiş başvuru anonimleştirilemiyor
- [ ] Yanlış onay metni anonimleştirme başlatmıyor
- [ ] CV Storage silme hatası başvuruyu değiştirmiyor ve kilidi geri alıyor
- [ ] Tamamlanan anonimleştirme PII/hash/admin notu/CV kaydını temizliyor
- [ ] Bekleyen veya anonimleştirilmiş kayıtta CV endpoint'i `410` dönüyor

## Admin

- [ ] Oturumsuz `/admin` login'e yönleniyor
- [ ] Admin olmayan kullanıcı erişemiyor
- [ ] Admin giriş/çıkış
- [ ] Faz 9 TEST CRUD kayıtları
- [ ] Görsel yükleme ve kullanılma kontrolü
- [ ] Kullanılan medya arşivlenemiyor; bağlı admin kayıtları listeleniyor
- [ ] JSON içerik bloğundaki doğrudan medya yolu kullanım sayısına dahil
- [ ] Arşivlenmiş medya seçim listesinde yok ve yeniden yayına alınabiliyor
- [ ] Kalıcı silme yalnız bağlantısız TEST_ Storage medyasında açılıyor
- [ ] Tema ayarı ve güvenli varsayılana dönüş
- [ ] Mobil admin navigasyonu
- [ ] İşlem logları oluşuyor
- [ ] Generic CRUD 25 kayıttan sonra önceki/sonraki sayfa bağlantılarını gösteriyor
- [ ] Medya arama ve aktif/arşiv filtresi sayfalar arasında korunuyor
- [ ] Kariyer arama, durum, privacy ve retention filtreleri server-side sonuç veriyor
- [ ] Kariyer listesi tam tanıtım/admin notunu yalnız İncele açıldığında okuyor
- [ ] Generic CRUD geçersiz UUID, select, slug, e-posta, HTTPS, negatif fiyat ve ondalıklı sıra değerini DB'ye gitmeden reddediyor
- [ ] JSON editörü bozuk sözdiziminde kaydı engelliyor ve biçimlendirme eylemi geçerli JSON'u okunabilir hale getiriyor
- [ ] JSON şema hatası doğru alanı işaretliyor; çalışma saatleri, içerik bloğu ve kontrollü tema ayarları kaynak kuralına göre doğrulanıyor

## Deployment

- [ ] Preview verifier başarılı
- [x] Güncel kaynak kod `main` branch'inde
- [ ] Production environment variable'ları
- [ ] Supabase Site URL / Redirect URL
- [ ] Production verifier 8/8
- [ ] robots.txt ve sitemap
- [ ] Production'da fallback uyarısı yok
- [ ] Admin canlı adreste çalışıyor
- [ ] Otomatik testler Preview/Production URL'sine karşı çalıştırılmadı

## Teslim

- [ ] Final ZIP'te `.env.local`, `.next`, `node_modules`, `.git` yok
- [ ] Migration, seed ve verification dosyaları var
- [ ] README ve kullanım belgeleri güncel
- [ ] Teknik rapor güncel
- [ ] Test/veri kayıtları temizlendi
