-- Kantin Website - Faz 5: Frontend v1 başlangıç verileri
-- Tarih: 20 Haziran 2026
-- Önkoşullar: Faz 2 şeması, Faz 3 RLS ve Faz 4 Storage migrationları uygulanmış olmalıdır.
-- Bu dosya tekrar çalıştırılabilir: benzersiz slug/key/path alanlarında UPSERT kullanır.

begin;

-- ---------------------------------------------------------------------------
-- Şubeler
-- ---------------------------------------------------------------------------
insert into public.branches (
  slug, code, name, short_description, address_line, district, city,
  country_code, timezone, maps_url, public_email, features, opening_hours,
  status, is_active, sort_order
) values (
  'alsancak', 'ALS', 'Alsancak', 'Self-servis sokak pub ruhu, bira ve gün boyu kahve barı.',
  '1464. Sokak No:71/A', 'Alsancak, Konak', 'İzmir',
  'TR', 'Europe/Istanbul', 'https://maps.app.goo.gl/qZYRVGAkhtbVA2Fu7?g_st=ic', 'hello@kantin.pub',
  array['Self-servis','Bira','Kahve Barı']::text[], '{"notice":"Güncel çalışma saatleri ve duyurular için Instagram hesabımızı takip et."}'::jsonb, 'published', true, 1
)
on conflict (slug) do update set
  code = excluded.code,
  name = excluded.name,
  short_description = excluded.short_description,
  address_line = excluded.address_line,
  district = excluded.district,
  city = excluded.city,
  country_code = excluded.country_code,
  timezone = excluded.timezone,
  maps_url = excluded.maps_url,
  public_email = excluded.public_email,
  features = excluded.features,
  opening_hours = excluded.opening_hours,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.branches (
  slug, code, name, short_description, address_line, district, city,
  country_code, timezone, maps_url, public_email, features, opening_hours,
  status, is_active, sort_order
) values (
  'atakent', 'ATA', 'Atakent', 'Bahçe, bubble kokteyller, house kokteyller ve grill seçkisi.',
  '2035 Sokak No:6', 'Atakent, Karşıyaka', 'İzmir',
  'TR', 'Europe/Istanbul', 'https://maps.app.goo.gl/Q6522YB6XoKSReYw8?g_st=ipc', 'hello@kantin.pub',
  array['Kokteyl','Grill','Bahçe']::text[], '{"notice":"Güncel çalışma saatleri ve duyurular için Instagram hesabımızı takip et."}'::jsonb, 'published', true, 2
)
on conflict (slug) do update set
  code = excluded.code,
  name = excluded.name,
  short_description = excluded.short_description,
  address_line = excluded.address_line,
  district = excluded.district,
  city = excluded.city,
  country_code = excluded.country_code,
  timezone = excluded.timezone,
  maps_url = excluded.maps_url,
  public_email = excluded.public_email,
  features = excluded.features,
  opening_hours = excluded.opening_hours,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Yerel medya kataloğu
-- ---------------------------------------------------------------------------
insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/branches/alsancak-1.jpg', 'Alsancak şubesi ana görseli', 'Kantin Alsancak şubesinden görünüm.', 'image/jpeg',
  234832, 1080, 1350, '{"group":"branches","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 1
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/branches/alsancak-2.jpg', 'Alsancak şubesi ikinci görsel', 'Kantin Alsancak şubesinin oturma alanı.', 'image/jpeg',
  202818, 1080, 1350, '{"group":"branches","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 2
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/branches/atakent-1.webp', 'Atakent şubesi ana görseli', 'Kantin Atakent şubesinin bahçesi.', 'image/webp',
  125418, 841, 1155, '{"group":"branches","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 3
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/branches/atakent-2.webp', 'Atakent şubesi ikinci görsel', 'Kantin Atakent şubesinden görünüm.', 'image/webp',
  147338, 773, 1143, '{"group":"branches","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 4
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/merch/tee-front.jpg', 'Oversize Tişört', 'Ön yüzünde küçük mavi k. logosu bulunan krem oversize tişört.', 'image/jpeg',
  85486, 1125, 2000, '{"group":"merch","product_slug":"oversize-tshirt","view":"front","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 10
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/merch/tote-front.jpg', 'Tote Çanta', 'Krem Kantin tote çanta.', 'image/jpeg',
  83024, 1125, 2000, '{"group":"merch","product_slug":"tote-canta","view":"front","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 11
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/merch/cap-front.jpg', 'Baseball Şapka', 'Mavi Kantin baseball şapka.', 'image/jpeg',
  102550, 1125, 2000, '{"group":"merch","product_slug":"baseball-sapka","view":"front","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 12
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/merch/tee-back.jpg', 'Oversize Tişört arka yüz', 'Arka yüzünde mavi çizgi karakterlerden oluşan karikatür baskısı olan merch tişört.', 'image/jpeg',
  119883, 1125, 2000, '{"group":"merch","product_slug":"oversize-tshirt","view":"back","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 13
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/instagram/post-01.webp', 'Instagram · All roads led to bubbles.', 'Atakent Bubble Bar tezgâhında kırmızı karbonize kokteyl.', 'image/webp',
  59270, 921, 1151, '{"group":"instagram","external_id":"bubbles","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 20
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/instagram/post-02.webp', 'Instagram · Atakent’te kaldırımı bahçeyle değiştirdik.', 'Kantin Atakent bahçesinde masalarda oturan kalabalık misafir grubu.', 'image/webp',
  192274, 917, 1146, '{"group":"instagram","external_id":"atakent-garden","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 21
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/instagram/post-03.webp', 'Instagram · Outdoor drinking season is back.', 'Ahşap masada bira bardakları ve paylaşmalık yiyecekler.', 'image/webp',
  145290, 922, 1152, '{"group":"instagram","external_id":"outdoor-season","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 22
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/instagram/post-04.webp', 'Instagram · Aynı sokak, aynı ruh. Biraz daha fazla yer.', 'Kantin Alsancak şubesinin yenilenen açık oturma alanı.', 'image/webp',
  133492, 960, 1200, '{"group":"instagram","external_id":"same-street","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 23
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/instagram/post-05.webp', 'Instagram · Soundtrack to your next round.', 'Kantin karikatürlerinin basılı olduğu bez çanta ve yürüyen bir kişi.', 'image/webp',
  107896, 960, 1200, '{"group":"instagram","external_id":"playlist","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 24
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/team-door.webp', 'Kapının önünde, aynı ruhun etrafında.', 'Kantin ekibinden dört kişi şubenin girişinde birlikte poz veriyor.', 'image/webp',
  50610, 437, 701, '{"group":"memories","label":"Ekip","layout":"feature","caption":"Kapının önünde, aynı ruhun etrafında.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 30
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/door-conversation.webp', 'Günün temposu çoğu zaman kapının önünde başlıyor.', 'Kantin girişinde sohbet eden üç ekip üyesi.', 'image/webp',
  73034, 640, 779, '{"group":"memories","label":"Ekip","layout":"portrait","caption":"Günün temposu çoğu zaman kapının önünde başlıyor.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 31
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/apron-tray.webp', 'Servise hazır, enerjisi hep yerinde.', 'Kantin önlüğü giyen bir ekip üyesi elinde servis tepsisiyle gülümsüyor.', 'image/webp',
  129370, 738, 1104, '{"group":"memories","label":"Kantin ekibi","layout":"portrait","caption":"Servise hazır, enerjisi hep yerinde.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 32
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/beer-cheers.webp', 'Bir bardak, birkaç lokma ve uzayan sohbetler.', 'Bir misafir elinde bira ve atıştırmalıkla gülümsüyor.', 'image/webp',
  64120, 698, 660, '{"group":"memories","label":"Akşamüstü","layout":"standard","caption":"Bir bardak, birkaç lokma ve uzayan sohbetler.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 33
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/memory-card.webp', 'Küçük detaylar da anılara karışıyor.', 'Bir kişi elinde Kantin''e ait küçük bir kart tutuyor.', 'image/webp',
  50098, 644, 957, '{"group":"memories","label":"Hatıra","layout":"portrait","caption":"Küçük detaylar da anılara karışıyor.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 34
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/night-closeup.webp', 'Gece uzadığında tempo düşmüyor.', 'Gece çekiminde Kantin önlüğü giyen ekip üyeleri yakın planda görülüyor.', 'image/webp',
  65390, 760, 799, '{"group":"memories","label":"Gece vardiyası","layout":"standard","caption":"Gece uzadığında tempo düşmüyor.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 35
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/kitchen-laugh.webp', 'Paylaşmalık tabaklar, mutfakta bol kahkaha.', 'İki ekip üyesi mutfakta sandviç hazırlarken gülüyor.', 'image/webp',
  66822, 509, 654, '{"group":"memories","label":"Mutfak","layout":"wide","caption":"Paylaşmalık tabaklar, mutfakta bol kahkaha.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 36
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/counter-rhythm.webp', 'Tezgâhın arkasındaki günlük ritim.', 'Bir ekip üyesi servis tezgâhının arkasında çalışıyor.', 'image/webp',
  53384, 519, 697, '{"group":"memories","label":"Self-servis","layout":"portrait","caption":"Tezgâhın arkasındaki günlük ritim.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 37
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.media (
  source, kind, local_path, title, alt_text, mime_type, size_bytes, width, height,
  metadata, status, is_active, sort_order
) values (
  'local', 'image', '/assets/img/memories/keg-run.webp', 'Bir sonraki tur için hazırlık.', 'İki Kantin ekip üyesi şubenin önünde bira fıçılarını taşıyor.', 'image/webp',
  41476, 569, 640, '{"group":"memories","label":"Günlük akış","layout":"standard","caption":"Bir sonraki tur için hazırlık.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 38
)
on conflict (local_path) where source = 'local' do update set
  kind = excluded.kind,
  title = excluded.title,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  width = excluded.width,
  height = excluded.height,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Menü kategorileri ve şube sıraları
