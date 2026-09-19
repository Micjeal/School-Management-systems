# SchoolDB

SchoolDB is a multi-tenant school management system for operating one or more schools from a shared application. It combines student information, academics, finance, human resources, communication, school operations, reporting, integrations, and administration in one role- and permission-controlled workspace.

The application is built with Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth, Supabase PostgreSQL, Supabase Storage, and Supabase Edge Functions.

## What the system does

SchoolDB supports these areas:

- Platform administration: schools, campuses, users, memberships, roles, permissions, feature flags, integrations, audit, imports, and exports.
- Student information: admissions, people, students, guardians, documents, enrolments, transfers, and student-linked accounts.
- Academics: academic years, terms, grade levels, departments, subjects, classes, sections, teacher assignments, timetables, attendance, assessments, marks, grading, results, publication, and report cards.
- Finance: chart of accounts, fee structures, invoices, payments, allocations, receipts, refunds, journals, bank accounts, transactions, and reports.
- HR and payroll: employees, assignments, contracts, qualifications, appraisals, leave, payroll components, payroll periods, payroll runs, entries, and payslips.
- Communication: announcements, notifications, conversations, message delivery, templates, outbox events, and webhook deliveries.
- Operations: library, transport, boarding, health, counselling, discipline, procurement, inventory, stock movements, assets, approvals, and scheduled jobs.
- Portals: role-specific workspaces for platform staff, school employees, guardians, and students.
- Files and printing: private school/personal files, audit activity, invoices, report cards, and payslips.

The module registry currently defines 139 module screens. The authoritative module-by-module list is in [`docs/MODULE_COVERAGE.md`](docs/MODULE_COVERAGE.md).

## System overview

```text
Browser
  |
  | HTTPS, Supabase session cookies
  v
Next.js App Router
  |-- Server Components: protected pages and reads
  |-- Server Actions: validated authenticated mutations
  |-- Route Handlers: auth callback and health endpoint
  |-- Proxy: session refresh and forced-password routing
  |-- Shared module engine: configuration/master-data screens
  |-- Dedicated workflows: admissions, attendance, finance, payroll, etc.
  |
  v
Supabase
  |-- Auth: users, sessions, password recovery, password changes
  |-- PostgreSQL: shared-schema tenant data, RLS, RPC workflows, audit data
  |-- Storage: private files and controlled downloads
  |-- Edge Functions: privileged administration and asynchronous workers
```

## How a request is authorized

SchoolDB uses a shared database schema. A school is the tenant root and tenant-owned rows contain `school_id`.

For a protected request, the normal flow is:

1. The browser sends its Supabase SSR session cookies.
2. The Next.js proxy refreshes the session when needed and prevents inactive or forced-password users from entering normal application routes.
3. The server resolves the signed-in user and calls the `get_my_context` database function for profile, platform role, school memberships, active school, roles, permissions, and enabled features.
4. The page or Server Action checks the required permission and the active school scope.
5. Direct table reads and writes are still constrained by PostgreSQL Row Level Security (RLS).
6. Transactional operations call PostgreSQL workflow functions that repeat permission checks inside the database.

The UI hides unavailable navigation and actions for usability, but UI visibility is never the security boundary. Server-side checks, RPC checks, and RLS must all agree. See [`docs/AUTHORIZATION.md`](docs/AUTHORIZATION.md) and [`docs/access-scope-audit.md`](docs/access-scope-audit.md).

## Tenancy and school switching

The system supports platform-wide users and users who belong to one or more schools. The active school is resolved from trusted membership/context data, not from an untrusted browser value alone.

- Platform administrators can work with platform-level administration and authorized school scopes.
- School users operate within their authorized school and campus context.
- A user can switch among schools only when the context resolver confirms membership and permission.
- Every tenant query and mutation must preserve the active `school_id` boundary.
- Guardians and students receive relationship-limited portal data rather than general school administration access.
- Sensitive health and counselling data has stricter authorization requirements.

## Authentication and password flows

Authentication is handled by Supabase Auth. SchoolDB does not create a password table, store password hashes, store OTPs, or manually modify `auth.users.encrypted_password`.

### Sign-in and first login

1. The user signs in at `/login`.
2. The server reads the profile status.
3. Disabled users are rejected from protected routes.
4. Users with `profiles.must_change_password = true` are sent to `/auth/change-password`.
5. The password action uses Supabase Auth `updateUser({ password })`.
6. The existing database trigger clears the first-login flag after the Auth password changes successfully.

### Password recovery

The normal recovery experience is an in-app verification-code flow:

```text
/login
  -> /forgot-password
  -> Supabase recovery email containing {{ .Token }}
  -> /forgot-password/verify
  -> verifyOtp({ type: "recovery" })
  -> /auth/change-password?recovery=1
  -> Supabase Auth password update
  -> recovery session sign-out
  -> /login
```

