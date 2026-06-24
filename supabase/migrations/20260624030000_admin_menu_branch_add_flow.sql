-- Kantin Website - Kontrollü ürün/şube menüye ekleme akışı
-- Tarih: 24 Haziran 2026
--
-- Bir ürünü yeni bir şubeye eklerken public menü görünürlüğü için gerekli
-- menu_items, menu_category_branches, menu_item_branches ve isteğe bağlı
-- menu_item_variants kayıtlarını tek transaction içinde yönetir.

begin;

create or replace function public.add_admin_menu_item_to_branch(
  p_menu_item_id uuid,
  p_branch_id uuid,
  p_category_id uuid,
  p_price_cents integer,
  p_price_label text,
  p_price_note text,
  p_availability_note text,
  p_is_active boolean,
  p_item_sort_order integer,
  p_category_sort_order integer,
  p_ensure_category_branch boolean default true,
  p_publish_item boolean default false,
  p_publish_category boolean default false,
  p_copy_variants_from_branch_id uuid default null
)
returns table(
  branch_price_id uuid,
  category_branch_id uuid,
  variants_copied integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.menu_items%rowtype;
  v_category public.menu_categories%rowtype;
  v_branch public.branches%rowtype;
  v_branch_price_id uuid;
  v_category_branch_id uuid;
  v_source_branch_price_id uuid;
  v_variants_copied integer := 0;
begin
  if not public.is_content_manager() then
    raise exception using errcode = '42501', message = 'content_manager_required';
  end if;

  if p_price_cents is not null and p_price_cents < 0 then
    raise exception using errcode = '23514', message = 'invalid_price';
  end if;

  if coalesce(p_item_sort_order, 0) < 0 or coalesce(p_category_sort_order, 0) < 0 then
    raise exception using errcode = '23514', message = 'invalid_sort_order';
  end if;

  select * into v_item
  from public.menu_items
  where id = p_menu_item_id
  for update;

  if not found then
    raise exception using errcode = '23503', message = 'menu_item_not_found';
  end if;

  select * into v_category
  from public.menu_categories
  where id = p_category_id
  for update;

  if not found then
    raise exception using errcode = '23503', message = 'menu_category_not_found';
  end if;

  select * into v_branch
  from public.branches
  where id = p_branch_id;

  if not found then
    raise exception using errcode = '23503', message = 'branch_not_found';
  end if;

  update public.menu_items
  set
    category_id = p_category_id,
    status = case when p_publish_item then 'published'::public.content_status else status end,
    is_active = case when p_publish_item then true else is_active end
  where id = p_menu_item_id;

  if p_publish_category then
    update public.menu_categories
    set
      status = 'published'::public.content_status,
      is_active = true
    where id = p_category_id;
  end if;

  if p_ensure_category_branch then
    insert into public.menu_category_branches (
      category_id,
      branch_id,
      is_active,
      sort_order
    )
    values (
      p_category_id,
      p_branch_id,
      true,
      coalesce(p_category_sort_order, 0)
    )
    on conflict (category_id, branch_id) do update
    set
      is_active = true,
      sort_order = excluded.sort_order
    returning id into v_category_branch_id;
  else
    select id into v_category_branch_id
    from public.menu_category_branches
    where category_id = p_category_id
      and branch_id = p_branch_id;
  end if;

  insert into public.menu_item_branches (
    menu_item_id,
    branch_id,
    price_cents,
    currency,
    price_label,
    price_note,
    availability_note,
    is_active,
    sort_order
  )
  values (
    p_menu_item_id,
    p_branch_id,
    p_price_cents,
    'TRY',
    nullif(btrim(coalesce(p_price_label, '')), ''),
    nullif(btrim(coalesce(p_price_note, '')), ''),
    nullif(btrim(coalesce(p_availability_note, '')), ''),
    coalesce(p_is_active, true),
    coalesce(p_item_sort_order, 0)
  )
  on conflict (menu_item_id, branch_id) do update
  set
    price_cents = excluded.price_cents,
    price_label = excluded.price_label,
    price_note = excluded.price_note,
    availability_note = excluded.availability_note,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order
  returning id into v_branch_price_id;

  if p_copy_variants_from_branch_id is not null then
    select id into v_source_branch_price_id
    from public.menu_item_branches
    where menu_item_id = p_menu_item_id
      and branch_id = p_copy_variants_from_branch_id;

    if v_source_branch_price_id is null then
      raise exception using errcode = '23503', message = 'source_branch_price_not_found';
    end if;

    insert into public.menu_item_variants (
      menu_item_branch_id,
      slug,
      label,
      detail,
      price_cents,
      currency,
      price_note,
      metadata,
      is_active,
      sort_order
    )
    select
      v_branch_price_id,
      source.slug,
      source.label,
      source.detail,
      source.price_cents,
      source.currency,
      source.price_note,
      source.metadata,
      source.is_active,
      source.sort_order
    from public.menu_item_variants as source
    where source.menu_item_branch_id = v_source_branch_price_id
    on conflict (menu_item_branch_id, slug) do update
    set
      label = excluded.label,
      detail = excluded.detail,
      price_cents = excluded.price_cents,
      currency = excluded.currency,
      price_note = excluded.price_note,
      metadata = excluded.metadata,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order;

    get diagnostics v_variants_copied = row_count;
  end if;

  insert into public.admin_activity_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    entity_label,
    metadata
  )
  values (
    auth.uid(),
    'menu_item_branch_add',
    'menu_item_branches',
    v_branch_price_id,
    left(v_item.name || ' → ' || v_branch.name, 180),
    jsonb_build_object(
      'menu_item_id', p_menu_item_id,
      'branch_id', p_branch_id,
      'category_id', p_category_id,
      'category_branch_id', v_category_branch_id,
      'variants_copied', v_variants_copied,
      'publish_item', p_publish_item,
      'publish_category', p_publish_category,
      'source', 'transactional_rpc'
    )
  );

  return query
  select v_branch_price_id, v_category_branch_id, v_variants_copied;
end;
$$;

revoke all
on function public.add_admin_menu_item_to_branch(
  uuid,
  uuid,
  uuid,
  integer,
  text,
  text,
  text,
  boolean,
  integer,
  integer,
  boolean,
  boolean,
  boolean,
  uuid
)
from public, anon;

grant execute
on function public.add_admin_menu_item_to_branch(
  uuid,
  uuid,
  uuid,
  integer,
  text,
  text,
  text,
  boolean,
  integer,
  integer,
  boolean,
  boolean,
  boolean,
  uuid
)
to authenticated;

commit;
