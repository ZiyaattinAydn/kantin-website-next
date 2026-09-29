import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
// The optional test dependency lives outside the application package.
if (!process.argv[2]) throw new Error('Pass the temporary directory containing @electric-sql/pglite.');
const { PGlite } = await import(pathToFileURL(path.resolve(process.argv[2], 'node_modules/@electric-sql/pglite/dist/index.js')).href);
import { readFile } from 'node:fs/promises';
const root=fileURLToPath(new URL("../", import.meta.url));const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create schema extensions;
create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}', email text); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema public,auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
for(const name of ['20260620010000_initial_schema.sql','20260620020000_rls_policies.sql','20260620060000_admin_crud_support.sql','20260623010000_transactional_content_audit.sql','20260624050000_concurrency_safe_ordering.sql','20260625010000_admin_record_revisions.sql','20260930010000_unified_admin_menu.sql','20260930020000_admin_system_logs.sql']) {
 const sql=(await readFile(`${root}/supabase/migrations/${name}`,'utf8')).replace('create extension if not exists pgcrypto with schema extensions;','');
 try {await db.exec(sql); console.log('PASS migration',name);} catch(e){console.log('FAIL',name,e.message);throw e;}
}
await db.exec(`create function public.plan(n integer) returns text language sql as $$select 'plan'::text$$;
create function public.ok(v boolean,m text) returns text language plpgsql as $$begin if v is distinct from true then raise exception 'ASSERTION FAILED: %',m; end if; return 'PASS '||m; end$$;
create function public.is(v bigint,w bigint,m text) returns text language plpgsql as $$begin if v is distinct from w then raise exception 'ASSERTION FAILED: % (% <> %)',m,v,w; end if; return 'PASS '||m; end$$;
create function public.throws_ok(q text,c text,m text,d text) returns text language plpgsql as $$begin begin execute q; exception when others then if SQLSTATE=c and SQLERRM=m then return 'PASS '||d; end if; raise exception 'ASSERTION FAILED: % (got % %)',d,SQLSTATE,SQLERRM; end; raise exception 'ASSERTION FAILED: % (no exception)',d; end$$;
create function public.finish() returns setof text language sql as $$select 'finished'::text$$;
grant execute on all functions in schema public to authenticated;`);
// Restore precise grants: the test harness must not grant forbidden RPCs to anon.
let result; try { result=await db.exec(await readFile(`${root}/supabase/tests/unified_admin_menu_and_logs.test.sql`,'utf8')); } catch(e) { console.log('SQL TEST FAILED',e.code,e.message,e.where); process.exitCode=1; await db.close(); throw new Error("Isolated SQL validation failed"); }
for(const r of result)for(const row of r.rows??[])console.log(Object.values(row).join(' '));
await db.close();
