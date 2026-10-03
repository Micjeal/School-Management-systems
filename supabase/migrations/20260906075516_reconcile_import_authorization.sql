begin;

insert into public.permissions (code, module, name, description, risk_level)
values ('imports.process', 'system', 'Process data imports', 'Upload and process controlled data import batches', 'critical')
on conflict (code) do update set module=excluded.module, name=excluded.name, description=excluded.description, risk_level=excluded.risk_level;

alter table public.import_batches add constraint import_batches_school_id_id_key unique (school_id, id);
alter table public.import_rows drop constraint if exists import_rows_school_batch_fk;
alter table public.import_rows add constraint import_rows_school_batch_fk foreign key (school_id, import_batch_id) references public.import_batches(school_id, id) on delete cascade;

do $$ declare p record; begin
  for p in select policyname, tablename from pg_policies where schemaname='public' and tablename in ('import_batches','import_rows') loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;
create policy import_batches_read on public.import_batches for select to authenticated using (private.has_permission(school_id,'imports.process'));
create policy import_batches_insert on public.import_batches for insert to authenticated with check (requested_by=auth.uid() and private.has_permission(school_id,'imports.process'));
create policy import_batches_update on public.import_batches for update to authenticated using (private.has_permission(school_id,'imports.process')) with check (private.has_permission(school_id,'imports.process'));
create policy import_batches_delete on public.import_batches for delete to authenticated using (private.has_permission(school_id,'imports.process'));
create policy import_rows_read on public.import_rows for select to authenticated using (private.has_permission(school_id,'imports.process'));
create policy import_rows_insert on public.import_rows for insert to authenticated with check (private.has_permission(school_id,'imports.process'));
create policy import_rows_update on public.import_rows for update to authenticated using (private.has_permission(school_id,'imports.process')) with check (private.has_permission(school_id,'imports.process'));
create policy import_rows_delete on public.import_rows for delete to authenticated using (private.has_permission(school_id,'imports.process'));

alter function public.process_import_batch(uuid) set schema private;
alter function private.process_import_batch(uuid) rename to process_import_batch_internal;
revoke all on function private.process_import_batch_internal(uuid) from public, anon, authenticated;
grant execute on function private.process_import_batch_internal(uuid) to service_role;
create function public.process_import_batch(target_import_batch_id uuid) returns jsonb language plpgsql security definer set search_path=public,private,pg_temp as $$
declare v_school_id uuid; v_import_type text; v_domain_permission text;
begin
 select school_id,import_type into v_school_id,v_import_type from public.import_batches where id=target_import_batch_id;
 if not found then raise exception 'Import batch not found'; end if;
 if not private.has_permission(v_school_id,'imports.process') then raise exception 'Permission denied' using errcode='42501'; end if;
 v_domain_permission:=case v_import_type when 'students' then 'students.create' when 'employees' then 'staff.manage' when 'inventory_items' then 'inventory.manage' when 'suppliers' then 'inventory.manage' else null end;
 if v_domain_permission is null then raise exception 'Unsupported import type %',v_import_type; end if;
 if not private.has_permission(v_school_id,v_domain_permission) then raise exception 'Permission denied' using errcode='42501'; end if;
 return private.process_import_batch_internal(target_import_batch_id);
end $$;
revoke all on function public.process_import_batch(uuid) from public,anon;
grant execute on function public.process_import_batch(uuid) to authenticated,service_role;
commit;
