# Architecture

## Overview

SchoolDB uses a shared-schema multi-tenant architecture. `schools.id` is the tenant root and tenant-owned records carry `school_id`. PostgreSQL Row Level Security is the final authorization boundary; the application shell and server actions provide earlier usability and authorization checks but do not replace RLS.

## Web application

- Next.js App Router and React Server Components
- TypeScript strict mode
- Tailwind CSS 4
- Supabase SSR cookie sessions
- Server Actions for authenticated mutations
- Route Handlers for callbacks and health checks
- Reusable module engine for configuration records
- Dedicated workflow pages for student admission, attendance, marks, finance, payroll, library and inventory

## Backend

- Supabase PostgreSQL, Auth and Storage
- Versioned SQL migrations
- `SECURITY DEFINER` RPCs with fixed `search_path`, explicit permission checks and anonymous execution revoked
- Edge Functions for privileged Auth administration, notifications, webhooks and report jobs
- Outbox and delivery tables for integrations

## Authorization flow

1. Supabase validates the user session.
2. `get_my_context` resolves profile, platform role, school memberships, roles, permissions and features.
3. Protected layouts enforce active/disabled account and forced-password rules.
4. Server actions require a permission before mutation.
5. PostgreSQL RPCs repeat permission checks for transactional operations.
6. RLS limits all direct table access to authorized tenant rows.

## Frontend module model

`src/config/modules.ts` registers 139 screens. Configuration/master-data modules use a shared table/form engine. High-risk or multi-record operations use dedicated pages and RPCs, preventing half-completed admissions, unbalanced journals, partial payments, inconsistent stock and similar failures.
