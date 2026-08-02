# Devin handoff prompt — complete SchoolDB

You are taking over an existing multi-tenant School Management SaaS repository. Continue the implementation; do not rebuild it from scratch unless a concrete defect requires a focused refactor.

## Repository and platform

- Application: SchoolDB
- Stack: Next.js App Router, React 19, TypeScript strict mode, Tailwind CSS 4, Supabase SSR, PostgreSQL RLS and Supabase Edge Functions
- Supabase project reference: `azeisrxigwbyrkquwbwe`
- Tenant root: `schools.id`; tenant-owned data is isolated by `school_id`
- Public database tables: 139
- Module registry: 139 unique governed screens, one for every public table
- Live migrations: baseline 001–010 plus application migrations 011–022
- Repository migrations 023–028: procurement/goods receipts, refunds, payroll posting, timetable conflicts, messaging and import processing; they are not deployed or smoke-tested yet
- Four Edge Functions: `admin-users`, `notification-worker`, `webhook-worker`, `report-worker`
- Initial feature benchmark: the Genius EduSoft school ERP reference supplied by the owner. Use it only as a feature-completeness reference; do not copy proprietary source code or visual assets.

## Work already completed

1. Supabase SSR authentication, callback, recovery, logout and forced password replacement.
2. Multi-school, campus, membership, role, permission and feature context.
3. Platform and school dashboards, tenant onboarding and user invitation controls.
4. Dedicated workflows for student admission/enrolment, employee onboarding, attendance, marks/moderation/results, invoices/payments/journals, payroll calculation, library circulation and stock movements.
5. Generic RLS-backed module interface for all 139 public tables, including composite-key, configurable sort-key, global-catalogue and read-only table support.
6. Atomic database RPCs with fixed search paths, permission checks and anonymous execution revoked.
7. Approval backend migration 022: submit requests, resolve a user's pending approvals and approve/reject the current step.
8. Print-oriented views already exist for some invoices, report cards and payslips.
9. Four JWT-protected Edge Functions and source for notification, webhook and report workers.
10. Static source parser, import/export verifier, Vitest sources, Playwright smoke sources, RLS SQL checks, CI configuration and deployment documentation.
11. Live transactional smoke testing previously covered school creation, student/staff onboarding, attendance, results, library, stock, invoicing, payments, balanced journals and payroll calculation. Test records were rolled back.
12. Live defects already corrected in migrations 017–021: report-card JSON shape, stock-transfer idempotency, stock-trigger double application, generated finance columns and journal posting sequence.

## Non-negotiable engineering rules

- Preserve multi-tenant isolation. Every server action, route handler, query and RPC must be tested for cross-school leakage.
- PostgreSQL RLS remains the final authorization boundary. UI hiding is not authorization.
- Never expose or commit the Supabase service-role key. It must remain server-only and must never use a `NEXT_PUBLIC_` variable.
- Do not edit applied migrations 001–022. Migrations 023–028 may be revised before their first deployment; once deployed they become immutable. Number all later migrations 029 and above.
- Use database RPCs for multi-record, financial, stock, approval, payroll and publication transitions. Do not implement these as multiple independent browser writes.
- Posted finance records must remain immutable except through audited reversal workflows.
- Do not leave TODOs, mocks, fake success states, dead buttons or generic CRUD as the final interface for high-risk workflows.
- Keep the existing App Router architecture, server actions, Supabase SSR clients, module registry and design language unless tests demonstrate a required change.
- Regenerate `src/types/database.generated.ts` after schema changes.
- Use a Supabase development branch for schema validation before production.

## Start-up sequence

1. Extract the repository and read `README.md`, `BUILD_SUMMARY.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/AUTHORIZATION.md`, `docs/VERIFICATION.md`, `docs/ACCEPTANCE_CHECKLIST.md` and `docs/MODULE_COVERAGE.md`.
2. Create `.env.local` from `.env.example`; do not commit it.
3. Install dependencies using Node 22 and npm 10.
4. Run:
   - `npm run test:static`
   - `npm run test:imports`
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
   - `npm run test:e2e`
5. Fix every real failure. Do not weaken TypeScript, ESLint, tests or authorization checks merely to make the build green.
6. Create a Supabase development branch, apply migrations 023–028 there, regenerate types and run database smoke tests before merging.

## Remaining implementation work, in priority order

### 1. Approval workflow UI and integration

Build a dedicated `/app/approvals` inbox backed by `get_my_pending_approvals` and `decide_approval_step`. Show request metadata, entity links, requester, amount, current step and history. Add approve/reject dialogs with required rejection notes. Integrate `submit_approval_request` into refund, payroll, purchase request/order, leave, journal and result-publication workflows. Ensure only the assigned user or active role holder can decide the current step.

