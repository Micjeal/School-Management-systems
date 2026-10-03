-- Reconciles the account/person linking contract already applied remotely.
create or replace function public.link_person_to_user(
  target_school_id uuid,
  target_person_id uuid,
  target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_existing_user_id uuid;
begin
  if auth.role() <> 'service_role'
     and not private.is_platform_admin()
     and not private.has_permission(target_school_id, 'users.manage') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles p where p.id = target_user_id) then
    raise exception 'Target user profile does not exist';
  end if;

  if not exists (
    select 1 from public.school_memberships sm
    where sm.school_id = target_school_id and sm.user_id = target_user_id
      and sm.status = 'active' and (sm.ended_at is null or sm.ended_at > now())
  ) then
    raise exception 'Target user is not an active member of the school' using errcode = '42501';
  end if;

  select p.user_id into v_existing_user_id
  from public.people p
  where p.school_id = target_school_id and p.id = target_person_id
  for update;

  if not found then raise exception 'Person not found'; end if;
  if v_existing_user_id is not null and v_existing_user_id <> target_user_id then
    raise exception 'Person is already linked to another user' using errcode = '23505';
  end if;
  if exists (
    select 1 from public.people p
    where p.school_id = target_school_id and p.user_id = target_user_id and p.id <> target_person_id
  ) then
    raise exception 'User is already linked to another person in this school' using errcode = '23505';
  end if;

  update public.people set user_id = target_user_id, updated_at = now()
  where school_id = target_school_id and id = target_person_id;
  return jsonb_build_object('school_id', target_school_id, 'person_id', target_person_id,
    'user_id', target_user_id, 'linked', true);
end;
$$;

revoke all on function public.link_person_to_user(uuid, uuid, uuid) from public, anon;
grant execute on function public.link_person_to_user(uuid, uuid, uuid) to authenticated, service_role;

create or replace function private.protect_profile_password_change_flag()
returns trigger language plpgsql
set search_path = public, private, pg_temp
as $$
begin
  if new.must_change_password is distinct from old.must_change_password
     and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'must_change_password can only be changed through the approved password-change flow'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_password_change_flag on public.profiles;
create trigger protect_profile_password_change_flag before update on public.profiles
for each row execute function private.protect_profile_password_change_flag();

drop function if exists public.complete_first_login_password_change();
