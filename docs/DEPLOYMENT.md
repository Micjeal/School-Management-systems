# Deployment

## Environment

Required public variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

Optional server-only variable:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose the service-role key through a `NEXT_PUBLIC_` variable or commit it to source control.

## Database deployment

1. Confirm baseline migrations 001–010 exist.
2. Link the Supabase CLI to the target project.
3. Review migrations 011–028. Confirm migrations 023–028 on a Supabase branch before production deployment.
4. Run `supabase db push`.
5. Deploy the four Edge Functions with JWT verification enabled.
6. Configure Edge Function secrets and external-provider credentials.
7. Enable leaked-password protection in Supabase Auth.

## Web deployment

```bash
npm install --no-audit --no-fund
npm run check
npm run build
npm start
```

The repository can be deployed to Vercel or a Node-compatible container. Add the production callback URL to Supabase Auth redirect URLs and set `NEXT_PUBLIC_SITE_URL` to the HTTPS origin.

## Rollback

Database workflows are `CREATE OR REPLACE FUNCTION` migrations. Roll back by restoring the previous function definitions from a reviewed migration or database backup. Do not delete tenant data to reverse application code.
