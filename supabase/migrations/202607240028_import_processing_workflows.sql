create or replace function public.process_import_batch(target_import_batch_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_batch public.import_batches;
  v_row public.import_rows;
  v_entity_id uuid;
  v_result jsonb;
  v_success integer := 0;
  v_failed integer := 0;
  v_permission text;
begin
  select * into v_batch from public.import_batches where id=target_import_batch_id for update;
  if not found then raise exception 'Import batch not found'; end if;
  v_permission := case v_batch.import_type
    when 'students' then 'students.create'
    when 'employees' then 'staff.manage'
    when 'inventory_items' then 'inventory.manage'
    when 'suppliers' then 'inventory.manage'
    else 'settings.manage' end;
  if not private.has_permission(v_batch.school_id,v_permission) then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_batch.status not in ('uploaded','ready','failed','completed_with_errors') then
    raise exception 'Import batch is not ready for processing';
  end if;

  update public.import_batches
  set status='processing',started_at=coalesce(started_at,now()),processed_rows=0,
      success_rows=0,failed_rows=0,error_summary=null,updated_at=now()
  where id=v_batch.id;

  for v_row in
    select * from public.import_rows
    where import_batch_id=v_batch.id and status in ('pending','valid','failed')
    order by row_number
    for update
  loop
    begin
      v_entity_id := null;
      v_result := null;
      if v_batch.import_type='inventory_items' then
        insert into public.inventory_items(
          school_id,code,name,description,category,unit_of_measure,reorder_level,
          standard_cost,track_stock,status,metadata
        ) values (
          v_batch.school_id,trim(v_row.raw_data->>'code'),trim(v_row.raw_data->>'name'),
          nullif(trim(v_row.raw_data->>'description'),''),nullif(trim(v_row.raw_data->>'category'),''),
          coalesce(nullif(trim(v_row.raw_data->>'unit_of_measure'),''),'unit'),
          coalesce(nullif(v_row.raw_data->>'reorder_level','')::numeric,0),
          nullif(v_row.raw_data->>'standard_cost','')::numeric,
          coalesce(nullif(v_row.raw_data->>'track_stock','')::boolean,true),
          coalesce(nullif(trim(v_row.raw_data->>'status'),''),'active'),'{}'::jsonb
        )
        on conflict (school_id,code) do update set
          name=excluded.name,description=excluded.description,category=excluded.category,
          unit_of_measure=excluded.unit_of_measure,reorder_level=excluded.reorder_level,
          standard_cost=excluded.standard_cost,track_stock=excluded.track_stock,status=excluded.status,updated_at=now()
        returning id into v_entity_id;
      elsif v_batch.import_type='suppliers' then
        insert into public.suppliers(
          school_id,code,name,contact_person,email,phone,tax_identifier,payment_terms_days,status,address,metadata
        ) values (
          v_batch.school_id,trim(v_row.raw_data->>'code'),trim(v_row.raw_data->>'name'),
          nullif(trim(v_row.raw_data->>'contact_person'),''),nullif(trim(v_row.raw_data->>'email'),''),
          nullif(trim(v_row.raw_data->>'phone'),''),nullif(trim(v_row.raw_data->>'tax_identifier'),''),
          coalesce(nullif(v_row.raw_data->>'payment_terms_days','')::integer,0),
          coalesce(nullif(trim(v_row.raw_data->>'status'),''),'active'),'{}'::jsonb,'{}'::jsonb
        )
        on conflict (school_id,code) do update set
          name=excluded.name,contact_person=excluded.contact_person,email=excluded.email,
          phone=excluded.phone,tax_identifier=excluded.tax_identifier,payment_terms_days=excluded.payment_terms_days,
          status=excluded.status,updated_at=now()
        returning id into v_entity_id;
      elsif v_batch.import_type='students' then
        v_result := public.create_student_with_enrolment(
          v_batch.school_id,
          jsonb_build_object(
            'first_name',v_row.raw_data->>'first_name','middle_name',v_row.raw_data->>'middle_name',
            'last_name',v_row.raw_data->>'last_name','gender',v_row.raw_data->>'gender',
            'date_of_birth',v_row.raw_data->>'date_of_birth','nationality_code',v_row.raw_data->>'nationality_code',
            'national_id',v_row.raw_data->>'national_id','primary_email',v_row.raw_data->>'primary_email',
            'primary_phone',v_row.raw_data->>'primary_phone'
          ),
          jsonb_build_object(
            'admission_number',v_row.raw_data->>'admission_number','student_number',v_row.raw_data->>'student_number',
            'admission_date',v_row.raw_data->>'admission_date','boarding_status',v_row.raw_data->>'boarding_status',
            'current_campus_id',v_row.raw_data->>'current_campus_id'
          ),
          case when nullif(v_row.raw_data->>'class_section_id','') is null then null else jsonb_build_object(
            'academic_year_id',v_row.raw_data->>'academic_year_id','term_id',v_row.raw_data->>'term_id',
            'class_section_id',v_row.raw_data->>'class_section_id','roll_number',v_row.raw_data->>'roll_number',
            'enrolled_on',v_row.raw_data->>'enrolled_on'
          ) end,
          '[]'::jsonb
        );
        v_entity_id := (v_result->>'student_id')::uuid;
      elsif v_batch.import_type='employees' then
        v_result := public.create_employee_with_assignment(
          v_batch.school_id,
          jsonb_build_object(
            'first_name',v_row.raw_data->>'first_name','middle_name',v_row.raw_data->>'middle_name',
            'last_name',v_row.raw_data->>'last_name','gender',v_row.raw_data->>'gender',
            'date_of_birth',v_row.raw_data->>'date_of_birth','primary_email',v_row.raw_data->>'primary_email',
            'primary_phone',v_row.raw_data->>'primary_phone','national_id',v_row.raw_data->>'national_id'
          ),
          jsonb_build_object(
            'employee_number',v_row.raw_data->>'employee_number','employment_type',v_row.raw_data->>'employment_type',
            'hire_date',v_row.raw_data->>'hire_date','tax_identifier',v_row.raw_data->>'tax_identifier',
            'social_security_number',v_row.raw_data->>'social_security_number'
          ),
          jsonb_build_object(
            'campus_id',v_row.raw_data->>'campus_id','department_id',v_row.raw_data->>'department_id',
            'job_title',v_row.raw_data->>'job_title','starts_on',v_row.raw_data->>'starts_on','is_primary',true
          ),
          case when nullif(v_row.raw_data->>'contract_number','') is null then null else jsonb_build_object(
            'contract_number',v_row.raw_data->>'contract_number','contract_type',coalesce(nullif(v_row.raw_data->>'contract_type',''),'permanent'),
            'starts_on',v_row.raw_data->>'starts_on','base_salary',coalesce(nullif(v_row.raw_data->>'base_salary',''),'0'),
            'currency_code',coalesce(nullif(v_row.raw_data->>'currency_code',''),'UGX'),'pay_frequency',coalesce(nullif(v_row.raw_data->>'pay_frequency',''),'monthly')
          ) end
        );
        v_entity_id := (v_result->>'employee_id')::uuid;
      else
        raise exception 'Unsupported import type %',v_batch.import_type;
      end if;

      update public.import_rows
      set status='imported',entity_id=v_entity_id,normalized_data=v_row.raw_data,errors='[]'::jsonb,processed_at=now()
      where id=v_row.id;
      v_success := v_success+1;
    exception when others then
      update public.import_rows
      set status='failed',errors=jsonb_build_array(jsonb_build_object('message',sqlerrm,'sqlstate',sqlstate)),processed_at=now()
      where id=v_row.id;
      v_failed := v_failed+1;
    end;
  end loop;

  update public.import_batches
  set status=case when v_failed=0 then 'completed' when v_success>0 then 'completed_with_errors' else 'failed' end,
      processed_rows=v_success+v_failed,success_rows=v_success,failed_rows=v_failed,
      completed_at=now(),error_summary=case when v_failed>0 then v_failed||' row(s) failed' else null end,updated_at=now()
  where id=v_batch.id returning * into v_batch;

  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_batch.school_id,'import_batch',v_batch.id,'system.import.completed',jsonb_build_object('import_batch_id',v_batch.id,'import_type',v_batch.import_type,'success_rows',v_success,'failed_rows',v_failed));
  return jsonb_build_object('import_batch_id',v_batch.id,'status',v_batch.status,'success_rows',v_success,'failed_rows',v_failed);
end;
$$;

revoke all on function public.process_import_batch(uuid) from public, anon;
grant execute on function public.process_import_batch(uuid) to authenticated, service_role;
