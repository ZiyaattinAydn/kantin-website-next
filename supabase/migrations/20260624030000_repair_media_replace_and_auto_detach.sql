-- Kantin Website - Medya RPC onarım migration'ı
-- Tarih: 24 Haziran 2026
--
-- Bu migration, production şemada eski media_in_use davranışı kalmışsa veya
-- replace_admin_media_file PostgREST schema cache'inde görünmüyorsa medya RPC'lerini
-- idempotent biçimde yeniden kurar. 20260624020000 uygulanmış olsa bile güvenle çalışır.
--
-- Bir medya kaydının dosyasını aynı UUID üzerinde değiştirir; böylece FK tabanlı
-- bağlantılar korunur. İçerik bloklarında doğrudan yol/URL kullanılmışsa bu
-- referanslar yeni public URL ile atomik olarak güncellenir.
--
-- Kalıcı silme tamamlanırken medya bağlantıları otomatik olarak kaldırılır.
-- Storage silme adımı yine uygulama sunucusunda yapılır; DB tamamlama adımı
-- bağlantı temizleme + medya silme + audit işlemlerini tek transaction'da yürütür.

begin;

create or replace function public.admin_media_reference_matches(
  p_value text,
  p_references text[]
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select exists (
    select 1
    from unnest(coalesce(p_references, array[]::text[])) as reference(value)
    where reference.value is not null
      and btrim(reference.value) <> ''
      and (
        p_value = reference.value
        or (
          char_length(p_value) > char_length(reference.value)
          and right(p_value, char_length(reference.value)) = reference.value
        )
      )
  );
$$;

create or replace function public.admin_jsonb_contains_media_reference(
  p_value jsonb,
  p_references text[]
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_text text;
begin
  if p_value is null then
    return false;
  end if;

  case jsonb_typeof(p_value)
    when 'string' then
      v_text := p_value #>> '{}';
      return public.admin_media_reference_matches(v_text, p_references);
    when 'array' then
      return exists (
        select 1
        from jsonb_array_elements(p_value) as item(value)
        where public.admin_jsonb_contains_media_reference(item.value, p_references)
      );
    when 'object' then
      return exists (
        select 1
        from jsonb_each(p_value) as item(key, value)
        where public.admin_jsonb_contains_media_reference(item.value, p_references)
      );
    else
      return false;
  end case;
end;
$$;

create or replace function public.admin_jsonb_replace_media_references(
  p_value jsonb,
  p_references text[],
  p_new_reference text
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_result jsonb;
  v_text text;
begin
  if p_value is null then
    return null;
  end if;

  case jsonb_typeof(p_value)
    when 'string' then
      v_text := p_value #>> '{}';
      if public.admin_media_reference_matches(v_text, p_references) then
        return to_jsonb(p_new_reference);
      end if;
      return p_value;
    when 'array' then
      select coalesce(
        jsonb_agg(
          public.admin_jsonb_replace_media_references(item.value, p_references, p_new_reference)
          order by item.ordinality
        ),
        '[]'::jsonb
      )
      into v_result
      from jsonb_array_elements(p_value) with ordinality as item(value, ordinality);
      return v_result;
    when 'object' then
      select coalesce(
        jsonb_object_agg(
          item.key,
          public.admin_jsonb_replace_media_references(item.value, p_references, p_new_reference)
        ),
        '{}'::jsonb
      )
      into v_result
      from jsonb_each(p_value) as item(key, value);
      return v_result;
    else
      return p_value;
  end case;
end;
$$;

create or replace function public.admin_jsonb_remove_media_references(
  p_value jsonb,
  p_references text[]
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_result jsonb;
  v_text text;
begin
  if p_value is null then
    return null;
  end if;

  case jsonb_typeof(p_value)
    when 'string' then
      v_text := p_value #>> '{}';
      if public.admin_media_reference_matches(v_text, p_references) then
        return null;
      end if;
      return p_value;
    when 'array' then
      select coalesce(
        jsonb_agg(cleaned.value order by item.ordinality)
          filter (where cleaned.value is not null),
        '[]'::jsonb
      )
      into v_result
      from jsonb_array_elements(p_value) with ordinality as item(value, ordinality)
      cross join lateral (
        select public.admin_jsonb_remove_media_references(item.value, p_references) as value
      ) as cleaned;
      return v_result;
    when 'object' then
      select coalesce(
        jsonb_object_agg(item.key, cleaned.value)
          filter (where cleaned.value is not null),
        '{}'::jsonb
      )
      into v_result
      from jsonb_each(p_value) as item(key, value)
      cross join lateral (
        select public.admin_jsonb_remove_media_references(item.value, p_references) as value
      ) as cleaned;
      return v_result;
    else
      return p_value;
  end case;
end;
$$;

drop function if exists public.replace_admin_media_file(uuid, text, text, text, bigint, text);

create function public.replace_admin_media_file(
  p_media_id uuid,
  p_bucket_name text,
  p_object_path text,
  p_mime_type text,
  p_size_bytes bigint,
  p_new_public_url text
)
returns table(
  media_id uuid,
  old_source public.media_source,
  old_bucket_name text,
  old_object_path text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_media public.media%rowtype;
  v_old_references text[];
  v_changed_blocks integer := 0;
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

  if v_media.kind <> 'image'::public.media_kind
    or v_media.bucket_name = 'career-cvs' then
    raise exception using errcode = 'P0001', message = 'public_image_required';
  end if;

  if coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') = 'pending' then
    raise exception using errcode = 'P0001', message = 'media_delete_pending';
  end if;

  if p_bucket_name not in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media'
  ) then
    raise exception using errcode = '23514', message = 'invalid_media_bucket';
  end if;

  if btrim(coalesce(p_object_path, '')) = ''
    or btrim(coalesce(p_mime_type, '')) = ''
    or coalesce(p_size_bytes, 0) <= 0
    or btrim(coalesce(p_new_public_url, '')) = '' then
    raise exception using errcode = '23514', message = 'invalid_replacement_file';
  end if;

  v_old_references := array_remove(array[
    v_media.local_path,
    v_media.external_url,
    v_media.object_path
  ], null);

  if cardinality(v_old_references) > 0 then
    update public.content_blocks
    set content = public.admin_jsonb_replace_media_references(
      content,
      v_old_references,
      p_new_public_url
    )
    where public.admin_jsonb_contains_media_reference(content, v_old_references);

    get diagnostics v_changed_blocks = row_count;
  end if;

  update public.media
  set
    source = 'storage'::public.media_source,
    bucket_name = p_bucket_name,
    object_path = p_object_path,
    external_url = null,
    local_path = null,
    mime_type = p_mime_type,
    size_bytes = p_size_bytes,
    metadata = (coalesce(metadata, '{}'::jsonb) - '_admin_delete') || jsonb_build_object(
      '_admin_replaced_at', clock_timestamp(),
      '_admin_replaced_by', auth.uid()
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
    'media_file_replace',
    'media',
    v_media.id,
    left(coalesce(v_media.title, 'Medya'), 180),
    jsonb_build_object(
      'old_source', v_media.source,
      'old_bucket', v_media.bucket_name,
      'old_object_path', v_media.object_path,
      'old_local_path', v_media.local_path,
      'new_bucket', p_bucket_name,
      'new_object_path', p_object_path,
      'content_blocks_updated', v_changed_blocks,
      'source', 'transactional_rpc'
    )
  );

  return query
  select v_media.id, v_media.source, v_media.bucket_name, v_media.object_path;
end;
$$;

-- Dönüş tipi genişlediği için eski fonksiyon düşürülüp yeniden oluşturulur.
drop function if exists public.begin_admin_media_delete(uuid);

create function public.begin_admin_media_delete(
  p_media_id uuid
)
returns table(
  media_id uuid,
  title text,
  source public.media_source,
  bucket_name text,
  object_path text
)
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

  if v_media.kind <> 'image'::public.media_kind
    or v_media.bucket_name = 'career-cvs' then
    raise exception using errcode = 'P0001', message = 'deletable_image_required';
  end if;

  if v_media.source = 'storage'::public.media_source
    and (
      v_media.bucket_name not in (
        'menu-images',
        'event-images',
        'merch-images',
        'gallery-images',
        'instagram-media'
      )
      or v_media.object_path is null
    ) then
    raise exception using errcode = 'P0001', message = 'deletable_storage_image_required';
  end if;

  if v_media.status <> 'archived'::public.content_status or v_media.is_active then
    raise exception using errcode = 'P0001', message = 'media_archive_required';
  end if;

  v_has_usage := public.admin_media_has_usage(
    v_media.id,
    v_media.object_path,
    v_media.local_path,
    v_media.external_url
  );

  if coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') = 'pending' then
    return query
    select v_media.id, v_media.title, v_media.source, v_media.bucket_name, v_media.object_path;
    return;
  end if;

  update public.media
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    '_admin_delete', jsonb_build_object(
      'state', 'pending',
      'started_at', clock_timestamp(),
      'actor_id', auth.uid(),
      'had_usage', v_has_usage
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
      'source_type', v_media.source,
      'bucket', v_media.bucket_name,
      'object_path', v_media.object_path,
      'had_usage', v_has_usage,
      'auto_detach', true,
      'source', 'transactional_rpc'
    )
  );

  return query
  select v_media.id, v_media.title, v_media.source, v_media.bucket_name, v_media.object_path;
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
  v_references text[];
  v_menu_count integer := 0;
  v_event_count integer := 0;
  v_merch_count integer := 0;
  v_instagram_count integer := 0;
  v_application_count integer := 0;
  v_content_count integer := 0;
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

  if v_media.kind <> 'image'::public.media_kind
    or v_media.status <> 'archived'::public.content_status
    or v_media.is_active
    or coalesce(v_media.metadata -> '_admin_delete' ->> 'state', '') <> 'pending' then
    raise exception using errcode = 'P0001', message = 'media_delete_not_prepared';
  end if;

  v_references := array_remove(array[
    v_media.id::text,
    v_media.local_path,
    v_media.external_url,
    v_media.object_path
  ], null);

  update public.menu_items
  set image_media_id = null
  where image_media_id = v_media.id;
  get diagnostics v_menu_count = row_count;

  update public.events
  set image_media_id = null
  where image_media_id = v_media.id;
  get diagnostics v_event_count = row_count;

  update public.merch_products
  set image_media_id = null
  where image_media_id = v_media.id;
  get diagnostics v_merch_count = row_count;

  update public.instagram_posts
  set image_media_id = null
  where image_media_id = v_media.id;
  get diagnostics v_instagram_count = row_count;

  update public.job_applications
  set cv_media_id = null
  where cv_media_id = v_media.id;
  get diagnostics v_application_count = row_count;

  if cardinality(v_references) > 0 then
    update public.content_blocks
    set content = coalesce(
      public.admin_jsonb_remove_media_references(content, v_references),
      '{}'::jsonb
    )
    where public.admin_jsonb_contains_media_reference(content, v_references);
    get diagnostics v_content_count = row_count;
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
      'source_type', v_media.source,
      'bucket', v_media.bucket_name,
      'object_path', v_media.object_path,
      'detached_menu_items', v_menu_count,
      'detached_events', v_event_count,
      'detached_merch_products', v_merch_count,
      'detached_instagram_posts', v_instagram_count,
      'detached_job_applications', v_application_count,
      'updated_content_blocks', v_content_count,
      'auto_detach', true,
      'source', 'transactional_rpc'
    )
  );

  return true;
end;
$$;

revoke all on function public.admin_media_reference_matches(text, text[])
from public, anon, authenticated;
revoke all on function public.admin_jsonb_contains_media_reference(jsonb, text[])
from public, anon, authenticated;
revoke all on function public.admin_jsonb_replace_media_references(jsonb, text[], text)
from public, anon, authenticated;
revoke all on function public.admin_jsonb_remove_media_references(jsonb, text[])
from public, anon, authenticated;
revoke all on function public.replace_admin_media_file(uuid, text, text, text, bigint, text)
from public, anon, authenticated;
revoke all on function public.begin_admin_media_delete(uuid)
from public, anon, authenticated;

-- cancel_admin_media_delete ve complete_admin_media_delete önceki migration'da
-- zaten authenticated rolüne açık olsa da burada yetkiler açıkça yeniden kurulur.
revoke all on function public.complete_admin_media_delete(uuid)
from public, anon, authenticated;

grant execute on function public.replace_admin_media_file(uuid, text, text, text, bigint, text)
to authenticated;
grant execute on function public.begin_admin_media_delete(uuid)
to authenticated;
grant execute on function public.complete_admin_media_delete(uuid)
to authenticated;

comment on function public.replace_admin_media_file(uuid, text, text, text, bigint, text) is
  'Aynı medya UUID kaydında dosyayı değiştirir; FK bağlantılarını korur ve content_blocks içindeki doğrudan yol referanslarını günceller.';
comment on function public.begin_admin_media_delete(uuid) is
  'Arşivlenmiş görseli kalıcı silme için hazırlar; mevcut bağlantılar complete aşamasında otomatik kaldırılır.';
comment on function public.complete_admin_media_delete(uuid) is
  'Bağlantıları atomik olarak temizler, medya kaydını siler ve ayrıntılı audit kaydı üretir.';

commit;

-- PostgREST yeni/değişen RPC imzalarını hemen yeniden keşfetsin.
notify pgrst, 'reload schema';