Known and unknown email addresses receive the same generic response. The application does not query account existence to construct that response. Recovery uses `getUser()` after OTP verification and does not change roles, memberships, school links, or profile relationships. Configuration and live acceptance requirements are documented in [`docs/auth-password-recovery.md`](docs/auth-password-recovery.md).

## Roles and permissions

Roles are templates for assigning permission codes; they are not the final authorization rule by themselves. Effective access is derived from the user, platform role, school membership, assigned roles, permissions, active school, and enabled features.

Common personas include:

| Persona                    | Typical responsibility                                                    |
| -------------------------- | ------------------------------------------------------------------------- |
| Platform administrator     | Tenant creation, platform users, roles, features, integrations, and audit |
| School administrator/owner | School setup, memberships, academic and operational oversight             |
| Admissions officer         | Applications, decisions, documents, and enrolment conversion              |
| Registrar                  | Students, guardians, enrolments, transfers, and status changes            |
| Teacher                    | Classes, attendance, assessments, marks, results, and timetable           |
| Accountant                 | Fees, invoices, payments, receipts, reconciliation, and reports           |
| HR/payroll officer         | Staff, contracts, leave, payroll configuration, runs, and payslips        |
| Librarian                  | Catalogue, copies, circulation, reservations, and fines                   |
| Nurse                      | Medical profiles, conditions, clinic visits, and medication               |
| Transport manager          | Vehicles, routes, stops, assignments, trips, and trip attendance          |
| Boarding manager           | Hostels, dormitories, beds, assignments, and roll call                    |
| Guardian                   | Linked children, attendance, published results, invoices, and messages    |
| Student                    | Timetable, attendance, published results, library, and announcements      |

Example permission codes include `students.create`, `attendance.record`, `results.publish`, `finance.collect`, `payroll.process`, `library.manage`, `inventory.manage`, `reports.read`, and `settings.manage`.

## Data and workflow model

Simple configuration and master-data screens use the shared module engine. The registry in [`src/config/modules.ts`](src/config/modules.ts) defines the table, fields, columns, relationships, scope, read-only status, permissions, and optional workflow entry point.

High-risk or multi-record operations use dedicated pages and database workflows. This keeps related changes atomic and prevents partial records. Examples include:

- admitting a student and creating person, student, and enrolment records;
- onboarding an employee and creating person, employee, assignment, and contract records;
- initializing and locking attendance sessions;
- saving marks, calculating results, moderating, publishing, and withdrawing results;
- creating invoices with lines and posting balanced finance entries;
- allocating payments and posting balanced journals;
- issuing/returning library items;
- receiving, issuing, adjusting, and transferring stock;
- calculating payroll runs.

Database workflow functions use fixed search paths, explicit permission checks, and restricted execution. They are not a replacement for RLS; they are an additional transactional boundary.

## Integrations, files, and workers

The repository contains these Edge Function applications:

- `admin-users`: server-side user invitation/account administration using the service-role key.
- `notification-worker`: notification delivery processing.
- `integration-worker`: integration event/outbox processing.
- `report-worker`: asynchronous report/export processing.
- `webhook-worker`: webhook delivery processing.

Edge Functions must verify JWTs where the function is user-facing, keep service-role secrets server-side, and receive provider credentials through function secrets. External email, SMS, WhatsApp, mobile-money, banking, and webhook providers still require real provider accounts, credentials, callback URLs, and provider-specific acceptance tests.

Files are accessed through server-authorized paths and private storage policies. Do not expose private storage buckets or create public download URLs for sensitive school data.

## Repository layout

```text
src/app/                 Next.js routes, pages, Server Actions, callbacks, health
src/components/          Shared UI and feature components
src/config/modules.ts    Module registry and permission metadata
src/lib/auth/             Context, school scope, switching, access errors, safe redirects
src/lib/supabase/         Browser, server, proxy, admin, and private RPC clients
src/lib/files/            File validation, access, paths, downloads, and logging
src/lib/features/         Domain-specific queries, permissions, and types
src/types/                Database-generated and application context types
supabase/migrations/      Versioned schema, RLS, functions, triggers, and workflows
supabase/functions/       Edge Function workers and privileged administration
supabase/tests/            SQL-level RLS and anonymous-RPC checks
tests/                    Unit, static, import, page, recovery, and migration tests
e2e/                      Playwright login and multi-tenant browser tests
docs/                     Architecture, authorization, deployment, testing, and acceptance references
```

## Requirements

- Node.js 20.9 or newer; Node.js 22 is recommended for the current project setup.
- npm 10 or newer.
- Supabase CLI for database and Edge Function workflows.
- Access to a Supabase project containing the baseline schema migrations 001–010.

The package manager is pinned in `package.json` as npm 10.9.2. Commit and use the existing `package-lock.json` when installing dependencies.

## Local setup

