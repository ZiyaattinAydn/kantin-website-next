-- Kantin Website - Faz 2: İlk veritabanı şeması
-- Tarih: 20 Haziran 2026
-- Bu migration şemayı, ilişkileri, bütünlük kontrollerini, indeksleri ve
-- güvenli başlangıç için RLS etkinleştirmelerini oluşturur.
-- Public/admin erişim politikaları Faz 3 migration'ında eklenecektir.

begin;

create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('viewer', 'editor', 'admin');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.media_source as enum ('local', 'storage', 'external');
create type public.media_kind as enum ('image', 'document', 'video');
create type public.menu_category_display as enum (
  'price_table',
  'compact',
  'cards',
  'editorial',
  'feature',
  'coffee',
  'custom'
);
create type public.inventory_status as enum (
  'available',
  'limited',
  'out_of_stock',
  'discontinued'
);
create type public.job_application_status as enum (
  'new',
  'reviewing',
  'contacted',
  'rejected',
  'hired',
  'archived'
);
create type public.employment_type as enum ('full_time', 'part_time');
create type public.job_department as enum ('service', 'kitchen', 'bar', 'cashier');
create type public.shift_preference as enum ('morning', 'evening', 'flexible');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.app_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 2 and 120
  )
);

comment on table public.profiles is
  'Supabase Auth kullanıcılarının uygulama rolü ve profil bilgileri. Public olarak okunmaz.';

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text not null unique,
  name text not null,
  short_description text,
  address_line text not null,
  district text not null,
  city text not null,
  country_code text not null default 'TR',
  timezone text not null default 'Europe/Istanbul',
  maps_url text not null,
  phone text,
  public_email text,
  features text[] not null default '{}',
  opening_hours jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint branches_code_format check (code ~ '^[A-Z0-9]{2,10}$'),
  constraint branches_name_not_blank check (char_length(btrim(name)) > 0),
  constraint branches_country_code_format check (country_code ~ '^[A-Z]{2}$'),
  constraint branches_maps_url_https check (maps_url ~ '^https://'),
  constraint branches_email_format check (
    public_email is null or public_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint branches_features_limit check (cardinality(features) <= 20),
  constraint branches_opening_hours_object check (jsonb_typeof(opening_hours) = 'object'),
  constraint branches_sort_order_non_negative check (sort_order >= 0)
);

comment on table public.branches is
  'Alsancak ve Atakent şube adresleri, çalışma saatleri ve public görünürlük bilgileri.';

create table public.media (
  id uuid primary key default gen_random_uuid(),
  source public.media_source not null,
  kind public.media_kind not null,
  bucket_name text,
  object_path text,
  external_url text,
  local_path text,
  title text,
  alt_text text,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  metadata jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_source_location check (
    (source = 'local' and local_path is not null and bucket_name is null and object_path is null and external_url is null)
    or
    (source = 'storage' and bucket_name is not null and object_path is not null and local_path is null and external_url is null)
    or
    (source = 'external' and external_url is not null and local_path is null and bucket_name is null and object_path is null)
  ),
  constraint media_local_path_format check (local_path is null or local_path like '/%'),
  constraint media_external_url_https check (external_url is null or external_url ~ '^https://'),
  constraint media_size_non_negative check (size_bytes is null or size_bytes >= 0),
  constraint media_dimensions_positive check (
    (width is null or width > 0) and (height is null or height > 0)
  ),
  constraint media_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint media_sort_order_non_negative check (sort_order >= 0)
);

comment on table public.media is
  'Yerel public dosyaları, Supabase Storage nesneleri ve harici medya bağlantıları için ortak katalog.';

create unique index media_storage_object_unique
  on public.media (bucket_name, object_path)
  where source = 'storage';
create unique index media_external_url_unique
  on public.media (external_url)
  where source = 'external';
create unique index media_local_path_unique
  on public.media (local_path)
  where source = 'local';

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  display_type public.menu_category_display not null default 'cards',
  metadata jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint menu_categories_name_not_blank check (char_length(btrim(name)) > 0),
  constraint menu_categories_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint menu_categories_sort_order_non_negative check (sort_order >= 0)
);

