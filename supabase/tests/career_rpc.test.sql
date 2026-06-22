begin;

set local search_path = public, extensions;
select plan(6);

select ok(
  has_function_privilege(
    'anon',
    'public.begin_job_application(text,text,text,text,text,text,text,text[],text,text,boolean,text,bigint,text,text,text)',
    'EXECUTE'
  ),
  'anon başvuru başlatma RPCsini çalıştırabilir'
);
select ok(
  has_function_privilege('anon', 'public.complete_job_application(uuid,uuid)', 'EXECUTE'),
  'anon başvuru tamamlama RPCsini çalıştırabilir'
);
select throws_ok(
  $$
    select * from public.begin_job_application(
      '', '5555555555', 'test@example.com', 'either', 'service',
      'part_time', 'morning', array['monday'], 'no',
      'TEST_ yeterince uzun tanıtım metnidir.', true,
      'application/pdf', 100, 'pdf', null, null
    )
  $$,
  'P0001',
  'invalid_full_name',
  'geçersiz ad reddedilir'
);
select throws_ok(
  $$
    select * from public.begin_job_application(
      'TEST_ Aday', '5555555555', 'test@example.com', 'either', 'service',
      'part_time', 'morning', array['monday'], 'no',
      'TEST_ yeterince uzun tanıtım metnidir.', false,
      'application/pdf', 100, 'pdf', null, null
    )
  $$,
  'P0001',
  'consent_required',
  'açık rıza olmadan başvuru reddedilir'
);
select throws_ok(
  $$
    select * from public.begin_job_application(
      'TEST_ Aday', '5555555555', 'test@example.com', 'either', 'service',
      'part_time', 'morning', array['monday'], 'no',
      'TEST_ yeterince uzun tanıtım metnidir.', true,
      'image/png', 100, 'pdf', null, null
    )
  $$,
  'P0001',
  'invalid_cv_type',
  'CV MIME ve uzantı uyuşmazlığı reddedilir'
);
select throws_ok(
  $$select * from public.complete_job_application(gen_random_uuid(), gen_random_uuid())$$,
  'P0001',
  'invalid_upload_session',
  'bilinmeyen yükleme oturumu tamamlanamaz'
);

select * from finish();
rollback;
