-- Apply only after reverting the application. Retains all content and log data.
-- This optional manual script disables the new entry points; it never deletes records.
begin;
revoke execute on function public.save_admin_menu_product(jsonb) from authenticated;
revoke execute on function public.move_admin_menu_product(uuid,uuid,text,timestamptz) from authenticated;
revoke execute on function public.record_admin_system_event(text,text,text,uuid,text,text,uuid) from authenticated;
revoke execute on function public.resolve_admin_system_event(uuid,boolean) from authenticated;
commit;
