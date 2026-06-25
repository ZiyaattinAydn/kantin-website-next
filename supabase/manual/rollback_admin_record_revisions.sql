-- Kritik admin kayıt sürüm geçmişi rollback dosyası
-- UYARI: Bu işlem daha önce oluşmuş bütün snapshot kayıtlarını kalıcı olarak siler.
-- Yalnız migration geri alınacaksa ve geri yükleme geçmişine artık ihtiyaç yoksa çalıştırın.

begin;

drop trigger if exists capture_admin_record_revision on public.branches;
drop trigger if exists capture_admin_record_revision on public.site_settings;
drop trigger if exists capture_admin_record_revision on public.site_pages;
drop trigger if exists capture_admin_record_revision on public.content_blocks;

drop function if exists public.capture_admin_record_revision();
drop table if exists public.admin_record_revisions;

commit;
