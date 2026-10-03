# Development, Merge, Devin, and Vercel Workflow

This document defines the release boundary for SchoolDB. Work is merged in small, reviewable batches. A local change is not a deployment, and a green static check is not live acceptance.

## Before every batch

1. Start from a clean branch or record all unrelated working-tree changes.
2. Review the exact files in the batch; do not stage the whole repository.
3. Check for sensitive material:
   - `.env*`, private keys, access tokens, passwords, service-role keys, database URLs, and provider credentials must not be committed.
   - `NEXT_PUBLIC_*` values are browser-visible. Only public Supabase URL/key and the exact site URL belong there.
   - Supabase service-role keys and provider credentials stay in server-only Vercel or Supabase Function secrets.
4. Run the relevant focused tests, then the full release checks when the batch is intended for merge.

The minimum merge gate is:

```powershell
npm.cmd run test:static
npm.cmd run test:imports
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
git diff --check
```

Do not merge if a check fails, if a migration has not been reviewed for the target database, or if the batch changes authorization without the matching tenant and role checks.

## Branch and merge policy

- `main` is the production-bound branch.
- Each feature or repair uses a short-lived branch and one focused pull request.
- A pull request must describe source changes, automated validation, required environment/database changes, live acceptance still pending, and rollback considerations.
- Merge only after CI is green and the reviewer confirms the sensitive-file check.
- Deploy only the merged commit. Never deploy an unreviewed dirty worktree.

## Vercel setup

Link the GitHub repository `Micjeal/School-Management-systems` to one Vercel project. Configure the repository root and Node version from `package.json` (`node >=20.9.0`). Use Git integration so pull requests receive Preview deployments and `main` produces the Production deployment.

Configure these variables in Vercel with environment-specific values:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SERVICE_ROLE_KEY   # server-only, if the deployed server path requires it
```

Preview deployments should use a non-production Supabase project where possible. Never put `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_TOKEN`, SMTP credentials, provider credentials, or database passwords in GitHub files, `NEXT_PUBLIC_*` variables, Devin prompts, or committed documentation.

After the first production domain exists, add its exact HTTPS callback URL to Supabase Auth and set `NEXT_PUBLIC_SITE_URL` to the same origin. Then perform authenticated login, password recovery, tenant isolation, and role-based smoke checks against the deployed environment.

## Devin Cloud handoff

Devin may work on a feature branch or pull request, but it must follow the same gates:

- Read `README.md`, `docs/DEPLOYMENT.md`, this file, and `DEVIN_HANDOFF_PROMPT.md` first.
- Keep one feature or repair per batch; do not mix migrations, generated artifacts, and unrelated cleanup.
- Do not request, print, copy, or commit secrets. Use environment bindings supplied by the workspace or deployment platform.
- Report exact commands and results. Distinguish automated checks from live browser/database/provider acceptance.
- Do not apply Supabase migrations or deploy Edge Functions without explicit approval for the target environment.
- Leave the branch ready for review with a summary of changed files, security impact, tests, deployment variables, and known blockers.

## Current release blocker

The published `main` history was rewritten on 2026-10-04 to remove the populated `.env.example` blob. Before production deployment, rotate/revoke every credential that appeared there and verify the old credentials no longer work. Recheck the published refs with:

```powershell
git log --all -- .env.example
git rev-list --all --objects | Select-String '\.env'
```

Do not paste the old values into tickets, prompts, logs, or this document.
