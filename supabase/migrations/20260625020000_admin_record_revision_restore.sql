-- Kantin Website - Kritik admin kayıtlarında güvenli sürüm geri yükleme
-- Tarih: 25 Haziran 2026
--
-- Önkoşul: 20260625010000_admin_record_revisions.sql
-- Bu migration mevcut içerikleri değiştirmez. Yalnız admin kullanıcıların seçili
-- update snapshot'ının değişiklik öncesi hâlini aynı kayıt üzerinde transaction
-- içinde geri yüklemesini sağlayan kontrollü RPC'yi ekler.

begin;

create or replace function public.restore_admin_record_revision(
  p_revision_id uuid,
  p_expected_entity_type text,
  p_expected_entity_id uuid
)
returns table (
  restored_entity_type text,
  restored_entity_id uuid,
  restored_from_revision uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_revision public.admin_record_revisions%rowtype;
  v_target jsonb;
  v_current jsonb;
  v_current_projection jsonb;
  v_target_projection jsonb;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception
      using
        errcode = '42501',
        message = 'admin_required';
  end if;

  select revision.*
  into v_revision
  from public.admin_record_revisions as revision
  where revision.id = p_revision_id;

  if not found then
    raise exception
      using
        errcode = 'P0002',
        message = 'revision_not_found';
  end if;

  if v_revision.entity_type is distinct from p_expected_entity_type
    or v_revision.entity_id is distinct from p_expected_entity_id then
    raise exception
      using
        errcode = '22023',
        message = 'revision_target_mismatch';
  end if;

  if v_revision.entity_type not in (
    'branches',
    'site_settings',
    'site_pages',
    'content_blocks'
  ) then
    raise exception
      using
        errcode = '0A000',
        message = 'revision_restore_not_supported';
  end if;

  if v_revision.operation <> 'update'
    or v_revision.before_data is null
    or v_revision.schema_version <> 1 then
    raise exception
      using
        errcode = '22023',
        message = 'revision_not_restorable';
  end if;

  if (v_revision.before_data ->> 'id') is distinct from v_revision.entity_id::text then
    raise exception
      using
        errcode = '22023',
        message = 'revision_snapshot_invalid';
  end if;

  v_target := v_revision.before_data;

  case v_revision.entity_type
    when 'branches' then
      select to_jsonb(branch)
      into v_current
      from public.branches as branch
      where branch.id = v_revision.entity_id
      for update;

      if v_current is null then
        raise exception using errcode = 'P0002', message = 'revision_target_not_found';
      end if;

      v_current_projection := jsonb_build_object(
        'name', v_current -> 'name',
        'short_description', v_current -> 'short_description',
        'address_line', v_current -> 'address_line',
        'district', v_current -> 'district',
        'city', v_current -> 'city',
        'maps_url', v_current -> 'maps_url',
        'phone', v_current -> 'phone',
        'public_email', v_current -> 'public_email',
        'features', v_current -> 'features',
        'opening_hours', v_current -> 'opening_hours',
        'status', v_current -> 'status',
        'is_active', v_current -> 'is_active'
      );
      v_target_projection := jsonb_build_object(
        'name', v_target -> 'name',
        'short_description', v_target -> 'short_description',
        'address_line', v_target -> 'address_line',
        'district', v_target -> 'district',
        'city', v_target -> 'city',
        'maps_url', v_target -> 'maps_url',
        'phone', v_target -> 'phone',
        'public_email', v_target -> 'public_email',
        'features', v_target -> 'features',
        'opening_hours', v_target -> 'opening_hours',
        'status', v_target -> 'status',
        'is_active', v_target -> 'is_active'
      );

      if v_current_projection = v_target_projection then
        raise exception using errcode = '22023', message = 'revision_already_current';
      end if;

      update public.branches
      set
        name = v_target ->> 'name',
        short_description = v_target ->> 'short_description',
        address_line = v_target ->> 'address_line',
        district = v_target ->> 'district',
        city = v_target ->> 'city',
        maps_url = v_target ->> 'maps_url',
        phone = v_target ->> 'phone',
        public_email = v_target ->> 'public_email',
        features = case
          when jsonb_typeof(v_target -> 'features') = 'array'
            then array(select jsonb_array_elements_text(v_target -> 'features'))
          else '{}'::text[]
        end,
        opening_hours = coalesce(v_target -> 'opening_hours', '{}'::jsonb),
        status = (v_target ->> 'status')::public.content_status,
        is_active = (v_target ->> 'is_active')::boolean
      where id = v_revision.entity_id;

    when 'site_settings' then
      select to_jsonb(setting)
      into v_current
      from public.site_settings as setting
      where setting.id = v_revision.entity_id
      for update;

      if v_current is null then
        raise exception using errcode = 'P0002', message = 'revision_target_not_found';
      end if;

      v_current_projection := jsonb_build_object(
        'value', v_current -> 'value',
        'description', v_current -> 'description',
        'is_public', v_current -> 'is_public',
        'status', v_current -> 'status',
        'is_active', v_current -> 'is_active'
      );
      v_target_projection := jsonb_build_object(
        'value', v_target -> 'value',
        'description', v_target -> 'description',
        'is_public', v_target -> 'is_public',
        'status', v_target -> 'status',
        'is_active', v_target -> 'is_active'
      );

      if v_current_projection = v_target_projection then
        raise exception using errcode = '22023', message = 'revision_already_current';
      end if;

      update public.site_settings
      set
        value = coalesce(v_target -> 'value', '{}'::jsonb),
        description = v_target ->> 'description',
        is_public = (v_target ->> 'is_public')::boolean,
        status = (v_target ->> 'status')::public.content_status,
        is_active = (v_target ->> 'is_active')::boolean
      where id = v_revision.entity_id;

    when 'site_pages' then
      select to_jsonb(page)
      into v_current
      from public.site_pages as page
      where page.id = v_revision.entity_id
      for update;

      if v_current is null then
        raise exception using errcode = 'P0002', message = 'revision_target_not_found';
      end if;

      v_current_projection := jsonb_build_object(
        'title', v_current -> 'title',
        'seo_title', v_current -> 'seo_title',
        'seo_description', v_current -> 'seo_description',
        'metadata', v_current -> 'metadata',
        'status', v_current -> 'status',
        'is_active', v_current -> 'is_active',
        'published_at', v_current -> 'published_at'
      );
      v_target_projection := jsonb_build_object(
        'title', v_target -> 'title',
        'seo_title', v_target -> 'seo_title',
        'seo_description', v_target -> 'seo_description',
        'metadata', v_target -> 'metadata',
        'status', v_target -> 'status',
        'is_active', v_target -> 'is_active',
        'published_at', v_target -> 'published_at'
      );

      if v_current_projection = v_target_projection then
        raise exception using errcode = '22023', message = 'revision_already_current';
      end if;

      update public.site_pages
      set
        title = v_target ->> 'title',
        seo_title = v_target ->> 'seo_title',
        seo_description = v_target ->> 'seo_description',
        metadata = coalesce(v_target -> 'metadata', '{}'::jsonb),
        status = (v_target ->> 'status')::public.content_status,
        is_active = (v_target ->> 'is_active')::boolean,
        published_at = nullif(v_target ->> 'published_at', '')::timestamptz
      where id = v_revision.entity_id;

    when 'content_blocks' then
      select to_jsonb(block)
      into v_current
      from public.content_blocks as block
      where block.id = v_revision.entity_id
      for update;

      if v_current is null then
        raise exception using errcode = 'P0002', message = 'revision_target_not_found';
      end if;

      v_current_projection := jsonb_build_object(
        'content', v_current -> 'content',
        'status', v_current -> 'status',
        'is_active', v_current -> 'is_active'
      );
      v_target_projection := jsonb_build_object(
        'content', v_target -> 'content',
        'status', v_target -> 'status',
        'is_active', v_target -> 'is_active'
      );

      if v_current_projection = v_target_projection then
        raise exception using errcode = '22023', message = 'revision_already_current';
      end if;

      update public.content_blocks
      set
        content = coalesce(v_target -> 'content', '{}'::jsonb),
        status = (v_target ->> 'status')::public.content_status,
        is_active = (v_target ->> 'is_active')::boolean
      where id = v_revision.entity_id;
  end case;

  return query
  select
    v_revision.entity_type,
    v_revision.entity_id,
    v_revision.id;
end;
$$;

comment on function public.restore_admin_record_revision(uuid, text, uuid) is
  'Admin kullanıcının kritik bir update snapshotının değişiklik öncesi hâlini aynı kayda transaction içinde geri yükler; restore işlemi trigger tarafından yeni snapshot olarak kaydedilir.';

revoke all
on function public.restore_admin_record_revision(uuid, text, uuid)
from public, anon, authenticated;

grant execute
on function public.restore_admin_record_revision(uuid, text, uuid)
to authenticated;

commit;
