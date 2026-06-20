-- Kantin Website - Faz 4 Storage doğrulaması
-- Bu sorgu yalnız okuma yapar; bucket veya policy değiştirmez.

with expected_buckets as (
  select *
  from (
    values
      ('menu-images'::text, true, 8388608::bigint),
      ('event-images'::text, true, 8388608::bigint),
      ('merch-images'::text, true, 8388608::bigint),
      ('gallery-images'::text, true, 8388608::bigint),
      ('instagram-media'::text, true, 8388608::bigint),
      ('career-cvs'::text, false, 5242880::bigint)
  ) as bucket(id, is_public, max_bytes)
),
expected_policies as (
  select unnest(array[
    'storage_public_media_read',
    'storage_public_media_manager_insert',
    'storage_public_media_manager_update',
    'storage_public_media_manager_delete',
    'storage_career_cvs_admin_select',
    'storage_career_cvs_admin_insert',
    'storage_career_cvs_admin_update',
    'storage_career_cvs_admin_delete'
  ]::text[]) as policy_name
),
checks as (
  select
    'Storage bucket sayısı 6/6'::text as kontrol,
    (
      select count(*) = 6
      from storage.buckets b
      join expected_buckets e on e.id = b.id
    ) as basarili

  union all

  select
    'Bucket public/private ve boyut ayarları doğru',
    not exists (
      select 1
      from expected_buckets e
      left join storage.buckets b on b.id = e.id
      where b.id is null
        or b.public is distinct from e.is_public
        or b.file_size_limit is distinct from e.max_bytes
    )

  union all

  select
    'Public görsel MIME tipleri doğru',
    not exists (
      select 1
      from storage.buckets b
      where b.id in (
        'menu-images',
        'event-images',
        'merch-images',
        'gallery-images',
        'instagram-media'
      )
      and b.allowed_mime_types is distinct from
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
    )

  union all

  select
    'CV MIME tipleri doğru',
    exists (
      select 1
      from storage.buckets b
      where b.id = 'career-cvs'
        and b.allowed_mime_types = array[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]::text[]
    )

  union all

  select
    'Faz 4 storage policy sayısı 8/8',
    (
      select count(*) = 8
      from pg_policies p
      join expected_policies e on e.policy_name = p.policyname
      where p.schemaname = 'storage'
        and p.tablename = 'objects'
    )

  union all

  select
    'career-cvs public değildir',
    exists (
      select 1
      from storage.buckets
      where id = 'career-cvs' and public = false
    )

  union all

  select
    'career-cvs için anon INSERT policy yok',
    not exists (
      select 1
      from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and cmd = 'INSERT'
        and roles @> array['anon']::name[]
        and coalesce(with_check, '') like '%career-cvs%'
    )
)
select kontrol, basarili
from checks
order by kontrol;

select
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'storage_%'
order by policyname;

select
  id,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id in (
  'menu-images',
  'event-images',
  'merch-images',
  'gallery-images',
  'instagram-media',
  'career-cvs'
)
order by id;
