-- QA2: additive metadata placement, scoped ordering and immutable delivery templates.
-- Prepared only. No current content is overwritten by applying this migration.
begin;
alter table public.menu_category_branches add column if not exists metadata jsonb not null default '{}'::jsonb;
create or replace function public.admin_menu_group_key(p_category uuid,p_metadata jsonb)
returns text language sql stable security invoker set search_path='' as $$
 select coalesce(p_metadata->'menu_group'->>'key',case when c.slug in ('kahve','spesiyaller','kahve-disi','kahve-ekstralari') then 'coffee' else 'main' end)
 from public.menu_categories c where c.id=p_category
$$;
revoke all on function public.admin_menu_group_key(uuid,jsonb) from public,anon;
grant execute on function public.admin_menu_group_key(uuid,jsonb) to authenticated;
create or replace function public.save_admin_menu_category_v2(p_payload jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid := nullif(p_payload->>'id','')::uuid; v_row public.menu_categories%rowtype;
  v_group jsonb; v_group_key text; v_metadata jsonb; v_existing public.menu_category_branches%rowtype;
  v_branch uuid; v_seen uuid[] := '{}'; v_status public.content_status := (p_payload->>'status')::public.content_status;
  v_active boolean := (p_payload->>'is_active')::boolean; v_order integer := (p_payload->>'sort_order')::integer;
begin
  if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
  if char_length(btrim(p_payload->>'name')) not between 1 and 180 or jsonb_typeof(p_payload->'branches') is distinct from 'array'
    or jsonb_array_length(p_payload->'branches') not between 1 and 20 or v_order is null or v_order not between 0 and 100000
    or v_active is null or v_status is null then raise exception using errcode='22023',message='invalid_category_payload'; end if;
  if p_payload ? 'branch_groups' and (jsonb_typeof(p_payload->'branch_groups') is distinct from 'array' or jsonb_array_length(p_payload->'branch_groups')>20) then raise exception using errcode='22023',message='invalid_category_group'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_unified_menu',0));
  if v_id is not null then
    select * into v_row from public.menu_categories where id=v_id for update;
    if not found then raise exception using errcode='23503',message='category_not_found'; end if;
    if v_row.updated_at is distinct from (p_payload->>'updated_at')::timestamptz or exists (
      select 1 from (select * from public.menu_category_branches where category_id=v_id) b
      full join jsonb_to_recordset(p_payload->'branch_snapshot') as e(id uuid,updated_at timestamptz) on b.id=e.id
      where b.id is null or e.id is null or b.updated_at is distinct from e.updated_at
    ) then raise exception using errcode='40001',message='stale_category'; end if;
    if (v_row.status is distinct from v_status or v_row.is_active is distinct from v_active
      or exists(select 1 from public.menu_category_branches where category_id=v_id and is_active is distinct from (p_payload->'branches' ? branch_id::text))
      or exists(select 1 from jsonb_array_elements_text(p_payload->'branches') b(value) where not exists(select 1 from public.menu_category_branches l where l.category_id=v_id and l.branch_id=b.value::uuid and l.is_active)))
      and p_payload->>'confirmed' is distinct from 'EVET' then raise exception using errcode='22023',message='visibility_confirmation_required'; end if;
    update public.menu_categories set name=btrim(p_payload->>'name'),status=v_status,is_active=v_active where id=v_id;
  else
    if v_status='published' and p_payload->>'confirmed' is distinct from 'EVET' then raise exception using errcode='22023',message='visibility_confirmation_required'; end if;
    insert into public.menu_categories(slug,name,status,is_active,sort_order) values(p_payload->>'slug',btrim(p_payload->>'name'),v_status,v_active,v_order) returning id into v_id;
  end if;
  for v_branch in select value::uuid from jsonb_array_elements_text(p_payload->'branches') loop
    if v_branch=any(v_seen) then raise exception using errcode='22023',message='duplicate_branch_change'; end if;
    v_seen:=array_append(v_seen,v_branch);
    if not exists(select 1 from public.branches where id=v_branch) then raise exception using errcode='23503',message='branch_not_found'; end if;
    insert into public.menu_category_branches(category_id,branch_id,is_active,sort_order) values(v_id,v_branch,true,v_order)
      on conflict(category_id,branch_id) do update set is_active=true where public.menu_category_branches.is_active is distinct from true;
  end loop;
  update public.menu_category_branches set is_active=false where category_id=v_id and not(branch_id=any(v_seen)) and is_active;
  if exists(select 1 from jsonb_array_elements(coalesce(p_payload->'branch_groups','[]'::jsonb)) g group by g->>'branch_id' having count(*)>1) then raise exception using errcode='22023',message='duplicate_category_group'; end if;
  for v_group in select value from jsonb_array_elements(coalesce(p_payload->'branch_groups','[]'::jsonb)) loop
    v_branch:=(v_group->>'branch_id')::uuid; v_group_key:=v_group->>'key';
    if v_branch is null or not (v_branch=any(v_seen)) or v_group->>'label' is null or v_group_key is null or v_group_key !~ '^(main|coffee|custom:[a-z0-9-]{1,60})$' or char_length(btrim(v_group->>'label')) not between 1 and 80
      or coalesce(v_group->>'display_type','preserve') not in ('preserve','cards','compact','price_table','editorial','coffee') then raise exception using errcode='22023',message='invalid_category_group'; end if;
    select * into v_existing from public.menu_category_branches where category_id=v_id and branch_id=v_branch for update;
    v_metadata:=coalesce(v_existing.metadata,'{}'::jsonb)||jsonb_build_object('menu_group',jsonb_build_object('key',v_group_key,'label',btrim(v_group->>'label')));
    if coalesce(v_group->>'display_type','preserve')<>'preserve' then v_metadata:=v_metadata||jsonb_build_object('display_type',v_group->>'display_type'); end if;
    if public.admin_menu_group_key(v_id,v_existing.metadata) is distinct from v_group_key then
      v_metadata:=v_metadata||'{"managed_order":true}'::jsonb;
      update public.menu_category_branches set metadata=v_metadata,sort_order=(select coalesce(max(sort_order),-10)+10 from public.menu_category_branches where branch_id=v_branch) where id=v_existing.id;
    elsif v_metadata is distinct from v_existing.metadata then
      update public.menu_category_branches set metadata=v_metadata where id=v_existing.id;
    end if;
  end loop;
  return v_id;
end; $$;
revoke all on function public.save_admin_menu_category_v2(jsonb) from public,anon,authenticated;
grant execute on function public.save_admin_menu_category_v2(jsonb) to authenticated;


create or replace function public.move_admin_menu_category(p_id uuid,p_branch_id uuid,p_direction text,p_updated_at timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare v_current public.menu_category_branches%rowtype; v_other public.menu_category_branches%rowtype; v_spare integer; v_group text;
begin
 if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
 if p_direction is null or p_direction not in ('up','down') then raise exception using errcode='22023',message='invalid_direction'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_unified_menu',0));
 select * into v_current from public.menu_category_branches where category_id=p_id and branch_id=p_branch_id for update;
 if not found or v_current.updated_at is distinct from p_updated_at then raise exception using errcode='40001',message='stale_category'; end if;
 v_group:=public.admin_menu_group_key(p_id,v_current.metadata);
 select b.* into v_other from public.menu_category_branches b where b.branch_id=p_branch_id
 and public.admin_menu_group_key(b.category_id,b.metadata)=v_group
 and case when p_direction='up' then b.sort_order<v_current.sort_order else b.sort_order>v_current.sort_order end
 order by case when p_direction='up' then -b.sort_order else b.sort_order end limit 1 for update;
 if not found then return; end if;
 select coalesce(max(sort_order),0)+10 into v_spare from public.menu_category_branches where branch_id=p_branch_id;
 update public.menu_category_branches set sort_order=v_spare where id=v_current.id;
 update public.menu_category_branches set sort_order=v_current.sort_order where id=v_other.id;
 update public.menu_category_branches set sort_order=v_other.sort_order where id=v_current.id;
 update public.menu_category_branches set metadata=coalesce(metadata,'{}'::jsonb)||'{"managed_order":true}'::jsonb
 where branch_id=p_branch_id and public.admin_menu_group_key(category_id,metadata)=v_group;
end; $$;
revoke all on function public.move_admin_menu_category(uuid,uuid,text,timestamptz) from public,anon;
grant execute on function public.move_admin_menu_category(uuid,uuid,text,timestamptz) to authenticated;

create table public.admin_delivery_baselines (
 entity_type text not null check(entity_type in ('site_pages','content_blocks','site_settings','branches')),
 baseline_key text not null,
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
 source_ref text not null,
 captured_at timestamptz not null default now(),
 primary key(entity_type,baseline_key)
);
alter table public.admin_delivery_baselines enable row level security;
revoke all on public.admin_delivery_baselines from public,anon,authenticated;
grant select on public.admin_delivery_baselines to authenticated;
create policy admin_delivery_baselines_read on public.admin_delivery_baselines for select to authenticated using ((select public.is_admin()));
-- Fixed frontend-v1 source templates are independent of later revisions and current live values.
insert into public.admin_delivery_baselines(entity_type,baseline_key,snapshot,source_ref) values
('site_pages','home','{"title": "Ana Sayfa", "seo_title": "Kantin İzmir", "seo_description": "Alsancak ve Atakent şubeleri, menüler, etkinlikler ve Kantin’den kareler.", "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_pages','menu','{"title": "Menü", "seo_title": "Kantin Menü", "seo_description": "Alsancak ve Atakent şubelerine özel Kantin menüleri.", "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_pages','events','{"title": "Etkinlikler", "seo_title": "Kantin Etkinlikleri", "seo_description": "Kantin Alsancak ve Atakent etkinlikleri.", "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_pages','careers','{"title": "Ekibe Katıl", "seo_title": "Kantin Kariyer", "seo_description": "Kantin servis, mutfak, bar ve kasa ekiplerine başvuru.", "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','home/hero','{"content": {"title": ["Savor the sip.", "Share the bite."], "eyebrow": "Alsancak · Atakent · İzmir", "marquee": "Savor the sip. Share the bite.", "features": [{"href": "#menuler", "label": "Şubeye özel menü"}, {"href": "/menu?sube=alsancak", "label": "Paylaşmalık tabaklar"}, {"href": "#etkinlikler", "label": "İyi müzik"}], "seedSource": "frontend-v1", "description": "İki şube, iki farklı menü. Alsancak’ta self-servis sokak pub ruhu; Atakent’te bahçe, kokteyller ve daha geniş mutfak seçkisi.", "primaryAction": {"href": "/menu", "label": "Şubeni ve menünü seç"}, "secondaryAction": {"href": "#subeler", "label": "Konumlara bak"}}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','home/menu-branches','{"content": {"items": [{"code": "ALS", "name": "Alsancak", "slug": "alsancak", "tags": ["Self-servis", "Bira", "Kahve Barı"], "image": {"src": "/assets/img/branches/alsancak-1.jpg", "width": 1080, "height": 1350}, "title": "Bira, şarap ve hızlı atıştırmalıklar.", "description": "Fıçı ve şişe biralar, sandviçler, fritöz ürünleri, deli şişleri ve gün boyu açık kahve barı. Kokteyl bu şubenin menüsünde yer almıyor."}, {"code": "ATA", "name": "Atakent", "slug": "atakent", "tags": ["Kokteyl", "Grill", "Bahçe"], "image": {"src": "/assets/img/branches/atakent-1.webp", "width": 841, "height": 1155}, "title": "Bubble kokteyller, aperitifler ve grill.", "delayClass": "reveal-delay-1", "description": "Fıçı ve şişe biraların yanında bubble ve house kokteyller; sıcak tabaklar, 17:00 sonrası ızgara şişleri ve tatlı."}], "seedSource": "frontend-v1"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','home/locations','{"content": {"items": [{"code": "ALS", "slug": "alsancak", "title": "1464. Sokak No:71/A", "images": [{"src": "/assets/img/branches/alsancak-1.jpg", "width": 1080, "height": 1350}, {"src": "/assets/img/branches/alsancak-2.jpg", "width": 1080, "height": 1350}], "address": "Alsancak, Konak / İzmir", "eyebrow": "Alsancak · Self-servis", "mapsUrl": "https://maps.app.goo.gl/qZYRVGAkhtbVA2Fu7?g_st=ic", "visualClass": "branch-alsancak"}, {"code": "ATA", "slug": "atakent", "title": "2035 Sokak No:6", "images": [{"src": "/assets/img/branches/atakent-1.webp", "width": 841, "height": 1155}, {"src": "/assets/img/branches/atakent-2.webp", "width": 773, "height": 1143}], "address": "Atakent, Karşıyaka / İzmir", "eyebrow": "Atakent · Bahçe", "mapsUrl": "https://maps.app.goo.gl/Q6522YB6XoKSReYw8?g_st=ipc", "delayClass": "reveal-delay-1", "visualClass": "branch-atakent"}], "seedSource": "frontend-v1"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','home/memories-copy','{"content": {"title": "Anılarımız", "eyebrow": "Aralık 2023’ten bugüne", "chapters": [{"label": "Alsancak · İlk durak", "title": "Sokağın ritmine göre.", "description": "Tepsini al, soğuk biranı seç ve arkadaşlarının yanına dön. Alsancak’ta amaç en başından beri basitti: beklemeyi azaltmak, masadaki sohbeti bölmemek ve sokağın enerjisine karışmak."}, {"label": "Atakent · Bubble Bar", "title": "Köpüğü kokteyle taşıdık.", "description": "Bira kadar rahat içilen ve ikinci turu doğal hissettiren kokteyllerin peşine düştük. Karbonasyon, kimya, tekrar tekrar denenen tarifler ve bol merak; Atakent’in bahçesinde hızlı servis edilen Bubble ve house kokteyllere dönüştü."}], "statement": "Aynı sokak, aynı ruh. Sadece artık biraz daha fazla yerimiz var.", "seedSource": "frontend-v1", "closingLine": "Samimi ekip, hızlı servis, paylaşmalık tabaklar ve arkadaşlarla uzayan akşamlar.", "introduction": "Kantin; soğuk içecekleri beklemeden alıp sohbete kaldığın, hızlı self-servis ritmi sokak kültürüyle buluşturan samimi bir pub olarak doğdu."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','home/memories-gallery','{"content": {"items": [{"alt": "Kantin ekibinden dört kişi şubenin girişinde birlikte poz veriyor.", "src": "/assets/img/memories/team-door.webp", "label": "Ekip", "layout": "feature", "caption": "Kapının önünde, aynı ruhun etrafında."}, {"alt": "Kantin girişinde sohbet eden üç ekip üyesi.", "src": "/assets/img/memories/door-conversation.webp", "label": "Ekip", "layout": "portrait", "caption": "Günün temposu çoğu zaman kapının önünde başlıyor."}, {"alt": "Kantin önlüğü giyen bir ekip üyesi elinde servis tepsisiyle gülümsüyor.", "src": "/assets/img/memories/apron-tray.webp", "label": "Kantin ekibi", "layout": "portrait", "caption": "Servise hazır, enerjisi hep yerinde."}, {"alt": "Bir misafir elinde bira ve atıştırmalıkla gülümsüyor.", "src": "/assets/img/memories/beer-cheers.webp", "label": "Akşamüstü", "layout": "standard", "caption": "Bir bardak, birkaç lokma ve uzayan sohbetler."}, {"alt": "Bir kişi elinde Kantin''e ait küçük bir kart tutuyor.", "src": "/assets/img/memories/memory-card.webp", "label": "Hatıra", "layout": "portrait", "caption": "Küçük detaylar da anılara karışıyor."}, {"alt": "Gece çekiminde Kantin önlüğü giyen ekip üyeleri yakın planda görülüyor.", "src": "/assets/img/memories/night-closeup.webp", "label": "Gece vardiyası", "layout": "standard", "caption": "Gece uzadığında tempo düşmüyor."}, {"alt": "İki ekip üyesi mutfakta sandviç hazırlarken gülüyor.", "src": "/assets/img/memories/kitchen-laugh.webp", "label": "Mutfak", "layout": "wide", "caption": "Paylaşmalık tabaklar, mutfakta bol kahkaha."}, {"alt": "Bir ekip üyesi servis tezgâhının arkasında çalışıyor.", "src": "/assets/img/memories/counter-rhythm.webp", "label": "Self-servis", "layout": "portrait", "caption": "Tezgâhın arkasındaki günlük ritim."}, {"alt": "İki Kantin ekip üyesi şubenin önünde bira fıçılarını taşıyor.", "src": "/assets/img/memories/keg-run.webp", "label": "Günlük akış", "layout": "standard", "caption": "Bir sonraki tur için hazırlık."}], "seedSource": "frontend-v1"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','home/merch-doodles','{"content": {"items": [{"src": "/assets/img/merch/doodles/table-friends.png", "className": "merch-doodle-table"}, {"src": "/assets/img/merch/doodles/looking-up.png", "className": "merch-doodle-look"}, {"src": "/assets/img/merch/doodles/bar-friends.png", "className": "merch-doodle-bar"}, {"src": "/assets/img/merch/doodles/jumping.png", "className": "merch-doodle-jump"}, {"src": "/assets/img/merch/doodles/cats-table.png", "className": "merch-doodle-cats"}, {"src": "/assets/img/merch/doodles/sharing-drink.png", "className": "merch-doodle-share"}, {"src": "/assets/img/merch/doodles/high-five.png", "className": "merch-doodle-highfive"}, {"src": "/assets/img/merch/doodles/hugging.png", "className": "merch-doodle-hug"}, {"src": "/assets/img/merch/doodles/walking.png", "className": "merch-doodle-walk"}], "seedSource": "frontend-v1"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','home/instagram','{"content": {"postsLimit": 5, "seedSource": "frontend-v1"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','menu/hero','{"content": {"mark": "ALS—ATA", "title": "Şubeni seç", "eyebrow": "Menüler şubeye göre değişir", "seedSource": "frontend-v1", "description": "Alsancak ve Atakent’in ortak ürünleri olsa da kokteyl ve yiyecek seçenekleri aynı değildir. Aşağıdan gideceğin şubeyi seç."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','menu/alsancak-intro','{"content": {"kicker": "Alsancak Menu.", "seedSource": "frontend-v1", "titleLines": ["Bira +", "yanında"], "description": "Alsancak menüsünde kokteyl bulunmaz. Fıçı ve şişe bira, şarap, fritöz ürünleri, sandviçler ve deli tabakları servis edilir."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','menu/atakent-intro','{"content": {"kicker": "Atakent Bubbles + Drinks", "seedSource": "frontend-v1", "titleLines": ["Kokteyl +", "fıçı"], "description": "Bubble ve house kokteyller yalnızca Atakent menüsündedir. Bira, şarap ve kokteyllerin ardından aşağıda Atakent mutfağı yer alır."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','events/empty-state','{"content": {"title": "Yakında yeni etkinlikler burada.", "seedSource": "frontend-v1", "description": "Güncel etkinlik duyuruları yayınlandığında bu alanda listelenecek."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('content_blocks','careers/form-intro','{"content": {"title": "Ekibe katıl", "cvMaxMb": 5, "cvTypes": ["PDF", "DOC", "DOCX"], "seedSource": "frontend-v1", "departments": ["Servis", "Mutfak", "Bar", "Kasa"]}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','theme.settings','{"value": {"bodyScale": "balanced", "fontPreset": "brand", "cardDensity": "balanced", "colorPreset": "kantin", "headingScale": "balanced", "homeSectionOrder": ["menu", "merch", "memories", "events", "branches"]}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','site.identity','{"value": {"name": "kantin.", "slogan": "Savor the sip. Share the bite.", "sloganLines": ["Savor the sip.", "Share the bite."], "instagramUrl": "https://www.instagram.com/kantinizmir/"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','site.contact','{"value": {"city": "İzmir", "country": "TR", "publicEmail": "hello@kantin.pub"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','navigation.primary','{"value": [{"href": "/", "exact": true, "label": "Ana sayfa"}, {"href": "/menu", "label": "Menü"}, {"href": "/events", "label": "Etkinlikler"}], "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','navigation.footer','{"value": [{"links": [{"href": "/events", "label": "Etkinlikler"}, {"href": "/menu", "label": "Şube menüleri"}, {"href": "/#subeler", "label": "Konumlar"}], "title": "Keşfet"}, {"links": [{"href": "https://www.instagram.com/kantinizmir/", "label": "Instagram ↗", "external": true}], "title": "Sosyal"}], "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','sections.visibility','{"value": {"menu": true, "merch": true, "events": true, "careers": true, "branches": true, "homeHero": true, "memories": true, "instagram": true}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','footer.content','{"value": {"intro": "Alsancak’ın sokak temposu, Atakent’in bahçe ve kokteyl ritmi. İkisinde de hızlı servis, samimi ekip ve uzayan sohbetler.", "title": "İki şube, tek ruh.", "workTitle": "Kantin’in bir parçası olmak ister misin?", "bottomLine": "İzmir’de iyi akşamlar için.", "workDescription": "Servis, mutfak, bar ve kasa ekipleri için vardiya tercihlerini belirleyip başvuru formunu doldur."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','menu.hero','{"value": {"title": "Şubeni seç", "eyebrow": "Menüler şubeye göre değişir"}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('site_settings','careers.options','{"value": {"cv": {"maxBytes": 5242880, "allowedExtensions": ["pdf", "doc", "docx"]}, "branches": [{"id": "alsancak", "label": "Alsancak"}, {"id": "atakent", "label": "Atakent"}, {"id": "either", "label": "Fark etmez"}], "departments": [{"id": "service", "label": "Servis", "shifts": [{"id": "morning", "hours": "09.30–17.30", "label": "Sabah vardiyası"}, {"id": "evening", "hours": "16.00–00.00", "label": "Akşam vardiyası"}], "description": "Misafir akışı, masa düzeni ve hızlı self-servis deneyimi."}, {"id": "kitchen", "label": "Mutfak", "shifts": [{"id": "morning", "hours": "09.00–17.00", "label": "Sabah vardiyası"}, {"id": "evening", "hours": "15.30–23.30", "label": "Akşam vardiyası"}], "description": "Hazırlık, üretim ve servis temposunun mutfak tarafı."}, {"id": "bar", "label": "Bar", "shifts": [{"id": "evening", "hours": "16.00–00.00", "label": "Akşam vardiyası"}], "description": "İçecek servisi, düzen ve akşam vardiyasının ritmi."}, {"id": "cashier", "label": "Kasa", "shifts": [{"id": "evening", "hours": "16.00–00.00", "label": "Akşam vardiyası"}], "description": "Sipariş akışı, ödeme ve misafir karşılama."}], "employmentTypes": [{"id": "full-time", "label": "Tam zamanlı"}, {"id": "part-time", "label": "Part-time"}], "availabilityDays": ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('branches','alsancak','{"name": "Alsancak", "short_description": "Self-servis sokak pub ruhu, bira ve gün boyu kahve barı.", "address_line": "1464. Sokak No:71/A", "district": "Alsancak, Konak", "city": "İzmir", "maps_url": "https://maps.app.goo.gl/qZYRVGAkhtbVA2Fu7?g_st=ic", "phone": null, "public_email": "hello@kantin.pub", "features": ["Self-servis", "Bira", "Kahve Barı"], "opening_hours": {"notice": "Güncel çalışma saatleri ve duyurular için Instagram hesabımızı takip et."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea'),
('branches','atakent','{"name": "Atakent", "short_description": "Bahçe, bubble kokteyller, house kokteyller ve grill seçkisi.", "address_line": "2035 Sokak No:6", "district": "Atakent, Karşıyaka", "city": "İzmir", "maps_url": "https://maps.app.goo.gl/Q6522YB6XoKSReYw8?g_st=ipc", "phone": null, "public_email": "hello@kantin.pub", "features": ["Kokteyl", "Grill", "Bahçe"], "opening_hours": {"notice": "Güncel çalışma saatleri ve duyurular için Instagram hesabımızı takip et."}, "status": "published", "is_active": true}'::jsonb,'frontend-v1:seed@b6e4fea')
on conflict(entity_type,baseline_key) do nothing;

create or replace function public.restore_admin_delivery_baseline(p_changes jsonb,p_confirmation text)
returns void language plpgsql security invoker set search_path='' as $$
declare v_change jsonb; v_table text; v_id uuid; v_baseline public.admin_delivery_baselines%rowtype;
 v_current jsonb; v_key text; v_columns text; v_count integer; v_seen text[]:='{}'; v_token text;
begin
 if not public.is_admin() then raise exception using errcode='42501',message='admin_required'; end if;
 if p_confirmation is distinct from 'İLK TESLİME DÖN' then raise exception using errcode='22023',message='baseline_confirmation_required'; end if;
 if jsonb_typeof(p_changes) is distinct from 'array' or jsonb_array_length(p_changes) not between 1 and 500 then raise exception using errcode='22023',message='invalid_baseline_scope'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('admin_delivery_baseline',0));
 for v_change in select value from jsonb_array_elements(p_changes) loop
  v_table:=v_change->>'entity_type'; v_id:=(v_change->>'id')::uuid;
  if v_table is null or v_table not in ('site_pages','content_blocks','site_settings','branches') then raise exception using errcode='22023',message='invalid_baseline_scope'; end if;
  v_token:=v_table||':'||v_id::text;
  if v_token=any(v_seen) then raise exception using errcode='22023',message='duplicate_baseline_target'; end if;
  v_seen:=array_append(v_seen,v_token);
  select * into v_baseline from public.admin_delivery_baselines where entity_type=v_table and baseline_key=v_change->>'baseline_key';
  if not found then raise exception using errcode='23503',message='baseline_not_found'; end if;
  execute format('select to_jsonb(t) from public.%I t where id=$1 for update',v_table) into v_current using v_id;
  if v_current is null or (v_current->>'updated_at')::timestamptz is distinct from (v_change->>'updated_at')::timestamptz then raise exception using errcode='40001',message='stale_baseline_target'; end if;
  if v_table='content_blocks' then
   select slug||'/'||(v_current->>'key') into v_key from public.site_pages where id=(v_current->>'page_id')::uuid;
   v_columns:='content,status,is_active';
  elsif v_table='site_pages' then v_key:=v_current->>'slug'; v_columns:='title,seo_title,seo_description,status,is_active';
  elsif v_table='site_settings' then
   if (v_current->>'is_public')::boolean is distinct from true then raise exception using errcode='42501',message='private_setting_not_restorable'; end if;
   v_key:=v_current->>'key'; v_columns:='value,status,is_active';
  else v_key:=v_current->>'slug'; v_columns:='name,short_description,address_line,district,city,maps_url,phone,public_email,features,opening_hours,status,is_active';
  end if;
  if v_key is distinct from v_baseline.baseline_key then raise exception using errcode='22023',message='baseline_target_mismatch'; end if;
  -- Normal transactional audit/revision triggers preserve the complete pre-restore record.
  execute format('update public.%I t set (%s)=(select %s from jsonb_populate_record(null::public.%I,$1)) where id=$2',v_table,v_columns,v_columns,v_table) using v_baseline.snapshot,v_id;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception using errcode='40001',message='stale_baseline_target'; end if;
 end loop;
end; $$;
revoke all on function public.restore_admin_delivery_baseline(jsonb,text) from public,anon;
grant execute on function public.restore_admin_delivery_baseline(jsonb,text) to authenticated;
commit;
