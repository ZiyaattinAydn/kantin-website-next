begin;

set local search_path = public, extensions;

select plan(34);

select ok(
  to_regprocedure(expected.signature) is not null,
  format('%s fonksiyonu mevcut', expected.label)
)
from (
  values
    ('public.save_admin_theme_settings(jsonb,jsonb,boolean)', 'tema transaction RPC'),
    ('public.update_job_application_admin(uuid,public.job_application_status,text)', 'başvuru transaction RPC'),
    ('public.create_admin_media_record(text,text,text,text,text,bigint)', 'medya oluşturma RPC'),
    ('public.set_admin_media_state(uuid,text)', 'medya durum RPC'),
    ('public.begin_test_admin_media_delete(uuid)', 'TEST medya silme başlangıç RPC'),
    ('public.cancel_test_admin_media_delete(uuid,public.content_status,boolean,text)', 'TEST medya silme geri alma RPC'),
    ('public.complete_test_admin_media_delete(uuid)', 'TEST medya silme tamamlama RPC')
) as expected(signature, label);

select ok(
  (
    select procedure.prosecdef
    from pg_proc as procedure
    where procedure.oid = to_regprocedure(expected.signature)
  ),
  format('%s SECURITY DEFINER', expected.label)
)
from (
  values
    ('public.save_admin_theme_settings(jsonb,jsonb,boolean)', 'tema transaction RPC'),
    ('public.update_job_application_admin(uuid,public.job_application_status,text)', 'başvuru transaction RPC'),
    ('public.create_admin_media_record(text,text,text,text,text,bigint)', 'medya oluşturma RPC'),
    ('public.set_admin_media_state(uuid,text)', 'medya durum RPC'),
    ('public.begin_test_admin_media_delete(uuid)', 'TEST medya silme başlangıç RPC'),
    ('public.cancel_test_admin_media_delete(uuid,public.content_status,boolean,text)', 'TEST medya silme geri alma RPC'),
    ('public.complete_test_admin_media_delete(uuid)', 'TEST medya silme tamamlama RPC')
) as expected(signature, label);

select ok(
  has_function_privilege('authenticated', expected.signature, 'EXECUTE'),
  format('authenticated %s çağırabilir', expected.label)
)
from (
  values
    ('public.save_admin_theme_settings(jsonb,jsonb,boolean)', 'tema transaction RPC'),
    ('public.update_job_application_admin(uuid,public.job_application_status,text)', 'başvuru transaction RPC'),
    ('public.create_admin_media_record(text,text,text,text,text,bigint)', 'medya oluşturma RPC'),
    ('public.set_admin_media_state(uuid,text)', 'medya durum RPC'),
    ('public.begin_test_admin_media_delete(uuid)', 'TEST medya silme başlangıç RPC'),
    ('public.cancel_test_admin_media_delete(uuid,public.content_status,boolean,text)', 'TEST medya silme geri alma RPC'),
    ('public.complete_test_admin_media_delete(uuid)', 'TEST medya silme tamamlama RPC')
) as expected(signature, label);

select ok(
  not has_function_privilege('anon', expected.signature, 'EXECUTE'),
  format('anon %s çağıramaz', expected.label)
)
from (
  values
    ('public.save_admin_theme_settings(jsonb,jsonb,boolean)', 'tema transaction RPC'),
    ('public.update_job_application_admin(uuid,public.job_application_status,text)', 'başvuru transaction RPC'),
    ('public.create_admin_media_record(text,text,text,text,text,bigint)', 'medya oluşturma RPC'),
    ('public.set_admin_media_state(uuid,text)', 'medya durum RPC'),
    ('public.begin_test_admin_media_delete(uuid)', 'TEST medya silme başlangıç RPC'),
    ('public.cancel_test_admin_media_delete(uuid,public.content_status,boolean,text)', 'TEST medya silme geri alma RPC'),
    ('public.complete_test_admin_media_delete(uuid)', 'TEST medya silme tamamlama RPC')
) as expected(signature, label);

select ok(
  not has_table_privilege('authenticated', 'public.media', privilege_name),
  format('authenticated media tablosunda doğrudan %s yapamaz', privilege_name)
)
from (values ('INSERT'), ('UPDATE'), ('DELETE')) as privilege(privilege_name);

select ok(
  not has_table_privilege('authenticated', 'public.job_applications', privilege_name),
  format('authenticated job_applications tablosunda doğrudan %s yapamaz', privilege_name)
)
from (values ('INSERT'), ('UPDATE'), ('DELETE')) as privilege(privilege_name);

select * from finish();

rollback;
