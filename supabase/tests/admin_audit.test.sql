begin;

set local search_path = public, extensions;
select plan(6);

select has_table('public', 'admin_activity_logs', 'admin audit tablosu mevcut');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.admin_activity_logs'::regclass),
  'admin audit tablosunda RLS etkin'
);
select policies_are(
  'public',
  'admin_activity_logs',
  array['admin_activity_logs_admin_insert', 'admin_activity_logs_admin_select'],
  'audit tablosu beklenen iki admin politikasına sahip'
);
select ok(
  not has_table_privilege('anon', 'public.admin_activity_logs', 'SELECT'),
  'anon audit kayıtlarını okuyamaz'
);
select ok(
  has_table_privilege('authenticated', 'public.admin_activity_logs', 'INSERT'),
  'authenticated rolü RLS kapsamında audit ekleyebilir'
);
select ok(
  not has_table_privilege('authenticated', 'public.admin_activity_logs', 'UPDATE'),
  'audit kayıtları sonradan güncellenemez'
);

select * from finish();
rollback;
