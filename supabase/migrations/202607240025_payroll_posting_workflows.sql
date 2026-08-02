alter table public.school_finance_settings
  add column if not exists payroll_expense_account_id uuid,
  add column if not exists payroll_payable_account_id uuid,
  add column if not exists payroll_bank_account_id uuid,
  add column if not exists employer_contribution_expense_account_id uuid,
  add column if not exists employer_contribution_payable_account_id uuid;

do $$ begin
  alter table public.school_finance_settings
    add constraint school_finance_payroll_expense_fk foreign key (school_id,payroll_expense_account_id)
    references public.financial_accounts(school_id,id) on delete restrict;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.school_finance_settings
    add constraint school_finance_payroll_payable_fk foreign key (school_id,payroll_payable_account_id)
    references public.financial_accounts(school_id,id) on delete restrict;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.school_finance_settings
    add constraint school_finance_payroll_bank_fk foreign key (school_id,payroll_bank_account_id)
    references public.financial_accounts(school_id,id) on delete restrict;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.school_finance_settings
    add constraint school_finance_employer_expense_fk foreign key (school_id,employer_contribution_expense_account_id)
    references public.financial_accounts(school_id,id) on delete restrict;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.school_finance_settings
    add constraint school_finance_employer_payable_fk foreign key (school_id,employer_contribution_payable_account_id)
    references public.financial_accounts(school_id,id) on delete restrict;
exception when duplicate_object then null; end $$;

create or replace function public.configure_payroll_accounts(
  target_school_id uuid,
  target_expense_account_id uuid,
  target_payable_account_id uuid,
  target_bank_account_id uuid,
  target_employer_expense_account_id uuid default null,
  target_employer_payable_account_id uuid default null
)
returns public.school_finance_settings
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_settings public.school_finance_settings;
begin
  if not private.has_permission(target_school_id,'payroll.process') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if not exists(select 1 from public.financial_accounts where school_id=target_school_id and id=target_expense_account_id and is_active) then
    raise exception 'Payroll expense account not found';
  end if;
  if not exists(select 1 from public.financial_accounts where school_id=target_school_id and id=target_payable_account_id and is_active) then
    raise exception 'Payroll payable account not found';
  end if;
  if not exists(select 1 from public.financial_accounts where school_id=target_school_id and id=target_bank_account_id and is_active) then
    raise exception 'Payroll bank account not found';
  end if;
  update public.school_finance_settings
  set payroll_expense_account_id=target_expense_account_id,
      payroll_payable_account_id=target_payable_account_id,
      payroll_bank_account_id=target_bank_account_id,
      employer_contribution_expense_account_id=target_employer_expense_account_id,
      employer_contribution_payable_account_id=target_employer_payable_account_id,
      updated_at=now()
  where school_id=target_school_id returning * into v_settings;
  if not found then raise exception 'School finance settings are not initialized'; end if;
  return v_settings;
end;
$$;

create or replace function public.approve_payroll_run(target_payroll_run_id uuid)
returns public.payroll_runs
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_run public.payroll_runs;
begin
  select * into v_run from public.payroll_runs where id=target_payroll_run_id for update;
  if not found then raise exception 'Payroll run not found'; end if;
  if not private.has_permission(v_run.school_id,'payroll.process') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_run.status not in ('calculated','review') then raise exception 'Payroll must be calculated before approval'; end if;
  if not exists(select 1 from public.payroll_entries where payroll_run_id=v_run.id) then raise exception 'Payroll has no entries'; end if;
  update public.payroll_runs set status='approved',approved_by=auth.uid(),approved_at=now(),updated_at=now()
  where id=v_run.id returning * into v_run;
  return v_run;
end;
$$;

