# 24 Haziran 2026 — Duyuru ve medya migration uygulama notu

Bu paket üç production şema değişikliğine bağlıdır. Docker kullanılmadığı için migration'lar bu çalışma ortamında uygulanmadı. Supabase SQL Editor içinde aşağıdaki sırayla uygulanmalıdır.

## Uygulama sırası

1. `supabase/migrations/20260623030000_event_announcements.sql`
2. `supabase/migrations/20260624010000_media_management.sql`
3. `supabase/migrations/20260624020000_media_replace_and_auto_detach.sql`
4. Schema cache yenileme:

```sql
notify pgrst, 'reload schema';
```

İlk migration etkinlik tablosuna duyuru alanlarını ekler. İkinci migration medya metadata, arşiv/restore ve güvenli silme temel RPC'lerini ekler. Üçüncü migration aynı medya UUID'si üzerinde görsel değiştirme ve kalıcı silmede bağlantıları otomatik temizleme davranışını ekler. Sıra değiştirilmemelidir.

## Uygulama öncesi kontrol

```sql
select
  count(*) filter (where start_at is null) as start_at_null_count,
  count(*) filter (where description is null or btrim(description) = '') as blank_description_count
from public.events;
```

Mevcut kayıtlar varsayılan olarak `content_type = 'event'` alacağı için `start_at` veya açıklaması boş eski bir kayıt varsa ilk migration constraint eklerken durur. Böyle bir sonuç görülürse kayıtlar önce admin panelinden düzeltilmelidir.

## Uygulama sonrası doğrulama

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'events'
  and column_name in (
    'content_type',
    'cta_label',
    'publish_start_at',
    'publish_end_at'
  )
order by column_name;

select
  to_regprocedure('public.update_admin_media_metadata(uuid,text,text,public.content_status,boolean,integer)') as update_media_rpc,
  to_regprocedure('public.replace_admin_media_file(uuid,text,text,text,bigint,text)') as replace_media_rpc,
  to_regprocedure('public.begin_admin_media_delete(uuid)') as begin_delete_rpc,
  to_regprocedure('public.cancel_admin_media_delete(uuid,text)') as cancel_delete_rpc,
  to_regprocedure('public.complete_admin_media_delete(uuid)') as complete_delete_rpc;

select
  has_function_privilege(
    'authenticated',
    'public.replace_admin_media_file(uuid,text,text,text,bigint,text)',
    'EXECUTE'
  ) as authenticated_can_replace_media,
  has_function_privilege(
    'authenticated',
    'public.complete_admin_media_delete(uuid)',
    'EXECUTE'
  ) as authenticated_can_complete_delete,
  not has_function_privilege(
    'anon',
    'public.begin_admin_media_delete(uuid)',
    'EXECUTE'
  ) as anon_cannot_begin_delete;
```

Bütün `to_regprocedure` sonuçları dolu, yetki kontrolleri `true` olmalıdır.

## Production smoke testi

Yalnız `TEST_` kayıtlarıyla:

1. TEST görselinin adını ve alt metnini güncelle.
2. TEST görselini arşivle; public yüzeyden kaybolduğunu kontrol et.
3. Geri yükle; public görünümün geri geldiğini doğrula.
4. TEST görselinde **Düzenle / değiştir** seçeneğini aç ve yeni bir görsel yükle.
5. Aynı medya UUID'sinin korunduğunu ve bağlı içerikte yeni görselin göründüğünü doğrula.
6. Eski Storage object path'in artık aktif kayıtta kullanılmadığını kontrol et.
7. Bağlantılı TEST görselini yeniden arşivle ve kalıcı sil.
8. Bağlı içerik kaydının bozulmadığını, medya FK/JSON bağlantısının otomatik kaldırıldığını ve public sayfanın kırık görsel üretmediğini doğrula.
9. `admin_activity_logs` içinde `media_file_replace`, `media_delete_started` ve `media_delete` kayıtlarını kontrol et.
10. `/events` üzerinde TEST duyurusu oluştur; tür/şube filtrelerini, yayın tarih aralığını ve arşivlemeyi doğrula.

## Geri dönüş yaklaşımı

Migration'lar ileri yönlü ve transaction içinde uygulanır. Otomatik downgrade dosyası yoktur. Sorunda önce yeni medya eylemleri durdurulmalı, audit/Storage kayıtları incelenmeli ve ileri yönlü düzeltme migration'ı hazırlanmalıdır. Production'da fonksiyonları veya kolonları elle geri silmek önerilmez.
