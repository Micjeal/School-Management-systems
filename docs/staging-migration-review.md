# Linked SchoolDB migration reconciliation

Verified against Supabase project `azeisrxigwbyrkquwbwe` on 2026-09-06. The owner has not separately confirmed the environment label, so this document calls it the linked SchoolDB project rather than staging.

| Rejected migration | Decision | Authoritative contract |
| --- | --- | --- |
| 042 `import_jobs` | Discarded | `import_batches`, `import_rows`, `process_import_batch(uuid)` |
| 043 `export_jobs` create | Discarded | The existing `export_jobs` table was hardened in place |
| 044 `school_branding` create | Discarded | `schools.logo_path` plus private `school-branding` bucket |
| 045 `assessment_files` | Deferred/discarded | No metadata table or complete product workflow |
| 046 `application_documents` create | Discarded | Existing table with composite application/school FK |

The rejected files were removed. The repository now records the four migrations already present remotely:

- `20260906075516_reconcile_import_authorization`
- `20260906075528_harden_export_job_authorization`
- `20260906075546_harden_pending_file_storage_access`
- `20260906075642_lock_private_storage_and_sensitive_exports`

Security decisions are intentional: imports require `imports.process` plus a mapped domain permission; export inserts require `reports.export` plus a mapped domain permission; employee exports remain denied; authenticated users cannot update/delete export jobs directly; private domain buckets have no generic school-member policies; branding alone retains path-scoped authenticated policies.
