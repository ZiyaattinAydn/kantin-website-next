-- Atomic category + branch choices and narrow, concurrency-checked price changes.
-- Prepared only; applying to a remote database requires explicit approval.
begin;
create or replace function public.save_admin_menu_category(p_payload jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid := nullif(p_payload->>'id','')::uuid; v_row public.menu_categories%rowtype;
  v_branch uuid; v_seen uuid[] := '{}'; v_status public.content_status := (p_payload->>'status')::public.content_status;
  v_active boolean := (p_payload->>'is_active')::boolean; v_order integer := (p_payload->>'sort_order')::integer;
begin
  if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
  if char_length(btrim(p_payload->>'name')) not between 1 and 180 or jsonb_typeof(p_payload->'branches') is distinct from 'array'
    or jsonb_array_length(p_payload->'branches') not between 1 and 20 or v_order is null or v_order not between 0 and 100000
    or v_active is null or v_status is null then raise exception using errcode='22023',message='invalid_category_payload'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_unified_menu',0));
  if v_id is not null then
    select * into v_row from public.menu_categories where id=v_id for update;
    if not found then raise exception using errcode='23503',message='category_not_found'; end if;
    if v_row.updated_at is distinct from (p_payload->>'updated_at')::timestamptz or exists (
      select 1 from (select * from public.menu_category_branches where category_id=v_id) b
      full join jsonb_to_recordset(p_payload->'branch_snapshot') as e(id uuid,updated_at timestamptz) on b.id=e.id
      where b.id is null or e.id is null or b.updated_at is distinct from e.updated_at
    ) then raise exception using errcode='40001',message='stale_category'; end if;
    if (v_row.status is distinct from v_status or v_row.is_active is distinct from v_active
      or exists(select 1 from public.menu_category_branches where category_id=v_id and is_active is distinct from (p_payload->'branches' ? branch_id::text))
      or exists(select 1 from jsonb_array_elements_text(p_payload->'branches') b(value) where not exists(select 1 from public.menu_category_branches l where l.category_id=v_id and l.branch_id=b.value::uuid and l.is_active)))
      and p_payload->>'confirmed' is distinct from 'EVET' then raise exception using errcode='22023',message='visibility_confirmation_required'; end if;
    update public.menu_categories set name=btrim(p_payload->>'name'),status=v_status,is_active=v_active,sort_order=v_order where id=v_id;
  else
    if v_status='published' and p_payload->>'confirmed' is distinct from 'EVET' then raise exception using errcode='22023',message='visibility_confirmation_required'; end if;
    insert into public.menu_categories(slug,name,status,is_active,sort_order) values(p_payload->>'slug',btrim(p_payload->>'name'),v_status,v_active,v_order) returning id into v_id;
  end if;
  for v_branch in select value::uuid from jsonb_array_elements_text(p_payload->'branches') loop
    if v_branch=any(v_seen) then raise exception using errcode='22023',message='duplicate_branch_change'; end if;
    v_seen:=array_append(v_seen,v_branch);
    if not exists(select 1 from public.branches where id=v_branch) then raise exception using errcode='23503',message='branch_not_found'; end if;
    insert into public.menu_category_branches(category_id,branch_id,is_active,sort_order) values(v_id,v_branch,true,v_order)
      on conflict(category_id,branch_id) do update set is_active=true,sort_order=excluded.sort_order;
  end loop;
  update public.menu_category_branches set is_active=false where category_id=v_id and not(branch_id=any(v_seen)) and is_active;
  return v_id;
end; $$;
revoke all on function public.save_admin_menu_category(jsonb) from public,anon,authenticated;
grant execute on function public.save_admin_menu_category(jsonb) to authenticated;

create or replace function public.save_admin_menu_prices(p_payload jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare v_id uuid := (p_payload->>'id')::uuid; v_change jsonb; v_count integer; v_seen uuid[] := '{}'; v_record uuid;
begin
  if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
  if jsonb_typeof(p_payload->'branches') is distinct from 'array' or jsonb_typeof(p_payload->'variants') is distinct from 'array'
    or jsonb_array_length(p_payload->'branches')>20 or jsonb_array_length(p_payload->'variants')>600
    or jsonb_array_length(p_payload->'branches')+jsonb_array_length(p_payload->'variants')=0 then raise exception using errcode='22023',message='invalid_price_payload'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_unified_menu',0));
  perform 1 from public.menu_items where id=v_id for update;
  if not found then raise exception using errcode='23503',message='menu_item_not_found'; end if;
  for v_change in select value from jsonb_array_elements(p_payload->'branches') loop
    v_record:=(v_change->>'id')::uuid;
    if v_record=any(v_seen) then raise exception using errcode='22023',message='duplicate_price_change'; end if; v_seen:=array_append(v_seen,v_record);
    update public.menu_item_branches set price_cents=(v_change->>'price_cents')::integer
      where id=v_record and menu_item_id=v_id and updated_at=(v_change->>'updated_at')::timestamptz;
    get diagnostics v_count=row_count;
    if v_count<>1 then raise exception using errcode='40001',message='stale_price'; end if;
  end loop;
  for v_change in select value from jsonb_array_elements(p_payload->'variants') loop
    v_record:=(v_change->>'id')::uuid;
    if v_record=any(v_seen) then raise exception using errcode='22023',message='duplicate_price_change'; end if; v_seen:=array_append(v_seen,v_record);
    if (v_change->>'price_cents')::integer is null then raise exception using errcode='22023',message='invalid_price'; end if;
    update public.menu_item_variants v set price_cents=(v_change->>'price_cents')::integer
      where v.id=v_record and v.updated_at=(v_change->>'updated_at')::timestamptz
      and exists(select 1 from public.menu_item_branches b where b.id=v.menu_item_branch_id and b.menu_item_id=v_id);
    get diagnostics v_count=row_count;
    if v_count<>1 then raise exception using errcode='40001',message='stale_price'; end if;
  end loop;
end; $$;
revoke all on function public.save_admin_menu_prices(jsonb) from public,anon,authenticated;
grant execute on function public.save_admin_menu_prices(jsonb) to authenticated;

-- Event fields and branch visibility are persisted in the same transaction.
create or replace function public.save_admin_event_with_branches(p_id uuid,p_updated_at timestamptz,p_payload jsonb,p_branches uuid[],p_branch_snapshot jsonb,p_confirmed text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid:=p_id; v_current public.events%rowtype; v public.events%rowtype; v_branch uuid; v_seen uuid[]:='{}';
begin
 if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
 if p_branches is null or cardinality(p_branches)>20 or jsonb_typeof(p_branch_snapshot) is distinct from 'array' then raise exception using errcode='22023',message='invalid_event_payload'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_events',0));
 if v_id is not null then
  select * into v_current from public.events where id=v_id for update;
  if not found then raise exception using errcode='23503',message='event_not_found'; end if;
  if v_current.updated_at is distinct from p_updated_at or exists(
   select 1 from (select * from public.event_branches where event_id=v_id) b
   full join jsonb_to_recordset(p_branch_snapshot) as e(id uuid,updated_at timestamptz) on b.id=e.id
   where b.id is null or e.id is null or b.updated_at is distinct from e.updated_at
  ) then raise exception using errcode='40001',message='stale_event'; end if;
 end if;
 v:=jsonb_populate_record(v_current,p_payload);
 if p_confirmed not in ('YAYINLA','PASİFE AL') or p_confirmed is null then
  if p_id is null and v.status='published' and v.is_active
    or p_id is not null and (v.status is distinct from v_current.status or v.is_active is distinct from v_current.is_active)
    or p_id is not null and v.status='published' and v.is_active and (
      exists(select 1 from public.event_branches where event_id=v_id and is_active is distinct from (branch_id=any(p_branches)))
      or exists(select 1 from unnest(p_branches) b(id) where not exists(select 1 from public.event_branches l where l.event_id=v_id and l.branch_id=b.id and l.is_active)))
  then raise exception using errcode='22023',message='visibility_confirmation_required'; end if;
 end if;
 if v_id is null then
  insert into public.events(slug,title,summary,description,start_at,end_at,venue_name,location_text,external_url,image_media_id,status,is_active,is_featured,sort_order,published_at,content_type,cta_label,publish_start_at,publish_end_at)
  values(v.slug,v.title,v.summary,v.description,v.start_at,v.end_at,v.venue_name,v.location_text,v.external_url,v.image_media_id,v.status,v.is_active,coalesce(v.is_featured,false),-1,v.published_at,coalesce(v.content_type,'event'),v.cta_label,v.publish_start_at,v.publish_end_at) returning id into v_id;
 else
  update public.events set title=v.title,summary=v.summary,description=v.description,start_at=v.start_at,end_at=v.end_at,venue_name=v.venue_name,
   location_text=v.location_text,external_url=v.external_url,image_media_id=v.image_media_id,status=v.status,is_active=v.is_active,is_featured=v.is_featured,
   published_at=v.published_at,content_type=v.content_type,cta_label=v.cta_label,publish_start_at=v.publish_start_at,publish_end_at=v.publish_end_at where id=v_id;
 end if;
 for v_branch in select unnest(p_branches) loop
  if v_branch=any(v_seen) then raise exception using errcode='22023',message='duplicate_branch_change'; end if; v_seen:=array_append(v_seen,v_branch);
  insert into public.event_branches(event_id,branch_id,is_active,sort_order) values(v_id,v_branch,true,-1) on conflict(event_id,branch_id) do update set is_active=true;
 end loop;
 update public.event_branches set is_active=false where event_id=v_id and not(branch_id=any(p_branches)) and is_active;
 return v_id;
end; $$;
revoke all on function public.save_admin_event_with_branches(uuid,timestamptz,jsonb,uuid[],jsonb,text) from public,anon,authenticated;
grant execute on function public.save_admin_event_with_branches(uuid,timestamptz,jsonb,uuid[],jsonb,text) to authenticated;
commit;