### 2. Procurement and goods receipt completion

Review migration 023 for schema compatibility, idempotency and concurrency. Add dedicated purchase-order and goods-receipt pages with line editors, approval state, partial receipts, rejected/damaged quantities and printable documents. Posting a receipt must update purchase-order received quantities and inventory atomically and must reject over-receipt or negative/invalid quantities. Add rolled-back database smoke tests and Playwright coverage.

### 3. Refunds and finance reversals

Review and harden the repository-only refund RPCs in migration 024, then build the complete refund request, approval, processing and completion UI. Validate that refunds cannot exceed the posted payment's refundable balance. Reverse allocations and accounting entries using explicit reversal journals; never mutate posted historical lines. Add bank-reconciliation actions, student statements, ageing, receipts and printable invoice/payment documents. Add idempotency keys and audit/outbox events.

### 4. Full payroll lifecycle

Review and harden migration 025, then complete payroll review, approval, locking, posting to the ledger, payment state, cancellation/reversal and payslip generation. Define salary components, deductions, employer contributions and policy hooks without hardcoding Uganda statutory rates unless configured and legally reviewed. Restrict employee payslip access through RLS and portal context. Add balancing assertions and repeat-run idempotency tests.

### 5. Timetable conflict-safe editor

Review and harden migration 026, then create dedicated timetable version and entry screens. The backend must prevent overlapping class, room and teacher assignments for the same effective timetable. Support draft, publish, supersede and print views. Add tests for boundary times, term scope and concurrent changes.

### 6. Messaging and communications

Review and harden migration 027, then build conversation lists, threaded messages, members, read state, attachments and message composition using the existing conversation tables and private storage. Complete notification templates, queue processing, retries and status visibility. Maintain conversation-member authorization in both RLS and server actions.

### 7. Imports, exports and reports

Review and harden migration 028, then implement CSV/XLSX upload parsing, validation, preview, row-level errors, resumable processing and idempotent commits for students, staff, marks and finance opening balances. Complete export/report jobs and secure downloadable output files. Add report templates for report cards, transcripts, student IDs, invoices, receipts, statements and payslips.

### 8. Provider integrations

Configure and test real or sandbox providers for email, SMS, WhatsApp, mobile money, banking and outbound webhooks. Store only secret references in tables; secrets belong in Supabase function secrets or the deployment secret manager. Verify signatures, callback replay protection, idempotency, retry policies and audit trails.

### 9. Dedicated operational UX

Replace generic CRUD with dedicated task-oriented screens where users need validation or state transitions: leave review, discipline incident/action flow, clinic confidentiality, boarding capacity and assignment, transport trips/rosters, asset assignment/maintenance, purchase approvals and result publication. Keep generic screens for low-risk configuration tables.

### 10. Security, performance and production acceptance

- Enable Supabase Auth leaked-password protection.
- Re-run security and performance advisors; document intentional `SECURITY DEFINER` functions and optimize material RLS initialization/overlapping-policy warnings.
- Add authenticated two-tenant RLS tests for every sensitive table and storage bucket.
- Complete role-based Playwright suites for super admin, school admin, teacher, accountant, HR/payroll, librarian, nurse, transport, boarding, guardian and student.
- Test desktop and mobile layouts, accessibility, keyboard navigation and print output.
- Run load tests at the owner's expected school size.
- Rehearse backup restoration and rollback.
- Configure monitoring, error reporting, database alerts and worker observability.

## Required acceptance gates

Do not declare completion until all of the following are evidenced:

1. `npm run check` passes with no skipped required step.
2. Playwright role and mobile suites pass against a seeded test environment.
3. A two-school authenticated RLS suite proves isolation for direct tables, RPCs, storage and Edge Functions.
4. All migrations apply cleanly to a database containing baseline migrations 001–010.
5. Migrations 023–028 and every later migration have transaction-level smoke tests.
6. Finance journals balance; stock never becomes negative through supported workflows; result publication and payroll transitions are idempotent and audited.
7. All visible buttons perform a real authorized operation or are removed.
8. Provider sandbox tests pass, or the UI clearly marks a provider as unconfigured rather than pretending delivery succeeded.
9. `README.md`, build summary, module coverage, database docs, testing docs and acceptance checklist match the final implementation.
10. Produce a final clean ZIP excluding `.env*`, `node_modules`, `.next`, test reports, credentials and temporary files, with a SHA-256 checksum and a concise verification report.

## Final deliverable format

Return:

- the completed source repository;
- new migration files and regenerated database types;
- test evidence and command output summaries;
- a list of live-versus-local migrations;
- any provider configuration still requiring owner credentials;
- the clean ZIP and SHA-256 checksum;
- an honest production-readiness statement with no unsupported claims.
