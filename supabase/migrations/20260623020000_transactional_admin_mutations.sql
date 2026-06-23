-- Kantin Website - Faz 14F: Transactional admin mutations
-- Tarih: 23 Haziran 2026
--
-- Tema, kariyer başvurusu ve medya DB değişikliklerini semantic audit kaydıyla
-- aynı transaction içinde tamamlar. Media Storage silme/yükleme işlemleri
-- uygulama katmanında telafi adımlarıyla birlikte yürütülür.

begin;

-- ---------------------------------------------------------------------------
-- Ortak medya kullanım kontrolü
-- ---------------------------------------------------------------------------

create or replace function public.admin_media_has_usage(
  p_media_id uuid,
  p_object_path text,
  p_local_path text,
  p_external_url text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.menu_items where image_media_id = p_media_id
    )
    or exists (
      select 1 from public.events where image_media_id = p_media_id
    )
    or exists (
      select 1 from public.merch_products where image_media_id = p_media_id
    )
    or exists (
      select 1 from public.instagram_posts where image_media_id = p_media_id
    )
    or exists (
      select 1 from public.job_applications where cv_media_id = p_media_id
    )
    or exists (
      select 1
      from public.content_blocks as block
      where position(p_media_id::text in block.content::text) > 0
        or (p_object_path is not null and position(p_object_path in block.content::text) > 0)
        or (p_local_path is not null and position(p_local_path in block.content::text) > 0)
        or (p_external_url is not null and position(p_external_url in block.content::text) > 0)
    );
$$;

revoke all
on function public.admin_media_has_usage(uuid, text, text, text)
from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tema ve bölüm görünürlüğü
-- ---------------------------------------------------------------------------

create or replace function public.save_admin_theme_settings(
  p_theme jsonb,
  p_visibility jsonb,
  p_reset boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  if not public.is_valid_theme_settings(p_theme) then
    raise exception using errcode = '23514', message = 'invalid_theme_settings';
  end if;

  if not public.is_valid_section_visibility(p_visibility) then
    raise exception using errcode = '23514', message = 'invalid_section_visibility';
  end if;

  -- site_settings trigger'ının iki satır için iki ayrı düşük seviyeli kayıt
  -- üretmesini engelle; aşağıda tek semantic audit kaydı yazılır.
  perform set_config('app.audit_content_mode', 'semantic', true);

  insert into public.site_settings (
    key,
    value,
    description,
    is_public,
    status,
    is_active,
    sort_order
  )
  values
    (
      'theme.settings',
      p_theme,
      'Kontrollü font, renk, başlık, gövde, kart yoğunluğu ve ana sayfa sıralama ayarları.',
      true,
      'published'::public.content_status,
      true,
      9
    ),
    (
      'sections.visibility',
      p_visibility,
      'Public site bölüm görünürlükleri.',
      true,
      'published'::public.content_status,
      true,
      5
    )
  on conflict (key) do update
  set
    value = excluded.value,
    description = excluded.description,
    is_public = excluded.is_public,
    status = excluded.status,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

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
    case when p_reset then 'theme_reset' else 'theme_update' end,
    'site_settings',
    null,
    case
      when p_reset then 'Varsayılan tasarım ayarları'
      else 'Kontrollü tasarım ayarları'
    end,
    jsonb_build_object(
      'theme', p_theme,
      'visibility', p_visibility,
      'source', 'transactional_rpc'
    )
  );

  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Kariyer başvurusu admin güncellemesi
-- ---------------------------------------------------------------------------

create or replace function public.update_job_application_admin(
  p_application_id uuid,
  p_status public.job_application_status,
  p_admin_notes text
)
returns table(application_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application_id uuid;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  if char_length(coalesce(p_admin_notes, '')) > 5000 then
    raise exception using errcode = '22001', message = 'admin_notes_too_long';
  end if;

  update public.job_applications
  set
    status = p_status,
    admin_notes = nullif(btrim(coalesce(p_admin_notes, '')), '')
  where id = p_application_id
    and privacy_status = 'active'::public.job_application_privacy_status
  returning id into v_application_id;

  if v_application_id is null then
    raise exception using errcode = 'P0001', message = 'active_application_not_found';
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
    'application_update',
    'job_applications',
    v_application_id,
    'Kariyer başvurusu',
    jsonb_build_object(
      'status', p_status,
      'source', 'transactional_rpc'
    )
  );

  return query select v_application_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Medya oluşturma ve durum değişiklikleri
-- ---------------------------------------------------------------------------

