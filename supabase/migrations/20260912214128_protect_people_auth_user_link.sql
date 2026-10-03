create or replace function private.protect_people_user_link()
returns trigger language plpgsql
set search_path = public, private, pg_temp
as $$
begin
  if (tg_op = 'INSERT' and new.user_id is not null)
     or (tg_op = 'UPDATE' and new.user_id is distinct from old.user_id) then
    if current_user in ('postgres', 'supabase_admin') then return new; end if;
    if auth.role() <> 'service_role'
       and not private.is_platform_admin()
       and not private.has_permission(new.school_id, 'users.manage') then
      raise exception 'Linking a person to an Auth user requires users.manage' using errcode = '42501';
    end if;
    if new.user_id is not null then
      if not exists (select 1 from public.profiles p where p.id = new.user_id) then
        raise exception 'Target user profile does not exist';
      end if;
      if not exists (
        select 1 from public.school_memberships sm
        where sm.school_id = new.school_id and sm.user_id = new.user_id
          and sm.status = 'active' and (sm.ended_at is null or sm.ended_at > now())
      ) then
        raise exception 'Target user is not an active member of the school' using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_people_user_link on public.people;
create trigger protect_people_user_link before insert or update of user_id on public.people
for each row execute function private.protect_people_user_link();
