-- Separate from business audit history. No raw exception/body/session data is accepted.
begin;
create table public.admin_system_logs (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  route text not null, operation text not null, entity_type text not null, entity_id uuid,
  level text not null check(level in ('info','warning','error','critical')),
  error_code text not null, technical_message text not null, request_id uuid not null,
  safe_detail jsonb not null, resolved_at timestamptz, resolved_by uuid references auth.users(id) on delete set null
);
create index admin_system_logs_recent on public.admin_system_logs(created_at desc);
create index admin_system_logs_level_recent on public.admin_system_logs(level,created_at desc);
alter table public.admin_system_logs enable row level security;
revoke all on public.admin_system_logs from public,anon,authenticated;
grant select on public.admin_system_logs to authenticated;
create policy admin_system_logs_read on public.admin_system_logs for select to authenticated using ((select public.is_admin()));
create function public.record_admin_system_event(p_route text,p_operation text,p_entity_type text,p_entity_id uuid,p_level text,p_error_code text,p_request_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_message text;
begin
  if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
  if p_route !~ '^/admin(/(menu|content|pricing|theme|media|applications|logs|search|manage/(menu-categories|menu-category-branches|menu-items|menu-item-branches|menu-item-variants|events|event-branches|merch-products|merch-product-branches|instagram-posts|site-pages|content-blocks|site-settings|branches)))?$'
    or p_operation not in ('read','save','create','update','archive','delete','restore','reorder','resolve','upload','anonymize')
    or p_entity_type not in ('menu_items','menu_item_branches','menu_item_variants','menu_categories','menu_category_branches','events','event_branches','merch_products','merch_product_branches','instagram_posts','site_pages','content_blocks','site_settings','branches','media','job_applications','system')
    or p_level not in ('info','warning','error','critical') or p_request_id is null
    then raise exception using errcode='22023',message='invalid_log_payload'; end if;
  v_message := case p_error_code
    when '23505' then 'Unique constraint conflict'
    when '23503' then 'Related record missing or referenced'
    when '23514' then 'Check constraint rejected change'
    when '22P02' then 'Invalid typed value'
    when '22023' then 'Invalid operation parameters'
    when '40001' then 'Concurrent change; reload required'
    when '42501' then 'Permission check rejected operation'
    when 'PGRST202' then 'Required database function unavailable'
    when 'PGRST205' then 'Required database table unavailable'
    when 'NETWORK' then 'Database connection failed'
    when 'VALIDATION' then 'Input validation failed'
    else 'Operation failed; raw details omitted' end;
  if p_error_code not in ('23505','23503','23514','22P02','22023','40001','42501','PGRST202','PGRST205','NETWORK','VALIDATION','UNKNOWN') then p_error_code:='UNKNOWN'; end if;
  insert into public.admin_system_logs(actor_id,route,operation,entity_type,entity_id,level,error_code,technical_message,request_id,safe_detail)
  values(auth.uid(),p_route,p_operation,p_entity_type,p_entity_id,p_level,p_error_code,v_message,p_request_id,
    jsonb_build_object('source','admin','retryable',p_error_code in ('40001','NETWORK'))) returning id into v_id;
  return v_id;
end;
$$;
create function public.resolve_admin_system_event(p_id uuid,p_resolved boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
  update public.admin_system_logs set resolved_at=case when p_resolved then now() else null end,
    resolved_by=case when p_resolved then auth.uid() else null end where id=p_id;
  if not found then raise exception using errcode='23503',message='log_not_found'; end if;
end;
$$;
revoke all on function public.record_admin_system_event(text,text,text,uuid,text,text,uuid) from public,anon,authenticated;
revoke all on function public.resolve_admin_system_event(uuid,boolean) from public,anon,authenticated;
grant execute on function public.record_admin_system_event(text,text,text,uuid,text,text,uuid) to authenticated;
grant execute on function public.resolve_admin_system_event(uuid,boolean) to authenticated;
commit;