create or replace function public.create_admin_media_record(
  p_bucket_name text,
  p_object_path text,
  p_title text,
  p_alt_text text,
  p_mime_type text,
  p_size_bytes bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_media_id uuid;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  if p_bucket_name not in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media'
  ) then
    raise exception using errcode = '23514', message = 'invalid_public_image_bucket';
  end if;

  if p_object_path !~ '^admin/[0-9]{4}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$' then
    raise exception using errcode = '23514', message = 'invalid_admin_media_path';
  end if;

  if p_mime_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/avif') then
    raise exception using errcode = '23514', message = 'invalid_image_mime_type';
  end if;

  if p_size_bytes is null or p_size_bytes < 1 or p_size_bytes > 8388608 then
    raise exception using errcode = '23514', message = 'invalid_image_size';
  end if;

  if nullif(btrim(coalesce(p_title, '')), '') is null
    or nullif(btrim(coalesce(p_alt_text, '')), '') is null then
    raise exception using errcode = '23514', message = 'media_title_and_alt_required';
  end if;

  if not exists (
    select 1
    from storage.objects as object
    where object.bucket_id = p_bucket_name
      and object.name = p_object_path
  ) then
    raise exception using errcode = 'P0001', message = 'storage_object_not_found';
  end if;

  insert into public.media (
    source,
    kind,
    bucket_name,
    object_path,
    title,
    alt_text,
    mime_type,
    size_bytes,
    status,
    is_active
  )
  values (
    'storage'::public.media_source,
    'image'::public.media_kind,
    p_bucket_name,
    p_object_path,
    btrim(p_title),
    btrim(p_alt_text),
    p_mime_type,
    p_size_bytes,
    'published'::public.content_status,
    true
  )
  returning id into v_media_id;

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
    'media_upload',
    'media',
    v_media_id,
    left(btrim(p_title), 180),
    jsonb_build_object(
      'bucket', p_bucket_name,
      'object_path', p_object_path,
      'source', 'transactional_rpc'
    )
  );

  return v_media_id;
end;
$$;

create or replace function public.set_admin_media_state(
  p_media_id uuid,
  p_action text
)
returns table(media_id uuid, title text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_media public.media%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  select media.*
  into v_media
  from public.media as media
  where media.id = p_media_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'media_not_found';
  end if;

  if p_action = 'media_archive' then
    if not v_media.is_active or v_media.status = 'archived'::public.content_status then
      raise exception using errcode = 'P0001', message = 'media_already_archived';
    end if;

    if public.admin_media_has_usage(
      v_media.id,
      v_media.object_path,
      v_media.local_path,
      v_media.external_url
    ) then
      raise exception using errcode = 'P0001', message = 'media_in_use';
    end if;

    update public.media
    set status = 'archived'::public.content_status,
        is_active = false
    where id = v_media.id;
  elsif p_action = 'media_restore' then
    if v_media.is_active and v_media.status = 'published'::public.content_status then
      raise exception using errcode = 'P0001', message = 'media_already_published';
    end if;

    update public.media
    set status = 'published'::public.content_status,
        is_active = true
    where id = v_media.id;
  else
    raise exception using errcode = '23514', message = 'invalid_media_state_action';
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
    p_action,
    'media',
    v_media.id,
    left(coalesce(v_media.title, 'Medya'), 180),
    jsonb_build_object('source', 'transactional_rpc')
  );

  return query select v_media.id, v_media.title;
end;
$$;

-- ---------------------------------------------------------------------------
-- TEST_ medya silme için iki aşamalı, telafi edilebilir akış
-- ---------------------------------------------------------------------------

create or replace function public.begin_test_admin_media_delete(
  p_media_id uuid
)
returns table(
  media_id uuid,
  title text,
  bucket_name text,
  object_path text,
  previous_status public.content_status,
  previous_is_active boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_media public.media%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  select media.*
  into v_media
  from public.media as media
  where media.id = p_media_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'media_not_found';
  end if;

  if v_media.source <> 'storage'::public.media_source
    or v_media.kind <> 'image'::public.media_kind
    or v_media.bucket_name not in (
      'menu-images',
      'event-images',
      'merch-images',
      'gallery-images',
      'instagram-media'
    )
    or v_media.object_path is null
    or coalesce(v_media.title, '') !~* '^TEST([_[:space:]-])' then
    raise exception using errcode = 'P0001', message = 'test_storage_image_required';
  end if;

  if public.admin_media_has_usage(
    v_media.id,
    v_media.object_path,
    v_media.local_path,
    v_media.external_url
  ) then
    raise exception using errcode = 'P0001', message = 'media_in_use';
  end if;

  update public.media
  set status = 'archived'::public.content_status,
      is_active = false
  where id = v_media.id;

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
    'media_delete_test_started',
    'media',
    v_media.id,
    left(v_media.title, 180),
    jsonb_build_object(
      'previous_status', v_media.status,
      'previous_is_active', v_media.is_active,
      'source', 'transactional_rpc'
    )
  );

  return query
  select
    v_media.id,
    v_media.title,
    v_media.bucket_name,
    v_media.object_path,
    v_media.status,
    v_media.is_active;
