# Faz 10 - Kontrollü tema ve bölüm yönetimi

Bu faz, admin kullanıcısına serbest CSS yazdırmadan public sitenin görünümünü kontrollü seçeneklerle yönetir.

## Yönetilen ayarlar

- Renk paleti: Kantin mavisi, derin lacivert veya ocean teal
- Font düzeni: marka, temiz veya editorial
- Başlık ölçeği: kompakt, dengeli veya vurgulu
- Gövde yazısı: kompakt, dengeli veya rahat okunur
- Kart yoğunluğu: sıkı, dengeli veya ferah
- Public bölüm görünürlükleri
- Ana sayfa bölüm sırası

Ana hero üstte sabit kalır. Menü, merch, anılarımız, etkinlikler ve şubeler alanları admin panelinden sıralanabilir.

## Güvenlik

`theme.settings` ve `sections.visibility` JSON değerleri PostgreSQL CHECK constraint'leriyle doğrulanır. Generic site ayarı editörü kullanılsa bile izin verilmeyen font, renk, ölçü veya sıra değerleri veritabanına kaydedilemez.

Bu sistem:

- CSS kodu kabul etmez.
- Özel font URL'si kabul etmez.
- Serbest renk kodu kabul etmez.
- Eksik veya yinelenen bölüm sırasını kabul etmez.
- Bölümleri silmez; yalnız görünürlüklerini değiştirir.

## Admin yolu

`/admin/theme`

## Migration

`supabase/migrations/20260620070000_controlled_theme_settings.sql`

## Doğrulama

`supabase/verification/verify_faz_10_theme.sql`
