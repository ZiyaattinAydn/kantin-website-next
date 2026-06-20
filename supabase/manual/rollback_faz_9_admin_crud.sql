-- Faz 9 destek migration'ını geri alma
-- UYARI: admin_activity_logs kayıtlarını kalıcı olarak siler.
-- Yalnız Faz 9 migration'ını geri almak gerçekten gerekiyorsa çalıştır.

begin;

drop policy if exists admin_activity_logs_admin_select on public.admin_activity_logs;
drop policy if exists admin_activity_logs_admin_insert on public.admin_activity_logs;
drop table if exists public.admin_activity_logs;

commit;
