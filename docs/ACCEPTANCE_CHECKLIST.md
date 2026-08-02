# Acceptance checklist

## Authentication and tenancy

- [ ] Super administrator signs in and is forced to replace the temporary password
- [ ] Disabled users cannot enter protected routes
- [ ] A platform administrator creates a school and main campus
- [ ] A school administrator cannot view another school's records
- [ ] School and campus switching update all lists and dashboards
- [ ] Invitation acceptance creates the correct membership and role

## Core SIS and academics

- [ ] Applicant submission, decision and conversion complete atomically
- [ ] Student admission creates person, student and enrolment records
- [ ] Guardian linkage and student profile tabs display correctly
- [ ] Employee onboarding creates person, employee, assignment and contract
- [ ] Timetable prevents class, teacher and room conflicts
- [ ] Attendance initialization loads only active class enrolments
- [ ] Bulk attendance, submission, correction and locking work
- [ ] Bulk marks enforce maximum scores and moderation states
- [ ] Results calculate, rank, publish, withdraw and print correctly

## Finance and payroll

- [ ] Invoice creation recalculates totals and posts balanced journals
- [ ] Payment allocations equal the payment and post balanced journals
- [ ] Receipts and statements print accurately
- [ ] Refund and reconciliation authorization is verified
- [ ] Manual journals reject unbalanced entries
- [ ] Payroll calculation matches configured components
- [ ] Payroll approval and payslip access follow role permissions

## Operations

- [ ] Library issue/return updates copy state and fines
- [ ] Stock issue prevents negative balances
- [ ] Stock transfer updates both locations atomically
- [ ] Boarding capacity and duplicate assignments are rejected
- [ ] Transport trip rosters respect route assignments and capacity
- [ ] Health and counselling confidentiality rules are verified
- [ ] Procurement approvals and partial goods receipts work

## Production

- [ ] Lint, typecheck, unit tests and production build pass
- [ ] Desktop and mobile Playwright suites pass
- [ ] Two-school RLS suite passes
- [ ] SMTP/SMS/payment/banking providers pass sandbox tests
- [ ] Auth leaked-password protection is enabled
- [ ] Monitoring, backups and rollback procedures are tested
