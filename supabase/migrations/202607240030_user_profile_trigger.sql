-- Handle new user profile creation from Supabase Auth
-- Sets must_change_password flag when user is created with that metadata

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    is_active,
    must_change_password,
    metadata
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    true,
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false),
    jsonb_build_object(
      'invited_by', new.raw_user_meta_data->>'invited_by',
      'school_id', new.raw_user_meta_data->>'school_id'
    )
  );
  return new;
end;
$$;

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
