begin;

alter table public.events
  add column if not exists content_type text not null default 'event',
  add column if not exists cta_label text,
  add column if not exists publish_start_at timestamptz,
  add column if not exists publish_end_at timestamptz;

alter table public.events
  alter column start_at drop not null,
  alter column description drop not null;

alter table public.events
  drop constraint if exists events_description_not_blank,
  drop constraint if exists events_time_order,
  drop constraint if exists events_content_type_allowed,
  drop constraint if exists events_event_description_required,
  drop constraint if exists events_event_start_required,
  drop constraint if exists events_publish_window_order,
  drop constraint if exists events_cta_label_not_blank;

alter table public.events
  add constraint events_content_type_allowed
    check (content_type in ('event', 'announcement')),
  add constraint events_event_description_required
    check (content_type <> 'event' or char_length(btrim(coalesce(description, ''))) > 0),
  add constraint events_event_start_required
    check (content_type <> 'event' or start_at is not null),
  add constraint events_time_order
    check (start_at is null or end_at is null or end_at > start_at),
  add constraint events_publish_window_order
    check (publish_start_at is null or publish_end_at is null or publish_end_at > publish_start_at),
  add constraint events_cta_label_not_blank
    check (cta_label is null or char_length(btrim(cta_label)) > 0);

create index if not exists events_public_content_idx
on public.events (content_type, status, is_active, publish_start_at, publish_end_at, sort_order);

drop policy if exists events_public_read on public.events;

create policy events_public_read
on public.events
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and is_active = true
  and (published_at is null or published_at <= now())
  and (publish_start_at is null or publish_start_at <= now())
  and (publish_end_at is null or publish_end_at >= now())
);

drop policy if exists event_branches_public_read on public.event_branches;

create policy event_branches_public_read
on public.event_branches
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.events as event
    where event.id = event_branches.event_id
      and event.status = 'published'::public.content_status
      and event.is_active = true
      and (event.published_at is null or event.published_at <= now())
      and (event.publish_start_at is null or event.publish_start_at <= now())
      and (event.publish_end_at is null or event.publish_end_at >= now())
  )
  and exists (
    select 1
    from public.branches as branch
    where branch.id = event_branches.branch_id
      and branch.status = 'published'::public.content_status
      and branch.is_active = true
  )
);

commit;