create or replace function public.post_payroll_run(target_payroll_run_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_run public.payroll_runs;
  v_settings public.school_finance_settings;
  v_entry_id uuid;
  v_number text;
begin
  select * into v_run from public.payroll_runs where id=target_payroll_run_id for update;
  if not found then raise exception 'Payroll run not found'; end if;
  if not private.has_permission(v_run.school_id,'payroll.process') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_run.status <> 'approved' then raise exception 'Payroll must be approved before posting'; end if;
  select * into v_settings from public.school_finance_settings where school_id=v_run.school_id;
  if v_settings.payroll_expense_account_id is null or v_settings.payroll_payable_account_id is null then
    raise exception 'Payroll accounting accounts are not configured';
  end if;
  v_number := 'PR-'||replace(v_run.run_number,' ','-');
  insert into public.journal_entries(
    school_id,entry_number,entry_date,source_type,source_id,description,currency_code,status
  ) values (
    v_run.school_id,v_number,current_date,'payroll',v_run.id,'Payroll posting '||v_run.run_number,'UGX','draft'
  ) returning id into v_entry_id;
  insert into public.journal_lines(school_id,journal_entry_id,account_id,description,debit_amount,credit_amount)
  values(v_run.school_id,v_entry_id,v_settings.payroll_expense_account_id,'Gross payroll expense',v_run.gross_total,0);
  insert into public.journal_lines(school_id,journal_entry_id,account_id,description,debit_amount,credit_amount)
  values(v_run.school_id,v_entry_id,v_settings.payroll_payable_account_id,'Gross payroll payable',0,v_run.gross_total);
  if v_run.employer_contributions_total > 0 then
    insert into public.journal_lines(school_id,journal_entry_id,account_id,description,debit_amount,credit_amount)
    values(v_run.school_id,v_entry_id,coalesce(v_settings.employer_contribution_expense_account_id,v_settings.payroll_expense_account_id),'Employer contribution expense',v_run.employer_contributions_total,0);
    insert into public.journal_lines(school_id,journal_entry_id,account_id,description,debit_amount,credit_amount)
    values(v_run.school_id,v_entry_id,coalesce(v_settings.employer_contribution_payable_account_id,v_settings.payroll_payable_account_id),'Employer contribution payable',0,v_run.employer_contributions_total);
  end if;
  update public.journal_entries set status='posted',posted_at=now(),posted_by=auth.uid(),updated_at=now() where id=v_entry_id;
  update public.payroll_runs set status='posted',posted_journal_entry_id=v_entry_id,updated_at=now()
  where id=v_run.id returning * into v_run;
  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_run.school_id,'payroll_run',v_run.id,'payroll.run.posted',jsonb_build_object('payroll_run_id',v_run.id,'journal_entry_id',v_entry_id,'net_total',v_run.net_total));
  return jsonb_build_object('payroll_run_id',v_run.id,'journal_entry_id',v_entry_id,'status',v_run.status);
end;
$$;

create or replace function public.pay_payroll_run(
  target_payroll_run_id uuid,
  target_payment_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_run public.payroll_runs;
  v_settings public.school_finance_settings;
  v_entry_id uuid;
  v_number text;
begin
  select * into v_run from public.payroll_runs where id=target_payroll_run_id for update;
  if not found then raise exception 'Payroll run not found'; end if;
  if not private.has_permission(v_run.school_id,'payroll.process') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_run.status <> 'posted' then raise exception 'Payroll must be posted before payment'; end if;
  select * into v_settings from public.school_finance_settings where school_id=v_run.school_id;
  if v_settings.payroll_payable_account_id is null then raise exception 'Payroll payable account is not configured'; end if;
  if coalesce(v_settings.payroll_bank_account_id,v_settings.bank_account_id) is null then raise exception 'Payroll bank account is not configured'; end if;
  v_number := 'PRPAY-'||replace(v_run.run_number,' ','-');
  insert into public.journal_entries(
    school_id,entry_number,entry_date,source_type,source_id,description,currency_code,status
  ) values (
    v_run.school_id,v_number,current_date,'payroll',v_run.id,'Payroll payment '||v_run.run_number,'UGX','draft'
  ) returning id into v_entry_id;
  insert into public.journal_lines(school_id,journal_entry_id,account_id,description,debit_amount,credit_amount)
  values(v_run.school_id,v_entry_id,v_settings.payroll_payable_account_id,'Net payroll paid',v_run.net_total,0);
  insert into public.journal_lines(school_id,journal_entry_id,account_id,description,debit_amount,credit_amount)
  values(v_run.school_id,v_entry_id,coalesce(v_settings.payroll_bank_account_id,v_settings.bank_account_id),'Payroll bank payment',0,v_run.net_total);
  update public.journal_entries set status='posted',posted_at=now(),posted_by=auth.uid(),updated_at=now() where id=v_entry_id;
  update public.payroll_entries
  set payment_status='paid',payment_reference=trim(target_payment_reference),updated_at=now()
  where payroll_run_id=v_run.id;
  update public.payroll_runs set status='paid',updated_at=now() where id=v_run.id returning * into v_run;
  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_run.school_id,'payroll_run',v_run.id,'payroll.run.paid',jsonb_build_object('payroll_run_id',v_run.id,'payment_journal_entry_id',v_entry_id,'payment_reference',target_payment_reference));
  return jsonb_build_object('payroll_run_id',v_run.id,'payment_journal_entry_id',v_entry_id,'status',v_run.status);
end;
$$;

revoke all on function public.configure_payroll_accounts(uuid,uuid,uuid,uuid,uuid,uuid) from public, anon;
revoke all on function public.approve_payroll_run(uuid) from public, anon;
revoke all on function public.post_payroll_run(uuid) from public, anon;
revoke all on function public.pay_payroll_run(uuid,text) from public, anon;
grant execute on function public.configure_payroll_accounts(uuid,uuid,uuid,uuid,uuid,uuid) to authenticated, service_role;
grant execute on function public.approve_payroll_run(uuid) to authenticated, service_role;
grant execute on function public.post_payroll_run(uuid) to authenticated, service_role;
grant execute on function public.pay_payroll_run(uuid,text) to authenticated, service_role;
