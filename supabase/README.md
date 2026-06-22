# Kantin Supabase migrations

Bu klasör, Kantin Website veritabanı değişikliklerinin sıralı ve denetlenebilir kaydıdır.

## Faz 2 migration

`migrations/20260620010000_initial_schema.sql`

Bu migration:

- temel enum ve tabloları oluşturur,
- UUID primary key ve foreign key ilişkilerini kurar,
- fiyat, URL, slug, sıralama ve form verisi kontrollerini ekler,
- gerekli indeksleri ve `updated_at` trigger'larını oluşturur,
- yeni Auth kullanıcıları için varsayılan `viewer` profili açar,
- bütün uygulama tablolarında RLS'yi güvenli varsayılan olarak etkinleştirir.

Public okuma, admin CRUD ve kariyer başvurusu INSERT politikaları bilinçli olarak Faz 3 migration'ına bırakılmıştır. Bu nedenle Faz 2 sonunda tabloların Data API üzerinden boş/erişilemez görünmesi beklenen davranıştır.

## Çalıştırma

Supabase Dashboard → SQL Editor → New query alanında migration dosyasının tamamını tek seferde çalıştırın.

Migration başarıyla tamamlandıktan sonra Table Editor içinde tabloların oluştuğunu ve her tabloda RLS'nin açık olduğunu kontrol edin.

## Faz 9 migration

`migrations/20260620060000_admin_crud_support.sql`

Bu migration mevcut içerik kayıtlarını değiştirmez veya silmez. Yalnızca admin panelindeki kritik işlemler için `admin_activity_logs` tablosunu, indekslerini ve RLS politikalarını ekler.

Faz 9 sonrasında:

- admin CRUD işlemleri loglanır,
- test kayıtları için güvenli cleanup SQL'i kullanılabilir,
- Faz 9 destek tablosu gerekirse ayrı rollback dosyasıyla kaldırılabilir.

## Faz 14D migration

`migrations/20260622080000_career_retention_anonymization.sql`

Bu migration kariyer başvurularına 180 günlük retention inceleme tarihi, gizlilik durumları ve admin-only iki aşamalı anonimleştirme RPC'leri ekler. Migration kendi başına CV veya aday verisi silmez. Uygulamadan önce yerel Supabase üzerinde `supabase/tests/career_retention.test.sql` ve yalnız `TEST_` başvurusu ile doğrulanmalıdır.
