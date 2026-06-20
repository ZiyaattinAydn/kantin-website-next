-- Kantin Website - Faz 5 seed doğrulaması
-- Seed çalıştırıldıktan sonra SQL Editor'da ayrı sorgu olarak çalıştırın.

with checks as (
  select 1 as sıra, 'Şube sayısı' as kontrol, (select count(*) from public.branches where status = 'published' and is_active) as bulunan, 2::bigint as beklenen
  union all select 2, 'Menü kategori sayısı', (select count(*) from public.menu_categories where (metadata ->> 'seed_source') = 'frontend-v1'), 16
  union all select 3, 'Menü ürün sayısı', (select count(*) from public.menu_items where (metadata ->> 'seed_source') = 'frontend-v1'), 84
  union all select 4, 'Ürün-şube ilişki sayısı', (select count(*) from public.menu_item_branches where (metadata ->> 'seed_source') = 'frontend-v1'), 100
  union all select 5, 'Fiyat varyantı sayısı', (select count(*) from public.menu_item_variants where (metadata ->> 'seed_source') = 'frontend-v1'), 40
  union all select 6, 'Yerel medya sayısı', (select count(*) from public.media where source = 'local' and (metadata ->> 'seed_source') = 'frontend-v1'), 22
  union all select 7, 'Merch ürün/bundle sayısı', (select count(*) from public.merch_products where (metadata ->> 'seed_source') = 'frontend-v1'), 5
  union all select 8, 'Instagram gönderi sayısı', (select count(*) from public.instagram_posts where (metadata ->> 'seed_source') = 'frontend-v1'), 5
  union all select 9, 'Site ayarı sayısı', (select count(*) from public.site_settings), 8
  union all select 10, 'Site sayfası sayısı', (select count(*) from public.site_pages where (metadata ->> 'seed_source') = 'frontend-v1'), 4
  union all select 11, 'İçerik bloğu sayısı', (select count(*) from public.content_blocks where (content ->> 'seedSource') = 'frontend-v1'), 12
)
select sıra, kontrol, bulunan, beklenen, (bulunan = beklenen) as başarılı
from checks
order by sıra;

-- Kritik içerik doğrulamaları.
select
  exists (
    select 1
    from public.branches
    where slug = 'alsancak'
      and maps_url = 'https://maps.app.goo.gl/qZYRVGAkhtbVA2Fu7?g_st=ic'
  ) as alsancak_harita_doğru,
  exists (
    select 1
    from public.branches
    where slug = 'atakent'
      and maps_url = 'https://maps.app.goo.gl/Q6522YB6XoKSReYw8?g_st=ipc'
  ) as atakent_harita_doğru,
  exists (
    select 1
    from public.menu_items item
    join public.menu_categories category on category.id = item.category_id
    where category.slug = 'deli-salata'
      and item.slug = 'eski-kasar-peyniri'
      and item.detail = 'Eski kaşar peyniri'
  ) as eski_kasar_aciklamasi_doğru,
  (
    select array_agg(variant.price_cents order by variant.price_cents)
    from public.menu_item_variants variant
    join public.menu_item_branches item_branch on item_branch.id = variant.menu_item_branch_id
    join public.menu_items item on item.id = item_branch.menu_item_id
    where item.slug = 'eski-kasar-peyniri'
  ) = array[7500,15000] as peynir_fiyatlari_doğru,
  (
    select count(*)
    from public.menu_items item
    join public.menu_categories category on category.id = item.category_id
    where category.slug = 'deli-salata'
      and item.slug in ('pasta-fredda','patates-salata')
      and item.badges @> array['VEGAN']::text[]
  ) = 2 as bira_salatalari_doğru,
  not exists (
    select 1
    from public.merch_product_branches relation
    join public.branches branch on branch.id = relation.branch_id
    where branch.slug = 'atakent'
  ) as merch_yalniz_alsancak;

-- Public RLS üzerinden görünmesi beklenen temel içerik sayıları.
set local role anon;
select
  (select count(*) from public.branches) as public_branches,
  (select count(*) from public.menu_categories) as public_categories,
  (select count(*) from public.menu_items) as public_menu_items,
  (select count(*) from public.merch_products) as public_merch_products,
  (select count(*) from public.instagram_posts) as public_instagram_posts;
reset role;
