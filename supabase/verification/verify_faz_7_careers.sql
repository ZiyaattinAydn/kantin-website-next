-- Kantin Website - Faz 7 doğrulama sorgusu
-- Migration uygulandıktan sonra Supabase SQL Editor'da çalıştırın.

with checks as (
  select
    'career_upload_sessions tablosu var'::text as kontrol,
    to_regclass('public.career_upload_sessions') is not null as basarili

  union all

  select
    'career_upload_sessions RLS açık',
    coalesce((
      select c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'career_upload_sessions'
    ), false)

  union all

  select
    'career-cvs private bucket',
    exists (
      select 1 from storage.buckets
      where id = 'career-cvs'
        and public = false
        and file_size_limit = 5242880
    )

  union all

  select
    'Anon upload oturumu tablosunu okuyamaz',
    not has_table_privilege('anon', 'public.career_upload_sessions', 'SELECT')

  union all

  select
    'Anon iş başvurularını okuyamaz',
    not has_table_privilege('anon', 'public.job_applications', 'SELECT')

  union all

  select
    'Anon iş başvurusu tablosuna doğrudan INSERT yapamaz',
    not has_table_privilege('anon', 'public.job_applications', 'INSERT')

  union all

  select
    'begin_job_application RPC anon tarafından çağrılabilir',
    has_function_privilege(
      'anon',
      'public.begin_job_application(text,text,text,text,text,text,text,text[],text,text,boolean,text,bigint,text,text,text)',
      'EXECUTE'
    )

  union all

  select
    'complete_job_application RPC anon tarafından çağrılabilir',
    has_function_privilege(
      'anon',
      'public.complete_job_application(uuid,uuid)',
      'EXECUTE'
    )

  union all

  select
    'cancel_job_application RPC anon tarafından çağrılabilir',
    has_function_privilege(
      'anon',
      'public.cancel_job_application(uuid,uuid)',
      'EXECUTE'
    )

  union all

  select
    'CV public form Storage policy sayısı 3/3',
    (
      select count(*) = 3
      from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and policyname in (
          'storage_career_cvs_application_insert',
          'storage_career_cvs_application_select',
          'storage_career_cvs_application_delete'
        )
    )

  union all

  select
    'Upload yolu kontrol fonksiyonu SECURITY DEFINER',
    exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'can_upload_career_cv'
        and p.prosecdef = true
    )
)
select kontrol, basarili
from checks
order by kontrol;

-- Faz 7 policy listesi
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where (schemaname = 'public' and tablename = 'career_upload_sessions')
   or (schemaname = 'storage' and policyname like 'storage_career_cvs_application_%')
order by schemaname, tablename, policyname;

-- Fonksiyon listesi ve SECURITY DEFINER durumu
select
  n.nspname as schema_name,
  p.proname as function_name,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'begin_job_application',
    'can_upload_career_cv',
    'complete_job_application',
    'cancel_job_application'
  )
order by p.proname;
