# SchoolDB staging runtime acceptance

Date: 2026-09-13  
Linked project: `azeisrxigwbyrkquwbwe`  
Environment verdict: **STAGING IDENTITY NOT CONFIRMED**  
Release verdict: **READY FOR STAGING ACCEPTANCE**

## Environment identity evidence

Supabase Management API reports one healthy project named `schooldb`; neither its name nor repository configuration labels it staging, test, disposable, or acceptance. Read-only aggregate SQL found one school, four authentication users, three school memberships, and zero schools explicitly named test/staging/acceptance. This is not enough to authorize modifying the data.

Per the acceptance stop condition, no schools, users, roles, memberships, domain records, export jobs, Storage objects, or migrations were created or changed.

## Verified read-only facts

- `report-worker` is deployed at version 4 with `verify_jwt = true`.
- The complete repository gate passed on 2026-09-13: static, imports, lint, TypeScript, 36 tests, and production build.
- Boarding leave, boarding incidents, and school-level notification settings remain visibly unsupported because the generated schema has no persistence contract.
- `.env.example` contained credential-shaped live values and was sanitized to placeholders. Rotation of the exposed credentials remains required outside this repository.

## Runtime acceptance matrix

| Scenario | Role | Selected school | Record school | Route/action | Expected | Actual | PASS/FAIL | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Credentialed login and safe `next` | Disposable user | A | A | `/login?next=/app/modules/notification-templates`; external/protocol-relative/javascript destinations | Valid login reaches local destination; unsafe destinations rejected | No disposable credentials; runtime submission not attempted | BLOCKED | Environment identity stop condition; safe-next unit tests pass |
| School A/B isolation | Every school role | A | A and B | Direct routes and Server Actions | A allowed; B denied/not found | Only one unconfirmed school exists | BLOCKED | Read-only aggregate count |
| Student scope | Student | A | Self, peer, B | Profile, timetable, attendance, results, reports, messages, announcements | Own/published/authorized only | No disposable student matrix | BLOCKED | Not executed |
| Guardian relationships | Guardian | A | Linked, unlinked, B | Academic and financial routes | Relationship flags enforced | No disposable guardian matrix | BLOCKED | Not executed |
| Teacher scope | Teacher | A | Assigned, unassigned, B | Employee, class, assessment, timetable | Assigned relationships only | No disposable teacher matrix | BLOCKED | Not executed |
| HR scope and field minimization | HR | A | Staff A and B | Staff directory/detail | A allowed; B denied; sensitive fields absent | No disposable HR identity or School B | BLOCKED | Not executed |
| Finance permission separation | Finance variants | A | A and B | Invoice, collect, adjust, refund | Each permission independent; cross-school denied | No disposable finance variants | BLOCKED | Not executed |
| Boarding | Warden | A | Student/bed A and B | Hub, assignment, roll call | Same-school allowed; cross-school denied; hostel-filtered roll call | No disposable warden, assignments, or School B | BLOCKED | Unsupported leave/incidents confirmed structurally |
| Transport | Manager | A | Route/vehicle A and B | Hub, routes, stops, assignments | Same-school only; safe driver fields | No disposable manager or School B | BLOCKED | Existing assignment table confirmed structurally |
| Timetable | Teacher/student/staff | A | A and B | Teacher, student, class views | Own/permitted timetable only | Credential matrix unavailable | BLOCKED | Routes compile and build |
| Reports | Domain role variants | A | A | Students, attendance, finance | `reports.read` plus domain permission | Credential matrix unavailable | BLOCKED | Inputs are hardcoded structurally |
| Imports | Permission variants | A | A and B | Process import | `imports.process` plus domain permission | No disposable jobs or identities | BLOCKED | Not executed |
| Exports | Permission variants | A | A and B | Queue, claim, download | `reports.export` plus domain permission; employee denied | No disposable jobs or identities | BLOCKED | Worker v4/JWT verified |
| Export concurrent claim | Request owner | A | A | Two simultaneous claims | Exactly one succeeds | No disposable queued job | BLOCKED | Not executed |
| Private Storage | Relationship variants | A | A and B | Direct bucket access and signed URL | Direct denied; server-authorized metadata path only | No controlled credentials/files | BLOCKED | Not executed |
| Branding | Member/manager | A | A and B | Read/mutate `schools.logo_path` object | Own read; manager-only own-school mutation | No School B/role matrix | BLOCKED | Not executed |
| Settings | Manager/ordinary member | A | A | Settings routes/actions | Manager allowed; ordinary member denied | No controlled role matrix | BLOCKED | Routes compile; unsupported notifications explicit |
| Platform administration | Platform admin/super admin | Platform | N/A | Role and status mutations | Privilege hierarchy and final super-admin protection | No disposable platform identities | BLOCKED | `admin-users` deployed metadata inspected only |
| Platform no-school mode | Platform admin | None | All schools | Private-domain routes | No implicit global tenant data | No disposable platform identity | BLOCKED | Not executed |
| School switching | Multi-school user | A then B | A and B | Switcher and scoped pages | Old scope disappears; new scope loads | No two-school membership | BLOCKED | Not executed |
| Direct URL tampering | All roles | A | A peer and B | IDs for student, employee, invoice, payment, assessment, approval, file, conversation, school, membership | 404/access denied without leakage | No credential/record matrix | BLOCKED | Not executed |
| Server Action tampering | All mutating roles | A | B | Hidden school/record/parent/student/employee/route/hostel/payment IDs | Server rejects | No School B fixtures | BLOCKED | Not executed |

## Remaining intentional limitations

- Generic, assessment, and application-document uploads remain disabled.
- Unsupported integrations and employee exports remain disabled.
- Boarding leave and incident persistence remain unavailable.
- School-level notification persistence remains unavailable.

## Remaining P0 blockers

1. The linked project is not independently confirmed as a disposable staging/test environment.
2. The controlled two-school and role/relationship credential matrix does not exist.
3. Credentials previously present in `.env.example` must be rotated in Supabase; repository sanitization cannot invalidate exposed keys.

## Remaining P1 blockers

1. `admin-users` reports `verify_jwt = false`; its in-function authentication and privilege hierarchy need credentialed negative testing before acceptance.
2. Credentialed login, direct URL tampering, Server Action tampering, Storage, import/export permission variants, and worker concurrency remain unexecuted.

## Required unblock

Obtain written confirmation that project `azeisrxigwbyrkquwbwe` is disposable staging, or provide a separate approved staging project and disposable credentials. Then create the two-school fixture matrix and execute every blocked scenario above.