create table public.menu_category_branches (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  display_name text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_category_branches_unique unique (category_id, branch_id),
  constraint menu_category_branches_sort_order_non_negative check (sort_order >= 0)
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  slug text not null,
  name text not null,
  description text,
  detail text,
  highlight_text text,
  allergen_text text,
  allergens text[] not null default '{}',
  badges text[] not null default '{}',
  image_media_id uuid references public.media(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_items_category_slug_unique unique (category_id, slug),
  constraint menu_items_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint menu_items_name_not_blank check (char_length(btrim(name)) > 0),
  constraint menu_items_allergens_limit check (cardinality(allergens) <= 30),
  constraint menu_items_badges_limit check (cardinality(badges) <= 10),
  constraint menu_items_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint menu_items_sort_order_non_negative check (sort_order >= 0)
);

create table public.menu_item_branches (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  price_cents integer,
  currency text not null default 'TRY',
  price_label text,
  price_note text,
  availability_note text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_item_branches_unique unique (menu_item_id, branch_id),
  constraint menu_item_branches_price_non_negative check (price_cents is null or price_cents >= 0),
  constraint menu_item_branches_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint menu_item_branches_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint menu_item_branches_sort_order_non_negative check (sort_order >= 0)
);

create table public.menu_item_variants (
  id uuid primary key default gen_random_uuid(),
  menu_item_branch_id uuid not null references public.menu_item_branches(id) on delete cascade,
  slug text not null,
  label text not null,
  detail text,
  price_cents integer not null,
  currency text not null default 'TRY',
  price_note text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_item_variants_unique unique (menu_item_branch_id, slug),
  constraint menu_item_variants_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint menu_item_variants_label_not_blank check (char_length(btrim(label)) > 0),
  constraint menu_item_variants_price_non_negative check (price_cents >= 0),
  constraint menu_item_variants_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint menu_item_variants_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint menu_item_variants_sort_order_non_negative check (sort_order >= 0)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  description text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  timezone text not null default 'Europe/Istanbul',
  venue_name text,
  location_text text,
  external_url text,
  image_media_id uuid references public.media(id) on delete set null,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint events_title_not_blank check (char_length(btrim(title)) > 0),
  constraint events_description_not_blank check (char_length(btrim(description)) > 0),
  constraint events_time_order check (end_at is null or end_at > start_at),
  constraint events_external_url_https check (external_url is null or external_url ~ '^https://'),
  constraint events_sort_order_non_negative check (sort_order >= 0)
);

create table public.event_branches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_branches_unique unique (event_id, branch_id),
  constraint event_branches_sort_order_non_negative check (sort_order >= 0)
);

create table public.merch_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  product_type text not null default 'item',
  name text not null,
  description text not null,
  detail text,
  sku text unique,
  price_cents integer not null,
  currency text not null default 'TRY',
  inventory_status public.inventory_status not null default 'available',
  stock_quantity integer,
  image_media_id uuid references public.media(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merch_products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint merch_products_type_allowed check (product_type in ('item', 'bundle')),
  constraint merch_products_name_not_blank check (char_length(btrim(name)) > 0),
  constraint merch_products_description_not_blank check (char_length(btrim(description)) > 0),
  constraint merch_products_price_non_negative check (price_cents >= 0),
  constraint merch_products_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint merch_products_stock_non_negative check (stock_quantity is null or stock_quantity >= 0),
  constraint merch_products_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint merch_products_sort_order_non_negative check (sort_order >= 0)
);

