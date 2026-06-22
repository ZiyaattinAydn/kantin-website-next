-- Kantin Website - Faz 14D: Kariyer retention ve iki aşamalı anonimleştirme
-- Tarih: 22 Haziran 2026
-- Önkoşullar: Faz 2-10 migration dosyaları
-- Bu migration otomatik veri silmez. Mevcut başvurulara oluşturulma tarihinden
-- itibaren 180 günlük inceleme tarihi atar ve admin kontrollü RPC'leri kurar.

begin;

do $$
begin
  create type public.job_application_privacy_status as enum (
    'active',
    'anonymization_pending',
    'anonymized'
  );
exception
  when duplicate_object then null;
end
$$;

alter table public.job_applications
  add column if not exists privacy_status public.job_application_privacy_status not null default 'active',
  add column if not exists retention_until timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists anonymization_started_at timestamptz,
  add column if not exists anonymized_at timestamptz,
  add column if not exists anonymized_by uuid references auth.users(id) on delete set null,
  add column if not exists cv_deleted_at timestamptz,
  add column if not exists anonymization_error text;

update public.job_applications
set retention_until = created_at + interval '180 days'
where retention_until is null;

alter table public.job_applications
  alter column retention_until set default (now() + interval '180 days'),
  alter column retention_until set not null,
  alter column cv_media_id drop not null;

alter table public.job_applications
  drop constraint if exists job_applications_days_not_empty;
alter table public.job_applications
  add constraint job_applications_days_not_empty check (
    privacy_status = 'anonymized'::public.job_application_privacy_status
    or cardinality(availability_days) > 0
  );

alter table public.job_applications
  drop constraint if exists job_applications_anonymized_state;
alter table public.job_applications
  add constraint job_applications_anonymized_state check (
    (
      privacy_status = 'anonymized'::public.job_application_privacy_status
      and anonymized_at is not null
      and cv_media_id is null
    )
    or
    (
      privacy_status <> 'anonymized'::public.job_application_privacy_status
      and anonymized_at is null
    )
  );

create index if not exists job_applications_retention_due_idx
  on public.job_applications (retention_until)
  where privacy_status = 'active'::public.job_application_privacy_status;

create index if not exists job_applications_privacy_status_idx
  on public.job_applications (privacy_status, created_at desc);

