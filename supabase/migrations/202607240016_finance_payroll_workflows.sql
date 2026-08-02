-- SchoolDB application workflows: generated from 202607240001_app_transactional_workflows.sql

create or replace function public.create_invoice_with_lines(
  target_school_id uuid,
  invoice_data jsonb,
  lines jsonb,
  post_now boolean default false
)
returns public.invoices
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_invoice public.invoices; v_line jsonb;
begin
  if not private.has_permission(target_school_id,'finance.invoice') then raise exception 'Permission denied' using errcode='42501'; end if;
  if jsonb_typeof(lines)<>'array' or jsonb_array_length(lines)=0 then raise exception 'At least one invoice line is required'; end if;
  insert into public.invoices(school_id,student_id,academic_year_id,term_id,invoice_number,invoice_date,due_date,currency_code,notes,idempotency_key)
  values(target_school_id,(invoice_data->>'student_id')::uuid,(invoice_data->>'academic_year_id')::uuid,nullif(invoice_data->>'term_id','')::uuid,
    invoice_data->>'invoice_number',coalesce(nullif(invoice_data->>'invoice_date','')::date,current_date),nullif(invoice_data->>'due_date','')::date,
    coalesce(nullif(invoice_data->>'currency_code',''),'UGX')::char(3),nullif(invoice_data->>'notes',''),nullif(invoice_data->>'idempotency_key','')) returning * into v_invoice;
  for v_line in select value from jsonb_array_elements(lines) loop
    insert into public.invoice_lines(school_id,invoice_id,fee_item_id,description,quantity,unit_amount,discount_amount,tax_amount,line_total,revenue_account_id,metadata)
    values(target_school_id,v_invoice.id,(v_line->>'fee_item_id')::uuid,v_line->>'description',coalesce((v_line->>'quantity')::numeric,1),
      (v_line->>'unit_amount')::numeric,coalesce((v_line->>'discount_amount')::numeric,0),coalesce((v_line->>'tax_amount')::numeric,0),
      (coalesce((v_line->>'quantity')::numeric,1)*(v_line->>'unit_amount')::numeric)-coalesce((v_line->>'discount_amount')::numeric,0)+coalesce((v_line->>'tax_amount')::numeric,0),
      nullif(v_line->>'revenue_account_id','')::uuid,coalesce(v_line->'metadata','{}'::jsonb));
  end loop;
  perform private.refresh_invoice_totals(v_invoice.id);
  select * into v_invoice from public.invoices where id=v_invoice.id;
  if post_now then select * into v_invoice from public.post_invoice(v_invoice.id); end if;
  return v_invoice;
end;
$$;

create or replace function public.create_payment_with_allocations(
  target_school_id uuid,
  payment_data jsonb,
  allocations jsonb,
  post_now boolean default true
)
returns public.payments
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_payment public.payments; v_allocation jsonb; v_total numeric:=0;
begin
  if not private.has_permission(target_school_id,'finance.collect') then raise exception 'Permission denied' using errcode='42501'; end if;
  if jsonb_typeof(allocations)<>'array' then raise exception 'allocations must be an array'; end if;
  select coalesce(sum((value->>'amount')::numeric),0) into v_total from jsonb_array_elements(allocations);
  if v_total<>(payment_data->>'amount')::numeric then raise exception 'Allocation total must equal payment amount'; end if;
  insert into public.payments(school_id,student_id,payment_method_id,payment_reference,external_reference,payment_date,currency_code,amount,
    allocated_amount,unallocated_amount,status,payer_name,payer_phone,payer_email,notes,received_by,idempotency_key,provider_payload)
  values(target_school_id,nullif(payment_data->>'student_id','')::uuid,(payment_data->>'payment_method_id')::uuid,payment_data->>'payment_reference',
    nullif(payment_data->>'external_reference',''),coalesce(nullif(payment_data->>'payment_date','')::timestamptz,now()),coalesce(nullif(payment_data->>'currency_code',''),'UGX')::char(3),
    (payment_data->>'amount')::numeric,0,(payment_data->>'amount')::numeric,'pending',nullif(payment_data->>'payer_name',''),nullif(payment_data->>'payer_phone',''),
    nullif(payment_data->>'payer_email',''),nullif(payment_data->>'notes',''),auth.uid(),nullif(payment_data->>'idempotency_key',''),coalesce(payment_data->'provider_payload','{}'::jsonb)) returning * into v_payment;
  for v_allocation in select value from jsonb_array_elements(allocations) loop
    perform public.allocate_payment(v_payment.id,(v_allocation->>'invoice_id')::uuid,(v_allocation->>'amount')::numeric);
  end loop;
  if post_now then select * into v_payment from public.post_payment(v_payment.id); else select * into v_payment from public.payments where id=v_payment.id; end if;
  return v_payment;