create table public.merch_product_branches (
  id uuid primary key default gen_random_uuid(),
  merch_product_id uuid not null references public.merch_products(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merch_product_branches_unique unique (merch_product_id, branch_id),
  constraint merch_product_branches_sort_order_non_negative check (sort_order >= 0)
);

create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  permalink text not null unique,
  caption text not null,
  image_alt text not null,
  branch_id uuid references public.branches(id) on delete set null,
  image_media_id uuid references public.media(id) on delete set null,
  published_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint instagram_posts_permalink_https check (permalink ~ '^https://'),
  constraint instagram_posts_caption_not_blank check (char_length(btrim(caption)) > 0),
  constraint instagram_posts_image_alt_not_blank check (char_length(btrim(image_alt)) > 0),
  constraint instagram_posts_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint instagram_posts_sort_order_non_negative check (sort_order >= 0)
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  preferred_branch_id uuid references public.branches(id) on delete restrict,
  is_branch_flexible boolean not null default false,
  department public.job_department not null,
  employment_type public.employment_type not null,
  shift_preference public.shift_preference not null,
  availability_days text[] not null,
  experience text,
  introduction text not null,
  cv_media_id uuid not null unique references public.media(id) on delete restrict,
  consent_given boolean not null,
  consented_at timestamptz not null,
  consent_version text not null,
  status public.job_application_status not null default 'new',
  admin_notes text,
  submission_token uuid not null unique default gen_random_uuid(),
  submission_fingerprint text,
  source_ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_applications_full_name_length check (
    char_length(btrim(full_name)) between 2 and 120
  ),
  constraint job_applications_phone_length check (
    char_length(btrim(phone)) between 7 and 30
  ),
  constraint job_applications_email_format check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint job_applications_branch_choice check (
    (is_branch_flexible and preferred_branch_id is null)
    or
    (not is_branch_flexible and preferred_branch_id is not null)
  ),
  constraint job_applications_days_allowed check (
    availability_days <@ array[
      'monday', 'tuesday', 'wednesday', 'thursday',
      'friday', 'saturday', 'sunday'
    ]::text[]
  ),
  constraint job_applications_days_not_empty check (cardinality(availability_days) > 0),
  constraint job_applications_intro_length check (
    char_length(btrim(introduction)) between 20 and 5000
  ),
  constraint job_applications_consent_required check (consent_given = true),
  constraint job_applications_consent_version_not_blank check (
    char_length(btrim(consent_version)) > 0
  )
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  is_public boolean not null default false,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_key_format check (key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  constraint site_settings_sort_order_non_negative check (sort_order >= 0)
);

create table public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  seo_title text,
  seo_description text,
  metadata jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_pages_slug_format check (slug ~ '^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$'),
  constraint site_pages_title_not_blank check (char_length(btrim(title)) > 0),
  constraint site_pages_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint site_pages_sort_order_non_negative check (sort_order >= 0)
);

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  key text not null,
  block_type text not null,
  content jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_blocks_page_key_unique unique (page_id, key),
  constraint content_blocks_key_format check (key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  constraint content_blocks_type_format check (block_type ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'),
  constraint content_blocks_content_object check (jsonb_typeof(content) = 'object'),
  constraint content_blocks_sort_order_non_negative check (sort_order >= 0)
);

-- Sorgu ve yönetim performansı için temel indeksler.
create index profiles_role_active_idx on public.profiles (role, is_active);
create index branches_public_list_idx on public.branches (status, is_active, sort_order);
create index media_public_list_idx on public.media (kind, status, is_active, sort_order);
create index menu_categories_public_list_idx on public.menu_categories (status, is_active, sort_order);
create index menu_category_branches_branch_idx on public.menu_category_branches (branch_id, is_active, sort_order);
create index menu_items_category_idx on public.menu_items (category_id, status, is_active, sort_order);
create index menu_items_image_media_idx on public.menu_items (image_media_id) where image_media_id is not null;
create index menu_item_branches_branch_idx on public.menu_item_branches (branch_id, is_active, sort_order);
create index menu_item_variants_parent_idx on public.menu_item_variants (menu_item_branch_id, is_active, sort_order);
create index events_public_list_idx on public.events (status, is_active, start_at, sort_order);
create index events_image_media_idx on public.events (image_media_id) where image_media_id is not null;
create index event_branches_branch_idx on public.event_branches (branch_id, is_active, sort_order);
create index merch_products_public_list_idx on public.merch_products (status, is_active, sort_order);
create index merch_products_image_media_idx on public.merch_products (image_media_id) where image_media_id is not null;
create index merch_product_branches_branch_idx on public.merch_product_branches (branch_id, is_available, sort_order);
create index instagram_posts_public_list_idx on public.instagram_posts (status, is_active, published_at desc, sort_order);
create index instagram_posts_branch_idx on public.instagram_posts (branch_id) where branch_id is not null;
create index job_applications_queue_idx on public.job_applications (status, created_at desc);
create index job_applications_email_idx on public.job_applications (lower(email));
create index job_applications_fingerprint_idx on public.job_applications (submission_fingerprint, created_at desc)
  where submission_fingerprint is not null;
create index site_settings_public_idx on public.site_settings (is_public, status, is_active, sort_order);
create index site_pages_public_idx on public.site_pages (status, is_active, sort_order);
create index content_blocks_page_idx on public.content_blocks (page_id, status, is_active, sort_order);

-- updated_at alanlarının otomatik yenilenmesi.
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_branches_updated_at
before update on public.branches
for each row execute function public.set_updated_at();

create trigger set_media_updated_at
before update on public.media
for each row execute function public.set_updated_at();

create trigger set_menu_categories_updated_at
before update on public.menu_categories
for each row execute function public.set_updated_at();

create trigger set_menu_category_branches_updated_at
before update on public.menu_category_branches
for each row execute function public.set_updated_at();

create trigger set_menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

create trigger set_menu_item_branches_updated_at
before update on public.menu_item_branches
for each row execute function public.set_updated_at();

create trigger set_menu_item_variants_updated_at
before update on public.menu_item_variants
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_event_branches_updated_at
before update on public.event_branches
for each row execute function public.set_updated_at();

create trigger set_merch_products_updated_at
before update on public.merch_products
for each row execute function public.set_updated_at();

create trigger set_merch_product_branches_updated_at
before update on public.merch_product_branches
for each row execute function public.set_updated_at();

create trigger set_instagram_posts_updated_at
before update on public.instagram_posts
for each row execute function public.set_updated_at();

create trigger set_job_applications_updated_at
before update on public.job_applications
for each row execute function public.set_updated_at();

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger set_site_pages_updated_at
before update on public.site_pages
for each row execute function public.set_updated_at();

create trigger set_content_blocks_updated_at
before update on public.content_blocks
for each row execute function public.set_updated_at();

-- Her yeni Auth kullanıcısı için düşük yetkili bir profil oluşturur.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Şema oluşturulur oluşturulmaz güvenli varsayılan: bütün uygulama tablolarında RLS açık.
-- Faz 3 politikaları eklenene kadar Data API üzerinden satır erişimi verilmez.
alter table public.profiles enable row level security;
alter table public.branches enable row level security;
alter table public.media enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_category_branches enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_item_branches enable row level security;
alter table public.menu_item_variants enable row level security;
alter table public.events enable row level security;
alter table public.event_branches enable row level security;
alter table public.merch_products enable row level security;
alter table public.merch_product_branches enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.job_applications enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_pages enable row level security;
alter table public.content_blocks enable row level security;

commit;
