begin;
set local search_path=public,extensions;
select plan(25);
select ok(not has_function_privilege('anon','public.restore_admin_delivery_baseline(jsonb,text)','EXECUTE'),'anonymous baseline restore forbidden');
select ok(not has_function_privilege('anon','public.save_admin_menu_category_v2(jsonb)','EXECUTE'),'anonymous group save forbidden');
select ok((select relrowsecurity from pg_class where oid='public.admin_delivery_baselines'::regclass),'baseline RLS enabled');
select ok(not (select prosecdef from pg_proc where oid='public.restore_admin_delivery_baseline(jsonb,text)'::regprocedure),'baseline restore respects RLS');
insert into auth.users(id) values('10000000-0000-4000-8000-000000000021'),('10000000-0000-4000-8000-000000000022');
insert into profiles(id,display_name,role) values('10000000-0000-4000-8000-000000000021','TEST_QA2_Admin','admin'),('10000000-0000-4000-8000-000000000022','TEST_QA2_Editor','editor') on conflict(id) do update set role=excluded.role;
insert into branches(id,slug,code,name,address_line,district,city,maps_url,status,is_active) values
('20000000-0000-4000-8000-000000000021','test-qa2-a','TQA2A','TEST_QA2_A','TEST_Address','TEST_District','TEST_City','https://example.test','published',true),
('20000000-0000-4000-8000-000000000022','test-qa2-b','TQA2B','TEST_QA2_B','TEST_Address','TEST_District','TEST_City','https://example.test','published',true);
insert into menu_categories(id,slug,name,status,is_active,display_type) values
('30000000-0000-4000-8000-000000000021','test-qa2-food','TEST_Food','published',true,'cards'),
('30000000-0000-4000-8000-000000000022','test-qa2-coffee','TEST_Coffee','published',true,'coffee');
insert into menu_category_branches(category_id,branch_id,sort_order,is_active,metadata) values
('30000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000021',10,true,'{"keep":"TEST_keep"}'),
('30000000-0000-4000-8000-000000000022','20000000-0000-4000-8000-000000000021',20,true,'{"menu_group":{"key":"coffee","label":"Kahve Barı"}}'),
('30000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000022',40,true,'{}');
insert into menu_items(id,category_id,slug,name,status,is_active) values('40000000-0000-4000-8000-000000000021','30000000-0000-4000-8000-000000000021','test-qa2-child','TEST_Child','draft',false);
insert into menu_item_branches(menu_item_id,branch_id,is_active,price_cents) values('40000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000021',false,10000);
insert into site_settings(id,key,value,is_public,status,is_active) values
('50000000-0000-4000-8000-000000000021','test-qa2-baseline','{"name":"TEST_changed"}',true,'published',true),
('50000000-0000-4000-8000-000000000022','test-qa2-second','{"name":"TEST_second_changed"}',true,'published',true);
insert into admin_delivery_baselines(entity_type,baseline_key,snapshot,source_ref) values
('site_settings','test-qa2-baseline','{"value":{"name":"TEST_delivered"},"status":"published","is_active":false}','TEST_fixture'),
('site_settings','test-qa2-second','{"value":{"name":"TEST_second_delivered"},"status":"published","is_active":true}','TEST_fixture');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000022',true);
set local role authenticated;
select is((select count(*) from admin_delivery_baselines),0::bigint,'editor cannot read baseline');
select throws_ok($$select restore_admin_delivery_baseline('[]','İLK TESLİME DÖN')$$,'42501','admin_required','editor cannot restore baseline');
select throws_ok($$select save_admin_menu_category_v2('{}')$$,'42501','admin_required','editor cannot save groups');
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000021',true);
set local role authenticated;
select throws_ok($$update admin_delivery_baselines set source_ref='TEST_tampered'$$,'42501','permission denied for table admin_delivery_baselines','normal admin cannot overwrite delivery baseline');
select throws_ok($$delete from admin_delivery_baselines$$,'42501','permission denied for table admin_delivery_baselines','normal admin cannot delete delivery baseline');
create temp table test_qa2_payload(payload jsonb);
insert into test_qa2_payload select jsonb_build_object('id',c.id,'updated_at',c.updated_at,'name',c.name,'status',c.status,'is_active',c.is_active,'sort_order',c.sort_order,'branches',jsonb_build_array('20000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000022'),'branch_snapshot',(select jsonb_agg(jsonb_build_object('id',l.id,'updated_at',l.updated_at)) from menu_category_branches l where l.category_id=c.id),'branch_groups',jsonb_build_array(jsonb_build_object('branch_id','20000000-0000-4000-8000-000000000021','key','coffee','label','Kahve Barı','display_type','preserve'),jsonb_build_object('branch_id','20000000-0000-4000-8000-000000000022','key','main','label','Ana Menü','display_type','preserve'))) from menu_categories c where c.id='30000000-0000-4000-8000-000000000021';
select save_admin_menu_category_v2((select payload from test_qa2_payload));
select ok((select metadata->'menu_group'->>'key'='coffee' and metadata->>'keep'='TEST_keep' from menu_category_branches where category_id='30000000-0000-4000-8000-000000000021' and branch_id='20000000-0000-4000-8000-000000000021'),'placement changes preserve unrelated metadata');
select ok((select sort_order=40 and metadata->'menu_group'->>'key'='main' from menu_category_branches where category_id='30000000-0000-4000-8000-000000000021' and branch_id='20000000-0000-4000-8000-000000000022'),'category save preserves other branch ordering');
select move_admin_menu_category('30000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000021','up',(select updated_at from menu_category_branches where category_id='30000000-0000-4000-8000-000000000021' and branch_id='20000000-0000-4000-8000-000000000021'));
select ok((select a.sort_order<b.sort_order from menu_category_branches a join menu_category_branches b on a.branch_id=b.branch_id where a.category_id='30000000-0000-4000-8000-000000000021' and b.category_id='30000000-0000-4000-8000-000000000022'),'category moves within its branch and menu group');
select throws_ok($$select move_admin_menu_category('30000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000021','up','2000-01-01')$$,'40001','stale_category','stale category order rejected');
select ok((select status='draft' and not is_active from menu_items where id='40000000-0000-4000-8000-000000000021'),'category mutations preserve child publication flags');
select ok((select not is_active from menu_item_branches where menu_item_id='40000000-0000-4000-8000-000000000021'),'category mutations preserve child branch flags');
select throws_ok($$select save_admin_menu_category_v2((select jsonb_set(payload,'{branch_groups,0,key}','"merch"') from test_qa2_payload))$$,'22023','invalid_category_group','unsupported merch placement rejected atomically');
create temp table test_baseline_payload(payload jsonb);
insert into test_baseline_payload select jsonb_build_array(jsonb_build_object('entity_type','site_settings','id',id,'baseline_key',key,'updated_at',updated_at)) from site_settings where id='50000000-0000-4000-8000-000000000021';
select throws_ok($$select restore_admin_delivery_baseline((select payload from test_baseline_payload),'EVET')$$,'22023','baseline_confirmation_required','baseline requires strong confirmation');
select restore_admin_delivery_baseline((select payload from test_baseline_payload),'İLK TESLİME DÖN');
select ok((select value->>'name'='TEST_delivered' and not is_active from site_settings where id='50000000-0000-4000-8000-000000000021'),'baseline restores original value and visibility');
select ok(exists(select 1 from admin_record_revisions where entity_id='50000000-0000-4000-8000-000000000021' and before_data->'value'->>'name'='TEST_changed'),'pre-restore content preserved in revisions');
select ok((select snapshot->'value'->>'name'='TEST_delivered' from admin_delivery_baselines where baseline_key='test-qa2-baseline'),'restore never mutates baseline');
update site_settings set value='{"name":"TEST_later"}' where id='50000000-0000-4000-8000-000000000021';
select ok((select snapshot->'value'->>'name'='TEST_delivered' from admin_delivery_baselines where baseline_key='test-qa2-baseline'),'later saves never mutate baseline');
select throws_ok($$select restore_admin_delivery_baseline((select jsonb_build_array(jsonb_build_object('entity_type','site_settings','id',id,'baseline_key',key,'updated_at',updated_at),jsonb_build_object('entity_type','site_settings','id','50000000-0000-4000-8000-000000000022','baseline_key','test-qa2-second','updated_at','2000-01-01')) from site_settings where id='50000000-0000-4000-8000-000000000021'),'İLK TESLİME DÖN')$$,'40001','stale_baseline_target','one stale target rolls back all baseline restores');
select ok((select value->>'name'='TEST_later' from site_settings where id='50000000-0000-4000-8000-000000000021'),'atomic restore preserves earlier record after rollback');
select ok(exists(select 1 from admin_activity_logs where entity_id='50000000-0000-4000-8000-000000000021'),'baseline restore remains transactionally audited');
select throws_ok($$select restore_admin_delivery_baseline('[{"entity_type":"job_applications","id":"50000000-0000-4000-8000-000000000021"}]','İLK TESLİME DÖN')$$,'22023','invalid_baseline_scope','baseline cannot target careers or other private tables');
reset role;
select * from finish();
rollback;