end;
$$;

create or replace function public.post_manual_journal(
  target_school_id uuid,
  journal_data jsonb,
  lines jsonb
)
returns public.journal_entries
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_entry public.journal_entries; v_line jsonb; v_debits numeric; v_credits numeric;
begin
  if not private.has_permission(target_school_id,'finance.adjust') then raise exception 'Permission denied' using errcode='42501'; end if;
  select coalesce(sum(coalesce((value->>'debit_amount')::numeric,0)),0),coalesce(sum(coalesce((value->>'credit_amount')::numeric,0)),0)
    into v_debits,v_credits from jsonb_array_elements(lines);
  if v_debits<=0 or v_debits<>v_credits then raise exception 'Journal must be balanced and greater than zero'; end if;
  insert into public.journal_entries(school_id,entry_number,entry_date,source_type,description,status,currency_code,posted_at,posted_by)
  values(target_school_id,journal_data->>'entry_number',coalesce(nullif(journal_data->>'entry_date','')::date,current_date),'manual',journal_data->>'description','posted',
    coalesce(nullif(journal_data->>'currency_code',''),'UGX')::char(3),now(),auth.uid()) returning * into v_entry;
  for v_line in select value from jsonb_array_elements(lines) loop
    insert into public.journal_lines(school_id,journal_entry_id,account_id,student_id,description,debit_amount,credit_amount)
    values(target_school_id,v_entry.id,(v_line->>'account_id')::uuid,nullif(v_line->>'student_id','')::uuid,nullif(v_line->>'description',''),
      coalesce((v_line->>'debit_amount')::numeric,0),coalesce((v_line->>'credit_amount')::numeric,0));
  end loop;
  return v_entry;
end;
$$;

