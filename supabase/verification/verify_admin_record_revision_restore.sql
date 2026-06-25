select
  'sürüm geri yükleme RPC mevcut' as kontrol,
  to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)') is not null as basarili;

select
  'sürüm geri yükleme RPC SECURITY DEFINER' as kontrol,
  coalesce((
    select procedure.prosecdef
    from pg_proc as procedure
    where procedure.oid = to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)')
  ), false) as basarili;

select
  'authenticated çağırabilir, anon çağıramaz' as kontrol,
  has_function_privilege(
    'authenticated',
    'public.restore_admin_record_revision(uuid,text,uuid)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'public.restore_admin_record_revision(uuid,text,uuid)',
    'EXECUTE'
  ) as basarili;

select
  'RPC admin ve kayıt eşleşmesi kontrolü içeriyor' as kontrol,
  position(
    'not public.is_admin()'
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0
  and position(
    'revision_target_mismatch'
    in pg_get_functiondef(to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)'))
  ) > 0 as basarili;

select
  'snapshot tablosu istemciden değiştirilemiyor' as kontrol,
  not has_table_privilege('authenticated', 'public.admin_record_revisions', 'INSERT')
  and not has_table_privilege('authenticated', 'public.admin_record_revisions', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.admin_record_revisions', 'DELETE') as basarili;
