create or replace function private.handle_auth_password_changed()
returns trigger language plpgsql security definer
set search_path = public, auth, private, pg_temp
as $$
begin
  if old.encrypted_password is distinct from new.encrypted_password then
    update public.profiles set must_change_password = false, updated_at = now()
    where id = new.id and must_change_password = true;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_password_changed on auth.users;
create trigger on_auth_password_changed after update of encrypted_password on auth.users
for each row when (old.encrypted_password is distinct from new.encrypted_password)
execute function private.handle_auth_password_changed();
