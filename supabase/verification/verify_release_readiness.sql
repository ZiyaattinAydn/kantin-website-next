-- Kantin Website - Production release readiness (salt okunur)
-- Bu dosya veri veya şema değiştirmez.
-- İlk çalıştırmada 20260625030000 ve migration_history satırları false olabilir.
-- Önceki 18 migration için herhangi bir false değer varsa migration history repair yapma.

with checks as (
  select
    '20260620010000_core_schema'::text as kontrol,
    (
      to_regclass('public.profiles') is not null
      and to_regclass('public.branches') is not null
      and to_regclass('public.media') is not null
      and to_regclass('public.menu_items') is not null
      and to_regclass('public.job_applications') is not null
      and to_regclass('public.site_settings') is not null
      and to_regclass('public.content_blocks') is not null
    ) as basarili,
    'Ana tablolar'::text as ayrinti

  union all select
    '20260620020000_rls_policies',
    to_regprocedure('public.is_admin()') is not null
      and to_regprocedure('public.is_content_manager()') is not null
      and exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'profiles'
          and policyname = 'profiles_admin_manage'
      ),
    'RLS rol yardımcıları ve profil policy'

  union all select
    '20260620030000_storage_buckets',
    (
      select count(*) = 6
      from storage.buckets
      where id in (
        'menu-images', 'event-images', 'merch-images',
        'gallery-images', 'instagram-media', 'career-cvs'
      )
    ),
    'Beklenen 6 Storage bucket'

  union all select
    '20260620040000_career_applications',
    to_regclass('public.career_upload_sessions') is not null
      and exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'begin_job_application'
      )
      and to_regprocedure('public.complete_job_application(uuid,uuid)') is not null,
    'Kariyer upload session ve RPC akışı'

  union all select
    '20260620050000_admin_auth_hardening',
    to_regprocedure('public.handle_new_user()') is not null
      and to_regclass('public.profiles_active_role_idx') is not null
      and exists (
        select 1 from pg_trigger
        where tgname = 'on_auth_user_created' and not tgisinternal
      ),
    'Admin auth trigger ve index'

  union all select
    '20260620060000_admin_crud_support',
    to_regclass('public.admin_activity_logs') is not null
      and exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'admin_activity_logs'
          and policyname = 'admin_activity_logs_admin_select'
      ),
    'Admin işlem geçmişi'

  union all select
    '20260620070000_controlled_theme_settings',
    to_regprocedure('public.is_valid_theme_settings(jsonb)') is not null
      and to_regprocedure('public.is_valid_section_visibility(jsonb)') is not null,
    'Kontrollü tema doğrulaması'

  union all select
    '20260622080000_career_retention',
    exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'job_applications'
        and column_name = 'privacy_status'
    )
      and to_regprocedure('public.complete_job_application_anonymization(uuid)') is not null,
    'Kariyer retention ve anonimleştirme'

  union all select
    '20260623010000_transactional_content_audit',
    to_regprocedure('public.audit_content_mutation()') is not null
      and exists (
        select 1 from pg_trigger t
        join pg_class c on c.oid = t.tgrelid
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'branches'
          and t.tgname = 'audit_content_mutation' and not t.tgisinternal
      ),
    'İçerik audit trigger'

  union all select
    '20260623020000_transactional_admin_mutations',
    to_regprocedure('public.save_admin_theme_settings(jsonb,jsonb,boolean)') is not null
      and exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'update_job_application_admin'
      ),
    'Transaction tabanlı admin RPC''leri'

  union all select
    '20260623030000_event_announcements',
    exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'events'
        and column_name = 'content_type'
    )
      and exists (
        select 1 from pg_constraint
        where conrelid = 'public.events'::regclass
          and conname = 'events_content_type_allowed'
      ),
    'Etkinlik/duyuru şeması'

  union all select
    '20260624010000_media_management',
    to_regprocedure('public.update_admin_media_metadata(uuid,text,text,public.content_status,boolean,integer)') is not null
      and to_regprocedure('public.complete_admin_media_delete(uuid)') is not null,
    'Medya metadata ve yaşam döngüsü RPC''leri'

  union all select
    '20260624020000_media_replace_auto_detach',
    to_regprocedure('public.admin_media_reference_matches(text,text[])') is not null
      and to_regprocedure('public.admin_jsonb_replace_media_references(jsonb,text[],text)') is not null,
    'Medya referans değiştirme yardımcıları'

  union all select
    '20260624030000_admin_menu_branch_add',
    exists (
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'add_admin_menu_item_to_branch'
    ),
    'Menü ürünü-şube transaction akışı'

  union all select
    '20260624040000_media_repair',
    to_regprocedure('public.replace_admin_media_file(uuid,text,text,text,bigint,text)') is not null,
    'Onarılmış medya değiştirme RPC imzası'

  union all select
    '20260624050000_concurrency_safe_ordering',
    to_regprocedure('public.assign_admin_sort_order()') is not null
      and exists (
        select 1 from pg_trigger t
        join pg_class c on c.oid = t.tgrelid
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'menu_items'
          and t.tgname = 'menu_items_assign_admin_sort_order'
          and not t.tgisinternal
      ),
    'Eşzamanlı güvenli otomatik sıralama'

  union all select
    '20260625010000_admin_record_revisions',
    to_regclass('public.admin_record_revisions') is not null
      and to_regprocedure('public.capture_admin_record_revision()') is not null
      and exists (
        select 1 from pg_trigger t
        join pg_class c on c.oid = t.tgrelid
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'site_settings'
          and t.tgname = 'capture_admin_record_revision'
          and not t.tgisinternal
      ),
    'Kritik kayıt snapshotları'

  union all select
    '20260625020000_admin_record_revision_restore',
    to_regprocedure('public.restore_admin_record_revision(uuid,text,uuid)') is not null,
    'Güvenli sürüm geri yükleme RPC''si'

  union all select
    '20260625030000_service_role_profiles',
    has_schema_privilege('service_role', 'public', 'USAGE')
      and has_table_privilege('service_role', 'public.profiles', 'SELECT')
      and has_table_privilege('service_role', 'public.profiles', 'INSERT')
      and has_table_privilege('service_role', 'public.profiles', 'UPDATE'),
    'Service-role profil yönetimi yetkileri'

  union all select
    'migration_history_table',
    to_regclass('supabase_migrations.schema_migrations') is not null,
    'CLI migration geçmişi tablosu'
)
select kontrol, basarili, ayrinti
from checks
order by kontrol;