-- ---------------------------------------------------------------------------
insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'fici-biralar', 'Fıçı Biralar', null, 'price_table', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 1
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Fıçı Biralar', 'Tüm fıçı biralar Mexican hazırlanabilir.', true, 1
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fici-biralar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Fıçıdan', 'Tüm fıçı biralar Mexican hazırlanabilir.', true, 1
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'fici-biralar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'sise-biralar', 'Şişe Biralar', null, 'compact', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 2
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Şişe Biralar', null, true, 2
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Şişe Biralar', null, true, 4
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'saraplar', 'Şaraplar', null, 'price_table', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 3
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Şaraplar', null, true, 3
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'saraplar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Şaraplar', null, true, 5
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'saraplar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'fritoz', 'Fritöz', null, 'cards', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 4
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Fritöz', null, true, 4
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fritoz'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'firin', 'Fırın', null, 'cards', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 5
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Fırın', 'Bütün sandviçler ikiye bölünerek servis edilir.', true, 5
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'firin'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'deli-salata', 'Deli + Salata', null, 'custom', '{"beer_salads_note":"İki salatayı aynı tabakta yarım + yarım olarak seçebilirsin.","cheese_note":"Tulum, eski kaşar veya yarım yarım karışık olarak hazırlanabilir.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 6
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Deli + Salata', null, true, 6
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'soslar', 'Soslar', null, 'custom', '{"kicker":"Ekstra sos +₺30","title":"Sosunu seç.","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 7
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Soslar', null, true, 7
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'kahve', 'Kahve', null, 'coffee', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 8
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Kahve', 'Sıcak / Soğuk', true, 8
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'spesiyaller', 'Spesiyaller', null, 'coffee', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 9
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Spesiyaller', null, true, 9
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'spesiyaller'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'kahve-disi', 'Kahve Dışı', null, 'coffee', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 10
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Kahve Dışı', null, true, 10
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-disi'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'kahve-ekstralari', 'Kahve Barı Ekstraları', null, 'compact', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 11
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Kahve Barı Ekstraları', null, true, 11
from public.menu_categories as category
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-ekstralari'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'bubble-kokteyller', 'Bubble Kokteyller', null, 'editorial', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 12
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Bubble Kokteyller', null, true, 2
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'bubble-kokteyller'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'house-kokteyller', 'House Kokteyller', null, 'editorial', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 13
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'House Kokteyller', null, true, 3
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'house-kokteyller'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'sicaklar', 'Sıcaklar', null, 'cards', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 14
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Sıcaklar', null, true, 6
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sicaklar'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'izgara-sisleri', 'Izgara Şişleri', null, 'cards', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 15
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Izgara Şişleri', '17:00’dan itibaren servis edilir.', true, 7
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'izgara-sisleri'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_categories (
  slug, name, description, display_type, metadata, status, is_active, sort_order
) values (
  'tatli', 'Tatlı', null, 'feature', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 16
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_type = excluded.display_type,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_category_branches (
  category_id, branch_id, display_name, description, is_active, sort_order
)
select category.id, branch.id, 'Tatlı', null, true, 8
from public.menu_categories as category
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'tatli'
on conflict (category_id, branch_id) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Menü ürünleri, şube fiyatları ve porsiyon/hacim varyantları
-- ---------------------------------------------------------------------------
insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'becks', 'Becks', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'fici-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fici-biralar'
  and item.slug = 'becks'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '20-cl', '20 cl', null,
  10000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'becks'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  21500, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'becks'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '66-cl', '66 cl', null,
  24500, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'becks'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'fici-biralar'
  and item.slug = 'becks'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '33-cl', '33 cl', null,
  16000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'becks'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  25000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'becks'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'belfast', 'Belfast', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'fici-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fici-biralar'
  and item.slug = 'belfast'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '20-cl', '20 cl', null,
  9000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'belfast'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  20000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'belfast'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '66-cl', '66 cl', null,
  23000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'belfast'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'efes-pilsen', 'Efes Pilsen', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'fici-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fici-biralar'
  and item.slug = 'efes-pilsen'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '20-cl', '20 cl', null,
  9000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'efes-pilsen'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  20000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'efes-pilsen'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '66-cl', '66 cl', null,
  23000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'efes-pilsen'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'fici-biralar'
  and item.slug = 'efes-pilsen'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '33-cl', '33 cl', null,
  15000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'efes-pilsen'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  23000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'efes-pilsen'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'stella-artois', 'Stella Artois', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 11
from public.menu_categories as category
where category.slug = 'fici-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 11
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'fici-biralar'
  and item.slug = 'stella-artois'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '33-cl', '33 cl', null,
  18000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'stella-artois'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  26000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'fici-biralar'
  and item.slug = 'stella-artois'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'amsterdam', 'Amsterdam', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 30000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'amsterdam'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 30000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'amsterdam'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'becks', 'Becks', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'becks'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '33-cl', '33 cl', null,
  23000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'becks'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  25000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'becks'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 24000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'becks'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'bomonti-filtresiz', 'Bomonti Filtresiz', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 24000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'bomonti-filtresiz'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 26000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'bomonti-filtresiz'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'bud', 'Bud', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'bud'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '33-cl', '33 cl', null,
  25000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'bud'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  27500, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'bud'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'bud'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '33-cl', '33 cl', null,
  25000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'bud'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  30000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'bud'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'corona', 'Corona', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 5
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 27500, 'TRY',
  '35,5 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'corona'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 30000, 'TRY',
  '35,5 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'corona'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'duvel', 'Duvel', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 6
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 30000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 6
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'duvel'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 32000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 6
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'duvel'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'efes-pilsen', 'Efes Pilsen', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 7
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 7
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-pilsen'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '30-cl', '30 cl', null,
  15000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'efes-pilsen'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, '50-cl', '50 cl', null,
  23000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'sise-biralar'
  and item.slug = 'efes-pilsen'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 17000, 'TRY',
  '30 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 7
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-pilsen'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'efes-malt', 'Efes Malt', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 8
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 23000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 8
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-malt'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 25000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 8
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-malt'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'efes-glutensiz', 'Efes Glutensiz', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 9
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 25000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 9
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-glutensiz'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 27000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 9
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-glutensiz'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'efes-ozel-seri', 'Efes Özel Seri', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 10
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 23000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 10
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-ozel-seri'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 25000, 'TRY',
  '50 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 10
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'efes-ozel-seri'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'erdinger', 'Erdinger', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 11
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 30000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 11
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'erdinger'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 32000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 11
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'erdinger'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'miller', 'Miller', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 12
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 25000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 12
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'miller'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 27000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 12
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'miller'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'hoegaarden', 'Hoegaarden', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 13
from public.menu_categories as category
where category.slug = 'sise-biralar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 30000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 13
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'sise-biralar'
  and item.slug = 'hoegaarden'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 32000, 'TRY',
  '33 cl', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 13
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sise-biralar'
  and item.slug = 'hoegaarden'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'la-smyrna', 'LA Smyrna', 'Beyaz · Rosé · Kırmızı', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'saraplar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'saraplar'
  and item.slug = 'la-smyrna'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'kadeh', 'Kadeh', null,
  30000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'saraplar'
  and item.slug = 'la-smyrna'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'karaf-75-cl', 'Karaf 75 cl', null,
  120000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'saraplar'
  and item.slug = 'la-smyrna'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'saraplar'
  and item.slug = 'la-smyrna'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'kadeh', 'Kadeh', null,
  45000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'saraplar'
  and item.slug = 'la-smyrna'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'sise', 'Şişe', null,
  200000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'saraplar'
  and item.slug = 'la-smyrna'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cinzano-prosecco', 'Cinzano Prosecco', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'saraplar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'saraplar'
  and item.slug = 'cinzano-prosecco'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'kadeh', 'Kadeh', null,
  58000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'saraplar'
  and item.slug = 'cinzano-prosecco'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'sise', 'Şişe', null,
  260000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'saraplar'
  and item.slug = 'cinzano-prosecco'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'la-monreve', 'LA Monreve', 'Beyaz · Kırmızı', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'saraplar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'saraplar'
  and item.slug = 'la-monreve'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'sise', 'Şişe', null,
  240000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'saraplar'
  and item.slug = 'la-monreve'
  and branch.slug = 'atakent'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'tortilla-cips', 'Tortilla Cips', 'Yanında seçtiğin 1 sos ücretsiz.', null,
  '1 sos ücretsiz', null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'fritoz'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 12500, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fritoz'
  and item.slug = 'tortilla-cips'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'patates-kizartmasi', 'Patates Kızartması', 'Yanında seçtiğin 2 sos ücretsiz. Tulum veya trüf dokunuşu +₺70.', null,
  '2 sos ücretsiz', null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'fritoz'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 22000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fritoz'
  and item.slug = 'patates-kizartmasi'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'tavuk-kizartmasi', 'Tavuk Kızartması', 'Coleslaw ile birlikte servis edilir.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'fritoz'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 27500, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fritoz'
  and item.slug = 'tavuk-kizartmasi'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'citir-chili-tavuk', 'Çıtır Chili Tavuk', 'Çıtır ve belirgin acılı tavuk.', null,
  null, null, '{}'::text[], array['ACILI']::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'fritoz'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 28500, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fritoz'
  and item.slug = 'citir-chili-tavuk'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'frankfurter', 'Frankfurter', 'Coleslaw ile servis edilir. Glutensiz seçeneği bulunur.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 5
from public.menu_categories as category
where category.slug = 'fritoz'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 25000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'fritoz'
  and item.slug = 'frankfurter'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'ege-sandvic', 'Ege Sandviç', 'Stracciatella peyniri · roka · ot pesto · pembe domates · balzamik sos.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'firin'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 26000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'firin'
  and item.slug = 'ege-sandvic'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'kasap-sandvic', 'Kasap Sandviç', 'Hindi füme · stracciatella peyniri · roka · ot pesto · pembe domates · balzamik sos.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'firin'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 32000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'firin'
  and item.slug = 'kasap-sandvic'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'balli-jambon-sandvic', 'Ballı Jambon Sandviç', 'Antep fıstığı ezmesi · stracciatella peyniri · mortadella · roka.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'firin'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 38000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'firin'
  and item.slug = 'balli-jambon-sandvic'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'pretzel', 'Pretzel', 'Cheddar sos ile servis edilir.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'firin'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 12500, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'firin'
  and item.slug = 'pretzel'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'sanayi-tabagi', 'Sanayi Tabağı', '5 adet küp tulum peyniri · 5 adet küp eski kaşar peyniri · 2 adet turşu şiş.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 18500, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'sanayi-tabagi'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'tulum-peyniri', 'Tulum Peyniri', null, 'Orta sertlikte · menşei Bergama',
  null, null, '{}'::text[], '{}'::text[],
  '{"portion":"Yarım: 6 küp · Tam: 12 küp","mixed":false,"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'tulum-peyniri'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'yarim', 'Yarım', 'Yarım: 6 küp · Tam: 12 küp',
  7500, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'tulum-peyniri'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'tam', 'Tam', 'Yarım: 6 küp · Tam: 12 küp',
  15000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'tulum-peyniri'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'eski-kasar-peyniri', 'Eski Kaşar Peyniri', null, 'Eski kaşar peyniri',
  null, null, '{}'::text[], '{}'::text[],
  '{"portion":"Yarım: 6 küp · Tam: 12 küp","mixed":false,"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'eski-kasar-peyniri'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'yarim', 'Yarım', 'Yarım: 6 küp · Tam: 12 küp',
  7500, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'eski-kasar-peyniri'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'tam', 'Tam', 'Yarım: 6 küp · Tam: 12 küp',
  15000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'eski-kasar-peyniri'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'karisik-kup-peynir', 'Karışık Küp Peynir', null, 'Tulum + eski kaşar birlikte',
  null, null, '{}'::text[], '{}'::text[],
  '{"portion":"Yarım: 3 tulum + 3 kaşar · Tam: 6 tulum + 6 kaşar","mixed":true,"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'karisik-kup-peynir'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'yarim', 'Yarım', 'Yarım: 3 tulum + 3 kaşar · Tam: 6 tulum + 6 kaşar',
  7500, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'karisik-kup-peynir'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'tam', 'Tam', 'Yarım: 3 tulum + 3 kaşar · Tam: 6 tulum + 6 kaşar',
  15000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'karisik-kup-peynir'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'chorizo-sis', 'Chorizo Şiş', 'Baby enginar · chorizo · top peyniri · şeker domates.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 10
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 20000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 10
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'chorizo-sis'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'peynir-sis', 'Peynir Şiş', 'Top peyniri · şeker domates.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 11
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 12000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 11
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'peynir-sis'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'tursu-sis', 'Turşu Şiş', 'Biberli zeytin · kornişon turşu · peynir dolgulu kiraz biber · biber turşusu.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 12
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 7500, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 12
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'tursu-sis'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'kuru-incir-sis', 'Kuru İncir Şiş', 'Kuru incir · eski kaşar peyniri · siyah üzüm.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 13
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 14000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 13
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'kuru-incir-sis'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cerez', 'Çerez', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"className":"beer-salad-preceding-item","seed_source":"frontend-v1"}'::jsonb, 'published', true, 14
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 8000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 14
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'cerez'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'pasta-fredda', 'Pasta Fredda', 'Fusilli makarna · biber · soğan · mısır · balzamik sos · turşu.', null,
  null, null, '{}'::text[], array['VEGAN']::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 20
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 20
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'pasta-fredda'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'tam', 'Tam', null,
  20000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'pasta-fredda'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'yarim', 'Yarım', null,
  10000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'pasta-fredda'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'patates-salata', 'Patates Salata', 'Patates · Dijon hardal · dereotu · taze soğan · hardal tohumu.', null,
  null, null, '{}'::text[], array['VEGAN']::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 21
from public.menu_categories as category
where category.slug = 'deli-salata'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, null, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 21
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'deli-salata'
  and item.slug = 'patates-salata'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'tam', 'Tam', null,
  20000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'patates-salata'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_variants (
  menu_item_branch_id, slug, label, detail, price_cents, currency,
  price_note, metadata, is_active, sort_order
)
select item_branch.id, 'yarim', 'Yarım', null,
  10000, 'TRY', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_item_branches as item_branch
join public.menu_items as item on item.id = item_branch.menu_item_id
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.id = item_branch.branch_id
where category.slug = 'deli-salata'
  and item.slug = 'patates-salata'
  and branch.slug = 'alsancak'
on conflict (menu_item_branch_id, slug) do update set
  label = excluded.label,
  detail = excluded.detail,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_note = excluded.price_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'kantin-sos', 'Kantin Sos', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'soslar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  'Ekstra sos', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
  and item.slug = 'kantin-sos'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'dereotlu-mayonez', 'Dereotlu Mayonez', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'soslar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  'Ekstra sos', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
  and item.slug = 'dereotlu-mayonez'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'aci-barbeku', 'Acı Barbekü', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'soslar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  'Ekstra sos', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
  and item.slug = 'aci-barbeku'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cheddar-dip', 'Cheddar Dip', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'soslar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  'Ekstra sos', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
  and item.slug = 'cheddar-dip'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'aci-mayonez', 'Acı Mayonez', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 5
from public.menu_categories as category
where category.slug = 'soslar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  'Ekstra sos', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
  and item.slug = 'aci-mayonez'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'truf-mayonez', 'Trüf Mayonez', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 6
from public.menu_categories as category
where category.slug = 'soslar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  'Ekstra sos', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 6
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
  and item.slug = 'truf-mayonez'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'sweet-chili', 'Sweet Chili', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 7
from public.menu_categories as category
where category.slug = 'soslar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  'Ekstra sos', null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 7
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'soslar'
  and item.slug = 'sweet-chili'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'espresso', 'Espresso', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 18000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'espresso'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'americano', 'Americano', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 18000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'americano'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cappuccino', 'Cappuccino', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 20000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'cappuccino'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'latte', 'Latte', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 20000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'latte'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'flat-white', 'Flat White', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 5
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 20000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'flat-white'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'macchiato', 'Macchiato', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 6
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 20000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 6
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'macchiato'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'mocha', 'Mocha', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 7
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 20000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 7
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'mocha'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'filtre-kahve', 'Filtre Kahve', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 8
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 18000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 8
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'filtre-kahve'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cold-brew', 'Cold Brew', null, '18H',
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 9
from public.menu_categories as category
where category.slug = 'kahve'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 22000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 9
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve'
  and item.slug = 'cold-brew'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'mont-blanc-latte', 'Mont Blanc Latte', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'spesiyaller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 24000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'spesiyaller'
  and item.slug = 'mont-blanc-latte'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'pink-brew', 'Pink Brew', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'spesiyaller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 24000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'spesiyaller'
  and item.slug = 'pink-brew'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'black-sesame-hojicha', 'Black Sesame Hojicha', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'spesiyaller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 33000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'spesiyaller'
  and item.slug = 'black-sesame-hojicha'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'matcha-berry', 'Matcha Berry', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'spesiyaller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 33000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'spesiyaller'
  and item.slug = 'matcha-berry'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'lotus-latte', 'Lotus Latte', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 5
from public.menu_categories as category
where category.slug = 'spesiyaller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 26000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'spesiyaller'
  and item.slug = 'lotus-latte'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'matcha-latte', 'Matcha Latte', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'kahve-disi'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 28000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-disi'
  and item.slug = 'matcha-latte'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cloud-matcha', 'Cloud Matcha', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'kahve-disi'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 26000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-disi'
  and item.slug = 'cloud-matcha'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'yuzu-cooler', 'Yuzu Cooler', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'kahve-disi'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 26000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-disi'
  and item.slug = 'yuzu-cooler'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'coco-matcha', 'Coco Matcha', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'kahve-disi'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 33000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-disi'
  and item.slug = 'coco-matcha'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'hojicha-latte', 'Hojicha Latte', null, null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 5
from public.menu_categories as category
where category.slug = 'kahve-disi'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 28000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-disi'
  and item.slug = 'hojicha-latte'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'tatlilar', 'Tatlılar', 'Kantin Rolls', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'kahve-ekstralari'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 23000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-ekstralari'
  and item.slug = 'tatlilar'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'ekstralar', 'Ekstralar', 'Karamel · Vanilya · Beyaz Çikolata', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'kahve-ekstralari'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 3000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-ekstralari'
  and item.slug = 'ekstralar'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'alternatif-sutler', 'Alternatif sütler', 'Badem · Soya · Yulaf · Hindistan Cevizi', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'kahve-ekstralari'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 4000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'alsancak'
where category.slug = 'kahve-ekstralari'
  and item.slug = 'alternatif-sutler'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'garden-fizz', 'Garden Fizz', 'Malfy Originale, zencefil, limonotu ve tropical mate çayı.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'bubble-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 48000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'bubble-kokteyller'
  and item.slug = 'garden-fizz'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'banana-oolong', 'Banana Oolong', 'Havana Club Añejo 3, Malibu ve muz.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'bubble-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 48000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'bubble-kokteyller'
  and item.slug = 'banana-oolong'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cherry-paloma', 'Cherry Paloma', 'Olmeca, vişne, greyfurt ve saline.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'bubble-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 48000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'bubble-kokteyller'
  and item.slug = 'cherry-paloma'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'greenhouse', 'Greenhouse', 'Absolut, kavun ve lime.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'house-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 52000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'house-kokteyller'
  and item.slug = 'greenhouse'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'peach-leaf', 'Peach Leaf', 'Malfy Originale, şeftali, fesleğen ve Lillet Rosé.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'house-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 52000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'house-kokteyller'
  and item.slug = 'peach-leaf'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'palo-santo', 'Palo Santo', 'Olmeca Altos, salatalık, bianco vermut ve mürver çiçeği.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'house-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 52000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'house-kokteyller'
  and item.slug = 'palo-santo'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'fig-tonka', 'Fig + Tonka', 'Jameson Black Barrel, incir, tonka ve mahlep.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 4
from public.menu_categories as category
where category.slug = 'house-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 52000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 4
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'house-kokteyller'
  and item.slug = 'fig-tonka'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'coffee-vermouth', 'Coffee Vermouth', 'Martini Fiero, kahve ve Ramazzotti.', null,
  null, null, '{}'::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 5
from public.menu_categories as category
where category.slug = 'house-kokteyller'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 52000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 5
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'house-kokteyller'
  and item.slug = 'coffee-vermouth'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'patates-kizartmasi', 'Patates Kızartması', 'Cajun baharatlı, trüf mayonez ve acı-tatlı BBQ sos ile.', null,
  null, 'Alerjenler: Yumurta.', array['Yumurta']::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'sicaklar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 23000, 'TRY',
  null, 'Trüflü +₺70', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sicaklar'
  and item.slug = 'patates-kizartmasi'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'tavuk-pane', 'Tavuk Pane', 'Baharatlı çıtır tavuk ve ev yapımı coleslaw.', null,
  null, 'Alerjenler: Gluten, yumurta, süt ürünleri.', array['Gluten','yumurta','süt ürünleri']::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'sicaklar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 27000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sicaklar'
  and item.slug = 'tavuk-pane'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'istiridye-mantari', 'İstiridye Mantarı', 'Tempura istiridye mantarı ve toum sos.', null,
  null, 'Alerjenler: Gluten, yumurta.', array['Gluten','yumurta']::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'sicaklar'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 23000, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'sicaklar'
  and item.slug = 'istiridye-mantari'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'incik-misir', 'İncik & Mısır', 'Soya ve pirinç sirkesi ile marine edilmiş kemiksiz tavuk but, mısır püresi ile.', null,
  null, 'Alerjenler: Soya, süt ürünleri.', array['Soya','süt ürünleri']::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'izgara-sisleri'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 21000, 'TRY',
  null, '/ adet', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'izgara-sisleri'
  and item.slug = 'incik-misir'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'karides-ananas', 'Karides & Ananas', 'Sarımsak, biberiye ve kekik ile ızgaralanmış karides; ananas ve narenciye sos ile.', null,
  null, 'Alerjenler: Kabuklu deniz ürünleri, süt ürünleri, sülfitler.', array['Kabuklu deniz ürünleri','süt ürünleri','sülfitler']::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 2
from public.menu_categories as category
where category.slug = 'izgara-sisleri'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 24000, 'TRY',
  null, '/ adet', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 2
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'izgara-sisleri'
  and item.slug = 'karides-ananas'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'kofte-humus', 'Köfte & Humus', 'Pekmezli misket köfte, kestane mantarı ve ev yapımı humus.', null,
  null, 'Alerjenler: Gluten, yumurta, susam.', array['Gluten','yumurta','susam']::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 3
from public.menu_categories as category
where category.slug = 'izgara-sisleri'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 21000, 'TRY',
  null, '/ adet', null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 3
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'izgara-sisleri'
  and item.slug = 'kofte-humus'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_items (
  category_id, slug, name, description, detail, highlight_text, allergen_text,
  allergens, badges, metadata, status, is_active, sort_order
)
select category.id, 'cikolata-mousse', 'Çikolata Mousse', 'Yoğun çikolatalı mousse.', null,
  null, 'Alerjenler: Süt ürünleri, yumurta.', array['Süt ürünleri','yumurta']::text[], '{}'::text[],
  '{"seed_source":"frontend-v1"}'::jsonb, 'published', true, 1
from public.menu_categories as category
where category.slug = 'tatli'
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  highlight_text = excluded.highlight_text,
  allergen_text = excluded.allergen_text,
  allergens = excluded.allergens,
  badges = excluded.badges,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.menu_item_branches (
  menu_item_id, branch_id, price_cents, currency, price_label, price_note,
  availability_note, metadata, is_active, sort_order
)
select item.id, branch.id, 22500, 'TRY',
  null, null, null,
  '{"seed_source":"frontend-v1"}'::jsonb, true, 1
from public.menu_items as item
join public.menu_categories as category on category.id = item.category_id
join public.branches as branch on branch.slug = 'atakent'
where category.slug = 'tatli'
  and item.slug = 'cikolata-mousse'
on conflict (menu_item_id, branch_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  availability_note = excluded.availability_note,
  metadata = excluded.metadata,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Merch ürünleri ve Alsancak bulunabilirliği
-- ---------------------------------------------------------------------------
insert into public.merch_products (
  slug, product_type, name, description, detail, sku, price_cents, currency,
  inventory_status, image_media_id, metadata, status, is_active, sort_order, published_at
) values (
  'oversize-tshirt', 'item', 'Oversize Tişört', '500 GSM pamuk single jersey kumaş, rahat ve oversize kesim unisex tişört.', 'Beden: S–XL · Materyal: %100 Organik Pamuk',
  'KANTIN-OVERSIZE-TSHIRT', 69000, 'TRY', 'available',
  (select id from public.media where source = 'local' and local_path = '/assets/img/merch/tee-front.jpg'),
  '{"image_alt":"Ön yüzünde küçük mavi k. logosu bulunan krem oversize tişört.","index":"01","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 1, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  product_type = excluded.product_type,
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  sku = excluded.sku,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  inventory_status = excluded.inventory_status,
  image_media_id = excluded.image_media_id,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.merch_products (
  slug, product_type, name, description, detail, sku, price_cents, currency,
  inventory_status, image_media_id, metadata, status, is_active, sort_order, published_at
) values (
  'tote-canta', 'item', 'Tote Çanta', 'Orta boy, iç cepli, sağlam saplı, çok amaçlı pamuk kanvas tote çanta.', 'Beden: Tek beden · Materyal: %100 Pamuk Kanvas',
  'KANTIN-TOTE-CANTA', 44000, 'TRY', 'available',
  (select id from public.media where source = 'local' and local_path = '/assets/img/merch/tote-front.jpg'),
  '{"image_alt":"Krem Kantin tote çanta.","index":"02","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 2, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  product_type = excluded.product_type,
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  sku = excluded.sku,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  inventory_status = excluded.inventory_status,
  image_media_id = excluded.image_media_id,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.merch_products (
  slug, product_type, name, description, detail, sku, price_cents, currency,
  inventory_status, image_media_id, metadata, status, is_active, sort_order, published_at
) values (
  'baseball-sapka', 'item', 'Baseball Şapka', 'Önde nakışlı logo, arkada metal tokalı ayarlanabilir kayışa sahip Kantin mavi baseball şapka.', 'Beden: Tek beden · Materyal: %100 Organik Pamuk',
  'KANTIN-BASEBALL-SAPKA', 42000, 'TRY', 'available',
  (select id from public.media where source = 'local' and local_path = '/assets/img/merch/cap-front.jpg'),
  '{"image_alt":"Mavi Kantin baseball şapka.","index":"03","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 3, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  product_type = excluded.product_type,
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  sku = excluded.sku,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  inventory_status = excluded.inventory_status,
  image_media_id = excluded.image_media_id,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.merch_products (
  slug, product_type, name, description, detail, sku, price_cents, currency,
  inventory_status, metadata, status, is_active, sort_order, published_at
) values (
  'full-set', 'bundle', 'Full Set · Tişört + Çanta + Şapka', 'Oversize tişört, tote çanta ve baseball şapkadan oluşan full set.', null, 'KANTIN-FULL-SET',
  135000, 'TRY', 'available', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 10, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  product_type = excluded.product_type,
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  sku = excluded.sku,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  inventory_status = excluded.inventory_status,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.merch_products (
  slug, product_type, name, description, detail, sku, price_cents, currency,
  inventory_status, metadata, status, is_active, sort_order, published_at
) values (
  'ikili-kombin', 'bundle', '2’li Kombin · seçili iki parça', 'Seçili iki Kantin merch parçasından oluşan kombin.', null, 'KANTIN-IKILI-KOMBIN',
  99000, 'TRY', 'available', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 11, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  product_type = excluded.product_type,
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  sku = excluded.sku,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  inventory_status = excluded.inventory_status,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.merch_product_branches (
  merch_product_id, branch_id, is_available, sort_order
)
select product.id, branch.id, true, product.sort_order
from public.merch_products as product
join public.branches as branch on branch.slug = 'alsancak'
where product.slug = 'oversize-tshirt'
on conflict (merch_product_id, branch_id) do update set
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

insert into public.merch_product_branches (
  merch_product_id, branch_id, is_available, sort_order
)
select product.id, branch.id, true, product.sort_order
from public.merch_products as product
join public.branches as branch on branch.slug = 'alsancak'
where product.slug = 'tote-canta'
on conflict (merch_product_id, branch_id) do update set
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

insert into public.merch_product_branches (
  merch_product_id, branch_id, is_available, sort_order
)
select product.id, branch.id, true, product.sort_order
from public.merch_products as product
join public.branches as branch on branch.slug = 'alsancak'
where product.slug = 'baseball-sapka'
on conflict (merch_product_id, branch_id) do update set
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

insert into public.merch_product_branches (
  merch_product_id, branch_id, is_available, sort_order
)
select product.id, branch.id, true, product.sort_order
from public.merch_products as product
join public.branches as branch on branch.slug = 'alsancak'
where product.slug = 'full-set'
on conflict (merch_product_id, branch_id) do update set
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

insert into public.merch_product_branches (
  merch_product_id, branch_id, is_available, sort_order
)
select product.id, branch.id, true, product.sort_order
from public.merch_products as product
join public.branches as branch on branch.slug = 'alsancak'
where product.slug = 'ikili-kombin'
on conflict (merch_product_id, branch_id) do update set
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Instagram gönderileri
-- ---------------------------------------------------------------------------
insert into public.instagram_posts (
  external_id, permalink, caption, image_alt, branch_id, image_media_id,
  published_at, metadata, status, is_active, sort_order
) values (
  'bubbles', 'https://www.instagram.com/p/DZS8Wk5ACW1/?img_index=1', 'All roads led to bubbles.', 'Atakent Bubble Bar tezgâhında kırmızı karbonize kokteyl.',
  (select id from public.branches where slug = 'atakent'),
  (select id from public.media where source = 'local' and local_path = '/assets/img/instagram/post-01.webp'),
  '2026-06-07T12:00:00+03:00', '{"display_date":"7 Haziran","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 1
)
on conflict (permalink) do update set
  external_id = excluded.external_id,
  caption = excluded.caption,
  image_alt = excluded.image_alt,
  branch_id = excluded.branch_id,
  image_media_id = excluded.image_media_id,
  published_at = excluded.published_at,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.instagram_posts (
  external_id, permalink, caption, image_alt, branch_id, image_media_id,
  published_at, metadata, status, is_active, sort_order
) values (
  'atakent-garden', 'https://www.instagram.com/p/DZPjAUPgDH8/?img_index=1', 'Atakent’te kaldırımı bahçeyle değiştirdik.', 'Kantin Atakent bahçesinde masalarda oturan kalabalık misafir grubu.',
  (select id from public.branches where slug = 'atakent'),
  (select id from public.media where source = 'local' and local_path = '/assets/img/instagram/post-02.webp'),
  '2026-06-06T12:00:00+03:00', '{"display_date":"6 Haziran","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 2
)
on conflict (permalink) do update set
  external_id = excluded.external_id,
  caption = excluded.caption,
  image_alt = excluded.image_alt,
  branch_id = excluded.branch_id,
  image_media_id = excluded.image_media_id,
  published_at = excluded.published_at,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.instagram_posts (
  external_id, permalink, caption, image_alt, branch_id, image_media_id,
  published_at, metadata, status, is_active, sort_order
) values (
  'outdoor-season', 'https://www.instagram.com/p/DYM3s96jSbl/?img_index=1', 'Outdoor drinking season is back.', 'Ahşap masada bira bardakları ve paylaşmalık yiyecekler.',
  (select id from public.branches where slug = 'alsancak'),
  (select id from public.media where source = 'local' and local_path = '/assets/img/instagram/post-03.webp'),
  '2026-05-11T12:00:00+03:00', '{"display_date":"11 Mayıs","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 3
)
on conflict (permalink) do update set
  external_id = excluded.external_id,
  caption = excluded.caption,
  image_alt = excluded.image_alt,
  branch_id = excluded.branch_id,
  image_media_id = excluded.image_media_id,
  published_at = excluded.published_at,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.instagram_posts (
  external_id, permalink, caption, image_alt, branch_id, image_media_id,
  published_at, metadata, status, is_active, sort_order
) values (
  'same-street', 'https://www.instagram.com/p/DYAUkBVjT4V/?img_index=1', 'Aynı sokak, aynı ruh. Biraz daha fazla yer.', 'Kantin Alsancak şubesinin yenilenen açık oturma alanı.',
  (select id from public.branches where slug = 'alsancak'),
  (select id from public.media where source = 'local' and local_path = '/assets/img/instagram/post-04.webp'),
  '2026-05-06T12:00:00+03:00', '{"display_date":"6 Mayıs","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 4
)
on conflict (permalink) do update set
  external_id = excluded.external_id,
  caption = excluded.caption,
  image_alt = excluded.image_alt,
  branch_id = excluded.branch_id,
  image_media_id = excluded.image_media_id,
  published_at = excluded.published_at,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.instagram_posts (
  external_id, permalink, caption, image_alt, branch_id, image_media_id,
  published_at, metadata, status, is_active, sort_order
) values (
  'playlist', 'https://www.instagram.com/p/DXj0-JsjS26/?img_index=1', 'Soundtrack to your next round.', 'Kantin karikatürlerinin basılı olduğu bez çanta ve yürüyen bir kişi.',
  (select id from public.branches where slug = 'alsancak'),
  (select id from public.media where source = 'local' and local_path = '/assets/img/instagram/post-05.webp'),
  '2026-04-25T12:00:00+03:00', '{"display_date":"25 Nisan","seed_source":"frontend-v1"}'::jsonb,
  'published', true, 5
)
on conflict (permalink) do update set
  external_id = excluded.external_id,
  caption = excluded.caption,
  image_alt = excluded.image_alt,
  branch_id = excluded.branch_id,
  image_media_id = excluded.image_media_id,
  published_at = excluded.published_at,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Genel site ayarları
-- ---------------------------------------------------------------------------
insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'site.identity', '{"name":"kantin.","slogan":"Savor the sip. Share the bite.","sloganLines":["Savor the sip.","Share the bite."],"instagramUrl":"https://www.instagram.com/kantinizmir/"}'::jsonb, 'Marka adı, slogan ve ana sosyal medya bağlantısı.', true, 'published', true, 1
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'site.contact', '{"publicEmail":"hello@kantin.pub","city":"İzmir","country":"TR"}'::jsonb, 'Public iletişim bilgileri.', true, 'published', true, 2
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'navigation.primary', '[{"href":"/","label":"Ana sayfa","exact":true},{"href":"/menu","label":"Menü"},{"href":"/events","label":"Etkinlikler"}]'::jsonb, 'Ana navigasyon öğeleri.', true, 'published', true, 3
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'navigation.footer', '[{"title":"Keşfet","links":[{"href":"/events","label":"Etkinlikler"},{"href":"/menu","label":"Şube menüleri"},{"href":"/#subeler","label":"Konumlar"}]},{"title":"Sosyal","links":[{"href":"https://www.instagram.com/kantinizmir/","label":"Instagram ↗","external":true}]}]'::jsonb, 'Footer navigasyon grupları.', true, 'published', true, 4
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'sections.visibility', '{"homeHero":true,"branches":true,"menu":true,"events":true,"merch":true,"memories":true,"instagram":true,"careers":true}'::jsonb, 'Public site bölüm görünürlükleri.', true, 'published', true, 5
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'footer.content', '{"title":"İki şube, tek ruh.","intro":"Alsancak’ın sokak temposu, Atakent’in bahçe ve kokteyl ritmi. İkisinde de hızlı servis, samimi ekip ve uzayan sohbetler.","workTitle":"Kantin’in bir parçası olmak ister misin?","workDescription":"Servis, mutfak, bar ve kasa ekipleri için vardiya tercihlerini belirleyip başvuru formunu doldur.","bottomLine":"İzmir’de iyi akşamlar için."}'::jsonb, 'Footer görünür metinleri.', true, 'published', true, 6
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'menu.hero', '{"eyebrow":"Menüler şubeye göre değişir","title":"Şubeni seç"}'::jsonb, 'Menü sayfası hero içeriği.', true, 'published', true, 7
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.site_settings (
  key, value, description, is_public, status, is_active, sort_order
) values (
  'careers.options', '{"branches":[{"id":"alsancak","label":"Alsancak"},{"id":"atakent","label":"Atakent"},{"id":"either","label":"Fark etmez"}],"employmentTypes":[{"id":"full-time","label":"Tam zamanlı"},{"id":"part-time","label":"Part-time"}],"departments":[{"id":"service","label":"Servis","description":"Misafir akışı, masa düzeni ve hızlı self-servis deneyimi.","shifts":[{"id":"morning","label":"Sabah vardiyası","hours":"09.30–17.30"},{"id":"evening","label":"Akşam vardiyası","hours":"16.00–00.00"}]},{"id":"kitchen","label":"Mutfak","description":"Hazırlık, üretim ve servis temposunun mutfak tarafı.","shifts":[{"id":"morning","label":"Sabah vardiyası","hours":"09.00–17.00"},{"id":"evening","label":"Akşam vardiyası","hours":"15.30–23.30"}]},{"id":"bar","label":"Bar","description":"İçecek servisi, düzen ve akşam vardiyasının ritmi.","shifts":[{"id":"evening","label":"Akşam vardiyası","hours":"16.00–00.00"}]},{"id":"cashier","label":"Kasa","description":"Sipariş akışı, ödeme ve misafir karşılama.","shifts":[{"id":"evening","label":"Akşam vardiyası","hours":"16.00–00.00"}]}],"availabilityDays":["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"],"cv":{"allowedExtensions":["pdf","doc","docx"],"maxBytes":5242880}}'::jsonb, 'Kariyer formunun kontrollü seçenekleri.', true, 'published', true, 8
)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Sayfalar ve içerik blokları
-- ---------------------------------------------------------------------------
insert into public.site_pages (
  slug, title, seo_title, seo_description, metadata, status, is_active, sort_order, published_at
) values (
  'home', 'Ana Sayfa', 'Kantin İzmir', 'Alsancak ve Atakent şubeleri, menüler, etkinlikler ve Kantin’den kareler.', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 1, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  title = excluded.title,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.site_pages (
  slug, title, seo_title, seo_description, metadata, status, is_active, sort_order, published_at
) values (
  'menu', 'Menü', 'Kantin Menü', 'Alsancak ve Atakent şubelerine özel Kantin menüleri.', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 2, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  title = excluded.title,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.site_pages (
  slug, title, seo_title, seo_description, metadata, status, is_active, sort_order, published_at
) values (
  'events', 'Etkinlikler', 'Kantin Etkinlikleri', 'Kantin Alsancak ve Atakent etkinlikleri.', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 3, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  title = excluded.title,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.site_pages (
  slug, title, seo_title, seo_description, metadata, status, is_active, sort_order, published_at
) values (
  'careers', 'Ekibe Katıl', 'Kantin Kariyer', 'Kantin servis, mutfak, bar ve kasa ekiplerine başvuru.', '{"seed_source":"frontend-v1"}'::jsonb,
  'published', true, 4, '2026-06-20T00:00:00+03:00'
)
on conflict (slug) do update set
  title = excluded.title,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  metadata = excluded.metadata,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'hero', 'hero', '{"eyebrow":"Alsancak · Atakent · İzmir","title":["Savor the sip.","Share the bite."],"description":"İki şube, iki farklı menü. Alsancak’ta self-servis sokak pub ruhu; Atakent’te bahçe, kokteyller ve daha geniş mutfak seçkisi.","primaryAction":{"href":"/menu","label":"Şubeni ve menünü seç"},"secondaryAction":{"href":"#subeler","label":"Konumlara bak"},"features":[{"label":"Şubeye özel menü","href":"#menuler"},{"label":"Paylaşmalık tabaklar","href":"/menu?sube=alsancak"},{"label":"İyi müzik","href":"#etkinlikler"}],"marquee":"Savor the sip. Share the bite.","seedSource":"frontend-v1"}'::jsonb, 'published', true, 1
from public.site_pages as page
where page.slug = 'home'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'menu-branches', 'branch_cards', '{"items":[{"slug":"alsancak","code":"ALS","name":"Alsancak","image":{"src":"/assets/img/branches/alsancak-1.jpg","width":1080,"height":1350},"title":"Bira, şarap ve hızlı atıştırmalıklar.","description":"Fıçı ve şişe biralar, sandviçler, fritöz ürünleri, deli şişleri ve gün boyu açık kahve barı. Kokteyl bu şubenin menüsünde yer almıyor.","tags":["Self-servis","Bira","Kahve Barı"]},{"slug":"atakent","code":"ATA","name":"Atakent","image":{"src":"/assets/img/branches/atakent-1.webp","width":841,"height":1155},"title":"Bubble kokteyller, aperitifler ve grill.","description":"Fıçı ve şişe biraların yanında bubble ve house kokteyller; sıcak tabaklar, 17:00 sonrası ızgara şişleri ve tatlı.","tags":["Kokteyl","Grill","Bahçe"],"delayClass":"reveal-delay-1"}],"seedSource":"frontend-v1"}'::jsonb, 'published', true, 2
from public.site_pages as page
where page.slug = 'home'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'locations', 'locations', '{"items":[{"slug":"alsancak","code":"ALS","visualClass":"branch-alsancak","eyebrow":"Alsancak · Self-servis","title":"1464. Sokak No:71/A","address":"Alsancak, Konak / İzmir","mapsUrl":"https://maps.app.goo.gl/qZYRVGAkhtbVA2Fu7?g_st=ic","images":[{"src":"/assets/img/branches/alsancak-1.jpg","width":1080,"height":1350},{"src":"/assets/img/branches/alsancak-2.jpg","width":1080,"height":1350}]},{"slug":"atakent","code":"ATA","visualClass":"branch-atakent","eyebrow":"Atakent · Bahçe","title":"2035 Sokak No:6","address":"Atakent, Karşıyaka / İzmir","mapsUrl":"https://maps.app.goo.gl/Q6522YB6XoKSReYw8?g_st=ipc","images":[{"src":"/assets/img/branches/atakent-1.webp","width":841,"height":1155},{"src":"/assets/img/branches/atakent-2.webp","width":773,"height":1143}],"delayClass":"reveal-delay-1"}],"seedSource":"frontend-v1"}'::jsonb, 'published', true, 3
from public.site_pages as page
where page.slug = 'home'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'memories-copy', 'editorial', '{"eyebrow":"Aralık 2023’ten bugüne","title":"Anılarımız","introduction":"Kantin; soğuk içecekleri beklemeden alıp sohbete kaldığın, hızlı self-servis ritmi sokak kültürüyle buluşturan samimi bir pub olarak doğdu.","statement":"Aynı sokak, aynı ruh. Sadece artık biraz daha fazla yerimiz var.","chapters":[{"label":"Alsancak · İlk durak","title":"Sokağın ritmine göre.","description":"Tepsini al, soğuk biranı seç ve arkadaşlarının yanına dön. Alsancak’ta amaç en başından beri basitti: beklemeyi azaltmak, masadaki sohbeti bölmemek ve sokağın enerjisine karışmak."},{"label":"Atakent · Bubble Bar","title":"Köpüğü kokteyle taşıdık.","description":"Bira kadar rahat içilen ve ikinci turu doğal hissettiren kokteyllerin peşine düştük. Karbonasyon, kimya, tekrar tekrar denenen tarifler ve bol merak; Atakent’in bahçesinde hızlı servis edilen Bubble ve house kokteyllere dönüştü."}],"closingLine":"Samimi ekip, hızlı servis, paylaşmalık tabaklar ve arkadaşlarla uzayan akşamlar.","seedSource":"frontend-v1"}'::jsonb, 'published', true, 4
from public.site_pages as page
where page.slug = 'home'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'memories-gallery', 'gallery', '{"items":[{"src":"/assets/img/memories/team-door.webp","alt":"Kantin ekibinden dört kişi şubenin girişinde birlikte poz veriyor.","caption":"Kapının önünde, aynı ruhun etrafında.","label":"Ekip","layout":"feature"},{"src":"/assets/img/memories/door-conversation.webp","alt":"Kantin girişinde sohbet eden üç ekip üyesi.","caption":"Günün temposu çoğu zaman kapının önünde başlıyor.","label":"Ekip","layout":"portrait"},{"src":"/assets/img/memories/apron-tray.webp","alt":"Kantin önlüğü giyen bir ekip üyesi elinde servis tepsisiyle gülümsüyor.","caption":"Servise hazır, enerjisi hep yerinde.","label":"Kantin ekibi","layout":"portrait"},{"src":"/assets/img/memories/beer-cheers.webp","alt":"Bir misafir elinde bira ve atıştırmalıkla gülümsüyor.","caption":"Bir bardak, birkaç lokma ve uzayan sohbetler.","label":"Akşamüstü","layout":"standard"},{"src":"/assets/img/memories/memory-card.webp","alt":"Bir kişi elinde Kantin''e ait küçük bir kart tutuyor.","caption":"Küçük detaylar da anılara karışıyor.","label":"Hatıra","layout":"portrait"},{"src":"/assets/img/memories/night-closeup.webp","alt":"Gece çekiminde Kantin önlüğü giyen ekip üyeleri yakın planda görülüyor.","caption":"Gece uzadığında tempo düşmüyor.","label":"Gece vardiyası","layout":"standard"},{"src":"/assets/img/memories/kitchen-laugh.webp","alt":"İki ekip üyesi mutfakta sandviç hazırlarken gülüyor.","caption":"Paylaşmalık tabaklar, mutfakta bol kahkaha.","label":"Mutfak","layout":"wide"},{"src":"/assets/img/memories/counter-rhythm.webp","alt":"Bir ekip üyesi servis tezgâhının arkasında çalışıyor.","caption":"Tezgâhın arkasındaki günlük ritim.","label":"Self-servis","layout":"portrait"},{"src":"/assets/img/memories/keg-run.webp","alt":"İki Kantin ekip üyesi şubenin önünde bira fıçılarını taşıyor.","caption":"Bir sonraki tur için hazırlık.","label":"Günlük akış","layout":"standard"}],"seedSource":"frontend-v1"}'::jsonb, 'published', true, 5
from public.site_pages as page
where page.slug = 'home'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'merch-doodles', 'decorative_media', '{"items":[{"src":"/assets/img/merch/doodles/table-friends.png","className":"merch-doodle-table"},{"src":"/assets/img/merch/doodles/looking-up.png","className":"merch-doodle-look"},{"src":"/assets/img/merch/doodles/bar-friends.png","className":"merch-doodle-bar"},{"src":"/assets/img/merch/doodles/jumping.png","className":"merch-doodle-jump"},{"src":"/assets/img/merch/doodles/cats-table.png","className":"merch-doodle-cats"},{"src":"/assets/img/merch/doodles/sharing-drink.png","className":"merch-doodle-share"},{"src":"/assets/img/merch/doodles/high-five.png","className":"merch-doodle-highfive"},{"src":"/assets/img/merch/doodles/hugging.png","className":"merch-doodle-hug"},{"src":"/assets/img/merch/doodles/walking.png","className":"merch-doodle-walk"}],"seedSource":"frontend-v1"}'::jsonb, 'published', true, 6
from public.site_pages as page
where page.slug = 'home'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'instagram', 'instagram_strip', '{"postsLimit":5,"seedSource":"frontend-v1"}'::jsonb, 'published', true, 7
from public.site_pages as page
where page.slug = 'home'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'hero', 'hero', '{"eyebrow":"Menüler şubeye göre değişir","title":"Şubeni seç","description":"Alsancak ve Atakent’in ortak ürünleri olsa da kokteyl ve yiyecek seçenekleri aynı değildir. Aşağıdan gideceğin şubeyi seç.","mark":"ALS—ATA","seedSource":"frontend-v1"}'::jsonb, 'published', true, 1
from public.site_pages as page
where page.slug = 'menu'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'alsancak-intro', 'branch_intro', '{"kicker":"Alsancak Menu.","titleLines":["Bira +","yanında"],"description":"Alsancak menüsünde kokteyl bulunmaz. Fıçı ve şişe bira, şarap, fritöz ürünleri, sandviçler ve deli tabakları servis edilir.","seedSource":"frontend-v1"}'::jsonb, 'published', true, 2
from public.site_pages as page
where page.slug = 'menu'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'atakent-intro', 'branch_intro', '{"kicker":"Atakent Bubbles + Drinks","titleLines":["Kokteyl +","fıçı"],"description":"Bubble ve house kokteyller yalnızca Atakent menüsündedir. Bira, şarap ve kokteyllerin ardından aşağıda Atakent mutfağı yer alır.","seedSource":"frontend-v1"}'::jsonb, 'published', true, 3
from public.site_pages as page
where page.slug = 'menu'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'empty-state', 'empty_state', '{"title":"Yakında yeni etkinlikler burada.","description":"Güncel etkinlik duyuruları yayınlandığında bu alanda listelenecek.","seedSource":"frontend-v1"}'::jsonb, 'published', true, 1
from public.site_pages as page
where page.slug = 'events'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.content_blocks (
  page_id, key, block_type, content, status, is_active, sort_order
)
select page.id, 'form-intro', 'form_intro', '{"title":"Ekibe katıl","departments":["Servis","Mutfak","Bar","Kasa"],"cvMaxMb":5,"cvTypes":["PDF","DOC","DOCX"],"seedSource":"frontend-v1"}'::jsonb, 'published', true, 1
from public.site_pages as page
where page.slug = 'careers'
on conflict (page_id, key) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  status = excluded.status,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

commit;
