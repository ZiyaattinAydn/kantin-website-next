begin;

set local search_path = public, extensions;
select plan(4);

select ok(
  has_schema_privilege('service_role', 'public', 'USAGE'),
  'service_role public şemasını kullanabilir'
);

select ok(
  has_table_privilege('service_role', 'public.profiles', 'SELECT'),
  'service_role profiles kayıtlarını okuyabilir'
);

select ok(
  has_table_privilege('service_role', 'public.profiles', 'INSERT'),
  'service_role profiles kaydı oluşturabilir'
);

select ok(
  has_table_privilege('service_role', 'public.profiles', 'UPDATE'),
  'service_role profiles kaydını güncelleyebilir'
);

select * from finish();
rollback;
