begin;
do $$ declare p record; begin
 for p in select policyname from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'school_files_%' loop execute format('drop policy %I on storage.objects',p.policyname); end loop;
end $$;
drop policy if exists school_branding_select on storage.objects;
drop policy if exists school_branding_insert on storage.objects;
drop policy if exists school_branding_update on storage.objects;
drop policy if exists school_branding_delete on storage.objects;
create policy school_branding_select on storage.objects for select to authenticated using(bucket_id='school-branding' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$' and (private.is_platform_admin() or private.is_school_member(split_part(name,'/',1)::uuid)));
create policy school_branding_insert on storage.objects for insert to authenticated with check(bucket_id='school-branding' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$' and private.has_permission(split_part(name,'/',1)::uuid,'settings.manage'));
create policy school_branding_update on storage.objects for update to authenticated using(bucket_id='school-branding' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$' and private.has_permission(split_part(name,'/',1)::uuid,'settings.manage')) with check(bucket_id='school-branding' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$' and private.has_permission(split_part(name,'/',1)::uuid,'settings.manage'));
create policy school_branding_delete on storage.objects for delete to authenticated using(bucket_id='school-branding' and split_part(name,'/',1) ~* '^[0-9a-f-]{36}$' and private.has_permission(split_part(name,'/',1)::uuid,'settings.manage'));
revoke all on public.import_batches,public.import_rows,public.export_jobs,public.application_documents from anon;
revoke update,delete on public.export_jobs from authenticated;
commit;
