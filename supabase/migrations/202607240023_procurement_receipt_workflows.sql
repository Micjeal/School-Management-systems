create or replace function public.create_purchase_order_with_items(
  target_school_id uuid,
  order_data jsonb,
  lines jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_order public.purchase_orders;
  v_line jsonb;
  v_subtotal numeric := 0;
  v_tax numeric := 0;
  v_quantity numeric;
  v_unit_price numeric;
  v_line_tax numeric;
begin
  if not private.has_permission(target_school_id,'inventory.manage') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if jsonb_typeof(lines) <> 'array' or jsonb_array_length(lines) = 0 then
    raise exception 'At least one purchase-order item is required';
  end if;
  if not exists (
    select 1 from public.suppliers
    where id=(order_data->>'supplier_id')::uuid and school_id=target_school_id and status='active'
  ) then
    raise exception 'Active supplier not found';
  end if;

  for v_line in select value from jsonb_array_elements(lines)
  loop
    v_quantity := coalesce((v_line->>'quantity')::numeric,0);
    v_unit_price := coalesce((v_line->>'unit_price')::numeric,0);
    v_line_tax := coalesce((v_line->>'tax_amount')::numeric,0);
    if v_quantity <= 0 or v_unit_price < 0 or v_line_tax < 0 then
      raise exception 'Purchase-order quantities and prices are invalid';
    end if;
    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
    v_tax := v_tax + v_line_tax;
  end loop;

  insert into public.purchase_orders(
    school_id, purchase_order_number, supplier_id, purchase_request_id,
    order_date, expected_delivery_date, currency_code, subtotal, tax_amount,
    total_amount, status, notes
  ) values (
    target_school_id,
    coalesce(nullif(trim(order_data->>'purchase_order_number'),''), 'PO-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS')),
    (order_data->>'supplier_id')::uuid,
    nullif(order_data->>'purchase_request_id','')::uuid,
    coalesce(nullif(order_data->>'order_date','')::date,current_date),
    nullif(order_data->>'expected_delivery_date','')::date,
    coalesce(nullif(order_data->>'currency_code',''),'UGX')::char(3),
    round(v_subtotal,2), round(v_tax,2), round(v_subtotal+v_tax,2),
    'draft', nullif(trim(order_data->>'notes'),'')
  ) returning * into v_order;

  for v_line in select value from jsonb_array_elements(lines)
  loop
    insert into public.purchase_order_items(
      school_id, purchase_order_id, inventory_item_id, description,
      quantity, unit_price, tax_amount
    ) values (
      target_school_id, v_order.id, nullif(v_line->>'inventory_item_id','')::uuid,
      coalesce(nullif(trim(v_line->>'description'),''),'Purchase item'),
      (v_line->>'quantity')::numeric, (v_line->>'unit_price')::numeric,
      coalesce((v_line->>'tax_amount')::numeric,0)
    );
  end loop;

  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(target_school_id,'purchase_order',v_order.id,'procurement.purchase_order.created',jsonb_build_object('purchase_order_id',v_order.id,'total_amount',v_order.total_amount));

  return jsonb_build_object('purchase_order_id',v_order.id,'status',v_order.status,'total_amount',v_order.total_amount);
end;
$$;

create or replace function public.set_purchase_order_status(
  target_purchase_order_id uuid,
  target_status text
)
returns public.purchase_orders
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_order public.purchase_orders;
begin
  select * into v_order from public.purchase_orders where id=target_purchase_order_id for update;
  if not found then raise exception 'Purchase order not found'; end if;
  if not private.has_permission(v_order.school_id,'inventory.manage') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if target_status not in ('draft','approved','sent','cancelled','closed') then
    raise exception 'Unsupported purchase-order status';
  end if;
  if v_order.status in ('received','closed','cancelled') and target_status <> v_order.status then
    raise exception 'Finalized purchase order cannot be reopened';
  end if;
  update public.purchase_orders
  set status=target_status,
      approved_by=case when target_status='approved' then auth.uid() else approved_by end,
      approved_at=case when target_status='approved' then now() else approved_at end,
      sent_at=case when target_status='sent' then now() else sent_at end,
      updated_at=now()
  where id=v_order.id
  returning * into v_order;
  return v_order;
end;
$$;

