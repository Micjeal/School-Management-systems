create or replace function public.check_timetable_conflicts(target_timetable_version_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_version public.timetable_versions;
  v_result jsonb;
begin
  select * into v_version from public.timetable_versions where id=target_timetable_version_id;
  if not found then raise exception 'Timetable version not found'; end if;
  if not private.has_permission(v_version.school_id,'academics.manage') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'entry_id',a.id,'conflicting_entry_id',b.id,'weekday',a.weekday,
    'starts_at',a.starts_at,'ends_at',a.ends_at,
    'conflict_type',case
      when a.class_section_id=b.class_section_id then 'class_section'
      when a.room_id is not null and a.room_id=b.room_id then 'room'
      else 'teacher' end
  ) order by a.weekday,a.starts_at),'[]'::jsonb)
  into v_result
  from public.timetable_entries a
  join public.timetable_entries b
    on b.timetable_version_id=a.timetable_version_id
   and b.id>a.id
   and b.weekday=a.weekday
   and a.starts_at<b.ends_at
   and b.starts_at<a.ends_at
   and (
     a.class_section_id=b.class_section_id
     or (a.room_id is not null and a.room_id=b.room_id)
     or (a.teacher_employee_id is not null and a.teacher_employee_id=b.teacher_employee_id)
   )
  where a.timetable_version_id=target_timetable_version_id;
  return v_result;
end;
$$;

create or replace function private.enforce_timetable_entry_conflicts()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_status text;
  v_conflict record;
begin
  select status into v_status from public.timetable_versions
  where id=new.timetable_version_id and school_id=new.school_id;
  if v_status is null then raise exception 'Timetable version not found'; end if;
  if v_status <> 'draft' then raise exception 'Published or retired timetables cannot be edited'; end if;
  if new.ends_at<=new.starts_at then raise exception 'Timetable end time must be later than start time'; end if;

  select e.id,
    case
      when e.class_section_id=new.class_section_id then 'class section'
      when new.room_id is not null and e.room_id=new.room_id then 'room'
      else 'teacher' end as conflict_type
  into v_conflict
  from public.timetable_entries e
  where e.timetable_version_id=new.timetable_version_id
    and e.weekday=new.weekday
    and e.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid)
    and e.starts_at<new.ends_at
    and new.starts_at<e.ends_at
    and (
      e.class_section_id=new.class_section_id
      or (new.room_id is not null and e.room_id=new.room_id)
      or (new.teacher_employee_id is not null and e.teacher_employee_id=new.teacher_employee_id)
    )
  limit 1;
  if found then
    raise exception 'Timetable conflict with % entry %',v_conflict.conflict_type,v_conflict.id using errcode='23514';
  end if;
  return new;
end;
$$;

drop trigger if exists timetable_entries_conflict_guard on public.timetable_entries;
create trigger timetable_entries_conflict_guard
before insert or update on public.timetable_entries
for each row execute function private.enforce_timetable_entry_conflicts();

create or replace function public.publish_timetable_version(target_timetable_version_id uuid)
returns public.timetable_versions
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_version public.timetable_versions;
  v_conflicts jsonb;
begin
  select * into v_version from public.timetable_versions where id=target_timetable_version_id for update;
  if not found then raise exception 'Timetable version not found'; end if;
  if not private.has_permission(v_version.school_id,'academics.manage') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_version.status <> 'draft' then raise exception 'Only draft timetables can be published'; end if;
  if not exists(select 1 from public.timetable_entries where timetable_version_id=v_version.id) then
    raise exception 'Timetable has no entries';
  end if;
  v_conflicts := public.check_timetable_conflicts(v_version.id);
  if jsonb_array_length(v_conflicts)>0 then raise exception 'Timetable contains conflicts'; end if;

  update public.timetable_versions
  set status='retired',updated_at=now()
  where school_id=v_version.school_id
    and academic_year_id=v_version.academic_year_id
    and term_id is not distinct from v_version.term_id
    and id<>v_version.id and status='published';
  update public.timetable_versions
  set status='published',published_at=now(),published_by=auth.uid(),updated_at=now()
  where id=v_version.id returning * into v_version;
  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_version.school_id,'timetable_version',v_version.id,'academics.timetable.published',jsonb_build_object('timetable_version_id',v_version.id,'academic_year_id',v_version.academic_year_id,'term_id',v_version.term_id));
  return v_version;
end;
$$;

revoke all on function public.check_timetable_conflicts(uuid) from public, anon;
revoke all on function public.publish_timetable_version(uuid) from public, anon;
grant execute on function public.check_timetable_conflicts(uuid) to authenticated, service_role;
grant execute on function public.publish_timetable_version(uuid) to authenticated, service_role;
