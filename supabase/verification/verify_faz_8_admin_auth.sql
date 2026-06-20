-- Kantin Website - Faz 8 doğrulama

with checks as (
  select
    'Auth kullanıcılarının profil kaydı var'::text as kontrol,
    not exists (
      select 1
      from auth.users as auth_user
      left join public.profiles as profile on profile.id = auth_user.id
      where profile.id is null
    ) as basarili

  union all

  select
    'Yeni kullanıcı trigger fonksiyonu mevcut',
    to_regprocedure('public.handle_new_user()') is not null

  union all

  select
    'Auth user trigger mevcut',
    exists (
      select 1
      from pg_trigger
      where tgname = 'on_auth_user_created'
        and not tgisinternal
    )

  union all

  select
    'Anon profiles okuyamaz',
    not has_table_privilege('anon', 'public.profiles', 'select')

  union all

  select
    'Authenticated kendi profilini okuyabilir',
    has_table_privilege('authenticated', 'public.profiles', 'select')

  union all

  select
    'Aktif admin hesabı mevcut',
    exists (
      select 1
      from public.profiles
      where role = 'admin'::public.app_role
        and is_active = true
    )
)
select * from checks order by kontrol;

select
  auth_user.email,
  profile.role,
  profile.is_active,
  profile.created_at,
  profile.updated_at
from public.profiles as profile
join auth.users as auth_user on auth_user.id = profile.id
where profile.role = 'admin'::public.app_role
order by profile.created_at;
