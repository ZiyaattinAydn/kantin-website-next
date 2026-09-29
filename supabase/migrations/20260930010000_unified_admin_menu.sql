-- A single atomic edit across the existing menu tables; no data rewrite.
begin;
create or replace function public.save_admin_menu_product(p_payload jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid := nullif(p_payload->>'id', '')::uuid;
  v_item public.menu_items%rowtype;
  v_category uuid := (p_payload->>'category_id')::uuid;
  v_branch jsonb;
  v_variant jsonb;
  v_link_id uuid;
  v_variant_id uuid;
  v_branch_id uuid;
  v_seen uuid[] := '{}';
  v_options uuid[];
  v_status public.content_status := (p_payload->>'status')::public.content_status;
  v_active boolean := (p_payload->>'is_active')::boolean;
begin
  if not public.is_admin() then raise exception using errcode='42501', message='admin_required'; end if;
  if jsonb_typeof(p_payload->'branches') is distinct from 'array'
    or jsonb_array_length(p_payload->'branches') not between 1 and 20
    or v_status not in ('draft', 'published', 'archived')
    or v_active is null
    or char_length(btrim(p_payload->>'name')) not between 1 and 180
    then raise exception using errcode='22023', message='invalid_menu_payload'; end if;
  -- Same lock order for every menu edit/reorder; avoids partial or conflicting writes.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_unified_menu', 0));
  if v_id is not null then
    select * into v_item from public.menu_items where id=v_id for update;
    if not found then raise exception using errcode='23503', message='menu_item_not_found'; end if;
    if v_item.updated_at is distinct from (p_payload->>'updated_at')::timestamptz then
      raise exception using errcode='40001', message='stale_menu_product';
    end if;
    -- Compare ALL child records, including hidden options and unselected branches.
    if exists (
      select 1 from public.menu_item_branches b full join
      jsonb_to_recordset(p_payload->'branch_snapshot') as e(id uuid, updated_at timestamptz)
      on b.id=e.id where (b.menu_item_id=v_id or e.id is not null)
      and (b.menu_item_id is distinct from v_id or e.id is null or b.updated_at is distinct from e.updated_at)
    ) or exists (
      select 1 from (select v.* from public.menu_item_variants v join public.menu_item_branches b on b.id=v.menu_item_branch_id where b.menu_item_id=v_id) v
      full join jsonb_to_recordset(p_payload->'variant_snapshot') as e(id uuid, updated_at timestamptz) on v.id=e.id
      where v.id is null or e.id is null or v.updated_at is distinct from e.updated_at
    ) then raise exception using errcode='40001', message='stale_menu_product'; end if;
    if (v_item.is_active is distinct from v_active or v_item.status is distinct from v_status)
      and p_payload->>'confirmed' is distinct from 'EVET' then
      raise exception using errcode='22023', message='visibility_confirmation_required';
    end if;
  elsif v_status='published' and p_payload->>'confirmed' is distinct from 'EVET' then
    raise exception using errcode='22023', message='visibility_confirmation_required';
  end if;
  if not exists(select 1 from public.menu_categories where id=v_category) then
    raise exception using errcode='23503', message='menu_category_not_found';
  end if;
  if nullif(p_payload->>'image_media_id','') is not null and not exists(
    select 1 from public.media where id=(p_payload->>'image_media_id')::uuid
      and kind='image' and status='published' and is_active
  ) then raise exception using errcode='23503', message='media_not_available'; end if;
  if v_id is null then
    insert into public.menu_items(category_id,slug,name,description,image_media_id,status,is_active,sort_order)
    values(v_category,p_payload->>'slug',btrim(p_payload->>'name'),nullif(p_payload->>'description',''),nullif(p_payload->>'image_media_id','')::uuid,v_status,v_active,-1)
    returning id into v_id;
  else
    update public.menu_items set category_id=v_category,name=btrim(p_payload->>'name'),
      description=nullif(p_payload->>'description',''),image_media_id=nullif(p_payload->>'image_media_id','')::uuid,
      status=v_status,is_active=v_active where id=v_id;
  end if;
  for v_branch in select value from jsonb_array_elements(p_payload->'branches') loop
    v_branch_id := (v_branch->>'id')::uuid;
    if v_branch_id=any(v_seen) then raise exception using errcode='22023',message='duplicate_branch_change'; end if;
    v_seen := array_append(v_seen,v_branch_id);
    if not exists(select 1 from public.branches where id=v_branch_id) then
      raise exception using errcode='23503',message='branch_not_found'; end if;
    insert into public.menu_category_branches(category_id,branch_id,is_active,sort_order)
    values(v_category,v_branch_id,true,-1) on conflict(category_id,branch_id) do update set is_active=true;
    insert into public.menu_item_branches(menu_item_id,branch_id,price_cents,is_active,sort_order)
    values(v_id,v_branch_id,(v_branch->>'price_cents')::integer,(v_branch->>'is_active')::boolean,-1)
    on conflict(menu_item_id,branch_id) do update set price_cents=excluded.price_cents,is_active=excluded.is_active
    returning id into v_link_id;
    if jsonb_typeof(v_branch->'variants') is distinct from 'array' or jsonb_array_length(v_branch->'variants')>30 then
      raise exception using errcode='22023',message='invalid_menu_payload'; end if;
    v_options := '{}';
    for v_variant in select value from jsonb_array_elements(v_branch->'variants') loop
      v_variant_id := nullif(v_variant->>'id','')::uuid;
      if v_variant_id is not null then
        if v_variant_id=any(v_options) or not exists(select 1 from public.menu_item_variants where id=v_variant_id and menu_item_branch_id=v_link_id) then
          raise exception using errcode='23503',message='variant_not_owned'; end if;
        update public.menu_item_variants set label=v_variant->>'label',price_cents=(v_variant->>'price_cents')::integer,
          is_active=(v_variant->>'is_active')::boolean where id=v_variant_id;
      else
        insert into public.menu_item_variants(menu_item_branch_id,slug,label,price_cents,is_active,sort_order)
        values(v_link_id,v_variant->>'slug',v_variant->>'label',(v_variant->>'price_cents')::integer,(v_variant->>'is_active')::boolean,-1)
        returning id into v_variant_id;
      end if;
      v_options := array_append(v_options,v_variant_id);
    end loop;
    -- Removing an option hides it; existing metadata, notes, and revision records survive.
    update public.menu_item_variants set is_active=false where menu_item_branch_id=v_link_id and not(id=any(v_options)) and is_active;
  end loop;
  if exists(select 1 from public.menu_item_branches where menu_item_id=v_id and not(branch_id=any(v_seen)) and is_active)
    and p_payload->>'confirmed' is distinct from 'EVET' then
    raise exception using errcode='22023',message='visibility_confirmation_required'; end if;
  update public.menu_item_branches set is_active=false where menu_item_id=v_id and not(branch_id=any(v_seen)) and is_active;
  return v_id;
end;
$$;
revoke all on function public.save_admin_menu_product(jsonb) from public, anon, authenticated;
grant execute on function public.save_admin_menu_product(jsonb) to authenticated;

create or replace function public.move_admin_menu_product(p_id uuid,p_branch_id uuid,p_direction text,p_updated_at timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare v_current public.menu_item_branches%rowtype; v_other public.menu_item_branches%rowtype; v_category uuid; v_spare integer;
begin
  if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
  if p_direction not in ('up','down') then raise exception using errcode='22023',message='invalid_menu_payload'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_unified_menu',0));
  select * into v_current from public.menu_item_branches where menu_item_id=p_id and branch_id=p_branch_id for update;
  if not found or v_current.updated_at is distinct from p_updated_at then raise exception using errcode='40001',message='stale_menu_product'; end if;
  select category_id into v_category from public.menu_items where id=p_id;
  select b.* into v_other from public.menu_item_branches b join public.menu_items i on i.id=b.menu_item_id
    where b.branch_id=p_branch_id and i.category_id=v_category
    and case when p_direction='up' then b.sort_order<v_current.sort_order else b.sort_order>v_current.sort_order end
    order by case when p_direction='up' then -b.sort_order else b.sort_order end limit 1 for update of b;
  if not found then return; end if;
  select max(sort_order)+10 into v_spare from public.menu_item_branches where branch_id=p_branch_id;
  -- Free the old slot before swapping so the existing ordering trigger stays enabled.
  update public.menu_item_branches set sort_order=v_spare where id=v_current.id;
  update public.menu_item_branches set sort_order=v_current.sort_order where id=v_other.id;
  update public.menu_item_branches set sort_order=v_other.sort_order where id=v_current.id;
end;
$$;
revoke all on function public.move_admin_menu_product(uuid,uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.move_admin_menu_product(uuid,uuid,text,timestamptz) to authenticated;
commit;
