-- Kantin Website - Faz 9: Admin CRUD destek katmanı
-- Tarih: 21 Haziran 2026
-- Önkoşullar: Faz 2-8 migration dosyaları
-- Bu migration mevcut içerik kayıtlarını değiştirmez veya silmez.

begin;

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_activity_logs_action_format check (
    action ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
  ),
  constraint admin_activity_logs_entity_type_format check (
    entity_type ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'
  ),
  constraint admin_activity_logs_metadata_object check (
    jsonb_typeof(metadata) = 'object'
  )
);

create index if not exists admin_activity_logs_recent_idx
  on public.admin_activity_logs (created_at desc);

create index if not exists admin_activity_logs_actor_idx
  on public.admin_activity_logs (actor_id, created_at desc);

alter table public.admin_activity_logs enable row level security;

revoke all on public.admin_activity_logs from anon;
revoke all on public.admin_activity_logs from authenticated;
grant select, insert on public.admin_activity_logs to authenticated;

drop policy if exists admin_activity_logs_admin_select on public.admin_activity_logs;
drop policy if exists admin_activity_logs_admin_insert on public.admin_activity_logs;

create policy admin_activity_logs_admin_select
on public.admin_activity_logs
for select
to authenticated
using ((select public.is_admin()));

create policy admin_activity_logs_admin_insert
on public.admin_activity_logs
for insert
to authenticated
with check (
  (select public.is_admin())
  and actor_id = (select auth.uid())
);

commit;
