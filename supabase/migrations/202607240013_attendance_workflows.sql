-- SchoolDB application workflows: generated from 202607240001_app_transactional_workflows.sql

create or replace function public.open_attendance_session(
  target_school_id uuid,
  target_academic_year_id uuid,
  target_term_id uuid,
  target_class_section_id uuid,
  target_session_date date,
  target_session_type text default 'daily',
  target_subject_id uuid default null,
  target_starts_at time default null,
  target_ends_at time default null,
  default_attendance_status text default 'present'
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_session_id uuid;
  v_count integer;
begin
  if not private.has_permission(target_school_id, 'attendance.record') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  select ats.id into v_session_id
  from public.attendance_sessions ats
  where ats.school_id = target_school_id
    and ats.class_section_id = target_class_section_id
    and ats.session_date = target_session_date
    and ats.session_type = target_session_type
    and ats.starts_at is not distinct from target_starts_at
  order by ats.created_at desc
  limit 1
  for update;

  if v_session_id is null then
    insert into public.attendance_sessions(
      school_id, academic_year_id, term_id, class_section_id, session_date,
      session_type, starts_at, ends_at, subject_id, status, opened_by
    ) values (
      target_school_id, target_academic_year_id, target_term_id,
      target_class_section_id, target_session_date, target_session_type,
      target_starts_at, target_ends_at, target_subject_id, 'open', auth.uid()
    ) returning id into v_session_id;
  else
    update public.attendance_sessions
    set academic_year_id = target_academic_year_id,
        term_id = target_term_id,
        subject_id = target_subject_id,
        ends_at = target_ends_at,
        updated_at = now()
    where id = v_session_id;
  end if;

  insert into public.student_attendance_records(
    school_id, attendance_session_id, student_id, attendance_status,
    recorded_by, recorded_at, source
  )
  select target_school_id, v_session_id, se.student_id, default_attendance_status,
         auth.uid(), now(), 'manual'
  from public.student_enrolments se
  join public.students s on s.id = se.student_id and s.school_id = se.school_id
  where se.school_id = target_school_id
    and se.academic_year_id = target_academic_year_id
    and se.class_section_id = target_class_section_id
    and (target_term_id is null or se.term_id is null or se.term_id = target_term_id)
    and se.enrolment_status = 'active'
    and s.status = 'active'
  on conflict (attendance_session_id, student_id) do nothing;

  get diagnostics v_count = row_count;
  return jsonb_build_object('session_id', v_session_id, 'initialized_records', v_count);
end;
$$;

create or replace function public.save_attendance_records(
  target_session_id uuid,
  records jsonb,
  submit_session boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_session public.attendance_sessions;
  v_count integer;
begin
  select * into v_session from public.attendance_sessions where id = target_session_id for update;
  if not found then raise exception 'Attendance session not found'; end if;
  if not private.has_permission(v_session.school_id, 'attendance.record') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if v_session.status not in ('open','submitted') then
    raise exception 'Attendance session is locked';
  end if;
  if jsonb_typeof(records) <> 'array' then raise exception 'records must be an array'; end if;

  insert into public.student_attendance_records(
    school_id, attendance_session_id, student_id, attendance_status,
    minutes_late, reason, remarks, recorded_by, recorded_at, source
  )
  select v_session.school_id, v_session.id, r.student_id, r.attendance_status,
         coalesce(r.minutes_late,0), r.reason, r.remarks, auth.uid(), now(), 'manual'
  from jsonb_to_recordset(records) as r(
    student_id uuid,
    attendance_status text,
    minutes_late integer,
    reason text,
    remarks text
  )
  on conflict (attendance_session_id, student_id)
  do update set attendance_status = excluded.attendance_status,
                minutes_late = excluded.minutes_late,
                reason = excluded.reason,
                remarks = excluded.remarks,
                recorded_by = auth.uid(), recorded_at = now(), updated_at = now();

  get diagnostics v_count = row_count;
  if submit_session then
    update public.attendance_sessions set status = 'submitted', updated_at = now() where id = v_session.id;
  end if;
  return jsonb_build_object('session_id', v_session.id, 'saved_records', v_count, 'status', case when submit_session then 'submitted' else v_session.status end);
end;
$$;

create or replace function public.lock_attendance_session(target_session_id uuid)
returns public.attendance_sessions
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_session public.attendance_sessions;
begin
  select * into v_session from public.attendance_sessions where id = target_session_id for update;
  if not found then raise exception 'Attendance session not found'; end if;
  if not private.has_permission(v_session.school_id, 'attendance.correct') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  update public.attendance_sessions
  set status = 'locked', closed_by = auth.uid(), closed_at = now(), updated_at = now()
  where id = target_session_id returning * into v_session;
  return v_session;
end;
$$;

revoke all on function public.open_attendance_session(uuid,uuid,uuid,uuid,date,text,uuid,time,time,text) from public, anon;
grant execute on function public.open_attendance_session(uuid,uuid,uuid,uuid,date,text,uuid,time,time,text) to authenticated, service_role;

revoke all on function public.save_attendance_records(uuid,jsonb,boolean) from public, anon;
grant execute on function public.save_attendance_records(uuid,jsonb,boolean) to authenticated, service_role;

revoke all on function public.lock_attendance_session(uuid) from public, anon;
grant execute on function public.lock_attendance_session(uuid) to authenticated, service_role;
