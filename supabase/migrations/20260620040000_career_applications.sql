-- Kantin Website - Faz 7: Güvenli kariyer başvurusu ve private CV yükleme akışı
-- Tarih: 20 Haziran 2026
-- Önkoşullar:
--   * 20260620010000_initial_schema.sql
--   * 20260620020000_rls_policies.sql
--   * 20260620030000_storage_buckets_and_policies.sql
--
-- Tasarım:
--   1) Public form, SECURITY DEFINER RPC ile kısa ömürlü bir yükleme oturumu alır.
--   2) Storage INSERT politikası yalnız bu oturum için üretilmiş tekil nesne yoluna izin verir.
--   3) CV yüklendikten sonra ikinci RPC, Storage nesnesini doğrular ve başvuruyu atomik kaydeder.
--   4) job_applications ve CV dosyaları public olarak okunamaz.

begin;

-- ---------------------------------------------------------------------------
-- Kısa ömürlü, public olarak okunamayan yükleme oturumları
-- ---------------------------------------------------------------------------

create table if not exists public.career_upload_sessions (
  id uuid primary key default gen_random_uuid(),
  upload_token_hash text not null,
  object_path text not null unique,
  full_name text not null,
  phone text not null,
  email text not null,
  preferred_branch_id uuid references public.branches(id) on delete restrict,
  is_branch_flexible boolean not null default false,
  department public.job_department not null,
  employment_type public.employment_type not null,
  shift_preference public.shift_preference not null,
  availability_days text[] not null,
  experience text,
  introduction text not null,
  consented_at timestamptz not null default now(),
  consent_version text not null,
  cv_mime_type text not null,
  cv_size_bytes bigint not null,
  cv_extension text not null,
  submission_fingerprint text not null,
  source_ip_hash text,
  user_agent_hash text,
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_upload_sessions_full_name_length check (
    char_length(btrim(full_name)) between 2 and 120
  ),
  constraint career_upload_sessions_phone_length check (
    char_length(btrim(phone)) between 7 and 30
  ),
  constraint career_upload_sessions_email_format check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint career_upload_sessions_branch_choice check (
    (is_branch_flexible and preferred_branch_id is null)
    or
    (not is_branch_flexible and preferred_branch_id is not null)
  ),
  constraint career_upload_sessions_days_allowed check (
    availability_days <@ array[
      'monday', 'tuesday', 'wednesday', 'thursday',
      'friday', 'saturday', 'sunday'
    ]::text[]
  ),
  constraint career_upload_sessions_days_not_empty check (
    cardinality(availability_days) > 0
  ),
  constraint career_upload_sessions_intro_length check (
    char_length(btrim(introduction)) between 20 and 1200
  ),
  constraint career_upload_sessions_cv_size check (
    cv_size_bytes between 1 and 5242880
  ),
  constraint career_upload_sessions_cv_extension check (
    cv_extension in ('pdf', 'doc', 'docx')
  ),
  constraint career_upload_sessions_cv_mime check (
    cv_mime_type in (
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ),
  constraint career_upload_sessions_object_path check (
    object_path ~ '^incoming/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|doc|docx)$'
  ),
  constraint career_upload_sessions_expiry check (expires_at > created_at)
);

comment on table public.career_upload_sessions is
  'Kariyer formu için 15 dakikalık, public okunamayan ve tek bir private CV nesne yoluna bağlı yükleme oturumları.';

create index if not exists career_upload_sessions_fingerprint_created_idx
  on public.career_upload_sessions (submission_fingerprint, created_at desc);
create index if not exists career_upload_sessions_ip_created_idx
  on public.career_upload_sessions (source_ip_hash, created_at desc)
  where source_ip_hash is not null;
create index if not exists career_upload_sessions_expires_idx
  on public.career_upload_sessions (expires_at);

alter table public.career_upload_sessions enable row level security;

revoke all privileges on table public.career_upload_sessions from anon, authenticated;
grant select, delete on table public.career_upload_sessions to authenticated;

drop policy if exists career_upload_sessions_admin_manage on public.career_upload_sessions;
create policy career_upload_sessions_admin_manage
on public.career_upload_sessions
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop trigger if exists set_career_upload_sessions_updated_at on public.career_upload_sessions;
create trigger set_career_upload_sessions_updated_at
before update on public.career_upload_sessions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Public formun ilk adımı: veriyi doğrula, spam/tekrar sınırlarını uygula ve
-- yalnız bir nesne yolu için geçerli kısa ömürlü yükleme yetkisi üret.
-- ---------------------------------------------------------------------------

create or replace function public.begin_job_application(
  p_full_name text,
  p_phone text,
  p_email text,
  p_branch_slug text,
  p_department text,
  p_employment_type text,
  p_shift_preference text,
  p_availability_days text[],
  p_experience text,
  p_introduction text,
  p_consent_given boolean,
  p_cv_mime_type text,
  p_cv_size_bytes bigint,
  p_cv_extension text,
  p_source_ip_hash text default null,
  p_user_agent_hash text default null
)
returns table (
  session_id uuid,
  upload_token uuid,
  object_path text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id uuid := gen_random_uuid();
  v_upload_token uuid := gen_random_uuid();
  v_object_path text;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_full_name text := btrim(coalesce(p_full_name, ''));
  v_intro text := btrim(coalesce(p_introduction, ''));
  v_branch_id uuid;
  v_is_flexible boolean := false;
  v_department public.job_department;
  v_employment public.employment_type;
  v_shift public.shift_preference;
  v_experience text;
  v_extension text := lower(btrim(coalesce(p_cv_extension, '')));
  v_mime text := lower(btrim(coalesce(p_cv_mime_type, '')));
  v_fingerprint text;
  v_expires_at timestamptz := now() + interval '15 minutes';
begin
  if char_length(v_full_name) not between 2 and 120 then
    raise exception using errcode = 'P0001', message = 'invalid_full_name';
  end if;

  if char_length(v_phone) not between 7 and 30 then
    raise exception using errcode = 'P0001', message = 'invalid_phone';
  end if;

  if char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception using errcode = 'P0001', message = 'invalid_email';
  end if;

  if char_length(v_intro) not between 20 and 1200 then
    raise exception using errcode = 'P0001', message = 'invalid_introduction';
  end if;

  if coalesce(p_consent_given, false) is not true then
    raise exception using errcode = 'P0001', message = 'consent_required';
  end if;

  if p_branch_slug = 'either' then
    v_is_flexible := true;
    v_branch_id := null;
  else
    select branch.id
    into v_branch_id
    from public.branches as branch
    where branch.slug = p_branch_slug
      and branch.is_active = true
      and branch.status = 'published'::public.content_status;

    if v_branch_id is null then
      raise exception using errcode = 'P0001', message = 'invalid_branch';
    end if;
  end if;

  if coalesce(p_department, '') not in ('service', 'kitchen', 'bar', 'cashier') then
    raise exception using errcode = 'P0001', message = 'invalid_department';
  end if;
  v_department := p_department::public.job_department;

  if coalesce(p_employment_type, '') not in ('full_time', 'part_time') then
    raise exception using errcode = 'P0001', message = 'invalid_employment_type';
  end if;
  v_employment := p_employment_type::public.employment_type;

  if coalesce(p_shift_preference, '') not in ('morning', 'evening') then
    raise exception using errcode = 'P0001', message = 'invalid_shift';
  end if;
  v_shift := p_shift_preference::public.shift_preference;

  if v_department in ('bar'::public.job_department, 'cashier'::public.job_department)
     and v_shift <> 'evening'::public.shift_preference then
    raise exception using errcode = 'P0001', message = 'invalid_shift_for_department';
  end if;

  if p_availability_days is null
     or cardinality(p_availability_days) = 0
     or not (p_availability_days <@ array[
       'monday', 'tuesday', 'wednesday', 'thursday',
       'friday', 'saturday', 'sunday'
     ]::text[])
     or cardinality(p_availability_days) <> cardinality(array(select distinct unnest(p_availability_days))) then
    raise exception using errcode = 'P0001', message = 'invalid_availability';
  end if;

  if coalesce(p_experience, '') not in ('yes', 'no') then
    raise exception using errcode = 'P0001', message = 'invalid_experience';
  end if;
  v_experience := case p_experience when 'yes' then 'Evet' else 'Hayır' end;

  if p_cv_size_bytes is null or p_cv_size_bytes not between 1 and 5242880 then
    raise exception using errcode = 'P0001', message = 'invalid_cv_size';
  end if;

  if v_extension not in ('pdf', 'doc', 'docx') then
    raise exception using errcode = 'P0001', message = 'invalid_cv_extension';
  end if;

  if not (
    (v_extension = 'pdf' and v_mime = 'application/pdf')
    or (v_extension = 'doc' and v_mime = 'application/msword')
    or (
      v_extension = 'docx'
      and v_mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ) then
    raise exception using errcode = 'P0001', message = 'invalid_cv_type';
  end if;

  v_fingerprint := encode(
    extensions.digest(v_email || '|' || regexp_replace(v_phone, '\s+', '', 'g'), 'sha256'),
    'hex'
  );

  -- Dosya hiç yüklenmemiş ve en az bir gündür süresi dolmuş oturumlarda
  -- kişisel veriyi tutma. Storage nesnesi bulunan sıra dışı yarım akışlar
  -- admin temizliğine bırakılır; nesneler SQL ile doğrudan silinmez.
  delete from public.career_upload_sessions as expired
  where expired.expires_at < now() - interval '1 day'
    and not exists (
      select 1
      from storage.objects as object
      where object.bucket_id = 'career-cvs'
        and object.name = expired.object_path
    );

  -- Aynı e-posta + telefon için 24 saatte yalnız bir tamamlanmış başvuru.
  if (
    select count(*)
    from public.job_applications as application
    where application.submission_fingerprint = v_fingerprint
      and application.created_at >= now() - interval '24 hours'
  ) >= 1 then
    raise exception using errcode = 'P0001', message = 'duplicate_submission';
  end if;

  -- Aynı kişi için aynı anda yalnız bir aktif yükleme oturumu.
  if (
    select count(*)
    from public.career_upload_sessions as session
    where session.submission_fingerprint = v_fingerprint
      and session.expires_at > now()
  ) >= 1 then
    raise exception using errcode = 'P0001', message = 'too_many_attempts';
  end if;

  -- Sunucu tarafından hashlenen IP için saatlik sınır.
  if p_source_ip_hash is not null and (
    select count(*)
    from public.career_upload_sessions as session
    where session.source_ip_hash = p_source_ip_hash
      and session.created_at >= now() - interval '1 hour'
  ) >= 10 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  -- Beklenmeyen otomatik saldırılara karşı proje genelinde üst sınır.
  if (
    select count(*)
    from public.career_upload_sessions as session
    where session.created_at >= now() - interval '1 hour'
  ) >= 100 then
    raise exception using errcode = 'P0001', message = 'temporarily_unavailable';
  end if;

  v_object_path := 'incoming/' || v_session_id::text || '/' || v_upload_token::text || '.' || v_extension;

  insert into public.career_upload_sessions (
    id,
    upload_token_hash,
    object_path,
    full_name,
    phone,
    email,
    preferred_branch_id,
    is_branch_flexible,
    department,
    employment_type,
    shift_preference,
    availability_days,
    experience,
    introduction,
    consent_version,
    cv_mime_type,
    cv_size_bytes,
    cv_extension,
    submission_fingerprint,
    source_ip_hash,
    user_agent_hash,
    expires_at
  )
  values (
    v_session_id,
    encode(extensions.digest(v_upload_token::text, 'sha256'), 'hex'),
    v_object_path,
    v_full_name,
    v_phone,
    v_email,
    v_branch_id,
    v_is_flexible,
    v_department,
    v_employment,
    v_shift,
    p_availability_days,
    v_experience,
    v_intro,
    '2026-06-20-v1',
    v_mime,
    p_cv_size_bytes,
    v_extension,
    v_fingerprint,
    nullif(btrim(coalesce(p_source_ip_hash, '')), ''),
    nullif(btrim(coalesce(p_user_agent_hash, '')), ''),
    v_expires_at
  );

  return query select v_session_id, v_upload_token, v_object_path, v_expires_at;
end;
$$;

comment on function public.begin_job_application(
  text, text, text, text, text, text, text, text[], text, text, boolean,
  text, bigint, text, text, text
) is
  'Kariyer formunu doğrular, tekrar/spam sınırlarını uygular ve tek kullanımlık private CV nesne yolu üretir.';

-- Storage RLS politikasının kullandığı dar yetki kontrolü.
create or replace function public.can_upload_career_cv(p_object_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.career_upload_sessions as session
    where session.object_path = p_object_path
      and session.expires_at > now()
  );
$$;

-- CV Storage'a ulaştıktan sonra media + job_applications kayıtlarını tek transaction'da tamamlar.
create or replace function public.complete_job_application(
  p_session_id uuid,
  p_upload_token uuid
)
returns table (
  application_id uuid,
  receipt_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.career_upload_sessions%rowtype;
  v_media_id uuid;
  v_application_id uuid;
  v_receipt uuid;
  v_object_size bigint;
  v_object_mime text;
begin
  select session.*
  into v_session
  from public.career_upload_sessions as session
  where session.id = p_session_id
    and session.upload_token_hash = encode(extensions.digest(p_upload_token::text, 'sha256'), 'hex')
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_upload_session';
  end if;

  if v_session.expires_at <= now() then
    raise exception using errcode = 'P0001', message = 'upload_session_expired';
  end if;

  select
    nullif(object.metadata ->> 'size', '')::bigint,
    lower(coalesce(object.metadata ->> 'mimetype', ''))
  into v_object_size, v_object_mime
  from storage.objects as object
  where object.bucket_id = 'career-cvs'
    and object.name = v_session.object_path;

  if not found then
    raise exception using errcode = 'P0001', message = 'cv_upload_not_found';
  end if;

  if v_object_size is distinct from v_session.cv_size_bytes
     or v_object_mime is distinct from v_session.cv_mime_type then
    raise exception using errcode = 'P0001', message = 'cv_upload_mismatch';
  end if;

  insert into public.media (
    source,
    kind,
    bucket_name,
    object_path,
    title,
    alt_text,
    mime_type,
    size_bytes,
    metadata,
    status,
    is_active
  )
  values (
    'storage'::public.media_source,
    'document'::public.media_kind,
    'career-cvs',
    v_session.object_path,
    'Kariyer başvurusu CV dosyası',
    null,
    v_session.cv_mime_type,
    v_session.cv_size_bytes,
    jsonb_build_object('extension', v_session.cv_extension),
    'draft'::public.content_status,
    true
  )
  returning id into v_media_id;

  insert into public.job_applications (
    full_name,
    phone,
    email,
    preferred_branch_id,
    is_branch_flexible,
    department,
    employment_type,
    shift_preference,
    availability_days,
    experience,
    introduction,
    cv_media_id,
    consent_given,
    consented_at,
    consent_version,
    status,
    submission_fingerprint,
    source_ip_hash,
    user_agent_hash
  )
  values (
    v_session.full_name,
    v_session.phone,
    v_session.email,
    v_session.preferred_branch_id,
    v_session.is_branch_flexible,
    v_session.department,
    v_session.employment_type,
    v_session.shift_preference,
    v_session.availability_days,
    v_session.experience,
    v_session.introduction,
    v_media_id,
    true,
    v_session.consented_at,
    v_session.consent_version,
    'new'::public.job_application_status,
    v_session.submission_fingerprint,
    v_session.source_ip_hash,
    v_session.user_agent_hash
  )
  returning id, submission_token into v_application_id, v_receipt;

  delete from public.career_upload_sessions where id = v_session.id;

  return query select v_application_id, v_receipt;
end;
$$;

-- Başarısız yüklemede kısa ömürlü oturumu temizler.
create or replace function public.cancel_job_application(
  p_session_id uuid,
  p_upload_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.career_upload_sessions as session
  where session.id = p_session_id
    and session.upload_token_hash = encode(extensions.digest(p_upload_token::text, 'sha256'), 'hex');

  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

-- Fonksiyonların varsayılan PUBLIC çalıştırma yetkisini kapat, yalnız gerekli rollere aç.
revoke all on function public.begin_job_application(
  text, text, text, text, text, text, text, text[], text, text, boolean,
  text, bigint, text, text, text
) from public, anon, authenticated;
revoke all on function public.can_upload_career_cv(text) from public, anon, authenticated;
revoke all on function public.complete_job_application(uuid, uuid) from public, anon, authenticated;
revoke all on function public.cancel_job_application(uuid, uuid) from public, anon, authenticated;

grant execute on function public.begin_job_application(
  text, text, text, text, text, text, text, text[], text, text, boolean,
  text, bigint, text, text, text
) to anon, authenticated;
grant execute on function public.can_upload_career_cv(text) to anon, authenticated;
grant execute on function public.complete_job_application(uuid, uuid) to anon, authenticated;
grant execute on function public.cancel_job_application(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Private CV Storage politikaları
-- Admin politikaları Faz 4'ten korunur. Public form yalnız aktif oturumun tam
-- nesne yoluna INSERT/SELECT/DELETE yapabilir; bucket listeleyemez veya başka
-- başvuruların dosyalarını göremez.
-- ---------------------------------------------------------------------------

drop policy if exists storage_career_cvs_application_insert on storage.objects;
drop policy if exists storage_career_cvs_application_select on storage.objects;
drop policy if exists storage_career_cvs_application_delete on storage.objects;

create policy storage_career_cvs_application_insert
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'career-cvs'
  and (select public.can_upload_career_cv(name))
);

create policy storage_career_cvs_application_select
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'career-cvs'
  and (select public.can_upload_career_cv(name))
);

create policy storage_career_cvs_application_delete
on storage.objects
for delete
to anon, authenticated
using (
  bucket_id = 'career-cvs'
  and (select public.can_upload_career_cv(name))
);

commit;