create or replace function public.set_job_application_archived_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'archived'::public.job_application_status
     and old.status is distinct from 'archived'::public.job_application_status then
    new.archived_at := coalesce(new.archived_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists set_job_application_archived_at on public.job_applications;
create trigger set_job_application_archived_at
before update of status on public.job_applications
for each row execute function public.set_job_application_archived_at();

create or replace function public.begin_job_application_anonymization(
  p_application_id uuid
)
returns table (
  application_id uuid,
  media_id uuid,
  bucket_name text,
  object_path text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.job_applications%rowtype;
  v_media public.media%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  select application.*
  into v_application
  from public.job_applications as application
  where application.id = p_application_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'application_not_found';
  end if;
  if v_application.privacy_status = 'anonymized'::public.job_application_privacy_status then
    raise exception using errcode = 'P0001', message = 'application_already_anonymized';
  end if;
  if v_application.status <> 'archived'::public.job_application_status then
    raise exception using errcode = 'P0001', message = 'application_must_be_archived';
  end if;

  if v_application.cv_media_id is not null then
    select media.*
    into v_media
    from public.media as media
    where media.id = v_application.cv_media_id;
  end if;

  if v_application.privacy_status = 'active'::public.job_application_privacy_status then
    update public.job_applications
    set
      privacy_status = 'anonymization_pending'::public.job_application_privacy_status,
      anonymization_started_at = now(),
      anonymization_error = null
    where id = v_application.id;

    insert into public.admin_activity_logs (
      actor_id, action, entity_type, entity_id, entity_label, metadata
    ) values (
      auth.uid(),
      'application_anonymization_started',
      'job_applications',
      v_application.id,
      'Kariyer başvurusu',
      jsonb_build_object('retention_until', v_application.retention_until)
    );
  end if;

  return query select
    v_application.id,
    v_media.id,
    v_media.bucket_name,
    v_media.object_path;
end;
$$;

create or replace function public.cancel_job_application_anonymization(
  p_application_id uuid,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  update public.job_applications
  set
    privacy_status = 'active'::public.job_application_privacy_status,
    anonymization_started_at = null,
    anonymization_error = left(nullif(btrim(coalesce(p_reason, '')), ''), 500)
  where id = p_application_id
    and privacy_status = 'anonymization_pending'::public.job_application_privacy_status;

  get diagnostics v_updated = row_count;
  if v_updated > 0 then
    insert into public.admin_activity_logs (
      actor_id, action, entity_type, entity_id, entity_label, metadata
    ) values (
      auth.uid(),
      'application_anonymization_cancelled',
      'job_applications',
      p_application_id,
      'Kariyer başvurusu',
      jsonb_build_object('reason', left(coalesce(p_reason, ''), 500))
    );
  end if;

  return v_updated > 0;
end;
$$;

create or replace function public.complete_job_application_anonymization(
  p_application_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.job_applications%rowtype;
  v_media public.media%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  select application.*
  into v_application
  from public.job_applications as application
  where application.id = p_application_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'application_not_found';
  end if;
  if v_application.privacy_status = 'anonymized'::public.job_application_privacy_status then
    return true;
  end if;
  if v_application.privacy_status <> 'anonymization_pending'::public.job_application_privacy_status then
    raise exception using errcode = 'P0001', message = 'anonymization_not_started';
  end if;

  if v_application.cv_media_id is not null then
    select media.*
    into v_media
    from public.media as media
    where media.id = v_application.cv_media_id;

    if found and (
      v_media.source <> 'storage'::public.media_source
      or v_media.kind <> 'document'::public.media_kind
      or v_media.bucket_name is distinct from 'career-cvs'
      or v_media.object_path is null
    ) then
      raise exception using errcode = 'P0001', message = 'invalid_cv_media';
    end if;

    if found and exists (
      select 1
      from storage.objects as object
      where object.bucket_id = v_media.bucket_name
        and object.name = v_media.object_path
    ) then
      raise exception using errcode = 'P0001', message = 'cv_still_exists';
    end if;
  end if;

  update public.job_applications
  set
    full_name = 'Anonim Aday',
    phone = '0000000',
    email = 'anon-' || replace(id::text, '-', '') || '@invalid.local',
    preferred_branch_id = null,
    is_branch_flexible = true,
    availability_days = array[]::text[],
    experience = null,
    introduction = 'Başvuru verisi geri döndürülemez biçimde anonimleştirildi.',
    cv_media_id = null,
    status = 'archived'::public.job_application_status,
    admin_notes = null,
    submission_token = gen_random_uuid(),
    submission_fingerprint = null,
    source_ip_hash = null,
    user_agent_hash = null,
    privacy_status = 'anonymized'::public.job_application_privacy_status,
    anonymized_at = now(),
    anonymized_by = auth.uid(),
    cv_deleted_at = now(),
    anonymization_error = null
  where id = v_application.id;

  if v_application.cv_media_id is not null then
    delete from public.media where id = v_application.cv_media_id;
  end if;

  insert into public.admin_activity_logs (
    actor_id, action, entity_type, entity_id, entity_label, metadata
  ) values (
    auth.uid(),
    'application_anonymized',
    'job_applications',
    v_application.id,
    'Anonimleştirilmiş başvuru',
    jsonb_build_object(
      'retention_until', v_application.retention_until,
      'cv_media_deleted', v_application.cv_media_id is not null
    )
  );

  return true;
end;
$$;

revoke all on function public.begin_job_application_anonymization(uuid) from public, anon, authenticated;
revoke all on function public.cancel_job_application_anonymization(uuid, text) from public, anon, authenticated;
revoke all on function public.complete_job_application_anonymization(uuid) from public, anon, authenticated;

grant execute on function public.begin_job_application_anonymization(uuid) to authenticated;
grant execute on function public.cancel_job_application_anonymization(uuid, text) to authenticated;
grant execute on function public.complete_job_application_anonymization(uuid) to authenticated;

comment on column public.job_applications.retention_until is
  'Otomatik silme değil; admin retention incelemesinin son tarihi. Varsayılan 180 gündür.';
comment on column public.job_applications.privacy_status is
  'CV Storage silme ve PII anonimleştirme arasındaki iki aşamalı yaşam döngüsü durumu.';

commit;
