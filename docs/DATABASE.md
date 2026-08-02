# Database

## Deployed state

The connected Supabase project contains 22 registered migrations. Migrations 001–010 establish the platform, people, academics, attendance, assessment, finance, HR, communications, operations, inventory, integrations, reporting, storage, platform bootstrap and security hardening.

This repository adds:

- `011_context_and_authorization`
- `012_people_onboarding_workflows`
- `013_attendance_workflows`
- `014_assessment_result_workflows`
- `015_library_inventory_workflows`
- `016_finance_payroll_workflows`
- `017_result_summary_object_fix`
- `018_stock_transfer_idempotency_fix`
- `019_stock_trigger_alignment_fix`
- `020_finance_generated_columns_fix`
- `021_manual_journal_posting_sequence_fix`
- `022_approval_workflows`
- `023_procurement_receipt_workflows` — repository-only; not yet deployed to the connected project
- `024_refund_workflows` — repository-only; not yet deployed to the connected project
- `025_payroll_posting_workflows` — repository-only; not yet deployed to the connected project
- `026_timetable_conflict_workflows` — repository-only; not yet deployed to the connected project
- `027_messaging_workflows` — repository-only; not yet deployed to the connected project
- `028_import_processing_workflows` — repository-only; not yet deployed to the connected project

## Application RPCs

The application migrations provide context resolution and atomic workflows for:

- Student admission, enrolment and applicant conversion
- Employee onboarding and assignment
- Attendance session initialization, bulk saving and locking
- Bulk marks, moderation, result calculation and withdrawal
- Library issue and return
- Stock receipt, issue, adjustment and transfer
- Invoice creation with lines
- Payment creation with allocations
- Balanced manual journals
- Payroll-run calculation

Every new workflow RPC revokes execution from `public` and `anon`, grants execution to authenticated/service roles, fixes its `search_path`, and performs an internal permission check.

## Reproducibility

This repository intentionally contains migrations 011–028 only. Migrations 023–028 are source handoffs but were not deployed from this build environment. A blank Supabase project must first receive baseline migrations 001–010 from the platform database source or a schema-only backup. Applying the application migrations to an empty database will fail because they reference baseline tables and private authorization functions.
