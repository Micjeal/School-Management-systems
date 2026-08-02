-- Run with Supabase CLI against a disposable database populated with two schools.
-- This test intentionally uses transaction-local JWT claims and rolls back all data.
begin;

create temporary table schooldb_test_results(test_name text primary key, passed boolean not null, detail text);

-- Baseline assertion: every public base/partitioned table has RLS enabled.
insert into schooldb_test_results
select 'all_public_tables_have_rls', count(*) = 0,
       format('%s tables without RLS', count(*))
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind in ('r','p') and not c.relrowsecurity;

-- Anonymous callers must not execute the application transaction RPCs.
insert into schooldb_test_results
select 'workflow_rpcs_not_executable_by_anon', bool_and(not has_function_privilege('anon', p.oid, 'execute')),
       'Checked public workflow functions'
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in (
  'create_student_with_enrolment','convert_application_to_student','create_employee_with_assignment',
  'open_attendance_session','save_attendance_records','lock_attendance_session',
  'save_mark_entries','moderate_assessment_marks','calculate_class_results','withdraw_class_results',
  'issue_library_item','return_library_item','record_stock_movement','create_invoice_with_lines',
  'create_payment_with_allocations','post_manual_journal','calculate_payroll_run'
);

select * from schooldb_test_results order by test_name;
do $$ begin
  if exists(select 1 from schooldb_test_results where not passed) then
    raise exception 'SchoolDB database isolation verification failed';
  end if;
end $$;
rollback;
