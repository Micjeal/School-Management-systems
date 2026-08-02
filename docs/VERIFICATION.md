# Verification report

## Live backend verification

- Supabase project: `azeisrxigwbyrkquwbwe`
- Registered live migrations: 22
- Deployed application migrations: 011–022
- Live application RPCs represented: 22
- Anonymous execute privilege on live application RPCs: denied
- Authenticated execute privilege: granted, with internal permission checks
- Storage buckets: private tenant-prefixed buckets already deployed
- Edge Functions: four functions previously confirmed active with JWT verification
- Repository migrations 023–028: present locally, not deployed and not included in the live transactional smoke assertions

## Repository verification

The repository includes a source-level static checker, unit-test sources, Playwright smoke tests, a database RLS verification script and CI configuration.

At package-creation time, the internal npm registry returned HTTP 503, preventing installation of Next.js dependencies in this environment. Therefore lint, full TypeScript semantic checking, Vitest execution, Playwright execution and `next build` must not be represented as passed until they are run in an environment with registry access.

The independent TypeScript syntax pass and repository structural checks are recorded by `npm run test:static` or `node scripts/static-check.mjs`.

## Known advisor items

- Supabase Auth leaked-password protection is disabled and must be enabled from project settings.
- Security-advisor `SECURITY DEFINER` warnings are expected for controlled transactional RPCs; anonymous execution is revoked and internal permission checks are present.
- Performance advisor reports RLS initialization-plan and overlapping permissive-policy warnings. These are optimization work, not evidence that RLS is absent.
- Unused-index notices are expected on a new or lightly populated database and should be reviewed after production query telemetry exists.

## Transactional smoke tests

Temporary schools and representative records were created inside PostgreSQL transactions and rolled back. The segmented tests exercised and asserted:

- School initialization
- Student creation and enrolment
- Employee creation, assignment and contract
- Attendance initialization, bulk save and locking
- Mark entry, moderation, result calculation, publication and withdrawal
- Library issue and return
- Stock receipt and two-location atomic transfer
- Invoice creation and posting
- Payment allocation and posting
- Balanced manual journal posting
- Payroll calculation

The smoke process identified and corrected five live integration defects through migrations 017–021: JSON object constraints in result summaries, stock-transfer idempotency, stock-trigger double application, generated finance columns and journal posting order.

All smoke data was rolled back; no test school or operational test record was retained.
