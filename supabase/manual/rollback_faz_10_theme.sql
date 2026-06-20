-- Yalnız Faz 10 kontrollü tema doğrulama nesnelerini geri almak için.
-- Bu dosya normal kurulum veya test akışında çalıştırılmaz.

begin;

alter table public.site_settings
  drop constraint if exists site_settings_theme_settings_valid;

alter table public.site_settings
  drop constraint if exists site_settings_section_visibility_valid;

drop function if exists public.is_valid_theme_settings(jsonb);
drop function if exists public.is_valid_section_visibility(jsonb);

-- theme.settings satırı özellikle silinmez; kullanıcının seçtiği ayarlar korunur.

commit;
