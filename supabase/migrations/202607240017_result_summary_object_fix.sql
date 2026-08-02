-- Preserve JSON object constraints for calculated result summaries.
create or replace function public.calculate_class_results(
  target_school_id uuid,
  target_academic_year_id uuid,
  target_term_id uuid,
  target_class_section_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_subject_count integer;
  v_card_count integer;
begin
  if not private.has_permission(target_school_id, 'results.moderate') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  with calculated as (
    select
      a.school_id, a.academic_year_id, a.term_id, a.class_section_id, a.subject_id,
      me.student_id,
      sum(case when me.is_absent or me.is_exempt or me.score is null then 0
               else (me.score / nullif(a.maximum_score,0)) * a.weight end) as weighted_score,
      sum(case when me.is_exempt then 0 else a.weight end) as weight_total,
      sum(coalesce(me.score,0)) as raw_total,
      jsonb_agg(jsonb_build_object(
        'assessment_id', a.id, 'title', a.title, 'score', me.score,
        'maximum_score', a.maximum_score, 'weight', a.weight,
        'absent', me.is_absent, 'exempt', me.is_exempt
      ) order by a.assessment_date nulls last, a.title) as details
    from public.assessments a
    join public.mark_entries me on me.assessment_id = a.id and me.school_id = a.school_id
    where a.school_id = target_school_id
      and a.academic_year_id = target_academic_year_id
      and a.term_id = target_term_id
      and a.class_section_id = target_class_section_id
      and me.status in ('submitted','moderated','locked')
    group by a.school_id, a.academic_year_id, a.term_id, a.class_section_id, a.subject_id, me.student_id
  ), graded as (
    select c.*,
      round((c.weighted_score / nullif(c.weight_total,0)) * 100, 2) as percentage,
      gs.grade, gs.grade_point
    from calculated c
    left join lateral (
      select gsi.grade, gsi.grade_point
      from public.grading_scales g
      join public.grading_scale_items gsi on gsi.grading_scale_id = g.id and gsi.school_id = g.school_id
      where g.school_id = c.school_id and g.is_active and g.is_default
        and ((c.weighted_score / nullif(c.weight_total,0)) * 100) between gsi.min_score and gsi.max_score
      order by gsi.sequence_no limit 1
    ) gs on true
  )
  insert into public.subject_results(
    school_id, academic_year_id, term_id, student_id, class_section_id,
    subject_id, total_score, percentage_score, grade, grade_point,
    calculation_details, calculated_at, status
  )
  select school_id, academic_year_id, term_id, student_id, class_section_id,
         subject_id, raw_total, percentage, grade, grade_point,
         jsonb_build_object(
           'assessments', coalesce(details, '[]'::jsonb),
           'weight_total', weight_total,
           'weighted_score', weighted_score
         ),
         now(), 'draft'
  from graded
  on conflict (school_id, academic_year_id, term_id, student_id, subject_id)
  do update set class_section_id = excluded.class_section_id,
                total_score = excluded.total_score,
                percentage_score = excluded.percentage_score,
                grade = excluded.grade,
                grade_point = excluded.grade_point,
                calculation_details = excluded.calculation_details,
                calculated_at = now(), status = 'draft', updated_at = now();
  get diagnostics v_subject_count = row_count;

  with ranked as (
    select id, dense_rank() over (partition by subject_id order by percentage_score desc nulls last) as pos
    from public.subject_results
    where school_id = target_school_id and academic_year_id = target_academic_year_id
      and term_id = target_term_id and class_section_id = target_class_section_id
  )
  update public.subject_results sr set position_in_class = ranked.pos, updated_at = now()
  from ranked where ranked.id = sr.id;

  with student_summary as (
    select se.student_id,
      round(avg(sr.percentage_score),2) as overall_percentage,
      jsonb_agg(jsonb_build_object(
        'subject_id', sr.subject_id,
        'percentage', sr.percentage_score,
        'grade', sr.grade,
        'position', sr.position_in_class
      ) order by sr.subject_id) filter (where sr.id is not null) as subject_summaries
    from public.student_enrolments se
    left join public.subject_results sr
      on sr.student_id = se.student_id and sr.school_id = se.school_id
     and sr.academic_year_id = target_academic_year_id
     and sr.term_id = target_term_id
     and sr.class_section_id = target_class_section_id
    where se.school_id = target_school_id
      and se.academic_year_id = target_academic_year_id
      and se.class_section_id = target_class_section_id
      and (se.term_id is null or se.term_id = target_term_id)
      and se.enrolment_status = 'active'
    group by se.student_id
  ), with_rank as (
    select *, dense_rank() over(order by overall_percentage desc nulls last) as class_position
    from student_summary
  )
  insert into public.report_cards(
    school_id, academic_year_id, term_id, student_id, class_section_id,
    academic_summary, attendance_summary, overall_percentage, class_position,
    status, generated_at
  )
  select target_school_id, target_academic_year_id, target_term_id, student_id,
         target_class_section_id,
         jsonb_build_object(
           'subjects', coalesce(subject_summaries,'[]'::jsonb),
           'subject_count', coalesce(jsonb_array_length(subject_summaries), 0)
         ),
         jsonb_build_object(
           'present', (select count(*) from public.student_attendance_records ar join public.attendance_sessions ats on ats.id=ar.attendance_session_id where ar.student_id=with_rank.student_id and ats.term_id=target_term_id and ar.attendance_status='present'),
           'absent', (select count(*) from public.student_attendance_records ar join public.attendance_sessions ats on ats.id=ar.attendance_session_id where ar.student_id=with_rank.student_id and ats.term_id=target_term_id and ar.attendance_status='absent')
         ),
         overall_percentage, class_position, 'draft', now()
  from with_rank
  on conflict (school_id, academic_year_id, term_id, student_id)
  do update set class_section_id = excluded.class_section_id,
                academic_summary = excluded.academic_summary,
                attendance_summary = excluded.attendance_summary,
                overall_percentage = excluded.overall_percentage,
                class_position = excluded.class_position,
                status = 'draft', generated_at = now(), updated_at = now();
  get diagnostics v_card_count = row_count;

  return jsonb_build_object('subject_results', v_subject_count, 'report_cards', v_card_count);
end;
$$;

revoke all on function public.calculate_class_results(uuid,uuid,uuid,uuid) from public, anon;
grant execute on function public.calculate_class_results(uuid,uuid,uuid,uuid) to authenticated, service_role;
