# Authorization

## Roles and permissions

SchoolDB supports platform roles, school memberships, membership roles and granular permission codes. Examples include `students.create`, `attendance.record`, `results.publish`, `finance.collect`, `payroll.process`, `library.manage` and `inventory.manage`.

## Enforcement

- Route protection is server-side.
- Navigation and buttons are filtered by effective permissions.
- Mutations call `requireUserContext(permission)`.
- Transaction RPCs call `private.has_permission`.
- RLS controls tenant row access.
- Privileged Auth operations run through a JWT-protected Edge Function using a server-side service-role key.

Frontend visibility is never treated as the sole security control.

## Sensitive modules

Health and counselling tables retain their stricter database policies. Finance posting and result publication use transactional functions. The browser never receives the service-role secret.

## Advisor notes

Supabase reports intentional warnings because authenticated users can execute `SECURITY DEFINER` functions. These functions are designed as controlled RPC boundaries: anonymous execution is revoked, permission checks are internal, and `search_path` is fixed. Leaked-password protection remains a project Auth setting that must be enabled in the Supabase dashboard.
