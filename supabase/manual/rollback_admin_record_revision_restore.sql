-- Yalnız sürüm geri yükleme RPC'sini kaldırır.
-- Snapshot tablosunu ve mevcut sürüm geçmişini silmez.

drop function if exists public.restore_admin_record_revision(uuid, text, uuid);
