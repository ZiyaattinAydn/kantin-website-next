-- Admin listelerinde kullanıcının sıra numarası girmesine gerek bırakmadan,
-- aynı anda yapılan eklemelerde çakışmayan otomatik sıralama.

create or replace function public.assign_admin_sort_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new jsonb := to_jsonb(new);
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  v_scope jsonb := '{}'::jsonb;
  v_scope_field text;
  v_scope_changed boolean := false;
  v_where text := 'true';
  v_exclude_current text := '';
  v_duplicate boolean := false;
  v_reassign boolean := false;
  v_next_order integer;
  v_index integer;
begin
  if new.sort_order is null then
    new.sort_order := -1;
  end if;

  if tg_op = 'UPDATE' then
    v_exclude_current := format(
      ' and (to_jsonb(t)->>''id'') is distinct from %L',
      v_old->>'id'
    );
  end if;

  if tg_nargs > 0 then
    for v_index in 0..tg_nargs - 1 loop
      v_scope_field := tg_argv[v_index];
      v_scope := v_scope || jsonb_build_object(v_scope_field, v_new->v_scope_field);
      v_where := v_where || format(
        ' and (to_jsonb(t)->>%L) is not distinct from %L',
        v_scope_field,
        v_new->>v_scope_field
      );

      if tg_op = 'UPDATE'
        and (v_old->v_scope_field) is distinct from (v_new->v_scope_field) then
        v_scope_changed := true;
      end if;
    end loop;
  end if;

  -- Kilit yalnız aynı tablo ve aynı sıralama kapsamındaki işlemleri sıraya koyar.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      tg_table_schema || '.' || tg_table_name || ':' || v_scope::text,
      0
    )
  );

  v_reassign := new.sort_order < 0 or v_scope_changed;

  if not v_reassign then
    execute format(
      'select exists (
         select 1
         from public.%I as t
         where %s
           and t.sort_order = $1%s
       )',
      tg_table_name,
      v_where,
      v_exclude_current
    )
    into v_duplicate
    using new.sort_order;

    v_reassign := v_duplicate;
  end if;

  if v_reassign then
    execute format(
      'select coalesce(max(t.sort_order), -10) + 10
       from public.%I as t
       where %s%s',
      tg_table_name,
      v_where,
      v_exclude_current
    )
    into v_next_order;

    if v_next_order > 2147483640 then
      raise exception using
        errcode = '22003',
        message = 'admin_sort_order_limit_reached';
    end if;

    new.sort_order := v_next_order;
  end if;

  return new;
end;
$$;

revoke all on function public.assign_admin_sort_order() from public, anon, authenticated;

-- Kapsamsız listeler.
drop trigger if exists branches_assign_admin_sort_order on public.branches;
create trigger branches_assign_admin_sort_order
before insert or update of sort_order on public.branches
for each row execute function public.assign_admin_sort_order();

drop trigger if exists menu_categories_assign_admin_sort_order on public.menu_categories;
create trigger menu_categories_assign_admin_sort_order
before insert or update of sort_order on public.menu_categories
for each row execute function public.assign_admin_sort_order();

drop trigger if exists events_assign_admin_sort_order on public.events;
create trigger events_assign_admin_sort_order
before insert or update of sort_order on public.events
for each row execute function public.assign_admin_sort_order();

drop trigger if exists merch_products_assign_admin_sort_order on public.merch_products;
create trigger merch_products_assign_admin_sort_order
before insert or update of sort_order on public.merch_products
for each row execute function public.assign_admin_sort_order();

drop trigger if exists site_settings_assign_admin_sort_order on public.site_settings;
create trigger site_settings_assign_admin_sort_order
before insert or update of sort_order on public.site_settings
for each row execute function public.assign_admin_sort_order();

drop trigger if exists site_pages_assign_admin_sort_order on public.site_pages;
create trigger site_pages_assign_admin_sort_order
before insert or update of sort_order on public.site_pages
for each row execute function public.assign_admin_sort_order();

-- Kapsamlı listeler.
drop trigger if exists media_assign_admin_sort_order on public.media;
create trigger media_assign_admin_sort_order
before insert or update of sort_order, kind on public.media
for each row execute function public.assign_admin_sort_order('kind');

drop trigger if exists menu_category_branches_assign_admin_sort_order on public.menu_category_branches;
create trigger menu_category_branches_assign_admin_sort_order
before insert or update of sort_order, branch_id on public.menu_category_branches
for each row execute function public.assign_admin_sort_order('branch_id');

drop trigger if exists menu_items_assign_admin_sort_order on public.menu_items;
create trigger menu_items_assign_admin_sort_order
before insert or update of sort_order, category_id on public.menu_items
for each row execute function public.assign_admin_sort_order('category_id');

drop trigger if exists menu_item_branches_assign_admin_sort_order on public.menu_item_branches;
create trigger menu_item_branches_assign_admin_sort_order
before insert or update of sort_order, branch_id on public.menu_item_branches
for each row execute function public.assign_admin_sort_order('branch_id');

drop trigger if exists menu_item_variants_assign_admin_sort_order on public.menu_item_variants;
create trigger menu_item_variants_assign_admin_sort_order
before insert or update of sort_order, menu_item_branch_id on public.menu_item_variants
for each row execute function public.assign_admin_sort_order('menu_item_branch_id');

drop trigger if exists event_branches_assign_admin_sort_order on public.event_branches;
create trigger event_branches_assign_admin_sort_order
before insert or update of sort_order, branch_id on public.event_branches
for each row execute function public.assign_admin_sort_order('branch_id');

drop trigger if exists merch_product_branches_assign_admin_sort_order on public.merch_product_branches;
create trigger merch_product_branches_assign_admin_sort_order
before insert or update of sort_order, branch_id on public.merch_product_branches
for each row execute function public.assign_admin_sort_order('branch_id');

drop trigger if exists instagram_posts_assign_admin_sort_order on public.instagram_posts;
create trigger instagram_posts_assign_admin_sort_order
before insert or update of sort_order, branch_id on public.instagram_posts
for each row execute function public.assign_admin_sort_order('branch_id');

drop trigger if exists content_blocks_assign_admin_sort_order on public.content_blocks;
create trigger content_blocks_assign_admin_sort_order
before insert or update of sort_order, page_id on public.content_blocks
for each row execute function public.assign_admin_sort_order('page_id');

comment on function public.assign_admin_sort_order() is
  'Admin kayıtlarında aynı kapsam içindeki sıralamayı advisory transaction lock ile çakışmasız atar.';
