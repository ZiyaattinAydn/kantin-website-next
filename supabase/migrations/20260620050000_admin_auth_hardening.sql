-- Kantin Website - Faz 8: Admin Auth sağlamlaştırma
-- Tarih: 20 Haziran 2026
-- Mevcut Auth kullanıcıları için eksik profil kayıtlarını tamamlar ve
-- sık kullanılan aktif rol kontrolünü indeksler.

begin;

insert into public.profiles (id, display_name)
select
  user_record.id,
  nullif(
    btrim(
      coalesce(
        user_record.raw_user_meta_data ->> 'full_name',
        user_record.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  )
from auth.users as user_record
on conflict (id) do nothing;

create index if not exists profiles_active_role_idx
  on public.profiles (role, id)
  where is_active = true;

-- Kullanıcı oluşturma trigger'ı yalnız düşük yetkili viewer profili üretir.
-- İstemci metadata'sı hiçbir zaman admin rolü atayamaz.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role, is_active)
  values (
    new.id,
    nullif(
      btrim(
        coalesce(
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'name',
          ''
        )
      ),
      ''
    ),
    'viewer'::public.app_role,
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

commit;