create or replace function public.calculate_payroll_run(target_payroll_run_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_run public.payroll_runs;
  v_period public.payroll_periods;
  v_employee record;
  v_entry_id uuid;
  v_base numeric;
  v_earnings numeric;
  v_deductions numeric;
  v_employer numeric;
  v_amount numeric;
  v_component record;
  v_count integer:=0;
begin
  select * into v_run from public.payroll_runs where id=target_payroll_run_id for update;
  if not found then raise exception 'Payroll run not found'; end if;
  if not private.has_permission(v_run.school_id,'payroll.process') then raise exception 'Permission denied' using errcode='42501'; end if;
  if v_run.status not in ('draft','calculated','review') then raise exception 'Payroll run cannot be recalculated'; end if;
  select * into v_period from public.payroll_periods where id=v_run.payroll_period_id;
  delete from public.payroll_entry_lines where payroll_entry_id in (select id from public.payroll_entries where payroll_run_id=v_run.id);
  delete from public.payroll_entries where payroll_run_id=v_run.id;

  for v_employee in
    select e.id,
      coalesce((select ec.base_salary from public.employment_contracts ec
        where ec.employee_id=e.id and ec.school_id=e.school_id and ec.status='active'
          and ec.starts_on<=v_period.ends_on and (ec.ends_on is null or ec.ends_on>=v_period.starts_on)
        order by ec.starts_on desc limit 1),0) as base_salary
    from public.employees e
    where e.school_id=v_run.school_id and e.status='active'
  loop
    v_base:=v_employee.base_salary; v_earnings:=0; v_deductions:=0; v_employer:=0;
    insert into public.payroll_entries(school_id,payroll_run_id,employee_id,base_salary,gross_pay,total_deductions,net_pay,employer_contributions,calculation_details)
    values(v_run.school_id,v_run.id,v_employee.id,v_base,v_base,0,v_base,0,'{}'::jsonb) returning id into v_entry_id;

    for v_component in
      select pc.*,epc.amount as employee_amount,epc.percentage_rate as employee_rate
      from public.employee_pay_components epc join public.payroll_components pc on pc.id=epc.payroll_component_id
      where epc.school_id=v_run.school_id and epc.employee_id=v_employee.id and epc.is_active and pc.is_active
        and epc.starts_on<=v_period.ends_on and (epc.ends_on is null or epc.ends_on>=v_period.starts_on)
    loop
      v_amount:=case
        when v_component.calculation_method='percentage' then round(v_base*coalesce(v_component.employee_rate,v_component.percentage_rate,0)/100,2)
        else coalesce(v_component.employee_amount,v_component.default_amount,0)
      end;
      insert into public.payroll_entry_lines(school_id,payroll_entry_id,payroll_component_id,quantity,rate,amount)
      values(v_run.school_id,v_entry_id,v_component.id,1,coalesce(v_component.employee_rate,v_component.percentage_rate),v_amount);
      if v_component.component_type='earning' then v_earnings:=v_earnings+v_amount;
      elsif v_component.component_type in ('deduction','tax') then v_deductions:=v_deductions+v_amount;
      elsif v_component.component_type='employer_contribution' then v_employer:=v_employer+v_amount; end if;
    end loop;
    update public.payroll_entries set gross_pay=v_base+v_earnings,total_deductions=v_deductions,
      net_pay=greatest(v_base+v_earnings-v_deductions,0),employer_contributions=v_employer,
      calculation_details=jsonb_build_object('base_salary',v_base,'earnings',v_earnings,'deductions',v_deductions,'employer_contributions',v_employer),updated_at=now()
    where id=v_entry_id;
    v_count:=v_count+1;
  end loop;
  update public.payroll_runs pr set
    gross_total=(select coalesce(sum(gross_pay),0) from public.payroll_entries where payroll_run_id=pr.id),
    deductions_total=(select coalesce(sum(total_deductions),0) from public.payroll_entries where payroll_run_id=pr.id),
    net_total=(select coalesce(sum(net_pay),0) from public.payroll_entries where payroll_run_id=pr.id),
    employer_contributions_total=(select coalesce(sum(employer_contributions),0) from public.payroll_entries where payroll_run_id=pr.id),
    status='calculated',processed_by=auth.uid(),processed_at=now(),updated_at=now()
  where pr.id=v_run.id;
  return jsonb_build_object('payroll_run_id',v_run.id,'employees_calculated',v_count);
end;
$$;

revoke all on function public.create_invoice_with_lines(uuid,jsonb,jsonb,boolean) from public, anon;
grant execute on function public.create_invoice_with_lines(uuid,jsonb,jsonb,boolean) to authenticated, service_role;

revoke all on function public.create_payment_with_allocations(uuid,jsonb,jsonb,boolean) from public, anon;
grant execute on function public.create_payment_with_allocations(uuid,jsonb,jsonb,boolean) to authenticated, service_role;

revoke all on function public.post_manual_journal(uuid,jsonb,jsonb) from public, anon;
grant execute on function public.post_manual_journal(uuid,jsonb,jsonb) to authenticated, service_role;

revoke all on function public.calculate_payroll_run(uuid) from public, anon;
grant execute on function public.calculate_payroll_run(uuid) to authenticated, service_role;
