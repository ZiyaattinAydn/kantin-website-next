-- Kantin Website - Yedek / geri yükleme envanteri
-- Yalnız okuma yapar. Kaynak production ve hedef test projesinde ayrı ayrı
-- çalıştırın; sonuçları CSV olarak indirip karşılaştırın.

with table_counts as (
  select 'public.admin_activity_logs'::text as veri_kumesi, count(*)::bigint as kayit_sayisi, null::bigint as toplam_bayt from public.admin_activity_logs
  union all select 'public.admin_record_revisions', count(*)::bigint, null::bigint from public.admin_record_revisions
  union all select 'public.branches', count(*)::bigint, null::bigint from public.branches
  union all select 'public.career_upload_sessions', count(*)::bigint, null::bigint from public.career_upload_sessions
  union all select 'public.content_blocks', count(*)::bigint, null::bigint from public.content_blocks
  union all select 'public.event_branches', count(*)::bigint, null::bigint from public.event_branches
  union all select 'public.events', count(*)::bigint, null::bigint from public.events
  union all select 'public.instagram_posts', count(*)::bigint, null::bigint from public.instagram_posts
  union all select 'public.job_applications', count(*)::bigint, null::bigint from public.job_applications
  union all select 'public.media', count(*)::bigint, null::bigint from public.media
  union all select 'public.menu_categories', count(*)::bigint, null::bigint from public.menu_categories
  union all select 'public.menu_category_branches', count(*)::bigint, null::bigint from public.menu_category_branches
  union all select 'public.menu_item_branches', count(*)::bigint, null::bigint from public.menu_item_branches
  union all select 'public.menu_item_variants', count(*)::bigint, null::bigint from public.menu_item_variants
  union all select 'public.menu_items', count(*)::bigint, null::bigint from public.menu_items
  union all select 'public.merch_product_branches', count(*)::bigint, null::bigint from public.merch_product_branches
  union all select 'public.merch_products', count(*)::bigint, null::bigint from public.merch_products
  union all select 'public.profiles', count(*)::bigint, null::bigint from public.profiles
  union all select 'public.site_pages', count(*)::bigint, null::bigint from public.site_pages
  union all select 'public.site_settings', count(*)::bigint, null::bigint from public.site_settings
  union all select 'auth.users', count(*)::bigint, null::bigint from auth.users
  union all select 'supabase_migrations.schema_migrations', count(*)::bigint, null::bigint from supabase_migrations.schema_migrations
),
storage_counts as (
  select
    'storage.' || bucket.id as veri_kumesi,
    count(object.id)::bigint as kayit_sayisi,
    coalesce(sum(
      case
        when (object.metadata ->> 'size') ~ '^[0-9]+$'
          then (object.metadata ->> 'size')::bigint
        else 0
      end
    ), 0)::bigint as toplam_bayt
  from storage.buckets as bucket
  left join storage.objects as object on object.bucket_id = bucket.id
  where bucket.id in (
    'menu-images',
    'event-images',
    'merch-images',
    'gallery-images',
    'instagram-media',
    'career-cvs'
  )
  group by bucket.id
)
select veri_kumesi, kayit_sayisi, toplam_bayt
from table_counts
union all
select veri_kumesi, kayit_sayisi, toplam_bayt
from storage_counts
order by veri_kumesi;
