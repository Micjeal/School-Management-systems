-- Align the stock RPC with the baseline stock_movements_apply trigger.
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
  v_out_id uuid;
  v_in_id uuid;
begin
  if not private.has_permission(target_school_id,'inventory.manage') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if;
  if movement_type not in ('receipt','issue','transfer_in','transfer_out','adjustment_in','adjustment_out','return_in','return_out','write_off') then
    raise exception 'Unsupported movement type';
  end if;

  if idempotency_key is not null and exists(
    select 1 from public.stock_movements sm
    where sm.school_id=target_school_id and sm.idempotency_key=record_stock_movement.idempotency_key
  ) then
    return jsonb_build_object(
      'idempotent', true,
      'movement_ids', (
        select jsonb_agg(id order by created_at)
        from public.stock_movements sm
        where sm.school_id=target_school_id
          and sm.idempotency_key in (record_stock_movement.idempotency_key, record_stock_movement.idempotency_key||':in')
      )
    );
  end if;

  insert into public.inventory_stock_balances(school_id,inventory_item_id,inventory_location_id)
  values(target_school_id,target_item_id,source_location_id)
  on conflict (inventory_item_id,inventory_location_id) do nothing;

  select * into v_source
  from public.inventory_stock_balances
  where inventory_item_id=target_item_id and inventory_location_id=source_location_id
  for update;

  if movement_type in ('issue','adjustment_out','return_out','write_off','transfer_out')
     and v_source.quantity_on_hand < quantity then
    raise exception 'Insufficient stock';
  end if;

  if destination_location_id is not null then
    if movement_type <> 'transfer_out' then
      raise exception 'A destination requires movement_type transfer_out';
    end if;
    if destination_location_id = source_location_id then
      raise exception 'Source and destination locations must differ';
    end if;
  elsif movement_type = 'transfer_out' then
    raise exception 'A transfer-out movement requires a destination location';
  end if;

  insert into public.stock_movements(
    school_id,inventory_item_id,inventory_location_id,movement_type,quantity,
    unit_cost,reference_type,reference_id,performed_by,notes,idempotency_key
  ) values (
    target_school_id,target_item_id,source_location_id,movement_type,quantity,
    unit_cost,reference_type,reference_id,auth.uid(),notes,idempotency_key
  ) returning id into v_out_id;

  if destination_location_id is not null then
    insert into public.stock_movements(
      school_id,inventory_item_id,inventory_location_id,movement_type,quantity,
      unit_cost,reference_type,reference_id,performed_by,notes,idempotency_key
    ) values (
      target_school_id,target_item_id,destination_location_id,'transfer_in',quantity,
      coalesce(unit_cost,v_source.average_cost),reference_type,reference_id,auth.uid(),notes,
      case when idempotency_key is null then null else idempotency_key||':in' end
    ) returning id into v_in_id;
  end if;

  return jsonb_build_object('source_movement_id',v_out_id,'destination_movement_id',v_in_id);
end;
$$;

revoke all on function public.record_stock_movement(uuid,uuid,uuid,text,numeric,numeric,uuid,text,uuid,text,text) from public, anon;
grant execute on function public.record_stock_movement(uuid,uuid,uuid,text,numeric,numeric,uuid,text,uuid,text,text) to authenticated, service_role;
