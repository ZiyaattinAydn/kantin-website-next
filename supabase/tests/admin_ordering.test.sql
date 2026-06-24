begin;

set local search_path = public, extensions;
select plan(5);

select ok(
  to_regprocedure('public.assign_admin_sort_order()') is not null,
  'otomatik sıralama trigger fonksiyonu mevcut'
);

select ok(
  (
    select procedure.prosecdef
    from pg_proc as procedure
    where procedure.oid = to_regprocedure('public.assign_admin_sort_order()')
  ),
  'otomatik sıralama fonksiyonu SECURITY DEFINER'
);

select ok(
  pg_get_functiondef(to_regprocedure('public.assign_admin_sort_order()'))
    ilike '%pg_advisory_xact_lock%',
  'aynı kapsamlı eşzamanlı eklemeler transaction lock ile sıralanır'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.menu_items'::regclass
      and tgname = 'menu_items_assign_admin_sort_order'
      and not tgisinternal
  ),
  'menü ürünlerinde otomatik sıralama triggerı aktif'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.content_blocks'::regclass
      and tgname = 'content_blocks_assign_admin_sort_order'
      and not tgisinternal
  ),
  'içerik bloklarında kapsamlı otomatik sıralama triggerı aktif'
);

select * from finish();
rollback;
