-- Allow platform administrators to read all schools and roles
-- while preserving tenant isolation for ordinary users

begin;

-- Update schools_select policy to allow platform admins to read all schools
drop policy if exists schools_select on public.schools;

create policy schools_select
on public.schools
for select
to authenticated
using (
  private.is_platform_admin()
  or private.is_school_member(id)
);

-- Update roles_read policy to allow platform admins to read all roles
drop policy if exists roles_read on public.roles;

create policy roles_read
on public.roles
for select
to authenticated
using (
  school_id is null
  or private.is_platform_admin()
  or private.is_school_member(school_id)
);

-- Update memberships_read policy to allow platform admins to read all memberships
drop policy if exists memberships_read on public.school_memberships;

create policy memberships_read
on public.school_memberships
for select
to authenticated
using (
  private.is_platform_admin()
  or user_id = auth.uid()
  or private.has_permission(school_id, 'users.read')
);

commit;

notify pgrst, 'reload schema';
