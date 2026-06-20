-- Kantin Website - Faz 3: RLS politikaları ve en az yetki modeli
-- Tarih: 20 Haziran 2026
-- Önkoşul: 20260620010000_initial_schema.sql başarıyla uygulanmış olmalıdır.
--
-- Güvenlik hedefleri:
--   * anon/authenticated yalnızca yayınlanmış ve aktif public içeriği okuyabilir.
--   * viewer rolü içerik değiştiremez.
--   * editor/admin public içerik tablolarını yönetebilir.
--   * yalnızca admin profil rolleri, iş başvuruları ve private CV medyasını yönetebilir.
--   * iş başvuruları hiçbir zaman public olarak okunamaz.
--   * doğrudan public başvuru INSERT erişimi, private Storage ve sunucu doğrulaması
--     kurulana kadar bilinçli olarak kapalıdır.

begin;

-- ---------------------------------------------------------------------------
-- Rol yardımcıları
-- SECURITY DEFINER kullanılır; böylece profiles tablosunun RLS politikası içinde
-- recursive sorgu oluşturmadan güvenli rol kontrolü yapılabilir.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and profile.role = 'admin'::public.app_role
  );
$$;

create or replace function public.is_content_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('editor'::public.app_role, 'admin'::public.app_role)
  );
$$;

comment on function public.is_admin() is
  'Aktif oturum kullanıcısının profiles tablosunda admin rolüne sahip olup olmadığını döndürür.';

comment on function public.is_content_manager() is
  'Aktif oturum kullanıcısının editor veya admin rolüne sahip olup olmadığını döndürür.';

-- Fonksiyonlar doğrudan anonim RPC olarak çağrılamaz; yalnız authenticated rolü
-- RLS değerlendirmesi sırasında çalıştırabilir.
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_content_manager() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_content_manager() to authenticated;

-- ---------------------------------------------------------------------------
-- Tablo yetkileri
-- Proje oluşturulurken "Automatically expose new tables" kapatıldığı için
-- gerekli Data API yetkileri burada açık ve denetlenebilir biçimde verilir.
-- RLS, bu SQL GRANT yetkilerinin hangi satırlarda kullanılabileceğini sınırlar.
-- ---------------------------------------------------------------------------

revoke all privileges on table
  public.profiles,
  public.branches,
  public.media,
  public.menu_categories,
  public.menu_category_branches,
  public.menu_items,
  public.menu_item_branches,
  public.menu_item_variants,
  public.events,
  public.event_branches,
  public.merch_products,
  public.merch_product_branches,
  public.instagram_posts,
  public.job_applications,
  public.site_settings,
  public.site_pages,
  public.content_blocks
from anon, authenticated;

grant select on table
  public.branches,
  public.media,
  public.menu_categories,
  public.menu_category_branches,
  public.menu_items,
  public.menu_item_branches,
  public.menu_item_variants,
  public.events,
  public.event_branches,
  public.merch_products,
  public.merch_product_branches,
  public.instagram_posts,
  public.site_settings,
  public.site_pages,
  public.content_blocks
to anon, authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.branches,
  public.media,
  public.menu_categories,
  public.menu_category_branches,
  public.menu_items,
  public.menu_item_branches,
  public.menu_item_variants,
  public.events,
  public.event_branches,
  public.merch_products,
  public.merch_product_branches,
  public.instagram_posts,
  public.job_applications,
  public.site_settings,
  public.site_pages,
  public.content_blocks
to authenticated;

-- ---------------------------------------------------------------------------
-- Önce olası eski politikaları temizle. Migration yanlışlıkla tekrar çalıştırılsa
-- bile aynı isimli policy çakışması oluşturmaz.
-- ---------------------------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_admin_manage on public.profiles;

drop policy if exists branches_public_read on public.branches;
drop policy if exists branches_manager_manage on public.branches;

drop policy if exists media_public_read on public.media;
drop policy if exists media_manager_manage_public_assets on public.media;
drop policy if exists media_admin_manage_all on public.media;

