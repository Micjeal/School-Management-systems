# Access-scope audit

This is the current security-refactor ledger. It distinguishes completed work from routes that still require domain-specific review. No migration was applied.

## Implemented contracts

| Area           | Route/helper                | Permission                   | School scope                      | Relationship / record scope                      | Projection                                        |
| -------------- | --------------------------- | ---------------------------- | --------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| Context        | `getUserContext`            | authenticated                | RPC-authorized active school only | active membership or platform role               | safe profile and membership fields                |
| Context        | `getAccessContext`          | optional required permission | trusted active school             | active membership roles                          | identity, role and permission codes               |
| Staff list     | `/app/staff`                | `staff.read`                 | active school, required           | school directory                                 | 25 rows, directory fields only                    |
| Staff detail   | `/app/staff/[employeeId]`   | `staff.read`                 | active school, required           | UUID and employee school equality                | HR-safe fields; no tax, SSN, payroll or contracts |
| Staff self     | `getMyEmployeeRecord`       | authenticated                | active school, required           | `people.user_id = auth user` and both school IDs | self-service fields only                          |
| Student list   | `/app/students`             | `students.read`              | active school, required           | school directory                                 | 25 safe directory rows                            |
| Student detail | `/app/students/[studentId]` | `students.read`              | active school, required           | UUID and student school equality, parent first   | explicit student and related projections          |

All listed reads use the authenticated server client, preserving RLS.

## Dynamic-route audit queue

The following routes existed at audit time and must not be treated as completed merely because RLS is present:

| Domain          | Routes                                                                             | Required follow-up                                                                |
| --------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Print           | `/print/invoice/[id]`, `/print/payslip/[id]`, `/print/report-card/[id]`            | validate UUID; owner school; finance/payroll/student-or-guardian relationship     |
| Academic        | admissions, assessments, attendance, timetable dynamic routes                      | parent-first authorization; teacher assignment scope                              |
| Finance         | invoice, payment, refund dynamic routes                                            | separate read/collect/refund checks; minimal finance projections                  |
| Files/messages  | file and conversation dynamic routes                                               | retain file ownership/grant and participant checks; verify every attachment chain |
| Platform        | school, membership-role and role-permission dynamic routes                         | platform permission plus selected-school/membership ownership checks              |
| Operations      | approvals, procurement orders, imports, integrations, webhooks, medical conditions | UUID validation, explicit projection and school/record ownership                  |
| Generic modules | `/app/modules/[moduleId]/[recordId]`                                               | replace generic authorization with per-module contracts                           |
| Payroll         | `/app/payroll/[runId]`                                                             | payroll permission, active-school equality, explicit projections                  |

## Role matrix

| Role family                           | Default data contract                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| Platform super/admin, platform mode   | aggregates and operational summaries only                                                |
| Platform super/admin, selected school | normal active-school contracts; no implicit sensitive-field expansion                    |
| Owner/admin/HR                        | school staff directory per `staff.read`; management per `staff.manage`; payroll separate |
| Principal/deputy/academic leadership  | safe staff directory and assigned academic data; no payroll identifiers                  |
| Finance roles                         | finance records per finance permissions; no general HR access                            |
| Payroll roles                         | payroll projections only in payroll workflows                                            |
| Teacher/class teacher                 | own employee record plus assignment-derived classes and students                         |
| Nurse/library/boarding/transport      | module relationships plus safe identity projections only                                 |
| Student                               | linked own student record only                                                           |
| Guardian                              | linked students only, further restricted by relationship visibility flags                |
| Ordinary staff                        | own employee record only unless separately permitted                                     |

## Known gaps and proposed database review

- Teacher-to-student, class-teacher, guardian visibility-flag and student-self helpers still need to be implemented against the exact live assignment/relationship schema.
- Remaining dynamic routes and server actions need the audit queue above completed.
- Existing RLS should be reviewed table by table for direct `school_id` or a documented ownership chain. Any policy changes must be proposed as a migration and reviewed before application.
- Sensitive access auditing needs a shared, value-redacting audit helper and corresponding RLS/RPC review.

## Batch 1 re-verification (2026-09-05)

No migration was applied. This pass is limited to critical authentication, privilege, tenant-scope, and broken-route verification.

