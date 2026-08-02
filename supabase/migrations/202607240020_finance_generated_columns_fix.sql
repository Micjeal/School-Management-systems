-- Respect generated columns on invoice lines and payments.
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
    insert into public.invoice_lines(school_id,invoice_id,fee_item_id,description,quantity,unit_amount,discount_amount,tax_amount,revenue_account_id,metadata)
    values(target_school_id,v_invoice.id,(v_line->>'fee_item_id')::uuid,v_line->>'description',coalesce((v_line->>'quantity')::numeric,1),
      (v_line->>'unit_amount')::numeric,coalesce((v_line->>'discount_amount')::numeric,0),coalesce((v_line->>'tax_amount')::numeric,0),
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
    allocated_amount,status,payer_name,payer_phone,payer_email,notes,received_by,idempotency_key,provider_payload)
  values(target_school_id,nullif(payment_data->>'student_id','')::uuid,(payment_data->>'payment_method_id')::uuid,payment_data->>'payment_reference',
    nullif(payment_data->>'external_reference',''),coalesce(nullif(payment_data->>'payment_date','')::timestamptz,now()),coalesce(nullif(payment_data->>'currency_code',''),'UGX')::char(3),
    (payment_data->>'amount')::numeric,0,'pending',nullif(payment_data->>'payer_name',''),nullif(payment_data->>'payer_phone',''),
    nullif(payment_data->>'payer_email',''),nullif(payment_data->>'notes',''),auth.uid(),nullif(payment_data->>'idempotency_key',''),coalesce(payment_data->'provider_payload','{}'::jsonb)) returning * into v_payment;
  for v_allocation in select value from jsonb_array_elements(allocations) loop
    perform public.allocate_payment(v_payment.id,(v_allocation->>'invoice_id')::uuid,(v_allocation->>'amount')::numeric);
  end loop;
  if post_now then select * into v_payment from public.post_payment(v_payment.id); else select * into v_payment from public.payments where id=v_payment.id; end if;
  return v_payment;
end;
$$;

revoke all on function public.create_invoice_with_lines(uuid,jsonb,jsonb,boolean) from public, anon;
grant execute on function public.create_invoice_with_lines(uuid,jsonb,jsonb,boolean) to authenticated, service_role;

revoke all on function public.create_payment_with_allocations(uuid,jsonb,jsonb,boolean) from public, anon;
grant execute on function public.create_payment_with_allocations(uuid,jsonb,jsonb,boolean) to authenticated, service_role;