drop policy if exists menu_categories_public_read on public.menu_categories;
drop policy if exists menu_categories_manager_manage on public.menu_categories;
drop policy if exists menu_category_branches_public_read on public.menu_category_branches;
drop policy if exists menu_category_branches_manager_manage on public.menu_category_branches;
drop policy if exists menu_items_public_read on public.menu_items;
drop policy if exists menu_items_manager_manage on public.menu_items;
drop policy if exists menu_item_branches_public_read on public.menu_item_branches;
drop policy if exists menu_item_branches_manager_manage on public.menu_item_branches;
drop policy if exists menu_item_variants_public_read on public.menu_item_variants;
drop policy if exists menu_item_variants_manager_manage on public.menu_item_variants;

drop policy if exists events_public_read on public.events;
drop policy if exists events_manager_manage on public.events;
drop policy if exists event_branches_public_read on public.event_branches;
drop policy if exists event_branches_manager_manage on public.event_branches;

drop policy if exists merch_products_public_read on public.merch_products;
drop policy if exists merch_products_manager_manage on public.merch_products;
drop policy if exists merch_product_branches_public_read on public.merch_product_branches;
drop policy if exists merch_product_branches_manager_manage on public.merch_product_branches;

drop policy if exists instagram_posts_public_read on public.instagram_posts;
drop policy if exists instagram_posts_manager_manage on public.instagram_posts;

drop policy if exists job_applications_admin_manage on public.job_applications;

drop policy if exists site_settings_public_read on public.site_settings;
drop policy if exists site_settings_manager_manage on public.site_settings;
drop policy if exists site_pages_public_read on public.site_pages;
drop policy if exists site_pages_manager_manage on public.site_pages;
drop policy if exists content_blocks_public_read on public.content_blocks;
drop policy if exists content_blocks_manager_manage on public.content_blocks;

-- ---------------------------------------------------------------------------
-- Profiles
-- Kullanıcı kendi profil satırını okuyabilir. Rol ve aktiflik değişiklikleri yalnız
-- admin tarafından yapılabilir; kullanıcıya kendi rolünü güncelleme policy'si yoktur.
-- ---------------------------------------------------------------------------

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_admin_manage
on public.profiles
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Branches
-- ---------------------------------------------------------------------------

create policy branches_public_read
on public.branches
for select
to anon, authenticated
using (status = 'published'::public.content_status and is_active = true);

create policy branches_manager_manage
on public.branches
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

-- ---------------------------------------------------------------------------
-- Media
-- Public kullanıcılar yalnız yayınlanmış görsel/video kayıtlarını görebilir.
-- career-cvs bucket'ı ve document türü public policy kapsamının dışındadır.
-- Editor public medya varlıklarını, admin ise private CV medyası dahil tümünü yönetir.
-- ---------------------------------------------------------------------------

create policy media_public_read
on public.media
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and kind in ('image'::public.media_kind, 'video'::public.media_kind)
  and bucket_name is distinct from 'career-cvs'
);

create policy media_manager_manage_public_assets
on public.media
for all
to authenticated
using (
  (select public.is_content_manager())
  and bucket_name is distinct from 'career-cvs'
)
with check (
  (select public.is_content_manager())
  and bucket_name is distinct from 'career-cvs'
);

create policy media_admin_manage_all
on public.media
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Menü
-- İlişki tabloları ancak bağlı kategori, ürün ve şube de public koşulları
-- sağlıyorsa anonim sorguda görünür.
-- ---------------------------------------------------------------------------

create policy menu_categories_public_read
on public.menu_categories
for select
to anon, authenticated
using (status = 'published'::public.content_status and is_active = true);

create policy menu_categories_manager_manage
on public.menu_categories
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy menu_category_branches_public_read
on public.menu_category_branches
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.menu_categories as category
    where category.id = menu_category_branches.category_id
      and category.status = 'published'::public.content_status
      and category.is_active = true
  )
  and exists (
    select 1
    from public.branches as branch
    where branch.id = menu_category_branches.branch_id
      and branch.status = 'published'::public.content_status
      and branch.is_active = true
  )
);

create policy menu_category_branches_manager_manage
on public.menu_category_branches
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy menu_items_public_read
on public.menu_items
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and exists (
    select 1
    from public.menu_categories as category
    where category.id = menu_items.category_id
      and category.status = 'published'::public.content_status
      and category.is_active = true
  )
);