end;
$$;

create or replace function public.cancel_test_admin_media_delete(
  p_media_id uuid,
  p_previous_status public.content_status,
  p_previous_is_active boolean,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_media public.media%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  select media.*
  into v_media
  from public.media as media
  where media.id = p_media_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'media_not_found';
  end if;

  if coalesce(v_media.title, '') !~* '^TEST([_[:space:]-])' then
    raise exception using errcode = 'P0001', message = 'test_media_required';
  end if;

  update public.media
  set status = p_previous_status,
      is_active = p_previous_is_active
  where id = v_media.id;

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
    'media_delete_test_cancelled',
    'media',
    v_media.id,
    left(v_media.title, 180),
    jsonb_build_object(
      'reason', left(coalesce(p_reason, ''), 300),
      'source', 'transactional_rpc'
    )
  );

  return true;
end;
$$;

create or replace function public.complete_test_admin_media_delete(
  p_media_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_media public.media%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;

  select media.*
  into v_media
  from public.media as media
  where media.id = p_media_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'media_not_found';
  end if;

  if v_media.source <> 'storage'::public.media_source
    or v_media.kind <> 'image'::public.media_kind
    or v_media.status <> 'archived'::public.content_status
    or v_media.is_active
    or coalesce(v_media.title, '') !~* '^TEST([_[:space:]-])' then
    raise exception using errcode = 'P0001', message = 'media_delete_not_prepared';
  end if;

  if public.admin_media_has_usage(
    v_media.id,
    v_media.object_path,
    v_media.local_path,
    v_media.external_url
  ) then
    raise exception using errcode = 'P0001', message = 'media_in_use';
  end if;

  delete from public.media where id = v_media.id;

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
    'media_delete_test',
    'media',
    v_media.id,
    left(v_media.title, 180),
    jsonb_build_object(
      'bucket', v_media.bucket_name,
      'object_path', v_media.object_path,
      'source', 'transactional_rpc'
    )
  );

  return true;
end;
$$;

-- Admin media ve başvuru mutasyonları yalnız auditli RPC'lerden geçsin.
revoke insert, update, delete on table public.media from authenticated;
revoke insert, update, delete on table public.job_applications from authenticated;

revoke all on function public.save_admin_theme_settings(jsonb, jsonb, boolean)
from public, anon, authenticated;
revoke all on function public.update_job_application_admin(uuid, public.job_application_status, text)
from public, anon, authenticated;
revoke all on function public.create_admin_media_record(text, text, text, text, text, bigint)
from public, anon, authenticated;
revoke all on function public.set_admin_media_state(uuid, text)
from public, anon, authenticated;
revoke all on function public.begin_test_admin_media_delete(uuid)
from public, anon, authenticated;
revoke all on function public.cancel_test_admin_media_delete(uuid, public.content_status, boolean, text)
from public, anon, authenticated;
revoke all on function public.complete_test_admin_media_delete(uuid)
from public, anon, authenticated;

grant execute on function public.save_admin_theme_settings(jsonb, jsonb, boolean)
to authenticated;
grant execute on function public.update_job_application_admin(uuid, public.job_application_status, text)
to authenticated;
grant execute on function public.create_admin_media_record(text, text, text, text, text, bigint)
to authenticated;
grant execute on function public.set_admin_media_state(uuid, text)
to authenticated;
grant execute on function public.begin_test_admin_media_delete(uuid)
to authenticated;
grant execute on function public.cancel_test_admin_media_delete(uuid, public.content_status, boolean, text)
to authenticated;
grant execute on function public.complete_test_admin_media_delete(uuid)
to authenticated;

comment on function public.save_admin_theme_settings(jsonb, jsonb, boolean) is
  'Tema ve bölüm görünürlüğünü tek transaction ve tek semantic audit kaydıyla günceller.';
comment on function public.update_job_application_admin(uuid, public.job_application_status, text) is
  'Aktif kariyer başvurusunun admin durum/not güncellemesini audit ile atomik yapar.';
comment on function public.create_admin_media_record(text, text, text, text, text, bigint) is
  'Yüklenmiş public Storage görselinin medya kataloğu ve audit kaydını atomik oluşturur.';
comment on function public.set_admin_media_state(uuid, text) is
  'Medya arşivleme/geri alma değişikliğini kullanım kontrolü ve audit ile atomik yapar.';
comment on function public.begin_test_admin_media_delete(uuid) is
  'TEST_ Storage görselini dış Storage silme adımı öncesinde güvenli silme durumuna alır.';
comment on function public.complete_test_admin_media_delete(uuid) is
  'Storage nesnesi silinmiş TEST_ medya kaydını audit ile atomik olarak kaldırır.';

commit;
