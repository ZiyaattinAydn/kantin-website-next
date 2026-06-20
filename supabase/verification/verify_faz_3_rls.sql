-- Kantin Website - Faz 3 doğrulama sorgusu
-- Salt okunurdur; veri veya şema değiştirmez.
-- Supabase SQL Editor'da migration sonrasında çalıştırılabilir.

with expected_tables(table_name) as (
  values
    ('profiles'),
    ('branches'),
    ('media'),
    ('menu_categories'),
    ('menu_category_branches'),
    ('menu_items'),
    ('menu_item_branches'),
    ('menu_item_variants'),
    ('events'),
    ('event_branches'),
    ('merch_products'),
    ('merch_product_branches'),
    ('instagram_posts'),
    ('job_applications'),
    ('site_settings'),
    ('site_pages'),
    ('content_blocks')
),
rls_check as (
  select
    count(*) filter (where cls.relrowsecurity) as rls_enabled_count,
    count(*) as found_table_count
  from expected_tables expected
  join pg_namespace namespace on namespace.nspname = 'public'
  join pg_class cls
    on cls.relnamespace = namespace.oid
   and cls.relname = expected.table_name
   and cls.relkind = 'r'
),
policy_check as (
  select count(*) as policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename in (select table_name from expected_tables)
)
select
  'RLS açık tablo sayısı' as kontrol,
  (select rls_enabled_count::text || '/17' from rls_check) as sonuc,
  ((select rls_enabled_count from rls_check) = 17) as basarili
union all
select
  'Bulunan uygulama tablosu',
  (select found_table_count::text || '/17' from rls_check),
  ((select found_table_count from rls_check) = 17)
union all
select
  'Faz 3 policy sayısı',
  (select policy_count::text || '/34' from policy_check),
  ((select policy_count from policy_check) = 34)
union all
select
  'Anon branches SELECT yetkisi',
  has_table_privilege('anon', 'public.branches', 'SELECT')::text,
  has_table_privilege('anon', 'public.branches', 'SELECT')
union all
select
  'Anon branches INSERT engeli',
  (not has_table_privilege('anon', 'public.branches', 'INSERT'))::text,
  not has_table_privilege('anon', 'public.branches', 'INSERT')
union all
select
  'Anon job_applications SELECT engeli',
  (not has_table_privilege('anon', 'public.job_applications', 'SELECT'))::text,
  not has_table_privilege('anon', 'public.job_applications', 'SELECT')
union all
select
  'Anon job_applications INSERT engeli',
  (not has_table_privilege('anon', 'public.job_applications', 'INSERT'))::text,
  not has_table_privilege('anon', 'public.job_applications', 'INSERT')
union all
select
  'Anon is_admin RPC engeli',
  (not has_function_privilege('anon', 'public.is_admin()', 'EXECUTE'))::text,
  not has_function_privilege('anon', 'public.is_admin()', 'EXECUTE')
union all
select
  'Authenticated is_admin kullanımı',
  has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE')::text,
  has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE')
order by kontrol;

-- Politika listesini ayrıca görünür kılar.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