create policy menu_items_manager_manage
on public.menu_items
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy menu_item_branches_public_read
on public.menu_item_branches
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.menu_items as item
    join public.menu_categories as category on category.id = item.category_id
    join public.menu_category_branches as category_branch
      on category_branch.category_id = category.id
      and category_branch.branch_id = menu_item_branches.branch_id
    join public.branches as branch on branch.id = menu_item_branches.branch_id
    where item.id = menu_item_branches.menu_item_id
      and item.status = 'published'::public.content_status
      and item.is_active = true
      and category.status = 'published'::public.content_status
      and category.is_active = true
      and category_branch.is_active = true
      and branch.status = 'published'::public.content_status
      and branch.is_active = true
  )
);

create policy menu_item_branches_manager_manage
on public.menu_item_branches
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy menu_item_variants_public_read
on public.menu_item_variants
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.menu_item_branches as item_branch
    where item_branch.id = menu_item_variants.menu_item_branch_id
      and item_branch.is_active = true
  )
);

create policy menu_item_variants_manager_manage
on public.menu_item_variants
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create policy events_public_read
on public.events
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and (published_at is null or published_at <= now())
);

create policy events_manager_manage
on public.events
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy event_branches_public_read
on public.event_branches
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.events as event
    where event.id = event_branches.event_id
      and event.status = 'published'::public.content_status
      and event.is_active = true
      and (event.published_at is null or event.published_at <= now())
  )
  and exists (
    select 1
    from public.branches as branch
    where branch.id = event_branches.branch_id
      and branch.status = 'published'::public.content_status
      and branch.is_active = true
  )
);

create policy event_branches_manager_manage
on public.event_branches
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

-- ---------------------------------------------------------------------------
-- Merch
-- ---------------------------------------------------------------------------

create policy merch_products_public_read
on public.merch_products
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and (published_at is null or published_at <= now())
  and inventory_status <> 'discontinued'::public.inventory_status
);

create policy merch_products_manager_manage
on public.merch_products
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy merch_product_branches_public_read
on public.merch_product_branches
for select
to anon, authenticated
using (
  is_available = true
  and exists (
    select 1
    from public.merch_products as product
    where product.id = merch_product_branches.merch_product_id
      and product.status = 'published'::public.content_status
      and product.is_active = true
      and (product.published_at is null or product.published_at <= now())
      and product.inventory_status <> 'discontinued'::public.inventory_status
  )
  and exists (
    select 1
    from public.branches as branch
    where branch.id = merch_product_branches.branch_id
      and branch.status = 'published'::public.content_status
      and branch.is_active = true
  )
);

create policy merch_product_branches_manager_manage
on public.merch_product_branches
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

-- ---------------------------------------------------------------------------
-- Instagram
-- ---------------------------------------------------------------------------

create policy instagram_posts_public_read
on public.instagram_posts
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and published_at <= now()
  and (
    branch_id is null
    or exists (
      select 1
      from public.branches as branch
      where branch.id = instagram_posts.branch_id
        and branch.status = 'published'::public.content_status
        and branch.is_active = true
    )
  )
);

create policy instagram_posts_manager_manage
on public.instagram_posts
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

-- ---------------------------------------------------------------------------
-- Kariyer başvuruları
-- Public SELECT policy yoktur. Anon/authenticated doğrudan INSERT grant'i de yoktur.
-- Faz 4 Storage ve Faz 7 sunucu doğrulaması tamamlanınca başvuru, kontrollü server
-- endpoint'i/RPC üzerinden eklenecektir. Admin bütün başvuruları yönetebilir.
-- ---------------------------------------------------------------------------

create policy job_applications_admin_manage
on public.job_applications
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Site ayarları ve kontrollü içerik blokları
-- ---------------------------------------------------------------------------

create policy site_settings_public_read
on public.site_settings
for select
to anon, authenticated
using (
  is_public = true
  and status = 'published'::public.content_status
  and is_active = true
);

create policy site_settings_manager_manage
on public.site_settings
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy site_pages_public_read
on public.site_pages
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and (published_at is null or published_at <= now())
);

create policy site_pages_manager_manage
on public.site_pages
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

create policy content_blocks_public_read
on public.content_blocks
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and exists (
    select 1
    from public.site_pages as page
    where page.id = content_blocks.page_id
      and page.status = 'published'::public.content_status
      and page.is_active = true
      and (page.published_at is null or page.published_at <= now())
  )
);

create policy content_blocks_manager_manage
on public.content_blocks
for all
to authenticated
using ((select public.is_content_manager()))
with check ((select public.is_content_manager()));

commit;
