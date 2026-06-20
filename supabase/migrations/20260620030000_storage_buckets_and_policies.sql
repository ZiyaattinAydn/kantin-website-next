-- Kantin Website - Faz 4: Supabase Storage bucket'ları ve erişim politikaları
-- Tarih: 20 Haziran 2026
-- Önkoşullar:
--   * 20260620010000_initial_schema.sql
--   * 20260620020000_rls_policies.sql
--
-- Bu migration yalnız bucket tanımlarını ve storage.objects RLS politikalarını kurar.
-- Gerçek dosya yükleme/silme işlemleri Storage API üzerinden yapılmalıdır.

begin;

-- ---------------------------------------------------------------------------
-- Bucket tanımları
-- Public medya bucket'ları: yalnız görsel, en fazla 8 MiB.
-- Kariyer CV bucket'ı: private, yalnız PDF/DOC/DOCX, en fazla 5 MiB.
-- SVG bilinçli olarak kabul edilmez; tarayıcıda aktif içerik çalıştırma riskini azaltır.
-- ---------------------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'menu-images',
    'menu-images',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
  ),
  (
    'event-images',
    'event-images',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
  ),
  (
    'merch-images',
    'merch-images',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
  ),
  (
    'gallery-images',
    'gallery-images',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
  ),
  (
    'instagram-media',
    'instagram-media',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
  ),
  (
    'career-cvs',
    'career-cvs',
    false,
    5242880,
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Olası eski policy'leri temizle. Böylece migration aynı isimler bakımından
-- güvenli biçimde yeniden uygulanabilir.
-- ---------------------------------------------------------------------------

drop policy if exists storage_public_media_read on storage.objects;
drop policy if exists storage_public_media_manager_insert on storage.objects;
drop policy if exists storage_public_media_manager_update on storage.objects;
drop policy if exists storage_public_media_manager_delete on storage.objects;

drop policy if exists storage_career_cvs_admin_select on storage.objects;
drop policy if exists storage_career_cvs_admin_insert on storage.objects;
drop policy if exists storage_career_cvs_admin_update on storage.objects;
drop policy if exists storage_career_cvs_admin_delete on storage.objects;

-- ---------------------------------------------------------------------------
-- Public medya
-- Public bucket URL'leri dosyayı doğrudan sunabilir. SELECT policy ayrıca listeleme
-- ve yetkili Storage API okuma işlemlerini açık hale getirir.
-- Yükleme, değiştirme ve silme yalnız editor/admin rolüne açıktır.
-- ---------------------------------------------------------------------------

create policy storage_public_media_read
on storage.objects
for select
to anon, authenticated
using (
  bucket_id in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media'
  )
);

create policy storage_public_media_manager_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media'
  )
  and (select public.is_content_manager())
);

create policy storage_public_media_manager_update
on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media'
  )
  and (select public.is_content_manager())
)
with check (
  bucket_id in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media'
  )
  and (select public.is_content_manager())
);

create policy storage_public_media_manager_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media'
  )
  and (select public.is_content_manager())
);

-- ---------------------------------------------------------------------------
-- Private CV dosyaları
-- Bu fazda anonim yükleme açılmaz. Kariyer formu entegrasyonunda sunucu tarafı
-- doğrulama, spam koruması ve atomik başvuru akışı tamamlandıktan sonra dar bir
-- upload yolu eklenecektir. Şimdilik yalnız admin okuyabilir/yönetebilir.
-- ---------------------------------------------------------------------------

create policy storage_career_cvs_admin_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'career-cvs'
  and (select public.is_admin())
);

create policy storage_career_cvs_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'career-cvs'
  and (select public.is_admin())
);

create policy storage_career_cvs_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'career-cvs'
  and (select public.is_admin())
)
with check (
  bucket_id = 'career-cvs'
  and (select public.is_admin())
);

create policy storage_career_cvs_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'career-cvs'
  and (select public.is_admin())
);

commit;
