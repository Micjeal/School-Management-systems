create or replace function private.can_decide_approval_step(
  target_school_id uuid,
  target_user_id uuid,
  target_role_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select auth.uid() is not null and (
    private.is_platform_admin()
    or target_user_id = auth.uid()
    or (
      target_role_id is not null
      and exists (
        select 1
        from public.school_memberships sm
        join public.membership_roles mr on mr.membership_id = sm.id
        where sm.school_id = target_school_id
          and sm.user_id = auth.uid()
          and sm.status = 'active'
          and mr.role_id = target_role_id
          and (mr.expires_at is null or mr.expires_at > now())
      )
    )
  );
$$;

create or replace function public.submit_approval_request(
  target_school_id uuid,
  target_request_type text,
  target_entity_type text,
  target_entity_id uuid,
  target_reason text,
  target_approvers jsonb,
  target_amount numeric default null,
  target_currency_code text default null,
  target_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_permission text;
  v_request_id uuid;
  v_approver jsonb;
  v_step integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not private.is_platform_admin() and not private.is_school_member(target_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if coalesce(trim(target_request_type),'') = ''
     or coalesce(trim(target_entity_type),'') = ''
     or target_entity_id is null then
    raise exception 'Request type, entity type and entity ID are required';
  end if;
  if jsonb_typeof(target_approvers) <> 'array' or jsonb_array_length(target_approvers) = 0 then
    raise exception 'At least one approver is required';
  end if;

  v_permission := case lower(target_request_type)
    when 'refund' then 'finance.refund'
    when 'payment_adjustment' then 'finance.adjust'
    when 'journal' then 'finance.adjust'
    when 'payroll' then 'payroll.process'
    when 'purchase_request' then 'inventory.manage'
    when 'purchase_order' then 'inventory.manage'
    when 'procurement' then 'inventory.manage'
    when 'leave' then 'staff.manage'
    when 'results' then 'results.publish'
    else 'settings.manage'
  end;
  if not private.is_platform_admin() and not private.has_permission(target_school_id, v_permission) then
    raise exception 'Permission denied for approval request type %', target_request_type using errcode = '42501';
  end if;

  insert into public.approval_requests(
    school_id, request_type, entity_type, entity_id, requested_by,
    amount, currency_code, reason, status, current_step, metadata
  ) values (
    target_school_id, lower(trim(target_request_type)), trim(target_entity_type),
    target_entity_id, auth.uid(), target_amount,
    nullif(trim(target_currency_code),'')::char(3), nullif(trim(target_reason),''),
    'pending', 1, coalesce(target_metadata,'{}'::jsonb)
  ) returning id into v_request_id;

  for v_approver in select value from jsonb_array_elements(target_approvers)
  loop
    v_step := v_step + 1;
    if nullif(v_approver->>'user_id','') is null
       and nullif(v_approver->>'role_id','') is null then
      raise exception 'Approval step % requires a user or role approver', v_step;
    end if;
    insert into public.approval_steps(
      school_id, approval_request_id, step_no, approver_user_id, approver_role_id
    ) values (
      target_school_id, v_request_id, v_step,
      nullif(v_approver->>'user_id','')::uuid,
      nullif(v_approver->>'role_id','')::uuid
    );
  end loop;

  return jsonb_build_object('approval_request_id',v_request_id,'steps',v_step,'status','pending');
end;
$$;

create or replace function public.get_my_pending_approvals(target_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, private, pg_temp
as $$
declare v_result jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if not private.is_platform_admin() and not private.is_school_member(target_school_id) then
    raise exception 'School access denied' using errcode='42501';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'request_id', ar.id,
    'step_id', ast.id,
    'request_type', ar.request_type,
    'entity_type', ar.entity_type,
    'entity_id', ar.entity_id,
    'amount', ar.amount,
    'currency_code', ar.currency_code,
    'reason', ar.reason,
    'submitted_at', ar.submitted_at,
    'requested_by', ar.requested_by,
    'current_step', ar.current_step,
    'step_no', ast.step_no,
    'approver_user_id', ast.approver_user_id,
    'approver_role_id', ast.approver_role_id,
    'metadata', ar.metadata
  ) order by ar.submitted_at), '[]'::jsonb)
  into v_result
  from public.approval_requests ar
  join public.approval_steps ast
    on ast.approval_request_id=ar.id
   and ast.school_id=ar.school_id
   and ast.step_no=ar.current_step
  where ar.school_id=target_school_id
    and ar.status='pending'
    and ast.decision is null
    and private.can_decide_approval_step(ar.school_id,ast.approver_user_id,ast.approver_role_id);

  return v_result;
end;
$$;

create or replace function public.decide_approval_step(
  target_step_id uuid,
  approve boolean,
  decision_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_step public.approval_steps;
  v_request public.approval_requests;
  v_next_step integer;
  v_final_status text;
begin
  select * into v_step from public.approval_steps where id=target_step_id for update;
  if not found then raise exception 'Approval step not found'; end if;
  select * into v_request from public.approval_requests where id=v_step.approval_request_id for update;
  if not found then raise exception 'Approval request not found'; end if;
  if v_request.status <> 'pending' then raise exception 'Approval request is no longer pending'; end if;
  if v_step.step_no <> v_request.current_step then raise exception 'Approval step is not current'; end if;
  if v_step.decision is not null then raise exception 'Approval step has already been decided'; end if;
  if not private.can_decide_approval_step(v_request.school_id,v_step.approver_user_id,v_step.approver_role_id) then
    raise exception 'You are not an approver for this step' using errcode='42501';
  end if;

  update public.approval_steps
  set decision=case when approve then 'approved' else 'rejected' end,
      decision_notes=nullif(trim(decision_note),''),
      decided_at=now()
  where id=v_step.id;

  if not approve then
    v_final_status := 'rejected';
    update public.approval_requests
    set status='rejected', completed_at=now(), updated_at=now()
    where id=v_request.id;
  else
    select min(step_no) into v_next_step
    from public.approval_steps
    where approval_request_id=v_request.id and step_no>v_step.step_no and decision is null;
    if v_next_step is null then
      v_final_status := 'approved';
      update public.approval_requests
      set status='approved', completed_at=now(), updated_at=now()
      where id=v_request.id;
    else
      v_final_status := 'pending';
      update public.approval_requests
      set current_step=v_next_step, updated_at=now()
      where id=v_request.id;
    end if;
  end if;

  return jsonb_build_object(
    'approval_request_id',v_request.id,
    'step_id',v_step.id,
    'decision',case when approve then 'approved' else 'rejected' end,
    'request_status',v_final_status,
    'next_step',v_next_step
  );
end;
$$;

revoke all on function public.submit_approval_request(uuid,text,text,uuid,text,jsonb,numeric,text,jsonb) from public, anon;
revoke all on function public.get_my_pending_approvals(uuid) from public, anon;
revoke all on function public.decide_approval_step(uuid,boolean,text) from public, anon;
grant execute on function public.submit_approval_request(uuid,text,text,uuid,text,jsonb,numeric,text,jsonb) to authenticated, service_role;
grant execute on function public.get_my_pending_approvals(uuid) to authenticated, service_role;
grant execute on function public.decide_approval_step(uuid,boolean,text) to authenticated, service_role;
