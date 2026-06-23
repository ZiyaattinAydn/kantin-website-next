-- Kantin Website - Güvenli medya düzenleme ve kalıcı silme
-- Tarih: 24 Haziran 2026
--
-- Medya metadata güncellemesini semantic audit ile atomik yapar.
-- Arşivleme, bağlı içeriklerdeki medyayı public görünümden kaldırabilir;
-- kalıcı silme ise yalnız bağlantısız, arşivlenmiş Storage görsellerine açıktır.

begin;

create or replace function public.update_admin_media_metadata(
  p_media_id uuid,
  p_title text,
  p_alt_text text,
  p_status public.content_status,
  p_is_active boolean,
  p_sort_order integer
)
returns table(media_id uuid, title text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_media public.media%rowtype;
  v_title text := btrim(coalesce(p_title, ''));
  v_alt_text text := btrim(coalesce(p_alt_text, ''));
  v_is_active boolean := coalesce(p_is_active, false);
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

  if coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') = 'pending' then
    raise exception using errcode = 'P0001', message = 'media_delete_pending';
  end if;

  if v_media.kind <> 'image'::public.media_kind
    or v_media.bucket_name = 'career-cvs' then
    raise exception using errcode = 'P0001', message = 'public_image_required';
  end if;

  if char_length(v_title) = 0 or char_length(v_title) > 180 then
    raise exception using errcode = '22001', message = 'invalid_media_title';
  end if;

  if char_length(v_alt_text) = 0 or char_length(v_alt_text) > 500 then
    raise exception using errcode = '22001', message = 'invalid_media_alt_text';
  end if;

  if p_sort_order is null or p_sort_order < 0 then
    raise exception using errcode = '23514', message = 'invalid_media_sort_order';
  end if;

  if p_status <> 'published'::public.content_status and v_is_active then
    raise exception using errcode = '23514', message = 'inactive_status_required';
  end if;

  update public.media
  set
    title = v_title,
    alt_text = v_alt_text,
    status = p_status,
    is_active = v_is_active,
    sort_order = p_sort_order
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
    'media_update',
    'media',
    v_media.id,
    left(v_title, 180),
    jsonb_build_object(
      'previous_title', v_media.title,
      'previous_status', v_media.status,
      'previous_is_active', v_media.is_active,
      'status', p_status,
      'is_active', v_is_active,
      'sort_order', p_sort_order,
      'source', 'transactional_rpc'
    )
  );

  return query select v_media.id, v_title;
end;
$$;

-- Bağlı medya da arşivlenebilir. Böylece public RLS ve public adapter filtreleri
-- medyayı görünümden kaldırır; kullanım bağlantıları kalıcı silmeyi engellemeye devam eder.
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
  v_has_usage boolean;
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

  if coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') = 'pending' then
    raise exception using errcode = 'P0001', message = 'media_delete_pending';
  end if;

  v_has_usage := public.admin_media_has_usage(
    v_media.id,
    v_media.object_path,
    v_media.local_path,
    v_media.external_url
  );

  if p_action = 'media_archive' then
    if not v_media.is_active or v_media.status = 'archived'::public.content_status then
      raise exception using errcode = 'P0001', message = 'media_already_archived';
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
    jsonb_build_object(
      'has_usage', v_has_usage,
      'source', 'transactional_rpc'
    )
  );

  return query select v_media.id, v_media.title;
end;
$$;

create or replace function public.begin_admin_media_delete(
  p_media_id uuid
)
returns table(
  media_id uuid,
  title text,
  bucket_name text,
  object_path text
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
    or v_media.object_path is null then
    raise exception using errcode = 'P0001', message = 'deletable_storage_image_required';
  end if;

  if v_media.status <> 'archived'::public.content_status or v_media.is_active then
    raise exception using errcode = 'P0001', message = 'media_archive_required';
  end if;

  if public.admin_media_has_usage(
    v_media.id,
    v_media.object_path,
    v_media.local_path,
    v_media.external_url
  ) then
    raise exception using errcode = 'P0001', message = 'media_in_use';
  end if;

  -- Storage silinmiş fakat DB tamamlama adımı yarıda kalmış olabilir.
  -- Aynı kayıt için tekrar çağrı, güvenli şekilde mevcut hazırlık bilgisini döndürür.
  if coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') = 'pending' then
    return query
    select v_media.id, v_media.title, v_media.bucket_name, v_media.object_path;
    return;
  end if;

  update public.media
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    '_admin_delete', jsonb_build_object(
      'state', 'pending',
      'started_at', clock_timestamp(),
      'actor_id', auth.uid()
    )
  )
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
    'media_delete_started',
    'media',
    v_media.id,
    left(coalesce(v_media.title, 'Medya'), 180),
    jsonb_build_object(
      'bucket', v_media.bucket_name,
      'object_path', v_media.object_path,
      'source', 'transactional_rpc'
    )
  );

  return query
  select v_media.id, v_media.title, v_media.bucket_name, v_media.object_path;
end;
$$;

create or replace function public.cancel_admin_media_delete(
  p_media_id uuid,
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

  if coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') <> 'pending' then
    raise exception using errcode = 'P0001', message = 'media_delete_not_pending';
  end if;

  update public.media
  set metadata = coalesce(metadata, '{}'::jsonb) - '_admin_delete'
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
    'media_delete_cancelled',
    'media',
    v_media.id,
    left(coalesce(v_media.title, 'Medya'), 180),
    jsonb_build_object(
      'reason', left(coalesce(p_reason, ''), 300),
      'source', 'transactional_rpc'
    )
  );

  return true;
end;
$$;

create or replace function public.complete_admin_media_delete(
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
    or coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') <> 'pending' then
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
    'media_delete',
    'media',
    v_media.id,
    left(coalesce(v_media.title, 'Medya'), 180),
    jsonb_build_object(
      'bucket', v_media.bucket_name,
      'object_path', v_media.object_path,
      'source', 'transactional_rpc'
    )
  );

  return true;
end;
$$;

revoke all on function public.update_admin_media_metadata(
  uuid, text, text, public.content_status, boolean, integer
) from public, anon, authenticated;
revoke all on function public.begin_admin_media_delete(uuid)
from public, anon, authenticated;
revoke all on function public.cancel_admin_media_delete(uuid, text)
from public, anon, authenticated;
revoke all on function public.complete_admin_media_delete(uuid)
from public, anon, authenticated;

grant execute on function public.update_admin_media_metadata(
  uuid, text, text, public.content_status, boolean, integer
) to authenticated;
grant execute on function public.begin_admin_media_delete(uuid)
to authenticated;
grant execute on function public.cancel_admin_media_delete(uuid, text)
to authenticated;
grant execute on function public.complete_admin_media_delete(uuid)
to authenticated;

comment on function public.update_admin_media_metadata(
  uuid, text, text, public.content_status, boolean, integer
) is 'Public görsel metadata ve yayın ayarlarını semantic audit ile atomik günceller.';
comment on function public.begin_admin_media_delete(uuid) is
  'Bağlantısız ve arşivlenmiş Storage görselini dış Storage silme adımı için işaretler.';
comment on function public.cancel_admin_media_delete(uuid, text) is
  'Başarısız Storage silme girişiminin bekleyen silme işaretini temizler.';
comment on function public.complete_admin_media_delete(uuid) is
  'Storage nesnesi silinmiş medya kaydını kullanım kontrolü ve audit ile atomik kaldırır.';

commit;
