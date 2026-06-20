-- Faz 9 test kayıtlarını güvenli biçimde temizleme
-- Yalnız TEST_ adı veya test- slug/key öneki taşıyan kayıtları hedefler.
-- Production kayıtlarını topluca silmez.

begin;

-- Bağlantılı alt kayıtlar parent silinince cascade ile temizlenir.
delete from public.instagram_posts
where caption ilike 'TEST_%'
   or external_id ilike 'TEST_%';

delete from public.events
where title ilike 'TEST_%'
   or slug like 'test-%';

delete from public.merch_products
where name ilike 'TEST_%'
   or slug like 'test-%';

delete from public.menu_items
where name ilike 'TEST_%'
   or slug like 'test-%';

delete from public.menu_categories as category
where (category.name ilike 'TEST_%' or category.slug like 'test-%')
  and not exists (
    select 1 from public.menu_items as item where item.category_id = category.id
  );

delete from public.content_blocks
where key like 'test-%';

delete from public.site_pages
where slug like 'test-%';

delete from public.site_settings
where key like 'test-%';

commit;
