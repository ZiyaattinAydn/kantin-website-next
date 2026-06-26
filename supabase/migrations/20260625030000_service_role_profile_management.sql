-- Kantin Website - Yerel/servis tarafı profil yönetimi yetkisi
-- Tarih: 25 Haziran 2026
--
-- Amaç:
--   * Supabase secret/service-role anahtarıyla çalışan güvenilir sunucu araçlarının
--     profiles tablosunda TEST admin profili hazırlayabilmesini sağlamak.
--   * anon ve authenticated izinlerini değiştirmemek.
--   * RLS bypass tek başına tablo GRANT yetkisi vermediği için eksik Data API
--     ayrıcalığını açık ve denetlenebilir biçimde tanımlamak.

begin;

grant usage on schema public to service_role;
grant select, insert, update on table public.profiles to service_role;

comment on table public.profiles is
  'Supabase Auth kullanıcılarının uygulama rolü ve profil bilgileri. Public olarak okunmaz; güvenilir service_role araçları select/insert/update yapabilir.';

commit;
