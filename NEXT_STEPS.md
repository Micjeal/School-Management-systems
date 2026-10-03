# SchoolDB next steps

## Current completed reconciliation

The repository now follows the live linked-project contracts for imports, exports, branding, application documents, and private Storage. Generated types came from project `azeisrxigwbyrkquwbwe`. The hardened `report-worker` is deployed as version 4 with JWT verification enabled, explicit projections, domain authorization, atomic claiming, redacted errors, and no raw Storage path response.

Employee export remains intentionally disabled in both UI/worker handling and `private.can_request_export`. Do not enable it without a separately reviewed database migration and runtime authorization tests.

## Next required work

1. Run the authorization matrix with dedicated test users from two schools: import permission/domain combinations, export permission/domain combinations, ownership/audit visibility, cancellation, signed URLs, and branding isolation.
2. Investigate the full TypeScript checker, which did not finish within the 120-second validation window. Do not treat the timeout as a pass.
3. Re-run the production build after typecheck completes. The first build found a missing server-action boundary and that defect was fixed; the second build did not finish within 120 seconds and therefore is not a pass.
4. Design an admissions-document upload workflow before permitting application-document uploads. Keep the generic uploader and assessment-file workflow unavailable.
5. Confirm with the owner whether project `azeisrxigwbyrkquwbwe` is formally the staging environment before using that label in release records.
