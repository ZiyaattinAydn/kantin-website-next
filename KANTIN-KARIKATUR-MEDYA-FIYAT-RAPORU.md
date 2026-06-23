# Kantin Website — Karikatür, Medya ve Fiyat Yönetimi Teslim Raporu

Tarih: 24 Haziran 2026

## Tamamlanan işler

### 1. Kariyer formu karikatür katmanı

- Başvuru formu ayrı stacking context içine alındı.
- Hareketli doodle/parallax katmanı korunarak form kartının arkasında bırakıldı.
- Opak form zemini sayesinde çizgilerin input ve metinlerin üzerinden görünmesi engellendi.
- Reduced-motion ve mevcut hareket davranışı değiştirilmedi.

### 2. Etkinlik + duyuru altyapısı

- Mevcut etkinlik/duyuru kodu korundu.
- `20260623030000_event_announcements.sql` transaction içine alındı.
- Etkinlik ve duyuru migration'ının production uygulama sırası belgelendi.

### 3. Medya düzenleme ve kalıcı silme

- Medya adı, alt metin, durum, aktiflik ve sıra güncellenebiliyor.
- Bucket, kaynak ve object path salt okunur tutuluyor.
- Bağlantılı medya arşivlenebiliyor; public görünümden kaldırılıyor.
- Kalıcı silme yalnız bağlantısız, arşivlenmiş, pasif Storage görsellerinde açılıyor.
- Yazılı `KALICI SİL` onayı eklendi.
- Begin → Storage remove → DB complete akışı eklendi.
- Storage nesnesi zaten yoksa yarım kalmış DB silme işlemi güvenli biçimde tamamlanıyor.
- Storage hatasında pending marker geri alınıyor; DB tamamlama yarıda kalırsa yeniden deneme mümkün.
- İşlemler admin kontrolü ve auditli RPC'lerle yürütülüyor.

### 4. Arşivli medyanın public alanda görünmesi

- Public medya sorguları yalnız `published + is_active` kayıtlarını kabul ediyor.
- Home, menu, events ve merch adaptörleri ortak güvenli medya sorgusunu kullanıyor.
- Content block JSON içinde kalmış arşivli Storage URL'leri aktif medya allowlist'iyle engelleniyor.
- Paketle gelen `/assets/...` görselleri etkilenmiyor.
- Arşivli Instagram görseli boş `src` üretmeden listeden çıkarılıyor.
- Medya değişikliklerinde ilgili public yollar revalidate ediliyor.

### 5. Birleşik fiyat yönetimi

Yeni route: `/admin/pricing`

- Ürün arama
- Kategori filtresi
- Şube filtresi
- Aktif/pasif ürün filtresi
- Fiyatı eksik ürün filtresi
- Aynı ürünün bütün aktif şube fiyatlarını tek ekranda görme
- Temel fiyat, fiyat etiketi, fiyat notu, bulunabilirlik notu ve aktiflik güncelleme
- Eksik ürün-şube bağlantısını aynı ekrandan oluşturma
- Varyant fiyatı, fiyat notu ve aktifliğini inline güncelleme
- Teknik şube/varyant tablolarını gelişmiş yönetim altında koruma
- Türkçe fiyat girişini güvenli `price_cents` değerine dönüştürme

Birleşik fiyat ekranı mevcut tabloları ve audit trigger'larını kullanır; yeni migration gerektirmez.

## Bekleyen migration'lar

Production Supabase SQL Editor içinde sırasıyla:

1. `supabase/migrations/20260623030000_event_announcements.sql`
2. `supabase/migrations/20260624010000_media_management.sql`
3. `notify pgrst, 'reload schema';`

Ayrıntılı uygulama ve smoke test adımları:

`docs/backend/20260624-media-ve-duyuru-migration-uygulama.md`

## Doğrulama sonuçları

- `npm ci --ignore-scripts`: geçti, 475 paket.
- `npm run test:unit`: geçti, **38 dosya / 117 test**.
- `npm run lint`: geçti.
- `npx tsc --noEmit`: geçti.
- Temiz `.next` sonrası `npm run build`: geçti.
- Build listesinde `/admin/pricing` dynamic route olarak yer aldı.
- `npm audit --audit-level=high`: 0 bulgu.
- 166 TypeScript/TSX dosyası parser kontrolü: temiz.
- CSS brace kontrolü: temiz.
- SQL transaction ve dollar-quote statik kontrolü: temiz.

Çalıştırılmayanlar:

- `npm run test:db`: Docker/yerel Supabase yok.
- `npm run test:e2e`: yerel Supabase ve TEST admin oturumu yok.
- Production migration veya canlı Storage/veri işlemi yapılmadı.

## Production smoke testi

Yalnız `TEST_` kayıtlarla:

1. TEST duyurusu oluştur, tür/şube/yayın aralığı filtrelerini kontrol et.
2. TEST görselinin adı ve alt metnini güncelle.
3. Görseli arşivle; public alanlardan kaybolduğunu doğrula.
4. Geri yükle; tekrar göründüğünü doğrula.
5. Bağlantılı medyada kalıcı silmenin kapalı olduğunu doğrula.
6. Bağlantısız arşiv TEST Storage görselini kalıcı sil.
7. `/admin/pricing` üzerinden TEST ürününün iki şube fiyatını güncelle.
8. Eksik ürün-şube bağlantısı oluştur ve varyant fiyatını değiştir.
9. `admin_activity_logs` kayıtlarını kontrol et.
10. `/admin/media` ve `/admin/pricing` sayfalarını 390, 768, 1024 ve 1440 pikselde kontrol et.

## Paketler

- Değişen dosyalar paketi: yalnız bu çalışma kapsamında eklenen/değişen dosyalar.
- Temiz tam kaynak paketi: `.git`, `.next`, `node_modules`, `.vercel`, env sırları, recovery code, coverage ve test artefact'ları hariç güncel kaynak.