1. Copy the environment template:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Set the environment values in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   # Service role key (optional, server-only, never commit real values)
   ```

   Only the first three values are public application configuration. The service-role key is optional for server-only administrative paths and must never use a `NEXT_PUBLIC_` prefix or be committed.

3. Install dependencies and generate database types when the target schema is available:

   ```powershell
   npm install
   npm run db:types
   ```

4. Start development:

   ```powershell
   npm run dev
   ```

   Open `http://localhost:3000`.

If PowerShell blocks `npm.ps1`, use `npm.cmd` for the same commands.

## Database setup and migration rules

The connected project currently has the baseline schema plus application migrations 011–022. Migrations 023–028 are present in this repository but are repository-only handoff migrations until they are reviewed and accepted for the target environment.

The application migrations depend on baseline migrations 001–010. They cannot be applied to an empty Supabase project without first restoring the baseline schema and private authorization helpers.

Before changing a target database:

1. Confirm the target project and environment.
2. Confirm baseline migrations 001–010 exist.
3. Review the pending migration SQL and its RLS/function/storage implications.
4. Validate pending work on a branch or approved staging project.
5. Run Supabase security advisors and the relevant SQL tests.
6. Apply migrations only with explicit release approval.

Typical CLI commands are:

```powershell
supabase --help
supabase link --project-ref your-project-ref
supabase db push
```

Do not apply migrations merely to make local documentation or source checks pass. See [`docs/DATABASE.md`](docs/DATABASE.md) and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Verification and testing

Run the complete automated gate with:

```powershell
npm run check
```

The individual checks are:

```powershell
npm run test:static     # static structure, routes, modules, migrations, functions, secret scan
npm run test:imports    # import and module-load validation
npm run lint            # ESLint with zero warnings allowed
npm run typecheck       # strict TypeScript compiler check
npm test                # Vitest suite
npm run build           # production Next.js build
npm run test:e2e        # Playwright browser smoke tests
```

The SQL checks in `supabase/tests/rls_isolation.sql` verify RLS enablement and anonymous RPC denial. Full tenant-isolation acceptance requires authenticated test users and representative data in at least two schools.

Automated tests and a successful build do not prove production readiness. Live acceptance must separately cover authentication, school switching, invitations, every role, two-school isolation, financial correctness, sensitive-data access, provider delivery, backups, performance, and rollback. Use [`docs/ACCEPTANCE_CHECKLIST.md`](docs/ACCEPTANCE_CHECKLIST.md), [`docs/TESTING.md`](docs/TESTING.md), and [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

## Deployment

SchoolDB can run on Vercel or another Node-compatible host.

1. Configure production environment variables and exact HTTPS site URLs.
2. Configure Supabase Auth redirect URLs for the deployed origin.
3. Configure the Reset Password email template with `{{ .Token }}` for the in-app OTP flow.
4. Configure approved SMTP/provider secrets in Supabase and Edge Function settings.
5. Review and apply only approved database migrations.
6. Deploy all five Edge Function applications with their required JWT and secret settings.
7. Run the automated gate and then the live acceptance checklist.

Example application build commands:

```powershell
npm install --no-audit --no-fund
npm run check
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the exact deployed HTTPS origin. Do not derive it from a request host, submitted form value, or arbitrary forwarded header. Do not use broad external redirect wildcards.

## Current status and boundaries

The repository includes the application implementation, source migrations, tests, documentation, and Edge Function source. The following remain environment-dependent and must be verified before production certification:

- live browser acceptance for representative users and all role paths;
- authenticated two-school RLS isolation tests with controlled seed data;
- production email, SMS, WhatsApp, payment, banking, and webhook provider tests;
- payroll policy configuration and applicable legal review;
- expected-school-size performance/load testing;
- backup restoration and rollback rehearsal;
- leaked-password protection in Supabase Auth;
- production verification of redirect URLs, SMTP, OTP expiry, and email templates.

Do not describe the system as production-certified solely because the source build or automated tests pass.

## Related documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — application and backend architecture.
- [`docs/AUTHORIZATION.md`](docs/AUTHORIZATION.md) — roles, permissions, RLS, RPC, and sensitive access.
- [`docs/DATABASE.md`](docs/DATABASE.md) — migration state and database workflows.
- [`docs/MODULE_COVERAGE.md`](docs/MODULE_COVERAGE.md) — complete module registry.
- [`docs/USER_ROLES.md`](docs/USER_ROLES.md) — role/persona reference.
- [`docs/auth-password-recovery.md`](docs/auth-password-recovery.md) — recovery configuration and acceptance.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deployment and rollback guidance.
- [`docs/TESTING.md`](docs/TESTING.md) — automated and database testing.
- [`docs/ACCEPTANCE_CHECKLIST.md`](docs/ACCEPTANCE_CHECKLIST.md) — live release checklist.
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) — implementation and outstanding acceptance status.

## License

This repository is private and has no open-source license declared.
