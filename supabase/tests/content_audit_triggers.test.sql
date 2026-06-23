begin;

set local search_path = public, extensions;

select plan(20);

select ok(
  to_regprocedure('public.audit_content_mutation()') is not null,
  'transactional içerik audit fonksiyonu mevcut'
);

select ok(
  (
    select procedure.prosecdef
    from pg_proc as procedure
    where procedure.oid = to_regprocedure('public.audit_content_mutation()')
  ),
  'transactional içerik audit fonksiyonu SECURITY DEFINER'
);

select ok(
  exists (
    select 1
    from pg_trigger as trigger
    where trigger.tgrelid = to_regclass(format('public.%I', expected.table_name))
      and trigger.tgname = 'audit_content_mutation'
      and trigger.tgisinternal = false
      and trigger.tgtype = 29
  ),
  format(
    '%s tablosunda AFTER INSERT/UPDATE/DELETE audit trigger mevcut',
    expected.table_name
  )
)
from (
  values
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
    ('branches'),
    ('site_settings'),
    ('site_pages'),
    ('content_blocks')
) as expected(table_name);

select ok(
  not exists (
    select 1
    from pg_trigger as trigger
    where trigger.tgrelid = to_regclass(format('public.%I', excluded.table_name))
      and trigger.tgname = 'audit_content_mutation'
      and trigger.tgisinternal = false
  ),
  format(
    '%s tablosu generic içerik audit trigger kapsamı dışında',
    excluded.table_name
  )
)
from (
  values
    ('media'),
    ('job_applications'),
    ('career_upload_sessions'),
    ('admin_activity_logs')
) as excluded(table_name);

select * from finish();

rollback;
