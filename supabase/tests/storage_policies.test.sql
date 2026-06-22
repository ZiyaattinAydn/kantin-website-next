begin;

set local search_path = public, extensions;
select plan(8);

select is(
  (select public from storage.buckets where id = 'career-cvs'),
  false,
  'career-cvs bucket private'
);
select is(
  (select file_size_limit from storage.buckets where id = 'career-cvs'),
  5242880::bigint,
  'CV boyut sınırı 5 MiB'
);
select is(
  (select public from storage.buckets where id = 'menu-images'),
  true,
  'menu-images bucket public'
);
select is(
  (select file_size_limit from storage.buckets where id = 'menu-images'),
  8388608::bigint,
  'public görsel boyut sınırı 8 MiB'
);
select policies_are(
  'storage',
  'objects',
  array[
    'storage_career_cvs_admin_delete',
    'storage_career_cvs_admin_insert',
    'storage_career_cvs_admin_select',
    'storage_career_cvs_admin_update',
    'storage_career_cvs_application_delete',
    'storage_career_cvs_application_insert',
    'storage_career_cvs_application_select',
    'storage_public_media_manager_delete',
    'storage_public_media_manager_insert',
    'storage_public_media_manager_update',
    'storage_public_media_read'
  ],
  'Storage policy seti beklenen kapsama sahip'
);
select ok(
  has_function_privilege('anon', 'public.can_upload_career_cv(text)', 'EXECUTE'),
  'anon yalnız dar CV yükleme kontrolünü çalıştırabilir'
);
select ok(
  not public.can_upload_career_cv('incoming/TEST_unknown/cv.pdf'),
  'aktif oturumu olmayan CV yolu reddedilir'
);
select ok(
  not ('image/svg+xml' = any(
    (select allowed_mime_types from storage.buckets where id = 'menu-images')
  )),
  'public bucket SVG kabul etmez'
);

select * from finish();
rollback;
