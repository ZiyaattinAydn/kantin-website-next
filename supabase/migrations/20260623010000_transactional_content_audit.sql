-- Kantin Website - Faz 14F: Transactional content audit
-- Tarih: 23 Haziran 2026
--
-- Generic içerik ve site ayarı tablolarındaki INSERT / UPDATE / DELETE
-- işlemlerini aynı veritabanı transaction'ı içinde audit tablosuna kaydeder.
-- Uygulama katmanı atlanarak yapılan Data API yazmaları da kapsama girer.

begin;

create or replace function public.audit_content_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_old_row jsonb :=
    case
      when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old)
      else '{}'::jsonb
    end;
  v_new_row jsonb :=
    case
      when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new)
      else '{}'::jsonb
    end;
  v_entity_row jsonb;
  v_entity_id uuid;
  v_entity_label text;
  v_action text;
  v_changed_fields jsonb := '[]'::jsonb;
begin
  -- Tema RPC'si iki site_settings satırını tek mantıksal işlem olarak audit eder.
  -- Bu mod açıkken satır bazlı trigger kaydı bilinçli olarak bastırılır.
  if current_setting('app.audit_content_mode', true) = 'semantic' then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  -- Seed, migration ve service-role işlemlerinde auth.uid() bulunmayabilir.
  -- Bu işlemler admin kullanıcı hareketi sayılmaz.
  if v_actor_id is null then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  if not public.is_content_manager() then
    raise exception
      using
        errcode = '42501',
        message = 'content_manager_required';
  end if;

  v_entity_row :=
    case
      when tg_op = 'DELETE' then v_old_row
      else v_new_row
    end;

  if nullif(v_entity_row ->> 'id', '') is not null then
    v_entity_id := (v_entity_row ->> 'id')::uuid;
  end if;

  v_entity_label := nullif(
    left(
      coalesce(
        v_entity_row ->> 'title',
        v_entity_row ->> 'name',
        v_entity_row ->> 'label',
        v_entity_row ->> 'slug',
        v_entity_row ->> 'code',
        v_entity_row ->> 'key'
      ),
      180
    ),
    ''
  );

  if tg_op = 'INSERT' then
    v_action := 'db_create';
  elsif tg_op = 'DELETE' then
    v_action := 'db_delete';
  else
    select coalesce(
      jsonb_agg(changed.key order by changed.key),
      '[]'::jsonb
    )
    into v_changed_fields
    from (
      select all_keys.key
      from (
        select jsonb_object_keys(v_old_row) as key
        union
        select jsonb_object_keys(v_new_row) as key
      ) as all_keys
      where (v_old_row -> all_keys.key)
        is distinct from
        (v_new_row -> all_keys.key)
        and all_keys.key <> 'updated_at'
    ) as changed;

    if (
      (
        (v_old_row ->> 'status') is distinct from (v_new_row ->> 'status')
        and (v_new_row ->> 'status') = 'archived'
      )
      or
      (
        (v_old_row ->> 'is_active') is distinct from (v_new_row ->> 'is_active')
        and (v_new_row ->> 'is_active') = 'false'
      )
    ) then
      v_action := 'db_archive';
    elsif (
      (
        (v_old_row ->> 'status') = 'archived'
        and (v_new_row ->> 'status') is distinct from 'archived'
      )
      or
      (
        (v_old_row ->> 'is_active') = 'false'
        and (v_new_row ->> 'is_active') = 'true'
      )
    ) then
      v_action := 'db_restore';
    else
      v_action := 'db_update';
    end if;
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
    v_actor_id,
    v_action,
    tg_table_name,
    v_entity_id,
    v_entity_label,
    jsonb_build_object(
      'source', 'database_trigger',
      'operation', lower(tg_op),
      'changed_fields', v_changed_fields
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

comment on function public.audit_content_mutation() is
  'Generic içerik ve site ayarı mutasyonlarını aynı transaction içinde audit eder.';

revoke all
on function public.audit_content_mutation()
from public, anon, authenticated;

do $$
declare
  v_table_name text;
begin
  foreach v_table_name in array array[
    'menu_categories',
    'menu_category_branches',
    'menu_items',
    'menu_item_branches',
    'menu_item_variants',
    'events',
    'event_branches',
    'merch_products',
    'merch_product_branches',
    'instagram_posts',
    'branches',
    'site_settings',
    'site_pages',
    'content_blocks'
  ]
  loop
    execute format(
      'drop trigger if exists audit_content_mutation on public.%I',
      v_table_name
    );

    execute format(
      'create trigger audit_content_mutation
       after insert or update or delete
       on public.%I
       for each row
       execute function public.audit_content_mutation()',
      v_table_name
    );
  end loop;
end;
$$;

commit;
