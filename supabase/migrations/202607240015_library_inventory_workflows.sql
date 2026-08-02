-- SchoolDB application workflows: generated from 202607240001_app_transactional_workflows.sql

create or replace function public.issue_library_item(
  target_copy_id uuid,
  target_student_id uuid default null,
  target_employee_id uuid default null,
  target_due_at timestamptz default null,
  notes text default null
)
returns public.library_loans
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_copy public.library_copies;
  v_item public.library_items;
  v_loan public.library_loans;
begin
  select * into v_copy from public.library_copies where id = target_copy_id for update;
  if not found then raise exception 'Library copy not found'; end if;
  if not private.has_permission(v_copy.school_id, 'library.manage') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if v_copy.circulation_status <> 'available' then raise exception 'Copy is not available'; end if;
  if (target_student_id is null) = (target_employee_id is null) then
    raise exception 'Exactly one borrower is required';
  end if;
  select * into v_item from public.library_items where id = v_copy.library_item_id;

  insert into public.library_loans(
    school_id, library_copy_id, student_id, employee_id, borrowed_at,
    due_at, status, issued_by, notes
  ) values (
    v_copy.school_id, v_copy.id, target_student_id, target_employee_id, now(),
    coalesce(target_due_at, now() + make_interval(days => v_item.loan_period_days)),
    'active', auth.uid(), notes
  ) returning * into v_loan;

  update public.library_copies set circulation_status='on_loan', updated_at=now() where id=v_copy.id;
  return v_loan;
end;
$$;