| Audit item                                                                            | Classification                                       | Evidence / action                                                                                                                                      |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/login`, `/forgot-password`, `/reset-password`, `/change-password`, `/access-denied` | Already implemented; behavioral verification pending | All page routes exist.                                                                                                                                 |
| `/auth/callback`                                                                      | Broken, fixed in Batch 1                             | Rejected absolute and protocol-relative `next` targets to prevent an OAuth callback open redirect.                                                     |
| `admin-users` caller authentication                                                   | Broken, fixed in Batch 1                             | Replaced unverified JWT payload decoding with `supabase.auth.getUser(token)`.                                                                          |
| Existing-user onboarding                                                              | Broken, fixed in Batch 1                             | Removed the password reset side effect when an invited email already belongs to an Auth user.                                                          |
| Platform-role assignment                                                              | Broken, fixed in Batch 1                             | Platform roles now require the caller to hold `super_admin`; role codes are allowlisted.                                                               |
| Last active super administrator                                                       | Broken, fixed in Batch 1                             | Disabling an account now refuses to disable the final active `super_admin`.                                                                            |
| `platform-user-roles` generic module                                                  | Read only by design                                  | Configuration is `readOnly: true`, `platformOnly: true`; assignment remains in the controlled admin workflow.                                          |
| Student/staff list and detail reads                                                   | Already implemented                                  | Continue using the explicit projections and trusted active-school contracts listed above.                                                              |
| Remaining dynamic routes and actions                                                  | Batch 1 application review complete                  | Direct routes were inventoried for authentication, ID validation, tenant/record scope and minimal projections; live RLS verification remains separate. |
| Migration timestamps around `0034`-`0042`                                             | Locally reconciled                                   | These suffixes are clock minutes, not ordinal sequence numbers. Validators now require unique, increasing timestamps; linked staging verification remains pending. |

### Current validation blockers

- Static parsing and principal-route checks run. The former migration-gap failure was a validator defect: Supabase migration filenames use timestamps rather than contiguous counters.
- The generated database type file was missing the locally consumed `PublicTableName` helper export; Batch 1 restored it without changing the generated schema shape.
- Full ESLint and local import/export verification pass.
- The unit suite is `10 passed, 1 failed`; the single failure is the confirmed migration gap (`expected 35, found 39`).
- Typecheck exceeded 90 seconds and build exceeded 120 seconds without producing diagnostics. Both remain unverified and must not be reported as passing.
- A read-only `supabase migration list --linked` attempt did not return before timeout. Local history and both available Git histories contain the same increasing timestamp set; no database write or migration application occurred.

### Additional Batch 1 fixes

- A `platform_admin` can no longer disable a `super_admin`; this requires another `super_admin`.
- Non-platform callers on the users page are locked to the trusted active school. Only platform administrators can select another school.
- School-role add/remove operations require `roles.assign`; membership status changes remain under `users.manage`.
- The final active `school_owner` membership cannot be deactivated or stripped of its owner role.
- Platform administrators can open an explicitly selected membership detail while ordinary administrators remain active-school scoped.
- Webhook detail/edit/actions enforce selected-school scope, use explicit endpoint projections, and no longer pass a server-only redirect handler to a client click.
- The webhook test server action now consumes the submitted `FormData` contract correctly.
- The remaining lint blockers were resolved without changing their feature behavior.

## Batch 2 re-verification (2026-09-06)

No migration was applied and no Edge Function was deployed.

| Area                      | Classification                       | Evidence / action                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integration providers     | Intentionally unavailable            | The worker has no provider adapters and `loadCredentials` always returns `null`; the incorrectly enabled example provider is now marked unavailable.                                                                                                                 |
| Integration actions       | Broken, fixed                        | Unavailable providers cannot be activated, tested, reconnected, synchronized or retried. Existing connections may still be inspected, disabled, or deleted by an authorized super administrator.                                                                     |
| Integration action forms  | Broken, fixed                        | Replaced POSTs to nonexistent action URLs with actual server-action bindings.                                                                                                                                                                                        |
| Integration worker status | Broken, fixed                        | The UI no longer treats source-file presence as processing capability. Availability remains false until adapter and credential contracts exist.                                                                                                                      |
| Portal unread messages    | Partially implemented, completed     | Counts are limited to active conversation membership and the active school, exclude deleted and self-authored messages, include system-authored messages, and use concurrent exact-count queries without fetching message bodies.                                    |
| Generic browser uploader  | Unsafe placeholder, disabled         | Removed browser-controlled bucket/path selection and direct Storage upload behavior. The component now clearly reports that uploads are unavailable.                                                                                                                 |
| Authorized domain uploads | Needs architecture/database decision | Metadata tables exist for specific domains, but no `storage.objects` policies are present in repository migrations and there is no generic user-upload metadata table. Enable only after choosing a domain workflow and reviewing matching private Storage policies. |

### Upload enablement requirements

Before enabling any upload UI, add and review a migration that creates or verifies the private bucket and authorizes `storage.objects` INSERT/SELECT/UPDATE/DELETE through the owning domain relationship. The server must derive the school, bucket, path and metadata foreign keys; validate MIME, extension and size; create metadata; roll back orphaned objects on failure; and audit the result. The unresolved migration sequence gaps must be reconciled before assigning that migration a permanent version.

## Batches 3-7 completion pass (2026-09-06)

No migration was applied and no Edge Function was deployed.

| Batch | Result | Evidence / boundary |
| --- | --- | --- |
| 3: controlled editing | Completed in application code | Student and school editing were already controlled. Staff identity/employment editing and draft-only assessment metadata editing now enforce permission, active-school ownership, allowed values, and record state. Generic reference modules retain server-derived school scope. |
| 4: finance and procurement states | Completed in application code | Invoice posting, refund decision/processing, purchase-order transitions, and goods receipt creation now validate current state before calling the database workflow. The UI exposes only applicable order actions. |
| 5: loading and errors | Completed in application code | Students, staff, assessments, finance, procurement, generic modules, and platform routes now have route-level loading UI and recoverable client error boundaries through shared accessible components. |
| 6: module consistency | Completed in application code | Read-only modules are visibly labelled; custom versus generic workflow routing is documented; generic destructive deletion is removed because reversals/deletions require domain-specific state and audit rules. |
| 7: workers and exports | Completed in application code | Notification and webhook workers are service-only, atomically claim eligible jobs, use explicit projections, and return redacted failures. Report exports use allowlisted tables and columns, verify requester membership, claim queued jobs, and no longer return storage paths. |

### Completion verification

- ESLint passes with zero warnings.
- Local import/export verification passes for 282 source files.
- Unit tests pass except the pre-existing migration-contiguity test: `16 passed, 1 failed` across the full current suite.
- Static verification's false migration-gap rule was corrected to validate unique, increasing timestamps.
- TypeScript now completes and reports existing repository-wide errors, primarily generated database types that do not include the unapplied tables/RPCs plus earlier application typing issues. No error was reported for the Batch 3-7 files in a filtered check.
- Runtime database, Storage, scheduled worker, and provider delivery tests remain pending because this checkout is not authorized to apply migrations or deploy functions.
