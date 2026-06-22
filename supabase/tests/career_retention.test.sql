begin;

set local search_path = public, extensions;
select plan(12);

select has_type(
  'public',
  'job_application_privacy_status',
  'kariyer gizlilik durum enumu mevcut'
);
select has_column('public', 'job_applications', 'privacy_status', 'privacy_status kolonu mevcut');
select has_column('public', 'job_applications', 'retention_until', 'retention tarihi mevcut');
select has_column('public', 'job_applications', 'anonymized_at', 'anonimleştirme tarihi mevcut');
select has_column('public', 'job_applications', 'cv_deleted_at', 'CV silme tarihi mevcut');
select ok(
  (select attnotnull from pg_attribute where attrelid = 'public.job_applications'::regclass and attname = 'retention_until'),
  'retention tarihi zorunlu'
);
select ok(
  not (select attnotnull from pg_attribute where attrelid = 'public.job_applications'::regclass and attname = 'cv_media_id'),
  'anonimleştirilen kayıtta CV FK alanı boş olabilir'
);
select ok(
  has_function_privilege('authenticated', 'public.begin_job_application_anonymization(uuid)', 'EXECUTE'),
  'authenticated rolü admin kontrollü başlatma RPCsini çağır'
);
select ok(
  not has_function_privilege('anon', 'public.begin_job_application_anonymization(uuid)', 'EXECUTE'),
  'anon anonimleştirme RPCsini çağıramaz'
);
select throws_ok(
  $$select * from public.begin_job_application_anonymization(gen_random_uuid())$$,
  '42501',
  'admin_required',
  'admin olmayan oturum anonimleştirme başlatamaz'
);
select throws_ok(
  $$select public.complete_job_application_anonymization(gen_random_uuid())$$,
  '42501',
  'admin_required',
  'admin olmayan oturum anonimleştirme tamamlayamaz'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'job_applications_retention_due_idx'
  ),
  'retention inceleme sorgusu indeksli'
);

select * from finish();
rollback;
