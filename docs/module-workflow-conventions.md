# Module workflow conventions

SchoolDB uses two intentional route patterns:

- Custom workflow routes handle stateful or sensitive domains such as students, admissions, assessments, finance, staff, payroll, procurement, and platform administration. Their actions validate permissions, active-school ownership, record state, and domain relationships.
- Generic module routes handle simple reference records. They derive fields and permissions from `src/config/modules.ts`, bind the active school on the server, and never accept a client-supplied tenant identifier.

`workflowHref` is the canonical redirect from a generic module identifier to a custom workflow. `readOnly` marks derived, join, audit, or workflow-owned tables that may be inspected but not changed directly. Generic destructive deletion is intentionally not exposed; deletion or reversal belongs in a domain action with explicit state rules and audit behavior.

When adding a module, use a custom workflow if it moves money, changes enrolment/employment state, publishes results, assigns permissions, sends external data, or requires a record relationship beyond direct school ownership. Otherwise, a generic route is acceptable only with an explicit field projection and permission code.
