# SchoolDB build summary

## Delivered repository

- Next.js App Router application
- TypeScript strict configuration
- Tailwind CSS 4
- Supabase SSR session handling
- Multi-school authorization context
- 139 registered module screens
- Dedicated transaction-oriented workflows
- 18 application database migrations, numbered 011–028
- Four Supabase Edge Functions
- Static, unit, browser and database test sources
- CI and deployment documentation

## Live backend state

- Supabase project reference: `azeisrxigwbyrkquwbwe`
- Total registered live migrations: 22
- Live application RPCs represented through migration 022: 22
- Anonymous execution on live application RPCs: 0
- Authenticated execution on live application RPCs: 22, subject to internal permission checks
- Transaction smoke data was created inside transactions and rolled back
- Migrations 023–028 (procurement/goods receipts, refunds, payroll posting, timetable conflicts, messaging and import processing) exist in the repository but are not deployed or transaction-smoke-tested

## Validation state

Passed in this build environment:

- TypeScript syntax parse across application source
- Local import/export consistency
- Module registry uniqueness and count
- Required-route presence
- Migration/function presence
- Edge Function presence
- Secret-pattern scan
- Live transactional smoke assertions across core workflows

Blocked by infrastructure:

- The internal npm package gateway returned HTTP 503, so dependency installation, ESLint, semantic TypeScript compilation, Vitest, Playwright and `next build` could not be executed here.

Run `npm install` and `npm run check` in an environment with npm registry access before production deployment.
