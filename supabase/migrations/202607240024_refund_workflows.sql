create or replace function public.create_refund_request(
  target_school_id uuid,
  target_payment_id uuid,
  target_amount numeric,
  target_reason text,
  target_refund_reference text default null
)
returns public.refunds
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_payment public.payments;
  v_refund public.refunds;
  v_refunded numeric;
begin
  if not private.has_permission(target_school_id,'finance.refund') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if target_amount <= 0 then raise exception 'Refund amount must be greater than zero'; end if;
  select * into v_payment from public.payments
  where id=target_payment_id and school_id=target_school_id for update;
  if not found then raise exception 'Payment not found'; end if;
  if v_payment.status not in ('completed','refunded') then
    raise exception 'Only completed payments can be refunded';
  end if;
  select coalesce(sum(amount),0) into v_refunded
  from public.refunds
  where payment_id=v_payment.id and status in ('approved','processing','completed');
  if v_refunded + target_amount > v_payment.amount then
    raise exception 'Refund exceeds the refundable payment balance';
  end if;

  insert into public.refunds(
    school_id,payment_id,student_id,refund_reference,amount,reason,
    requested_by,requested_at,status
  ) values (
    target_school_id,v_payment.id,v_payment.student_id,
    coalesce(nullif(trim(target_refund_reference),''),'REF-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS')),
    target_amount,trim(target_reason),auth.uid(),now(),'requested'
  ) returning * into v_refund;

  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(target_school_id,'refund',v_refund.id,'finance.refund.requested',jsonb_build_object('refund_id',v_refund.id,'payment_id',v_payment.id,'amount',v_refund.amount));
  return v_refund;
end;
$$;

create or replace function public.decide_refund_request(
  target_refund_id uuid,
  approve boolean,
  decision_note text default null
)
returns public.refunds
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_refund public.refunds;
begin
  select * into v_refund from public.refunds where id=target_refund_id for update;
  if not found then raise exception 'Refund not found'; end if;
  if not private.has_permission(v_refund.school_id,'finance.refund') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_refund.status <> 'requested' then raise exception 'Refund is no longer awaiting approval'; end if;
  update public.refunds
  set status=case when approve then 'approved' else 'rejected' end,
      approved_by=auth.uid(),approved_at=now(),
      reason=case when nullif(trim(decision_note),'') is null then reason else reason||E'\nDecision: '||trim(decision_note) end,
      updated_at=now()
  where id=v_refund.id returning * into v_refund;
  return v_refund;
end;
$$;

create or replace function public.process_refund(
  target_refund_id uuid,
  target_provider_reference text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_refund public.refunds;
  v_payment public.payments;
  v_method public.payment_methods;
  v_settings public.school_finance_settings;
  v_allocation public.payment_allocations;
  v_remaining numeric;
  v_cumulative numeric;
  v_entry_id uuid;
  v_entry_number text;
begin
  select * into v_refund from public.refunds where id=target_refund_id for update;
  if not found then raise exception 'Refund not found'; end if;
  if not private.has_permission(v_refund.school_id,'finance.refund') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_refund.status <> 'approved' then raise exception 'Refund must be approved before processing'; end if;
  select * into v_payment from public.payments where id=v_refund.payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  select coalesce(sum(amount),0) into v_cumulative
  from public.refunds where payment_id=v_payment.id and status='completed';
  if v_cumulative + v_refund.amount > v_payment.amount then
    raise exception 'Refund exceeds the refundable payment balance';
  end if;
  select * into v_method from public.payment_methods where id=v_payment.payment_method_id;
  select * into v_settings from public.school_finance_settings where school_id=v_refund.school_id;
  if v_settings.school_id is null then raise exception 'School finance settings are not initialized'; end if;

  update public.refunds set status='processing',updated_at=now() where id=v_refund.id;
  v_remaining := v_refund.amount;
  for v_allocation in
    select * from public.payment_allocations
    where payment_id=v_payment.id
    order by allocated_at desc,id desc
    for update
  loop
    exit when v_remaining <= 0;
    if v_allocation.amount <= v_remaining then
      v_remaining := v_remaining-v_allocation.amount;
      delete from public.payment_allocations where id=v_allocation.id;
    else
      update public.payment_allocations set amount=amount-v_remaining where id=v_allocation.id;
      v_remaining := 0;
    end if;
    perform private.refresh_invoice_totals(v_allocation.invoice_id);
  end loop;
  if v_remaining > 0 then
    raise exception 'Payment allocations are insufficient for this refund';
  end if;

  v_entry_number := 'REF-'||replace(v_refund.refund_reference,' ','-');
  insert into public.journal_entries(
    school_id,entry_number,entry_date,source_type,source_id,description,currency_code,status
  ) values (
    v_refund.school_id,v_entry_number,current_date,'refund',v_refund.id,
    'Refund '||v_refund.refund_reference,v_payment.currency_code,'draft'
  ) returning id into v_entry_id;
  insert into public.journal_lines(
    school_id,journal_entry_id,account_id,student_id,description,debit_amount,credit_amount
  ) values (
    v_refund.school_id,v_entry_id,v_settings.receivables_account_id,v_refund.student_id,
    'Restore student receivable',v_refund.amount,0
  );
  insert into public.journal_lines(
    school_id,journal_entry_id,account_id,student_id,description,debit_amount,credit_amount
  ) values (
    v_refund.school_id,v_entry_id,coalesce(v_method.settlement_account_id,v_settings.bank_account_id),v_refund.student_id,
    'Refund paid',0,v_refund.amount
  );
  update public.journal_entries set status='posted',posted_at=now(),posted_by=auth.uid(),updated_at=now() where id=v_entry_id;

  v_cumulative := v_cumulative + v_refund.amount;
  update public.payments
  set allocated_amount=(select coalesce(sum(amount),0) from public.payment_allocations where payment_id=v_payment.id),
      status=case when v_cumulative>=amount then 'refunded' else 'completed' end,
      provider_payload=coalesce(provider_payload,'{}'::jsonb)||jsonb_build_object('refunded_amount',v_cumulative,'last_refund_id',v_refund.id),
      updated_at=now()
  where id=v_payment.id;
  update public.refunds
  set status='completed',processed_by=auth.uid(),processed_at=now(),
      provider_reference=nullif(trim(target_provider_reference),''),updated_at=now()
  where id=v_refund.id returning * into v_refund;

  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_refund.school_id,'refund',v_refund.id,'finance.refund.completed',jsonb_build_object('refund_id',v_refund.id,'payment_id',v_payment.id,'amount',v_refund.amount,'journal_entry_id',v_entry_id));
  return jsonb_build_object('refund_id',v_refund.id,'status',v_refund.status,'journal_entry_id',v_entry_id,'payment_refunded_amount',v_cumulative);
end;
$$;

revoke all on function public.create_refund_request(uuid,uuid,numeric,text,text) from public, anon;
revoke all on function public.decide_refund_request(uuid,boolean,text) from public, anon;
revoke all on function public.process_refund(uuid,text) from public, anon;
grant execute on function public.create_refund_request(uuid,uuid,numeric,text,text) to authenticated, service_role;
grant execute on function public.decide_refund_request(uuid,boolean,text) to authenticated, service_role;
grant execute on function public.process_refund(uuid,text) to authenticated, service_role;
