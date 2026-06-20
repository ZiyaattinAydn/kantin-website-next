# Faz 5 — Başlangıç verileri (seed)

Bu faz, Frontend v1 içindeki doğrulanmış statik içerikleri Supabase şemasına aktarır. Public site bu aşamada henüz Supabase'ten okumaz; statik TypeScript dosyaları güvenli fallback olarak korunur.

## Aktarılan veri kapsamı

- 2 şube
- 16 menü kategorisi
- 84 menü ürünü
- 100 ürün-şube ilişkisi
- 40 porsiyon/hacim/fiyat varyantı
- 22 yerel medya kaydı
- 5 merch ürünü veya paketi
- 5 Instagram gönderisi
- 8 public site ayarı
- 4 site sayfası
- 12 içerik bloğu

Etkinlik veri dosyası boş olduğu için örnek veya hayali etkinlik eklenmemiştir.

## Çalışma saatleri hakkında

Frontend v1 içinde kesin günlük açılış-kapanış saatleri bulunmamaktadır. Footer'daki “Güncel çalışma saatleri ve duyurular için Instagram hesabımızı takip et.” metni `branches.opening_hours` alanına not olarak aktarılmıştır. Kesin saatler daha sonra admin panelinden eklenebilir.

## Tekrar çalıştırma davranışı

`supabase/seed.sql` benzersiz slug, key, permalink ve local path alanlarında UPSERT kullanır. İkinci kez çalıştırıldığında aynı kayıtların kopyalarını üretmez; seed tarafından yönetilen değerleri günceller.

## Tarih notu

Instagram kaynak dosyasında yalnız gün ve ay etiketi bulunduğu için sıralama amacıyla 2026 tarihleri atanmış, özgün görünür etiket `metadata.display_date` içinde aynen korunmuştur.

## Kritik korumalar

- Alsancak ve Atakent harita bağlantıları doğrulanmış değerlerle kaydedilir.
- Peynir porsiyonları 75 TL ve 150 TL olarak varyantlara ayrılır.
- Eski kaşar açıklaması yalnızca “Eski kaşar peyniri” olarak kalır.
- Pasta Fredda ve Patates Salata içerikleri, yarım/tam fiyatları ve VEGAN rozetiyle aktarılır.
- Merch yalnız Alsancak şubesiyle ilişkilendirilir.
- Footer public e-postası `hello@kantin.pub` olarak kaydedilir.
- Mevcut statik TypeScript verileri kaldırılmaz.
