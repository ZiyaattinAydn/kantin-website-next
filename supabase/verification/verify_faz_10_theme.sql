-- Kantin Website - Faz 10 kontrollü tema doğrulaması

select * from (
  select
    'theme.settings kaydı mevcut'::text as kontrol,
    exists (
      select 1
      from public.site_settings
      where key = 'theme.settings'
    ) as basarili
  union all
  select
    'theme.settings public ve yayında',
    exists (
      select 1
      from public.site_settings
      where key = 'theme.settings'
        and is_public = true
        and is_active = true
        and status = 'published'
    )
  union all
  select
    'Tema JSON değeri kontrollü seçeneklere uygun',
    coalesce((
      select public.is_valid_theme_settings(value)
      from public.site_settings
      where key = 'theme.settings'
    ), false)
  union all
  select
    'Bölüm görünürlüğü JSON değeri geçerli',
    coalesce((
      select public.is_valid_section_visibility(value)
      from public.site_settings
      where key = 'sections.visibility'
    ), false)
  union all
  select
    'Tema doğrulama constraint mevcut',
    exists (
      select 1
      from pg_constraint
      where conname = 'site_settings_theme_settings_valid'
        and conrelid = 'public.site_settings'::regclass
    )
  union all
  select
    'Bölüm görünürlüğü constraint mevcut',
    exists (
      select 1
      from pg_constraint
      where conname = 'site_settings_section_visibility_valid'
        and conrelid = 'public.site_settings'::regclass
    )
  union all
  select
    'Anon tema ayarını okuyabilir',
    has_table_privilege('anon', 'public.site_settings', 'SELECT')
  union all
  select
    'Anon tema ayarını değiştiremez',
    not has_table_privilege('anon', 'public.site_settings', 'INSERT')
    and not has_table_privilege('anon', 'public.site_settings', 'UPDATE')
    and not has_table_privilege('anon', 'public.site_settings', 'DELETE')
) as checks
order by kontrol;

select
  key,
  value,
  status,
  is_active,
  is_public,
  updated_at
from public.site_settings
where key in ('theme.settings', 'sections.visibility')
order by sort_order;
