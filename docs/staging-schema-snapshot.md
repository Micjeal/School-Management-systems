# Linked SchoolDB schema snapshot

Project reference: `azeisrxigwbyrkquwbwe`  
Snapshot date: 2026-09-06  
Environment label: not independently confirmed by the owner

## Migration history

The remote migration registry contains the four reconciliation migrations `20260906075516`, `20260906075528`, `20260906075546`, and `20260906075642`. Local files now use those exact versions and names. Rejected migrations 042-046 are not remote migrations and have been removed locally; 045 remains deferred/discarded.

## Canonical contracts

### Imports

`import_batches` statuses are `uploaded`, `validating`, `ready`, `processing`, `completed`, `completed_with_errors`, `failed`, and `cancelled`. `import_rows` has composite FK `(school_id, import_batch_id) -> import_batches(school_id, id) ON DELETE CASCADE`. Table policies use `imports.process`. The public processor additionally requires a domain permission and rejects unsupported types.

### Exports

`export_jobs` contains `id`, `school_id`, `export_type`, `format`, `filters`, `status`, `file_path`, `row_count`, `requested_by`, lifecycle timestamps, `error_message`, and `version`. Export types are constrained to students, employees, invoices, payments, attendance, results, library, and inventory. Authenticated inserts must be caller-owned queued CSV jobs with worker fields null and must pass `private.can_request_export`. Reads are own jobs or `audit.read`; cancellation uses `cancel_export_job(uuid)`; direct authenticated update/delete is revoked. Employee requests are denied.

### Branding

There is no `school_branding` table. `schools.logo_path` is the metadata contract. The private `school-branding` bucket allows member/platform reads and requires `settings.manage` for UUID-school-prefixed mutation paths.

### Application documents

The existing table uses `review_status`, `review_notes`, `reviewed_by`, and `reviewed_at`, with `(school_id, application_id) -> applications(school_id, id) ON DELETE CASCADE`. Policies use `admissions.read` and `admissions.manage`. No upload workflow is enabled.

### Assessment files

There is no `assessment_files` metadata table or complete application workflow. The private bucket exists but has no direct authenticated policy. Migration 045 remains deferred/discarded.

## Permissions and Storage

Verified live permission codes include `imports.process`, `reports.export`, `settings.manage`, `admissions.read`, and `admissions.manage`; stale codes queried for this reconciliation were not relied upon. Private buckets include imports, exports, school-branding, student/staff/medical documents, message attachments, report cards, receipts, and assessment-files. Only school-branding has direct authenticated object policies; other private domains require metadata authorization followed by a server Storage operation or short-lived signed URL.

## Application reconciliation

Imports route to the controlled `import_batches` workflow with live statuses and `imports.process`. Exports route to a controlled allowlisted CSV action; the browser cannot choose table names, columns, school, requester, status, or worker fields. Generated types contain `import_batches`, `import_rows`, `export_jobs`, `application_documents`, and `cancel_export_job`, and omit nonexistent metadata tables. Private signed URLs are created only in server-side code after source/record authorization.
