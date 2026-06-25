begin;

set local search_path = public, extensions;
select plan(15);

select has_table(
  'public',
  'admin_record_revisions',
  'kritik kayıt sürüm geçmişi tablosu mevcut'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.admin_record_revisions'::regclass),
  'sürüm geçmişi tablosunda RLS etkin'
);

select policies_are(
  'public',
  'admin_record_revisions',
  array['admin_record_revisions_admin_select'],
  'sürüm geçmişi yalnız admin okuma politikasına sahip'
);

select ok(
  not has_table_privilege('anon', 'public.admin_record_revisions', 'SELECT'),
  'anon sürüm geçmişini okuyamaz'
);

select ok(
  has_table_privilege('authenticated', 'public.admin_record_revisions', 'SELECT'),
  'authenticated rolü RLS kapsamında sürüm geçmişini okuyabilir'
);

select ok(
  not has_table_privilege('authenticated', 'public.admin_record_revisions', 'INSERT'),
  'authenticated rolü doğrudan sürüm kaydı ekleyemez'
);

select ok(
  not has_table_privilege('authenticated', 'public.admin_record_revisions', 'UPDATE'),
  'sürüm kayıtları güncellenemez'
);

select ok(
  not has_table_privilege('authenticated', 'public.admin_record_revisions', 'DELETE'),
  'sürüm kayıtları silinemez'
);

select ok(
  to_regprocedure('public.capture_admin_record_revision()') is not null,
  'snapshot trigger fonksiyonu mevcut'
);

select ok(
  (
    select procedure.prosecdef
    from pg_proc as procedure
    where procedure.oid = to_regprocedure('public.capture_admin_record_revision()')
  ),
  'snapshot trigger fonksiyonu SECURITY DEFINER'
);

select ok(
  exists (
    select 1
    from pg_trigger as trigger
    where trigger.tgrelid = to_regclass(format('public.%I', expected.table_name))
      and trigger.tgname = 'capture_admin_record_revision'
      and trigger.tgisinternal = false
      and trigger.tgtype = 29
  ),
  format('%s tablosunda AFTER INSERT/UPDATE/DELETE snapshot trigger mevcut', expected.table_name)
)
from (
  values
    ('branches'),
    ('site_settings'),
    ('site_pages'),
    ('content_blocks')
) as expected(table_name);

select ok(
  not exists (
    select 1
    from pg_trigger as trigger
    where trigger.tgrelid = 'public.menu_items'::regclass
      and trigger.tgname = 'capture_admin_record_revision'
      and trigger.tgisinternal = false
  ),
  'normal menü kayıtları kritik snapshot kapsamına eklenmedi'
);

select * from finish();
rollback;
