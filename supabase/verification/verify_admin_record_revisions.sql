select
  'admin_record_revisions tablosu mevcut' as kontrol,
  to_regclass('public.admin_record_revisions') is not null as basarili;

select
  'snapshot fonksiyonu mevcut' as kontrol,
  to_regprocedure('public.capture_admin_record_revision()') is not null as basarili;

select
  format('%s snapshot trigger', expected.table_name) as kontrol,
  exists (
    select 1
    from pg_trigger as trigger
    where trigger.tgrelid = to_regclass(format('public.%I', expected.table_name))
      and trigger.tgname = 'capture_admin_record_revision'
      and trigger.tgisinternal = false
  ) as basarili
from (
  values
    ('branches'),
    ('site_settings'),
    ('site_pages'),
    ('content_blocks')
) as expected(table_name);

select
  'authenticated doğrudan snapshot yazamaz' as kontrol,
  not has_table_privilege('authenticated', 'public.admin_record_revisions', 'INSERT')
  and not has_table_privilege('authenticated', 'public.admin_record_revisions', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.admin_record_revisions', 'DELETE') as basarili;
