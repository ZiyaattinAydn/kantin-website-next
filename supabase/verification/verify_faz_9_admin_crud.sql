-- Kantin Website - Faz 9 doğrulama sorgusu

select * from (
  select
    'admin_activity_logs tablosu mevcut'::text as kontrol,
    exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'admin_activity_logs'
    ) as basarili
  union all
  select
    'admin_activity_logs RLS açık',
    coalesce((
      select relrowsecurity
      from pg_class
      join pg_namespace on pg_namespace.oid = pg_class.relnamespace
      where pg_namespace.nspname = 'public'
        and pg_class.relname = 'admin_activity_logs'
    ), false)
  union all
  select
    'Admin log SELECT policy mevcut',
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'admin_activity_logs'
        and policyname = 'admin_activity_logs_admin_select'
    )
  union all
  select
    'Admin log INSERT policy mevcut',
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'admin_activity_logs'
        and policyname = 'admin_activity_logs_admin_insert'
    )
  union all
  select
    'Anon tablo yetkisi yok',
    not has_table_privilege('anon', 'public.admin_activity_logs', 'SELECT')
    and not has_table_privilege('anon', 'public.admin_activity_logs', 'INSERT')
  union all
  select
    'Authenticated SELECT/INSERT grant mevcut',
    has_table_privilege('authenticated', 'public.admin_activity_logs', 'SELECT')
    and has_table_privilege('authenticated', 'public.admin_activity_logs', 'INSERT')
) as checks
order by kontrol;
