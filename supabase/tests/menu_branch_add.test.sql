begin;

set local search_path = public, extensions;
select plan(5);

select ok(
  to_regprocedure(
    'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)'
  ) is not null,
  'kontrollü ürün-şube ekleme RPC mevcut'
);

select ok(
  (
    select procedure.prosecdef
    from pg_proc as procedure
    where procedure.oid = to_regprocedure(
      'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)'
    )
  ),
  'kontrollü ürün-şube ekleme RPC SECURITY DEFINER'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)',
    'EXECUTE'
  ),
  'authenticated rolü kontrollü ürün-şube ekleme RPC çağırabilir'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)',
    'EXECUTE'
  ),
  'anon rolü kontrollü ürün-şube ekleme RPC çağıramaz'
);

select ok(
  pg_get_functiondef(
    to_regprocedure(
      'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)'
    )
  ) ilike '%menu_category_branches%'
  and pg_get_functiondef(
    to_regprocedure(
      'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)'
    )
  ) ilike '%menu_item_branches%'
  and pg_get_functiondef(
    to_regprocedure(
      'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)'
    )
  ) ilike '%menu_item_variants%'
  and pg_get_functiondef(
    to_regprocedure(
      'public.add_admin_menu_item_to_branch(uuid,uuid,uuid,integer,text,text,text,boolean,integer,integer,boolean,boolean,boolean,uuid)'
    )
  ) ilike '%admin_activity_logs%',
  'RPC kategori, şube fiyatı, varyant ve audit kayıtlarını aynı akışta yönetir'
);

select * from finish();
rollback;
