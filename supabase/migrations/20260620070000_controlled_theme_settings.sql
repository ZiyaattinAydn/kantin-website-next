-- Kantin Website - Faz 10
-- Kontrollü tema ayarları, görünürlük doğrulaması ve güvenli varsayılanlar.

begin;

create or replace function public.is_valid_theme_settings(p_value jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  order_count integer;
  distinct_count integer;
  allowed_count integer;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    return false;
  end if;

  if coalesce(p_value ->> 'fontPreset', '') not in ('brand', 'clean', 'editorial') then
    return false;
  end if;

  if coalesce(p_value ->> 'colorPreset', '') not in ('kantin', 'midnight', 'ocean') then
    return false;
  end if;

  if coalesce(p_value ->> 'headingScale', '') not in ('compact', 'balanced', 'expressive') then
    return false;
  end if;

  if coalesce(p_value ->> 'bodyScale', '') not in ('compact', 'balanced', 'comfortable') then
    return false;
  end if;

  if coalesce(p_value ->> 'cardDensity', '') not in ('compact', 'balanced', 'airy') then
    return false;
  end if;

  if jsonb_typeof(p_value -> 'homeSectionOrder') <> 'array' then
    return false;
  end if;

  select
    count(*),
    count(distinct item),
    count(*) filter (where item in ('menu', 'merch', 'memories', 'events', 'branches'))
  into order_count, distinct_count, allowed_count
  from jsonb_array_elements_text(p_value -> 'homeSectionOrder') as section_order(item);

  return order_count = 5
    and distinct_count = 5
    and allowed_count = 5;
exception
  when others then
    return false;
end;
$$;

create or replace function public.is_valid_section_visibility(p_value jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  setting_key text;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    return false;
  end if;

  foreach setting_key in array array[
    'homeHero',
    'branches',
    'menu',
    'events',
    'merch',
    'memories',
    'instagram',
    'careers'
  ]
  loop
    if not (p_value ? setting_key)
      or jsonb_typeof(p_value -> setting_key) <> 'boolean' then
      return false;
    end if;
  end loop;

  return true;
exception
  when others then
    return false;
end;
$$;

alter table public.site_settings
  drop constraint if exists site_settings_theme_settings_valid;

alter table public.site_settings
  add constraint site_settings_theme_settings_valid
  check (
    key <> 'theme.settings'
    or public.is_valid_theme_settings(value)
  );

alter table public.site_settings
  drop constraint if exists site_settings_section_visibility_valid;

alter table public.site_settings
  add constraint site_settings_section_visibility_valid
  check (
    key <> 'sections.visibility'
    or public.is_valid_section_visibility(value)
  );

insert into public.site_settings (
  key,
  value,
  description,
  is_public,
  status,
  is_active,
  sort_order
) values (
  'theme.settings',
  '{"fontPreset":"brand","colorPreset":"kantin","headingScale":"balanced","bodyScale":"balanced","cardDensity":"balanced","homeSectionOrder":["menu","merch","memories","events","branches"]}'::jsonb,
  'Kontrollü font, renk, başlık, gövde, kart yoğunluğu ve ana sayfa sıralama ayarları.',
  true,
  'published',
  true,
  9
)
on conflict (key) do nothing;

commit;
