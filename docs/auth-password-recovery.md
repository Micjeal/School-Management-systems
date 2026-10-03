# SchoolDB password recovery

## Application flow

`/login` -> Forgot password? -> `/forgot-password` -> Supabase recovery email with `{{ .Token }}` -> `/forgot-password/verify` -> `verifyOtp({ email, token, type: "recovery" })` -> `/auth/change-password?recovery=1` -> Auth password update -> sign out this recovery session -> `/login?message=Password updated successfully. Please sign in.`

The existing publishable-key SSR client sends `resetPasswordForEmail`; the verification Server Action calls Supabase Auth `verifyOtp` and confirms the resulting user with `getUser()` before redirecting. No database lookup is used to establish identity. The old callback remains available for legacy links, but the normal recovery UI no longer requires clicking an email link.

The password page and action verify the user with `getUser()`. Both first-login and recovery use the existing 12-character policy: uppercase, lowercase, digit, symbol and matching confirmation. The only credential write is `auth.updateUser({ password })`. Recovery does not inspect domain roles or memberships. No passwords or hashes are logged or stored in SchoolDB tables.

Known and unknown email addresses receive the same generic success message. Account-specific Auth errors are concealed. Email rate limits receive a safe wait-and-retry message. Failed, expired, or consumed codes return to the verification form with an explanation. A missing authenticated session redirects to login, which includes Forgot password?.

After a successful Auth update, the action refreshes the session and reads the caller's profile flag. It never clears the flag. A delayed/failed profile read does not turn an accepted password into an error: the user signs in again. First-login users normally retain their authenticated session and continue to their validated local destination. A failed recovery sign-out shows a sign-out retry form without submitting the password again.

## Supabase Dashboard configuration

Set Auth > URL Configuration separately for each environment. Set `NEXT_PUBLIC_SITE_URL` to the exact application origin in that deployment; production mode requires it explicitly. Never derive it from a submitted email form, Origin header, or arbitrary forwarded host.

| Environment | Site URL | Allowed callback |
| --- | --- | --- |
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Staging | `https://<approved-staging-host>` | `https://<approved-staging-host>/auth/callback` |
| Production | `https://<production-host>` | `https://<production-host>/auth/callback` |

The actual staging and production application hosts were not provided; the angle-bracket values above must be replaced before deployment. The linked database project is `schooldb-staging-acceptance` (`vtdjjvdnlgdvtrecamuu`); its Supabase API hostname is not an application callback host.

The application sends this local redirect exactly:

```text
http://localhost:3000/auth/callback?next=/auth/change-password&recovery=1
```

Add/verify the full callback redirect in the redirect allowlist for legacy recovery links and existing flows. Use corresponding HTTPS URLs on staging/production. Do not use broad external wildcard allowlists. The OTP verification page does not expose the submitted email in a URL; the user re-enters it there.

## Email delivery and template

Recovery requires email delivery. Supabase's built-in mailer is suitable for development only, subject to recipient restrictions and rate limits. Configure approved SMTP credentials in Supabase Auth for staging/production; never commit SMTP credentials.

Repository inspection found no local `supabase/config.toml` or recovery template override. In Dashboard -> Authentication -> Email Templates -> Reset Password, replace the link-oriented content with a code-oriented template using the official `{{ .Token }}` variable, for example: `<h2>SchoolDB Password Reset</h2><p>We received a request to reset your password.</p><p>Verification code: <strong>{{ .Token }}</strong></p><p>Enter this code in SchoolDB to continue.</p><p>If you did not request this, ignore this email.</p>`. Do not include roles, memberships, or school information. Keep the subject generic.

The live Dashboard template, redirect allowlist, OTP expiration, and SMTP configuration have not yet been inspected. Do not claim email delivery based on a successful reset request alone. Configure the recovery OTP expiration and email rate limits in the Dashboard Auth settings according to the approved staging policy.

References: [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [SSR and PKCE](https://supabase.com/docs/guides/auth/server-side/advanced-guide), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Database contract and acceptance

Read-only staging inspection on 2026-09-13 confirmed `on_auth_password_changed` on `auth.users`: after an actual encrypted-password change it invokes `private.handle_auth_password_changed()`, clearing only `profiles.must_change_password` (and updating the profile timestamp). This task creates no database migration, token table, password table, SQL reset or role/linkage change.

Automated tests cover requests, rate limits, callback success/failure, SSR cookie adapter writes, unsafe redirects, authenticated/anonymous guards, Server Action POSTs, rendered forms, password policy, Auth updates, profile convergence and recovery sign-out. Mocked session cookies are not live Supabase acceptance evidence.

For both `micknick168@gmail.com` and one approved ordinary staging user:

1. Record the profile flag and a read-only snapshot of platform roles, school memberships/roles, person/student/employee/guardian links, active school and effective permissions.
2. Request recovery from the staging application's login page; confirm the actual email arrived.
3. Open the real email link in the requesting browser. Verify callback success, session cookie establishment and the password form. Never record token URLs/cookies or passwords in logs or screenshots.
4. Enter and submit a new password. Verify Auth success, trigger-cleared profile flag, session sign-out and login confirmation.
5. Verify the previous password fails and the new password succeeds. Compare the authorization/linkage snapshot; recovery must not alter it.
6. Revisit the consumed link and test an expired link. Both should offer another reset request. Repeat for the ordinary user.

Live acceptance remains pending: browser/inbox access, confirmed staging application URL, ordinary-user identity and controlled credential entry are needed. No real account password was changed by this implementation run.
