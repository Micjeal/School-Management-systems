-- Student portal access is relationship based.  A student role never receives
-- a broad module permission such as students.read.
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
begin
  if auth.uid() is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  -- The selected school is part of the authority boundary.  Do not infer a
  -- school from a different membership or accept a caller supplied student id.
  if not private.is_school_member(target_school_id)
     or not exists (
       select 1
       from public.school_memberships sm
       join public.membership_roles mr on mr.membership_id = sm.id
       join public.roles r on r.id = mr.role_id
       where sm.school_id = target_school_id
         and sm.user_id = auth.uid()
         and sm.status = 'active'
         and (sm.ended_at is null or sm.ended_at > now())
         and (mr.expires_at is null or mr.expires_at > now())
         and r.code = 'student'
         and r.is_active
     ) then
    raise exception 'Student portal access denied' using errcode = '42501';
  end if;

  select * into v_person
  from public.people
  where school_id = target_school_id and user_id = auth.uid()
  limit 1;
  if v_person.id is null then return null; end if;

  select * into v_student
  from public.students
  where school_id = target_school_id and person_id = v_person.id
  limit 1;
  if v_student.id is null then return null; end if;

  select se.* into v_enrolment
  from public.student_enrolments se
  where se.school_id = target_school_id
    and se.student_id = v_student.id
    and se.enrolment_status = 'active'
  order by se.academic_year_id desc
  limit 1;

  return jsonb_build_object(
    'student_id', v_student.id,
    'person_id', v_person.id,
    'admission_number', v_student.admission_number,
    'student_number', v_student.student_number,
    'status', v_student.status,
    'campus', (select name from public.campuses where id = v_student.current_campus_id),
    'class_section', (select name from public.class_sections where id = v_enrolment.class_section_id),
    'class_group', (select cg.name from public.class_groups cg join public.class_sections cs on cs.class_group_id = cg.id where cs.id = v_enrolment.class_section_id),
    'academic_year', (select name from public.academic_years where id = v_enrolment.academic_year_id),
    'term', (select name from public.terms where id = v_enrolment.term_id),
    'boarding_status', v_enrolment.boarding_status
  );
end;
$$;

revoke all on function public.get_my_student_portal(uuid) from public, anon;
grant execute on function public.get_my_student_portal(uuid) to authenticated;
