# Medya RPC onarımı

Admin medya ekranında aşağıdaki belirtiler birlikte görülüyorsa production şema eski RPC sürümünde kalmıştır:

- `media_in_use`
- `Could not find the function public.replace_admin_media_file(...) in the schema cache`

Bu durumda uygulama kodu yeni medya akışını çağırır fakat Supabase tarafında eski `begin_admin_media_delete` fonksiyonu çalışır ve `replace_admin_media_file` henüz bulunmaz.

## Uygulama

Supabase SQL Editor'da şu dosyanın tamamını tek sorgu olarak çalıştır:

```text
supabase/migrations/20260624030000_repair_media_replace_and_auto_detach.sql
```

Migration kendi sonunda PostgREST schema cache yenileme bildirimi gönderir. Ayrı bir `notify pgrst, 'reload schema';` sorgusu zorunlu değildir.

## Doğrulama

Migration sonrasında şu sorguyu çalıştır:

```sql
select
  to_regprocedure('public.replace_admin_media_file(uuid,text,text,text,bigint,text)') as replace_media_rpc,
  to_regprocedure('public.begin_admin_media_delete(uuid)') as begin_delete_rpc,
  to_regprocedure('public.complete_admin_media_delete(uuid)') as complete_delete_rpc;
```

Üç sütunun da `null` dışında bir fonksiyon imzası döndürmesi gerekir.

Ardından yalnız `TEST_` medya kaydıyla:

1. Bağlantılı bir görseli arşivle.
2. Kalıcı sil işlemini çalıştır.
3. Bağlı `image_media_id` alanının `null` olduğunu ve görselin public alandan kalktığını doğrula.
4. Başka bir TEST görselinde “Düzenle / değiştir” akışından yeni dosya yükle.
5. Aynı medya UUID'sinin korunduğunu ve eski Storage nesnesinin kaldırıldığını doğrula.

## Kaynak dosya JSON/TypeScript sınırı

Migration; veritabanı foreign key bağlantılarını ve `content_blocks.content` JSONB içindeki medya yollarını otomatik temizler veya değiştirir. Repository içindeki `src/data/*.ts` ya da statik JSON dosyaları production runtime sırasında değiştirilemez. Bu tür hardcoded fallback referansları ayrı kod temizliği gerektirir.
