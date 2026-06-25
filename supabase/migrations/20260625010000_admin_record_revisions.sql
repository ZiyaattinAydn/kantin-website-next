-- Kantin Website - Kritik admin kayıtları için otomatik sürüm geçmişi
-- Tarih: 25 Haziran 2026
--
-- Bu migration mevcut içerikleri değiştirmez veya silmez.
-- Yalnızca bundan sonra admin paneli / Data API üzerinden yapılan kritik kayıt
-- değişikliklerinin transaction içindeki önceki ve sonraki hâllerini saklar.

begin;

create table if not exists public.admin_record_revisions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  entity_label text,
  operation text not null,
  before_data jsonb,
  after_data jsonb,
  changed_fields jsonb not null default '[]'::jsonb,
  schema_version smallint not null default 1,
  created_at timestamptz not null default now(),
  constraint admin_record_revisions_entity_type_format check (
    entity_type ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'
  ),
  constraint admin_record_revisions_operation_check check (
    operation in ('insert', 'update', 'delete')
  ),
  constraint admin_record_revisions_before_object check (
    before_data is null or jsonb_typeof(before_data) = 'object'
  ),
  constraint admin_record_revisions_after_object check (
    after_data is null or jsonb_typeof(after_data) = 'object'
  ),
  constraint admin_record_revisions_changed_fields_array check (
    jsonb_typeof(changed_fields) = 'array'
  ),
  constraint admin_record_revisions_snapshot_shape check (
    (operation = 'insert' and before_data is null and after_data is not null)
    or (operation = 'update' and before_data is not null and after_data is not null)
    or (operation = 'delete' and before_data is not null and after_data is null)
  )
);

create index if not exists admin_record_revisions_entity_recent_idx
  on public.admin_record_revisions (entity_type, entity_id, created_at desc);

create index if not exists admin_record_revisions_recent_idx
  on public.admin_record_revisions (created_at desc);

create index if not exists admin_record_revisions_actor_recent_idx
  on public.admin_record_revisions (actor_id, created_at desc)
  where actor_id is not null;

alter table public.admin_record_revisions enable row level security;

revoke all on public.admin_record_revisions from anon;
revoke all on public.admin_record_revisions from authenticated;
grant select on public.admin_record_revisions to authenticated;

drop policy if exists admin_record_revisions_admin_select
  on public.admin_record_revisions;

create policy admin_record_revisions_admin_select
on public.admin_record_revisions
for select
to authenticated
using ((select public.is_admin()));

create or replace function public.capture_admin_record_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_before_data jsonb :=
    case
      when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old)
      else null
    end;
  v_after_data jsonb :=
    case
      when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new)
      else null
    end;
  v_entity_data jsonb;
  v_entity_id uuid;
  v_entity_label text;
  v_changed_fields jsonb := '[]'::jsonb;
begin
  -- Migration, seed ve service-role işlemlerinde auth.uid() bulunmayabilir.
  -- Otomatik sürüm geçmişi yalnız oturum açmış içerik yöneticisi işlemlerini tutar.
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

  v_entity_data :=
    case
      when tg_op = 'DELETE' then v_before_data
      else v_after_data
    end;

  v_entity_id := (v_entity_data ->> 'id')::uuid;
  v_entity_label := nullif(
    left(
      coalesce(
        v_entity_data ->> 'title',
        v_entity_data ->> 'name',
        v_entity_data ->> 'label',
        v_entity_data ->> 'slug',
        v_entity_data ->> 'key'
      ),
      180
    ),
    ''
  );

  if tg_op = 'UPDATE' then
    select coalesce(
      jsonb_agg(changed.key order by changed.key),
      '[]'::jsonb
    )
    into v_changed_fields
    from (
      select all_keys.key
      from (
        select jsonb_object_keys(v_before_data) as key
        union
        select jsonb_object_keys(v_after_data) as key
      ) as all_keys
      where (v_before_data -> all_keys.key)
        is distinct from
        (v_after_data -> all_keys.key)
        and all_keys.key not in ('created_at', 'updated_at')
    ) as changed;

    -- Yalnız updated_at gibi teknik alanlar değiştiyse gereksiz sürüm üretme.
    if jsonb_array_length(v_changed_fields) = 0 then
      return new;
    end if;
  end if;

  insert into public.admin_record_revisions (
    actor_id,
    entity_type,
    entity_id,
    entity_label,
    operation,
    before_data,
    after_data,
    changed_fields
  )
  values (
    v_actor_id,
    tg_table_name,
    v_entity_id,
    v_entity_label,
    lower(tg_op),
    v_before_data,
    v_after_data,
    v_changed_fields
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

comment on table public.admin_record_revisions is
  'Şube, site ayarı, site sayfası ve içerik bloğu kayıtlarının geri yüklenebilir transaction snapshotları.';

comment on function public.capture_admin_record_revision() is
  'Kritik admin kayıtlarının önceki ve sonraki hâllerini aynı transaction içinde değiştirilemez sürüm kaydı olarak saklar.';

revoke all
on function public.capture_admin_record_revision()
from public, anon, authenticated;

do $$
declare
  v_table_name text;
begin
  foreach v_table_name in array array[
    'branches',
    'site_settings',
    'site_pages',
    'content_blocks'
  ]
  loop
    execute format(
      'drop trigger if exists capture_admin_record_revision on public.%I',
      v_table_name
    );

    execute format(
      'create trigger capture_admin_record_revision
       after insert or update or delete
       on public.%I
       for each row
       execute function public.capture_admin_record_revision()',
      v_table_name
    );
  end loop;
end;
$$;

commit;