create or replace function public.return_library_item(
  target_loan_id uuid,
  target_return_condition text default 'good',
  target_fine_type text default null,
  target_fine_amount numeric default null,
  target_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_loan public.library_loans; v_fine_id uuid;
begin
  select * into v_loan from public.library_loans where id=target_loan_id for update;
  if not found then raise exception 'Loan not found'; end if;
  if not private.has_permission(v_loan.school_id,'library.manage') then raise exception 'Permission denied' using errcode='42501'; end if;
  if v_loan.status not in ('active','overdue') then raise exception 'Loan is not returnable'; end if;
  update public.library_loans
  set returned_at=now(), received_by=auth.uid(), return_condition=target_return_condition,
      notes=concat_ws(E'\n',library_loans.notes,target_notes), status='returned', updated_at=now()
  where id=target_loan_id;
  update public.library_copies
  set circulation_status=case when target_return_condition in ('damaged','poor') then 'repair' else 'available' end,
      condition_status=target_return_condition, updated_at=now()
  where id=v_loan.library_copy_id;
  if coalesce(target_fine_amount,0)>0 then
    insert into public.library_fines(school_id,library_loan_id,student_id,employee_id,fine_type,amount,status,reason)
    values(v_loan.school_id,v_loan.id,v_loan.student_id,v_loan.employee_id,coalesce(target_fine_type,'late'),target_fine_amount,'outstanding',target_notes)
    returning id into v_fine_id;
  end if;
  return jsonb_build_object('loan_id',v_loan.id,'fine_id',v_fine_id,'status','returned');
end;
$$;

create or replace function public.record_stock_movement(
  target_school_id uuid,
  target_item_id uuid,
  source_location_id uuid,
  movement_type text,
  quantity numeric,
  unit_cost numeric default null,
  destination_location_id uuid default null,
  reference_type text default null,
  reference_id uuid default null,
  notes text default null,
  idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_source public.inventory_stock_balances;
  v_destination public.inventory_stock_balances;
  v_source_delta numeric := 0;
  v_destination_delta numeric := 0;
  v_out_id uuid;
  v_in_id uuid;
  v_new_avg numeric;
begin
  if not private.has_permission(target_school_id,'inventory.manage') then raise exception 'Permission denied' using errcode='42501'; end if;
  if quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if;
  if idempotency_key is not null and exists(select 1 from public.stock_movements sm where sm.school_id=target_school_id and sm.idempotency_key=record_stock_movement.idempotency_key) then
    return jsonb_build_object('idempotent',true,'movement_ids',(select jsonb_agg(id) from public.stock_movements sm where sm.school_id=target_school_id and sm.idempotency_key=record_stock_movement.idempotency_key));
  end if;

  insert into public.inventory_stock_balances(school_id,inventory_item_id,inventory_location_id)
  values(target_school_id,target_item_id,source_location_id)
  on conflict (inventory_item_id,inventory_location_id) do nothing;
  select * into v_source from public.inventory_stock_balances
   where inventory_item_id=target_item_id and inventory_location_id=source_location_id for update;

  if movement_type in ('receipt','adjustment_in','return_in','transfer_in') then
    v_source_delta := quantity;
  elsif movement_type in ('issue','adjustment_out','return_out','write_off','transfer_out') then
    v_source_delta := -quantity;
  else raise exception 'Unsupported movement type'; end if;

  if v_source.quantity_on_hand + v_source_delta < 0 then raise exception 'Insufficient stock'; end if;
  if v_source_delta > 0 and unit_cost is not null then
    v_new_avg := case when v_source.quantity_on_hand + quantity = 0 then unit_cost
      else ((v_source.quantity_on_hand*v_source.average_cost)+(quantity*unit_cost))/(v_source.quantity_on_hand+quantity) end;
  else v_new_avg := v_source.average_cost; end if;

  update public.inventory_stock_balances
  set quantity_on_hand=quantity_on_hand+v_source_delta, average_cost=v_new_avg, updated_at=now()
  where inventory_item_id=target_item_id and inventory_location_id=source_location_id;
  insert into public.stock_movements(school_id,inventory_item_id,inventory_location_id,movement_type,quantity,unit_cost,reference_type,reference_id,performed_by,notes,idempotency_key)
  values(target_school_id,target_item_id,source_location_id,movement_type,quantity,unit_cost,reference_type,reference_id,auth.uid(),notes,idempotency_key)
  returning id into v_out_id;

  if destination_location_id is not null then
    if movement_type <> 'transfer_out' then raise exception 'A destination requires movement_type transfer_out'; end if;
    if destination_location_id = source_location_id then raise exception 'Source and destination locations must differ'; end if;
    insert into public.inventory_stock_balances(school_id,inventory_item_id,inventory_location_id)
    values(target_school_id,target_item_id,destination_location_id)
    on conflict (inventory_item_id,inventory_location_id) do nothing;
    select * into v_destination from public.inventory_stock_balances
      where inventory_item_id=target_item_id and inventory_location_id=destination_location_id for update;
    v_new_avg := case when v_destination.quantity_on_hand + quantity = 0 then coalesce(unit_cost,v_source.average_cost)
      else ((v_destination.quantity_on_hand*v_destination.average_cost)+(quantity*coalesce(unit_cost,v_source.average_cost)))/(v_destination.quantity_on_hand+quantity) end;
    update public.inventory_stock_balances
    set quantity_on_hand=quantity_on_hand+quantity, average_cost=v_new_avg, updated_at=now()
    where inventory_item_id=target_item_id and inventory_location_id=destination_location_id;
    insert into public.stock_movements(school_id,inventory_item_id,inventory_location_id,movement_type,quantity,unit_cost,reference_type,reference_id,performed_by,notes,idempotency_key)
    values(target_school_id,target_item_id,destination_location_id,'transfer_in',quantity,coalesce(unit_cost,v_source.average_cost),reference_type,reference_id,auth.uid(),notes,idempotency_key)
    returning id into v_in_id;
  end if;
  return jsonb_build_object('source_movement_id',v_out_id,'destination_movement_id',v_in_id);
end;
$$;

revoke all on function public.issue_library_item(uuid,uuid,uuid,timestamptz,text) from public, anon;
grant execute on function public.issue_library_item(uuid,uuid,uuid,timestamptz,text) to authenticated, service_role;

revoke all on function public.return_library_item(uuid,text,text,numeric,text) from public, anon;
grant execute on function public.return_library_item(uuid,text,text,numeric,text) to authenticated, service_role;

revoke all on function public.record_stock_movement(uuid,uuid,uuid,text,numeric,numeric,uuid,text,uuid,text,text) from public, anon;
grant execute on function public.record_stock_movement(uuid,uuid,uuid,text,numeric,numeric,uuid,text,uuid,text,text) to authenticated, service_role;
