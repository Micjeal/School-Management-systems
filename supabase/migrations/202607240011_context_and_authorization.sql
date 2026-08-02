-- SchoolDB application workflows: generated from 202607240001_app_transactional_workflows.sql

create or replace function public.can(target_school_id uuid, permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select private.has_permission(target_school_id, permission_code);
$$;

create or replace function public.get_my_context(target_school_id uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_school_id uuid := target_school_id;
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if v_school_id is not null
     and not private.is_platform_admin()
     and not exists (
       select 1 from public.school_memberships sm
       where sm.user_id = v_user_id
         and sm.school_id = v_school_id
         and sm.status = 'active'
     ) then
    raise exception 'School access denied' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'user_id', v_user_id,
    'profile', coalesce((select to_jsonb(p) from public.profiles p where p.id = v_user_id), '{}'::jsonb),
    'is_platform_admin', private.is_platform_admin(),
    'platform_roles', coalesce((
      select jsonb_agg(jsonb_build_object('id', r.id, 'code', r.code, 'name', r.name) order by r.name)
      from public.platform_user_roles pur
      join public.roles r on r.id = pur.role_id
      where pur.user_id = v_user_id
    ), '[]'::jsonb),
    'memberships', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'membership_id', sm.id,
          'school_id', sm.school_id,
          'school_name', s.name,
          'school_slug', s.slug,
          'school_status', s.status,
          'subscription_status', s.subscription_status,
          'campus_id', sm.campus_id,
          'status', sm.status,
          'roles', coalesce((
            select jsonb_agg(jsonb_build_object('id', r.id, 'code', r.code, 'name', r.name) order by r.name)
            from public.membership_roles mr
            join public.roles r on r.id = mr.role_id
            where mr.membership_id = sm.id
              and (mr.expires_at is null or mr.expires_at > now())
          ), '[]'::jsonb)
        ) order by s.name
      )
      from public.school_memberships sm
      join public.schools s on s.id = sm.school_id
      where sm.user_id = v_user_id and sm.status = 'active'
    ), '[]'::jsonb),
    'active_school', case when v_school_id is null then null else (
      select to_jsonb(s) from public.schools s where s.id = v_school_id
    ) end,
    'permissions', case when v_school_id is null then '[]'::jsonb else coalesce((
      select jsonb_agg(distinct p.code order by p.code)
      from public.school_memberships sm
      join public.membership_roles mr on mr.membership_id = sm.id
      join public.role_permissions rp on rp.role_id = mr.role_id
      join public.permissions p on p.id = rp.permission_id
      where sm.user_id = v_user_id
        and sm.school_id = v_school_id
        and sm.status = 'active'
        and (mr.expires_at is null or mr.expires_at > now())
    ), '[]'::jsonb) end,
    'features', case when v_school_id is null then '[]'::jsonb else coalesce((
      select jsonb_agg(jsonb_build_object('code', f.feature_code, 'enabled', f.is_enabled, 'config', f.config) order by f.feature_code)
      from public.school_feature_flags f where f.school_id = v_school_id
    ), '[]'::jsonb) end
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.can(uuid,text) from public, anon;
grant execute on function public.can(uuid,text) to authenticated, service_role;

revoke all on function public.get_my_context(uuid) from public, anon;
grant execute on function public.get_my_context(uuid) to authenticated, service_role;
