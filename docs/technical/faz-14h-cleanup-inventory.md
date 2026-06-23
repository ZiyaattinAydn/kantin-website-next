# Faz 14H Teknik Temizlik Envanteri

## Güvenle kaldırılan eski katmanlar

Aşağıdaki dosyalar aktif App Router, public adapter veya test akışında kullanılmıyordu:

- `src/content/admin.ts`
- `src/content/home.ts`
- `src/content/menu.ts`
- `src/content/site.ts`
- `src/components/home/HomeMenuBranchCard.tsx`
- `src/components/events/EventCards.tsx`
- `src/components/layout/navigation.ts`

Aktif karşılıklar `src/data/*`, `src/components/cards/*` ve `src/lib/public-data/*` altında korunuyor.

## Sadeleştirilen exportlar

- Kariyer şube seçenekleri artık canlı public şube listesinden geldiği için `careerBranches` kaldırıldı.
- Etkinlik filtreleri artık canlı şube etiketlerinden üretildiği için statik `eventFilters` kaldırıldı.
- Kullanılmayan ikinci etkinlik label/adres haritası `src/lib/events.ts` içinden kaldırıldı; fallback haritaları `src/data/events.ts` içinde tek kaynak olarak kaldı.

## Bilinçli olarak korunan alanlar

### `src/styles/legacy.css`

Dosya büyük olmasına rağmen public sayfaların mevcut görsel kimliğinin önemli bölümü burada. Faz 14H kapsamında kör CSS silme yapılmadı. CSS temizliği ancak tarayıcı kapsama raporu ve responsive ekran turuyla parça parça yapılmalı.

### Seed ve fallback verileri

Seed, Supabase bağlantısı olmadığında kullanılan statik fallback ile aynı amaca sahip değildir. Seed canlı veri başlangıç seti, fallback ise hata durumunda public sayfayı çalışır tutan güvenli kopyadır. Bu nedenle iki katman birleştirilmedi.

### Deployment scriptleri

- `verify-deployment.mjs`: Preview/Production endpoint kontrolü
- `verify-production.mjs`: production kapanış kontrolü
- `project-preflight.mjs`: yerel proje ön kontrolü

Amaçları farklı olduğu için bu aşamada birleştirilmedi.

## Sonraki güvenli temizlik adımları

- Chrome Coverage ile `legacy.css` selector kullanım raporu çıkarılması
- Tasarım düzeltmeleri bittikten sonra ekran görüntüsü regresyonu
- Public fallback içeriklerinin admin/seed kaynaklarıyla dönemsel karşılaştırılması
- Kullanılmayan asset dosyalarının referans bazlı taranması
