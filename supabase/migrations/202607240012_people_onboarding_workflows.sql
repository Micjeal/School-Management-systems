-- SchoolDB application workflows: generated from 202607240001_app_transactional_workflows.sql

create or replace function public.create_student_with_enrolment(
  target_school_id uuid,
  person_data jsonb,
  student_data jsonb,
  enrolment_data jsonb default null,
  guardians_data jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_person_id uuid;
  v_student_id uuid;
  v_enrolment_id uuid;
  v_guardian jsonb;
  v_guardian_person_id uuid;
  v_guardian_id uuid;
begin
  if not private.has_permission(target_school_id, 'students.create') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if coalesce(nullif(trim(person_data->>'first_name'), ''), '') = ''
     or coalesce(nullif(trim(person_data->>'last_name'), ''), '') = '' then
    raise exception 'First name and last name are required';
  end if;
  if coalesce(nullif(trim(student_data->>'admission_number'), ''), '') = '' then
    raise exception 'Admission number is required';
  end if;

  insert into public.people(
    school_id, user_id, first_name, middle_name, last_name, preferred_name,
    gender, date_of_birth, nationality_code, national_id, primary_email,
    primary_phone, photo_path, status, metadata
  ) values (
    target_school_id,
    nullif(person_data->>'user_id','')::uuid,
    trim(person_data->>'first_name'),
    nullif(trim(person_data->>'middle_name'),''),
    trim(person_data->>'last_name'),
    nullif(trim(person_data->>'preferred_name'),''),
    nullif(person_data->>'gender',''),
    nullif(person_data->>'date_of_birth','')::date,
    nullif(person_data->>'nationality_code','')::char(2),
    nullif(person_data->>'national_id',''),
    nullif(person_data->>'primary_email',''),
    nullif(person_data->>'primary_phone',''),
    nullif(person_data->>'photo_path',''),
    coalesce(nullif(person_data->>'status',''), 'active'),
    coalesce(person_data->'metadata', '{}'::jsonb)
  ) returning id into v_person_id;

  insert into public.students(
    school_id, person_id, admission_number, student_number, admission_date,
    boarding_status, status, current_campus_id, metadata
  ) values (
    target_school_id,
    v_person_id,
    trim(student_data->>'admission_number'),
    nullif(trim(student_data->>'student_number'),''),
    coalesce(nullif(student_data->>'admission_date','')::date, current_date),
    coalesce(nullif(student_data->>'boarding_status',''), 'day'),
    coalesce(nullif(student_data->>'status',''), 'active'),
    nullif(student_data->>'current_campus_id','')::uuid,
    coalesce(student_data->'metadata', '{}'::jsonb)
  ) returning id into v_student_id;

  if enrolment_data is not null then
    insert into public.student_enrolments(
      school_id, student_id, academic_year_id, term_id, class_section_id,
      roll_number, enrolment_status, enrolled_on
    ) values (
      target_school_id,
      v_student_id,
      (enrolment_data->>'academic_year_id')::uuid,
      nullif(enrolment_data->>'term_id','')::uuid,
      (enrolment_data->>'class_section_id')::uuid,
      nullif(enrolment_data->>'roll_number',''),
      coalesce(nullif(enrolment_data->>'enrolment_status',''), 'active'),
      coalesce(nullif(enrolment_data->>'enrolled_on','')::date, current_date)
    ) returning id into v_enrolment_id;
  end if;

  if jsonb_typeof(guardians_data) = 'array' then
    for v_guardian in select value from jsonb_array_elements(guardians_data)
    loop
      v_guardian_id := nullif(v_guardian->>'guardian_id','')::uuid;
      if v_guardian_id is null then
        insert into public.people(
          school_id, first_name, middle_name, last_name, gender,
          primary_email, primary_phone, status, metadata
        ) values (
          target_school_id,
          trim(v_guardian->>'first_name'),
          nullif(trim(v_guardian->>'middle_name'),''),
          trim(v_guardian->>'last_name'),
          nullif(v_guardian->>'gender',''),
          nullif(v_guardian->>'primary_email',''),
          nullif(v_guardian->>'primary_phone',''),
          'active',
          coalesce(v_guardian->'metadata','{}'::jsonb)
        ) returning id into v_guardian_person_id;

        insert into public.guardians(
          school_id, person_id, occupation, employer,
          preferred_contact_method, portal_enabled, status
        ) values (
          target_school_id,
          v_guardian_person_id,
          nullif(v_guardian->>'occupation',''),
          nullif(v_guardian->>'employer',''),
          coalesce(nullif(v_guardian->>'preferred_contact_method',''), 'phone'),
          coalesce((v_guardian->>'portal_enabled')::boolean, false),
          'active'
        ) returning id into v_guardian_id;
      end if;

      insert into public.student_guardians(
        school_id, student_id, guardian_id, relationship_type, is_primary,
        is_emergency_contact, is_financially_responsible, can_pick_up,
        receives_academic_reports, receives_financial_notices
      ) values (
        target_school_id,
        v_student_id,
        v_guardian_id,
        coalesce(nullif(v_guardian->>'relationship_type',''), 'guardian'),
        coalesce((v_guardian->>'is_primary')::boolean, false),
        coalesce((v_guardian->>'is_emergency_contact')::boolean, false),
        coalesce((v_guardian->>'is_financially_responsible')::boolean, false),
        coalesce((v_guardian->>'can_pick_up')::boolean, false),
        coalesce((v_guardian->>'receives_academic_reports')::boolean, true),
        coalesce((v_guardian->>'receives_financial_notices')::boolean, true)
      );
    end loop;
  end if;

  return jsonb_build_object(
    'person_id', v_person_id,
    'student_id', v_student_id,
    'enrolment_id', v_enrolment_id
  );
end;
$$;

create or replace function public.convert_application_to_student(
  target_application_id uuid,
  admission_number text,
  class_section_id uuid,
  target_term_id uuid default null,
  roll_number text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_app public.applications;
  v_student_id uuid;
  v_enrolment_id uuid;
begin
  select * into v_app from public.applications where id = target_application_id for update;
  if not found then raise exception 'Application not found'; end if;
  if not private.has_permission(v_app.school_id, 'admissions.manage')
     or not private.has_permission(v_app.school_id, 'students.create') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if v_app.status not in ('accepted', 'under_review', 'submitted', 'waitlisted') then
    raise exception 'Application is not eligible for enrolment';
  end if;

  insert into public.students(
    school_id, person_id, admission_number, admission_date, boarding_status,
    status, current_campus_id, metadata
  ) values (
    v_app.school_id, v_app.applicant_person_id, admission_number, current_date,
    coalesce(v_app.metadata->>'boarding_status','day'), 'active', v_app.campus_id,
    jsonb_build_object('source_application_id', v_app.id)
  ) returning id into v_student_id;

  insert into public.student_enrolments(
    school_id, student_id, academic_year_id, term_id, class_section_id,
    roll_number, enrolment_status, enrolled_on
  ) values (
    v_app.school_id, v_student_id, v_app.academic_year_id, target_term_id,
    class_section_id, roll_number, 'active', current_date
  ) returning id into v_enrolment_id;

  update public.applications
  set status = 'enrolled', decision = 'accepted', decision_at = coalesce(decision_at, now()),
      decision_by = coalesce(decision_by, auth.uid()), updated_at = now()
  where id = v_app.id;

  return jsonb_build_object('student_id', v_student_id, 'enrolment_id', v_enrolment_id);
end;
$$;

create or replace function public.create_employee_with_assignment(
  target_school_id uuid,
  person_data jsonb,
  employee_data jsonb,
  assignment_data jsonb,
  contract_data jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_person_id uuid;
  v_employee_id uuid;
  v_assignment_id uuid;
  v_contract_id uuid;
begin
  if not private.has_permission(target_school_id, 'staff.manage') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  insert into public.people(
    school_id, user_id, first_name, middle_name, last_name, preferred_name,
    gender, date_of_birth, nationality_code, national_id, primary_email,
    primary_phone, photo_path, status, metadata
  ) values (
    target_school_id,
    nullif(person_data->>'user_id','')::uuid,
    trim(person_data->>'first_name'),
    nullif(trim(person_data->>'middle_name'),''),
    trim(person_data->>'last_name'),
    nullif(trim(person_data->>'preferred_name'),''),
    nullif(person_data->>'gender',''),
    nullif(person_data->>'date_of_birth','')::date,
    nullif(person_data->>'nationality_code','')::char(2),
    nullif(person_data->>'national_id',''),
    nullif(person_data->>'primary_email',''),
    nullif(person_data->>'primary_phone',''),
    nullif(person_data->>'photo_path',''),
    'active', coalesce(person_data->'metadata','{}'::jsonb)
  ) returning id into v_person_id;

  insert into public.employees(
    school_id, person_id, employee_number, employment_type, hire_date,
    status, tax_identifier, social_security_number, metadata
  ) values (
    target_school_id, v_person_id, trim(employee_data->>'employee_number'),
    coalesce(nullif(employee_data->>'employment_type',''),'full_time'),
    coalesce(nullif(employee_data->>'hire_date','')::date,current_date),
    coalesce(nullif(employee_data->>'status',''),'active'),
    nullif(employee_data->>'tax_identifier',''),
    nullif(employee_data->>'social_security_number',''),
    coalesce(employee_data->'metadata','{}'::jsonb)
  ) returning id into v_employee_id;

  insert into public.employee_assignments(
    school_id, employee_id, campus_id, department_id, job_title, starts_on,
    ends_on, is_primary, reports_to_employee_id
  ) values (
    target_school_id, v_employee_id,
    nullif(assignment_data->>'campus_id','')::uuid,
    nullif(assignment_data->>'department_id','')::uuid,
    assignment_data->>'job_title',
    coalesce(nullif(assignment_data->>'starts_on','')::date,current_date),
    nullif(assignment_data->>'ends_on','')::date,
    coalesce((assignment_data->>'is_primary')::boolean,true),
    nullif(assignment_data->>'reports_to_employee_id','')::uuid
  ) returning id into v_assignment_id;

  if contract_data is not null then
    insert into public.employment_contracts(
      school_id, employee_id, contract_number, contract_type, starts_on,
      ends_on, base_salary, currency_code, pay_frequency, probation_ends_on,
      notice_period_days, terms_path, status
    ) values (
      target_school_id, v_employee_id, contract_data->>'contract_number',
      contract_data->>'contract_type',
      coalesce(nullif(contract_data->>'starts_on','')::date,current_date),
      nullif(contract_data->>'ends_on','')::date,
      coalesce((contract_data->>'base_salary')::numeric,0),
      coalesce(nullif(contract_data->>'currency_code',''),'UGX')::char(3),
      coalesce(nullif(contract_data->>'pay_frequency',''),'monthly'),
      nullif(contract_data->>'probation_ends_on','')::date,
      coalesce((contract_data->>'notice_period_days')::integer,30),
      nullif(contract_data->>'terms_path',''),
      coalesce(nullif(contract_data->>'status',''),'active')
    ) returning id into v_contract_id;
  end if;

  return jsonb_build_object(
    'person_id', v_person_id,
    'employee_id', v_employee_id,
    'assignment_id', v_assignment_id,
    'contract_id', v_contract_id
  );
end;
$$;

revoke all on function public.create_student_with_enrolment(uuid,jsonb,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.create_student_with_enrolment(uuid,jsonb,jsonb,jsonb,jsonb) to authenticated, service_role;

revoke all on function public.convert_application_to_student(uuid,text,uuid,uuid,text) from public, anon;
grant execute on function public.convert_application_to_student(uuid,text,uuid,uuid,text) to authenticated, service_role;

revoke all on function public.create_employee_with_assignment(uuid,jsonb,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.create_employee_with_assignment(uuid,jsonb,jsonb,jsonb,jsonb) to authenticated, service_role;
