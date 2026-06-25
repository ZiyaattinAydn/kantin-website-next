begin;

set local search_path = public, extensions;
select plan(9);

select ok(
  to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)') is not null,
  'sürüm geri yükleme RPC mevcut'
);

select ok(
  (
    select procedure.prosecdef
    from pg_proc as procedure
    where procedure.oid = to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)')
  ),
  'sürüm geri yükleme RPC SECURITY DEFINER'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.restore_admin_record_revision(uuid,text,uuid)',
    'EXECUTE'
  ),
  'authenticated rolü RLS ve admin kontrolü kapsamında geri yükleme RPC çağırabilir'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.restore_admin_record_revision(uuid,text,uuid)',
    'EXECUTE'
  ),
  'anon geri yükleme RPC çağıramaz'
);

select ok(
  position(
    'not public.is_admin()'
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0,
  'RPC aktif admin kontrolünü kendi transaction sınırında yapar'
);

select ok(
  position(
    'revision_target_mismatch'
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0,
  'RPC sürümün beklenen kayıtla eşleşmesini doğrular'
);

select ok(
  position(
    'when ''branches'''
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0
  and position(
    'when ''site_settings'''
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0
  and position(
    'when ''site_pages'''
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0
  and position(
    'when ''content_blocks'''
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0,
  'RPC yalnız dört kritik kayıt türünü açık listeyle işler'
);

select ok(
  position(
    'slug ='
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) = 0
  and position(
    'key ='
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) = 0
  and position(
    'page_id ='
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) = 0
  and position(
    'block_type ='
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) = 0,
  'geri yükleme sistem kimliklerini güncellemez'
);

select ok(
  position(
    'for update'
    in lower(pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)')))
  ) > 0,
  'geri yükleme eşzamanlı değişikliklere karşı hedef kaydı kilitler'
);

select * from finish();
rollback;
