# Testing

## Local checks

- `npm run test:static`: TypeScript syntax, route presence, 139-module uniqueness, migrations, Edge Functions and secret-pattern scan
- `npm run lint`: Next.js/TypeScript lint rules
- `npm run typecheck`: strict compiler validation
- `npm test`: registry, form normalization and migration tests
- `npm run build`: production Next.js compilation
- `npm run test:e2e`: desktop/mobile browser smoke tests

## Database tests

`supabase/tests/rls_isolation.sql` checks RLS enablement and anonymous RPC denial. Full tenant-isolation acceptance requires seeded users for two schools and authenticated JWT test cases.

## Required acceptance personas

- Platform super administrator
- School owner/administrator
- Teacher
- Accountant
- HR/payroll officer
- Librarian
- Nurse
- Transport manager
- Boarding manager
- Guardian
- Student

No release should be certified solely from a source-code build. Execute the acceptance checklist with representative data and at least two tenants.
