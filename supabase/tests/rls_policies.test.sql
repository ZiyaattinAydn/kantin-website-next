begin;

set local search_path = public, extensions;
select plan(10);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.branches'::regclass),
  'branches tablosunda RLS etkin'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.media'::regclass),
  'media tablosunda RLS etkin'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.job_applications'::regclass),
  'job_applications tablosunda RLS etkin'
);
select policies_are(
  'public',
  'branches',
  array['branches_manager_manage', 'branches_public_read'],
  'branches public okuma ve yönetici politikalarına sahip'
);
select policies_are(
  'public',
  'job_applications',
  array['job_applications_admin_manage'],
  'kariyer başvuruları yalnız admin politikasına sahip'
);
select ok(
  has_table_privilege('anon', 'public.branches', 'SELECT'),
  'anon branches tablosunu sorgulayabilir'
);
select ok(
  not has_table_privilege('anon', 'public.branches', 'INSERT'),
  'anon branches tablosuna yazamaz'
);
select ok(
  not has_table_privilege('anon', 'public.job_applications', 'SELECT'),
  'anon kişisel başvuru verisini okuyamaz'
);
select ok(
  has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE'),
  'authenticated rolü RLS admin kontrolünü çalıştırabilir'
);
select ok(
  not has_function_privilege('anon', 'public.is_admin()', 'EXECUTE'),
  'anon rolü admin kontrolünü RPC olarak çağıramaz'
);

select * from finish();
rollback;
