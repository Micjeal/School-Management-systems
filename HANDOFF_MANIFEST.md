# SchoolDB handoff manifest

## Snapshot

- Framework: Next.js App Router, React 19, TypeScript strict mode, Tailwind CSS 4 and Supabase SSR
- Public database tables represented by the module registry: 139
- TypeScript application files parsed by the structural checker: 104
- Principal routes checked: 16
- Repository application migrations: 011–028 (18 files)
- Live database migrations at handoff: 001–022
- Repository-only migrations awaiting branch validation: 023–028
- Supabase Edge Functions in source: 4
- Workflow function definitions detected in repository migrations: 39

## Verification performed before packaging

```text
SchoolDB static verification passed:
- 104 TypeScript source files parsed
- 139 unique module screens registered
- 16 principal routes present
- 18 versioned application migrations and 39 workflow functions present
- 4 Edge Functions present
- Repository secret-pattern scan completed

Local import/export check passed for 104 source files.
```

## Important limitation

Dependency installation was blocked in the originating runtime by package-registry availability. A real `npm install`, ESLint run, TypeScript compiler run against installed framework types, Vitest run, Playwright run and Next.js production build must be completed by Devin before release.

See `DEVIN_HANDOFF_PROMPT.md` for the ordered continuation plan and acceptance gates.
