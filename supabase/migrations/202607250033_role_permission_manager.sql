-- Create RPC function for atomic role permission updates
create or replace function public.set_role_permissions(
  target_role_id uuid,
  target_permission_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_role public.roles%rowtype;
  v_permission_ids uuid[] :=
    coalesce(
      target_permission_ids,
      '{}'::uuid[]
    );
  v_count integer;
begin
  select *
  into v_role
  from public.roles
  where id = target_role_id
  for update;

  if not found then
    raise exception 'Role not found'
      using errcode = 'P0002';
  end if;

  if not v_role.is_active then
    raise exception 'Inactive roles cannot be modified'
      using errcode = '42501';
  end if;

  if v_role.school_id is null then
    if not private.is_platform_super_admin() then
      raise exception
        'Platform super administrator access is required'
        using errcode = '42501';
    end if;
  else
    if not private.has_permission(
      v_role.school_id,
      'roles.manage'
    ) then
      raise exception
        'The roles.manage permission is required'
        using errcode = '42501';
    end if;
  end if;

  if exists (
    select 1
    from unnest(v_permission_ids)
      as selected(permission_id)
    left join public.permissions p
      on p.id = selected.permission_id
    where p.id is null
  ) then
    raise exception 'One or more permissions are invalid'
      using errcode = '22023';
  end if;

  delete from public.role_permissions rp
  where rp.role_id = target_role_id
    and not (
      rp.permission_id =
      any(v_permission_ids)
    );

  insert into public.role_permissions (
    role_id,
    permission_id
  )
  select
    target_role_id,
    selected.permission_id
  from (
    select distinct
      unnest(v_permission_ids)
        as permission_id
  ) selected
  on conflict (
    role_id,
    permission_id
  ) do nothing;

  select count(*)
  into v_count
  from public.role_permissions
  where role_id = target_role_id;

  return jsonb_build_object(
    'role_id',
    target_role_id,
    'permission_count',
    v_count
  );
end;
$$;

grant execute
on function public.set_role_permissions(
  uuid,
  uuid[]
)
to authenticated;

-- Update role_permissions_read policy to allow platform admins to read school-specific roles
drop policy if exists
  role_permissions_read
on public.role_permissions;

create policy role_permissions_read
on public.role_permissions
for select
to authenticated
using (
  exists (
    select 1
    from public.roles r
    where r.id =
      role_permissions.role_id
      and (
        r.school_id is null
        or private.is_platform_admin()
        or private.is_school_member(
          r.school_id
        )
      )
  )
);
