# 24 Haziran 2026 — Duyuru ve medya migration uygulama notu

Bu paket iki production şema değişikliğine bağlıdır. Docker kullanılmadığı için migration'lar bu çalışma ortamında uygulanmadı. Supabase SQL Editor içinde aşağıdaki sırayla uygulanmalıdır.

## Uygulama sırası

1. `supabase/migrations/20260623030000_event_announcements.sql`
2. `supabase/migrations/20260624010000_media_management.sql`
3. Schema cache yenileme:

```sql
notify pgrst, 'reload schema';
```

İlk migration etkinlik tablosuna duyuru alanlarını ekler. İkinci migration medya metadata düzenleme, bağlantılı medyayı arşivleme ve güvenli kalıcı silme RPC'lerini ekler. Dosyaların sırası değiştirilmemelidir.

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
  to_regprocedure('public.begin_admin_media_delete(uuid)') as begin_delete_rpc,
  to_regprocedure('public.cancel_admin_media_delete(uuid,text)') as cancel_delete_rpc,
  to_regprocedure('public.complete_admin_media_delete(uuid)') as complete_delete_rpc;

select
  has_function_privilege(
    'authenticated',
    'public.update_admin_media_metadata(uuid,text,text,public.content_status,boolean,integer)',
    'EXECUTE'
  ) as authenticated_can_update_media,
  not has_function_privilege(
    'anon',
    'public.begin_admin_media_delete(uuid)',
    'EXECUTE'
  ) as anon_cannot_begin_delete;
```

Dört `to_regprocedure` sonucu da boş olmamalı; yetki kontrolleri `true` dönmelidir.

## Production smoke testi

Yalnız `TEST_` kayıtlarıyla:

1. Bir TEST görselinin adını ve alt metnini güncelle.
2. TEST görselini arşivle; ana sayfa/menü/etkinlik alanından kaybolduğunu kontrol et.
3. Aynı görsel bir content block içinde Storage URL'siyle bağlıysa yine görünmediğini doğrula.
4. Geri yükle; public görünümün geri geldiğini kontrol et.
5. Bağlantılı görselde kalıcı silme seçeneğinin kapalı olduğunu doğrula.
6. Bağlantısız, arşivlenmiş TEST Storage görselinde `KALICI SİL` onayıyla silmeyi dene.
7. `admin_activity_logs` içinde `media_update`, `media_archive`/`media_restore`, `media_delete_started` ve `media_delete` kayıtlarını kontrol et.
8. `/events` üzerinde bir TEST duyurusu oluştur; tür ve şube filtrelerini, yayın tarih aralığını ve arşivlemeyi doğrula.

## Geri dönüş yaklaşımı

Bu migration'lar additive ve geriye uyumludur; otomatik downgrade dosyası yoktur. Sorunda önce UI eylemleri durdurulmalı, loglar incelenmeli ve ileri yönlü düzeltme migration'ı hazırlanmalıdır. Production'da migration dosyasını tersine elle silmek önerilmez.
