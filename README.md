# SchoolDB

SchoolDB is a multi-tenant school management platform built with Next.js App Router, TypeScript, Tailwind CSS and Supabase. It serves platform administrators, school administrators, teachers, accountants, HR teams, librarians, nurses, transport teams, boarding teams, guardians and students from one RLS-protected system.

## Included capabilities

- Supabase SSR authentication, recovery and forced password replacement
- Multi-school and campus context with permission-aware navigation
- Platform administration and school onboarding
- Admissions, student records, guardians and enrolments
- Staff onboarding, HR, leave and payroll
- Academic setup, timetable, attendance, assessments, marks and results
- Fee structures, invoices, allocations, payments, receipts and accounting reports
- Library, transport, boarding, health, discipline and counselling
- Procurement, inventory, assets, approvals, imports, exports and integrations
- 139 registered module screens backed by the existing tenant-isolated schema
- Atomic PostgreSQL workflows for transaction-heavy operations
- Four JWT-protected Supabase Edge Functions

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Supabase CLI for local database workflows
- Access to Supabase project `azeisrxigwbyrkquwbwe`, or another project containing baseline migrations 001–010

## Setup

```bash
cp .env.example .env.local
npm install
npm run db:types
npm run check
npm run dev
```

Configure `.env.local` with the Supabase project URL and publishable key. The service-role key is optional for local server-only administrative operations and must never use the `NEXT_PUBLIC_` prefix.

## Database

The live project already contains baseline migrations 001–010. This repository contains application migrations 011–028 under `supabase/migrations`. Apply them only to databases that contain the baseline schema.
Migrations 011–022 are registered on the connected live project. Migrations 023–028 are included for Devin to validate on a Supabase branch before applying to production.

```bash
supabase link --project-ref azeisrxigwbyrkquwbwe
supabase db push
```

## Validation

```bash
npm run test:static
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

See `docs/VERIFICATION.md` and `docs/ACCEPTANCE_CHECKLIST.md` for the distinction between structural verification, automated tests, live-database verification and production acceptance.
