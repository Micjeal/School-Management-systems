-- Secure RPC functions for portal data access
-- These functions derive the user from auth.uid() and do not accept arbitrary IDs

-- Get portal identity for the authenticated user
create or replace function public.get_my_portal_identity(
  target_school_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
declare
  v_person public.people%rowtype;
  v_employee public.employees%rowtype;
  v_student public.students%rowtype;
  v_guardian public.guardians%rowtype;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if not private.is_school_member(target_school_id)
     and not private.is_platform_admin() then
    raise exception 'School access denied'
      using errcode = '42501';
  end if;

  select *
  into v_person
  from public.people
  where school_id = target_school_id
    and user_id = auth.uid()
  limit 1;

  v_result := jsonb_build_object(
    'person_id', v_person.id
  );

  -- Check for employee linkage
  if v_person.id is not null then
    select *
    into v_employee
    from public.employees
    where school_id = target_school_id
      and person_id = v_person.id
    limit 1;

    if v_employee.id is not null then
      v_result := v_result || jsonb_build_object(
        'employee_id', v_employee.id,
        'employee_number', v_employee.employee_number
      );
    end if;

    -- Check for student linkage
    select *
    into v_student
    from public.students
    where school_id = target_school_id
      and person_id = v_person.id
    limit 1;

    if v_student.id is not null then
      v_result := v_result || jsonb_build_object(
        'student_id', v_student.id,
        'admission_number', v_student.admission_number
      );
    end if;

    -- Check for guardian linkage
    select *
    into v_guardian
    from public.guardians
    where school_id = target_school_id
      and person_id = v_person.id
    limit 1;

    if v_guardian.id is not null then
      v_result := v_result || jsonb_build_object(
        'guardian_id', v_guardian.id
      );
    end if;
  end if;

  return v_result;
end;
$$;

-- Get employee portal data for the authenticated user
create or replace function public.get_my_employee_portal(
  target_school_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
declare
  v_person public.people%rowtype;
  v_employee public.employees%rowtype;
  v_assignment public.employee_assignments%rowtype;
  v_is_teacher boolean;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if not private.is_school_member(target_school_id) then
    raise exception 'School access denied'
      using errcode = '42501';
  end if;

  -- Get person record
  select *
  into v_person
  from public.people
  where school_id = target_school_id
    and user_id = auth.uid()
  limit 1;

  if v_person.id is null then
    return null;
  end if;

  -- Get employee record
  select *
  into v_employee
  from public.employees
  where school_id = target_school_id
    and person_id = v_person.id
  limit 1;

  if v_employee.id is null then
    return null;
  end if;

  -- Check if teacher
  select exists(
    select 1 from public.teacher_assignments
    where employee_id = v_employee.id
  ) into v_is_teacher;

  -- Get primary assignment
  select ea.*
  into v_assignment
  from public.employee_assignments ea
  where ea.employee_id = v_employee.id
    and ea.is_primary = true
  limit 1;

  v_result := jsonb_build_object(
    'employee_id', v_employee.id,
    'employee_number', v_employee.employee_number,
    'person_id', v_person.id,
    'employment_type', v_employee.employment_type,
    'hire_date', v_employee.hire_date,
    'status', v_employee.status,
    'is_teacher', v_is_teacher,
    'primary_job_title', v_assignment.job_title,
    'department', (select name from public.departments where id = v_assignment.department_id),
    'campus', (select name from public.campuses where id = v_assignment.campus_id)
  );

  return v_result;
end;
$$;

-- Get student portal data for the authenticated user
create or replace function public.get_my_student_portal(
  target_school_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
declare
  v_person public.people%rowtype;
  v_student public.students%rowtype;
  v_enrolment public.student_enrolments%rowtype;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if not private.is_school_member(target_school_id) then
    raise exception 'School access denied'
      using errcode = '42501';
  end if;

  -- Get person record
  select *
  into v_person
  from public.people
  where school_id = target_school_id
    and user_id = auth.uid()
  limit 1;

  if v_person.id is null then
    return null;
  end if;

  -- Get student record
  select *
  into v_student
  from public.students
  where school_id = target_school_id
    and person_id = v_person.id
  limit 1;

  if v_student.id is null then
    return null;
  end if;

  -- Get active enrolment
  select se.*
  into v_enrolment
  from public.student_enrolments se
  where se.student_id = v_student.id
    and se.enrolment_status = 'active'
  order by se.academic_year_id desc
  limit 1;

  v_result := jsonb_build_object(
    'student_id', v_student.id,
    'person_id', v_person.id,
    'admission_number', v_student.admission_number,
    'student_number', v_student.student_number,
    'status', v_student.status,
    'campus', (select name from public.campuses where id = v_student.campus_id),
    'class_section', (select name from public.class_sections where id = v_enrolment.class_section_id),
    'class_group', (select cg.name from public.class_groups cg join public.class_sections cs on cg.id = cs.class_group_id where cs.id = v_enrolment.class_section_id),
    'academic_year', (select name from public.academic_years where id = v_enrolment.academic_year_id),
    'term', (select name from public.terms where id = v_enrolment.term_id),
    'boarding_status', v_enrolment.boarding_status
  );

  return v_result;
end;
$$;

-- Get guardian portal data for the authenticated user
create or replace function public.get_my_guardian_portal(
  target_school_id uuid,
  selected_student_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
declare
  v_person public.people%rowtype;
  v_guardian public.guardians%rowtype;
  v_learner_count int;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if not private.is_school_member(target_school_id) then
    raise exception 'School access denied'
      using errcode = '42501';
  end if;

  -- Get person record
  select *
  into v_person
  from public.people
  where school_id = target_school_id
    and user_id = auth.uid()
  limit 1;

  if v_person.id is null then
    return null;
  end if;

  -- Get guardian record
  select *
  into v_guardian
  from public.guardians
  where school_id = target_school_id
    and person_id = v_person.id
  limit 1;

  if v_guardian.id is null then
    return null;
  end if;

  -- Validate selected student if provided
  if selected_student_id is not null then
    if not exists(
      select 1 from public.student_guardians sg
      join public.students s on s.id = sg.student_id
      where sg.guardian_id = v_guardian.id
        and sg.student_id = selected_student_id
        and s.status = 'active'
    ) then
      raise exception 'Invalid student selection'
        using errcode = '42501';
    end if;
  end if;

  -- Count linked learners
  select count(*)
  into v_learner_count
  from public.student_guardians sg
  join public.students s on s.id = sg.student_id
  where sg.guardian_id = v_guardian.id
    and s.status = 'active';

  v_result := jsonb_build_object(
    'guardian_id', v_guardian.id,
    'person_id', v_person.id,
    'learner_count', v_learner_count
  );

  return v_result;
end;
$$;

-- Get portal notifications for the authenticated user
create or replace function public.get_my_portal_notifications(
  target_school_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  -- If school_id is provided, check school membership
  if target_school_id is not null then
    if not private.is_school_member(target_school_id) then
      raise exception 'School access denied'
        using errcode = '42501';
    end if;
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'title', n.title,
      'type', n.type,
      'priority', n.priority,
      'created_at', n.created_at,
      'is_read', n.is_read,
      'action_link', n.action_link
    )
  )
  into v_result
  from public.notifications n
  where n.user_id = auth.uid()
    and (target_school_id is null or n.school_id = target_school_id)
  order by n.created_at desc
  limit 20;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- Revoke default execution privileges
revoke all
on function public.get_my_portal_identity(uuid)
from public, anon;

grant execute
on function public.get_my_portal_identity(uuid)
to authenticated;

revoke all
on function public.get_my_employee_portal(uuid)
from public, anon;

grant execute
on function public.get_my_employee_portal(uuid)
to authenticated;

revoke all
on function public.get_my_student_portal(uuid)
from public, anon;

grant execute
on function public.get_my_student_portal(uuid)
to authenticated;

revoke all
on function public.get_my_guardian_portal(uuid, uuid)
from public, anon;

grant execute
on function public.get_my_guardian_portal(uuid, uuid)
to authenticated;

revoke all
on function public.get_my_portal_notifications(uuid)
from public, anon;

grant execute
on function public.get_my_portal_notifications(uuid)
to authenticated;
