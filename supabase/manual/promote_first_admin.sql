-- YALNIZCA Supabase SQL Editor'da manuel olarak çalıştırılır.
-- Önce Authentication > Users bölümünden kullanıcıyı oluştur.
-- Ardından aşağıdaki ADMIN_EMAIL_BURAYA değerini o kullanıcının e-postasıyla değiştir.
-- Bu dosyayı e-posta yazılmış halde Git'e gönderme.

do $$
declare
  target_email text := lower(btrim('ADMIN_EMAIL_BURAYA'));
  target_user_id uuid;
begin
  if target_email = 'admin_email_buraya' or position('@' in target_email) = 0 then
    raise exception 'Önce ADMIN_EMAIL_BURAYA değerini geçerli admin e-postasıyla değiştir.';
  end if;

  select auth_user.id
  into target_user_id
  from auth.users as auth_user
  where lower(auth_user.email) = target_email
  limit 1;

  if target_user_id is null then
    raise exception 'Bu e-posta ile Authentication kullanıcısı bulunamadı: %', target_email;
  end if;

  insert into public.profiles (id, display_name, role, is_active)
  values (target_user_id, null, 'admin'::public.app_role, true)
  on conflict (id) do update
  set
    role = 'admin'::public.app_role,
    is_active = true,
    updated_at = now();

  raise notice 'Admin rolü başarıyla verildi: %', target_email;
end;
$$;
