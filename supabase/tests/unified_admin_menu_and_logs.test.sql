begin;
set local search_path=public,extensions;
select plan(24);
select ok(not has_function_privilege('anon','public.save_admin_menu_product(jsonb)','EXECUTE'),'anon cannot save unified menu');
select ok(not has_table_privilege('authenticated','public.admin_system_logs','INSERT'),'no direct log insertion');
select ok(not has_table_privilege('authenticated','public.admin_system_logs','UPDATE'),'no direct log editing');
select ok(not has_table_privilege('authenticated','public.admin_system_logs','DELETE'),'no log deletion');
select ok((select relrowsecurity from pg_class where oid='public.admin_system_logs'::regclass),'log RLS enabled');
-- Isolated fixtures: no seed or existing public records are modified.
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002');
insert into profiles(id,display_name,role) values ('10000000-0000-4000-8000-000000000001','TEST_admin','admin'),('10000000-0000-4000-8000-000000000002','TEST_editor','editor') on conflict(id) do update set display_name=excluded.display_name,role=excluded.role;
insert into branches(id,code,slug,name,address_line,district,city,maps_url,status,is_active)
values('20000000-0000-4000-8000-000000000001','TESTALS','test-admin-branch','TEST_Branch','TEST_Address','TEST_District','TEST_City','https://example.test/maps','published',true);
insert into menu_categories(id,slug,name,status,is_active) values('30000000-0000-4000-8000-000000000001','test-menu-category','TEST_Category','published',true);
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select throws_ok($$select save_admin_menu_product('{}')$$,'42501','admin_required','editor cannot invoke menu save');
select throws_ok($$select record_admin_system_event('/admin/menu','save','menu_items',null,'error','UNKNOWN',gen_random_uuid())$$,'42501','admin_required','editor cannot write technical logs');
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select save_admin_menu_product(jsonb_build_object('name','TEST_Product','slug','test-unified-product','category_id','30000000-0000-4000-8000-000000000001','status','published','is_active',true,'confirmed','EVET','branches',jsonb_build_array(jsonb_build_object('id','20000000-0000-4000-8000-000000000001','price_cents',null,'is_active',true,'variants',jsonb_build_array(jsonb_build_object('slug','test-portion','label','TEST_50cl','price_cents',21500,'is_active',true))))));
select is((select count(*) from menu_items where slug='test-unified-product'),1::bigint,'product created');
select is((select count(*) from menu_item_branches b join menu_items i on i.id=b.menu_item_id where i.slug='test-unified-product'),1::bigint,'branch placement created');
select is((select count(*) from menu_item_variants v join menu_item_branches b on b.id=v.menu_item_branch_id join menu_items i on i.id=b.menu_item_id where i.slug='test-unified-product'),1::bigint,'portion created');
select is((select count(*) from menu_category_branches where category_id='30000000-0000-4000-8000-000000000001'),1::bigint,'category linked automatically');
select ok(exists(select 1 from admin_activity_logs where entity_label='TEST_Product'),'existing audit trigger records menu save');
select throws_ok($$select save_admin_menu_product(jsonb_build_object('name','TEST_Failed','slug','test-failed-product','category_id','30000000-0000-4000-8000-000000000001','status','draft','is_active',true,'branches',jsonb_build_array(jsonb_build_object('id','20000000-0000-4000-8000-000000000001','price_cents',100,'is_active',true,'variants',jsonb_build_array(jsonb_build_object('id','40000000-0000-4000-8000-000000000099','label','TEST_Invalid','price_cents',100,'is_active',true))))))$$,'23503','variant_not_owned','foreign portion rejected');
select is((select count(*) from menu_items where slug='test-failed-product'),0::bigint,'failed multi-table save fully rolled back');
-- Existing notes and metadata remain intact during simplified price edits.
update menu_item_variants set price_note='TEST_Note',metadata='{"keep":"TEST_value"}' where slug='test-portion';
update menu_category_branches set is_active=false where category_id='30000000-0000-4000-8000-000000000001';
create temp table test_menu_edit(payload jsonb);
insert into test_menu_edit select jsonb_build_object('id',i.id,'updated_at',i.updated_at,'name',i.name,'slug',i.slug,'category_id',i.category_id,'status',i.status,'is_active',i.is_active,
  'branch_snapshot',(select jsonb_agg(jsonb_build_object('id',b.id,'updated_at',b.updated_at)) from menu_item_branches b where b.menu_item_id=i.id),
  'variant_snapshot',(select jsonb_agg(jsonb_build_object('id',v.id,'updated_at',v.updated_at)) from menu_item_variants v join menu_item_branches b on b.id=v.menu_item_branch_id where b.menu_item_id=i.id),
  'branches',(select jsonb_agg(jsonb_build_object('id',b.branch_id,'price_cents',null,'is_active',b.is_active,'variants',
    (select jsonb_agg(jsonb_build_object('id',v.id,'label',v.label,'price_cents',22000,'is_active',v.is_active)) from menu_item_variants v where v.menu_item_branch_id=b.id))) from menu_item_branches b where b.menu_item_id=i.id))
from menu_items i where i.slug='test-unified-product';
select save_admin_menu_product((select payload from test_menu_edit));
select is((select price_cents::bigint from menu_item_variants where slug='test-portion'),22000::bigint,'existing portion price updated');
select ok((select price_note='TEST_Note' and metadata->>'keep'='TEST_value' from menu_item_variants where slug='test-portion'),'unexposed metadata and notes preserved');
select ok((select not is_active from menu_category_branches where category_id='30000000-0000-4000-8000-000000000001'),'existing closed category stays closed');
select throws_ok($$select save_admin_menu_product((select payload || '{"updated_at":"2000-01-01T00:00:00Z"}' from test_menu_edit))$$,'40001','stale_menu_product','stale edit rejected');
select throws_ok($$select save_admin_menu_product((select jsonb_set(payload,'{branches,0,is_active}','false') from test_menu_edit))$$,'22023','visibility_confirmation_required','hiding a branch requires confirmation');
select save_admin_menu_product((select jsonb_set(payload,'{branches,0,is_active}','false') || '{"confirmed":"EVET"}' from test_menu_edit));
select ok((select not b.is_active from menu_item_branches b join menu_items i on i.id=b.menu_item_id where i.slug='test-unified-product'),'branch hidden without deleting product');

select record_admin_system_event('/admin/menu','save','menu_items',null,'error','secret-token', '50000000-0000-4000-8000-000000000001');
select ok(exists(select 1 from admin_system_logs where request_id='50000000-0000-4000-8000-000000000001' and error_code='UNKNOWN' and technical_message='Operation failed; raw details omitted'),'unknown code and message sanitized by database');
select throws_ok($$select record_admin_system_event('/admin/menu?token=secret','save','menu_items',null,'error','UNKNOWN',gen_random_uuid())$$,'22023','invalid_log_payload','query parameters never stored');
select resolve_admin_system_event((select id from admin_system_logs where request_id='50000000-0000-4000-8000-000000000001'),true);
select ok(exists(select 1 from admin_system_logs where request_id='50000000-0000-4000-8000-000000000001' and resolved_at is not null and resolved_by=auth.uid()),'resolution records current admin');
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select is((select count(*) from admin_system_logs),0::bigint,'editor cannot read logs');
reset role;
select * from finish();
rollback;