create or replace function public.post_goods_receipt(target_goods_receipt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_receipt public.goods_receipts;
  v_order public.purchase_orders;
  v_item record;
  v_remaining numeric;
  v_stocked integer := 0;
  v_total integer := 0;
begin
  select * into v_receipt from public.goods_receipts where id=target_goods_receipt_id for update;
  if not found then raise exception 'Goods receipt not found'; end if;
  if not private.has_permission(v_receipt.school_id,'inventory.manage') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if v_receipt.status <> 'draft' then
    raise exception 'Only draft goods receipts can be posted';
  end if;
  select * into v_order from public.purchase_orders where id=v_receipt.purchase_order_id and school_id=v_receipt.school_id for update;
  if not found then raise exception 'Purchase order not found'; end if;
  if v_order.status not in ('approved','sent','partially_received') then
    raise exception 'Purchase order must be approved or sent before receipt';
  end if;
  if not exists(select 1 from public.goods_receipt_items where goods_receipt_id=v_receipt.id) then
    raise exception 'Goods receipt has no items';
  end if;

  for v_item in
    select
      gri.purchase_order_item_id,
      gri.inventory_item_id,
      sum(case when gri.condition_status in ('accepted','partial') then gri.quantity_received else 0 end) as accepted_quantity,
      sum(gri.quantity_received) as recorded_quantity,
      case when sum(case when gri.condition_status in ('accepted','partial') then gri.quantity_received else 0 end) > 0
        then sum(case when gri.condition_status in ('accepted','partial') then gri.quantity_received*gri.unit_cost else 0 end)
             / sum(case when gri.condition_status in ('accepted','partial') then gri.quantity_received else 0 end)
        else 0 end as average_cost
    from public.goods_receipt_items gri
    where gri.goods_receipt_id=v_receipt.id
    group by gri.purchase_order_item_id,gri.inventory_item_id
  loop
    select poi.quantity-poi.received_quantity into v_remaining
    from public.purchase_order_items poi
    where poi.id=v_item.purchase_order_item_id and poi.purchase_order_id=v_order.id and poi.school_id=v_order.school_id
    for update;
    if not found then raise exception 'Receipt item does not belong to purchase order'; end if;
    if v_item.recorded_quantity > v_remaining then
      raise exception 'Receipt quantity exceeds remaining purchase-order quantity';
    end if;
    v_total := v_total + 1;
    if v_item.accepted_quantity > 0 then
      perform public.record_stock_movement(
        v_receipt.school_id,
        v_item.inventory_item_id,
        v_receipt.inventory_location_id,
        'receipt',
        v_item.accepted_quantity,
        v_item.average_cost,
        null,
        'goods_receipt',
        v_receipt.id,
        coalesce(v_receipt.notes,'Goods receipt '||v_receipt.goods_receipt_number),
        'goods-receipt:'||v_receipt.id::text||':'||v_item.purchase_order_item_id::text
      );
      update public.purchase_order_items
      set received_quantity=received_quantity+v_item.accepted_quantity,updated_at=now()
      where id=v_item.purchase_order_item_id;
      v_stocked := v_stocked + 1;
    end if;
  end loop;

  update public.goods_receipts set status='posted',updated_at=now() where id=v_receipt.id;
  update public.purchase_orders po
  set status=case
    when not exists(select 1 from public.purchase_order_items poi where poi.purchase_order_id=po.id and poi.received_quantity<poi.quantity) then 'received'
    when exists(select 1 from public.purchase_order_items poi where poi.purchase_order_id=po.id and poi.received_quantity>0) then 'partially_received'
    else po.status end,
    updated_at=now()
  where po.id=v_order.id
  returning * into v_order;

  insert into public.outbox_events(school_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_receipt.school_id,'goods_receipt',v_receipt.id,'procurement.goods_receipt.posted',jsonb_build_object('goods_receipt_id',v_receipt.id,'purchase_order_id',v_order.id,'purchase_order_status',v_order.status));

  return jsonb_build_object('goods_receipt_id',v_receipt.id,'items_recorded',v_total,'items_stocked',v_stocked,'purchase_order_status',v_order.status);
end;
$$;

create or replace function public.create_goods_receipt_with_items(
  target_school_id uuid,
  receipt_data jsonb,
  lines jsonb,
  post_now boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_receipt public.goods_receipts;
  v_line jsonb;
  v_result jsonb;
begin
  if not private.has_permission(target_school_id,'inventory.manage') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if jsonb_typeof(lines) <> 'array' or jsonb_array_length(lines)=0 then
    raise exception 'At least one receipt item is required';
  end if;
  insert into public.goods_receipts(
    school_id,goods_receipt_number,purchase_order_id,inventory_location_id,
    delivery_note_number,received_at,received_by,status,notes
  ) values (
    target_school_id,
    coalesce(nullif(trim(receipt_data->>'goods_receipt_number'),''),'GRN-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS')),
    (receipt_data->>'purchase_order_id')::uuid,
    (receipt_data->>'inventory_location_id')::uuid,
    nullif(trim(receipt_data->>'delivery_note_number'),''),
    coalesce(nullif(receipt_data->>'received_at','')::timestamptz,now()),
    auth.uid(),'draft',nullif(trim(receipt_data->>'notes'),'')
  ) returning * into v_receipt;

  for v_line in select value from jsonb_array_elements(lines)
  loop
    insert into public.goods_receipt_items(
      school_id,goods_receipt_id,purchase_order_item_id,inventory_item_id,
      quantity_received,unit_cost,condition_status,rejection_reason
    ) values (
      target_school_id,v_receipt.id,(v_line->>'purchase_order_item_id')::uuid,
      (v_line->>'inventory_item_id')::uuid,(v_line->>'quantity_received')::numeric,
      (v_line->>'unit_cost')::numeric,coalesce(nullif(v_line->>'condition_status',''),'accepted'),
      nullif(trim(v_line->>'rejection_reason'),'')
    );
  end loop;

  if post_now then
    v_result := public.post_goods_receipt(v_receipt.id);
  else
    v_result := jsonb_build_object('goods_receipt_id',v_receipt.id,'status','draft');
  end if;
  return v_result;
end;
$$;

revoke all on function public.create_purchase_order_with_items(uuid,jsonb,jsonb) from public, anon;
revoke all on function public.set_purchase_order_status(uuid,text) from public, anon;
revoke all on function public.post_goods_receipt(uuid) from public, anon;
revoke all on function public.create_goods_receipt_with_items(uuid,jsonb,jsonb,boolean) from public, anon;
grant execute on function public.create_purchase_order_with_items(uuid,jsonb,jsonb) to authenticated, service_role;
grant execute on function public.set_purchase_order_status(uuid,text) to authenticated, service_role;
grant execute on function public.post_goods_receipt(uuid) to authenticated, service_role;
grant execute on function public.create_goods_receipt_with_items(uuid,jsonb,jsonb,boolean) to authenticated, service_role;
