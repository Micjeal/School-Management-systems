import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const edge = read("supabase/functions/admin-users/index.ts");
const linkMigration = read("supabase/migrations/20260912214008_secure_account_person_link_and_password_change.sql");
const peopleMigration = read("supabase/migrations/20260912214128_protect_people_auth_user_link.sql");
const passwordMigration = read("supabase/migrations/20260912214224_tie_first_login_flag_to_auth_password_change.sql");

describe("account provisioning contract", () => {
  it("does not automatically create accounts from unrelated domain creation actions", () => {
    for (const path of ["src/app/app/staff/actions.ts", "src/app/app/guardians/actions.ts"]) {
      const source = read(path);
      expect(source).not.toContain('functions.invoke("admin-users"');
      expect(source).not.toMatch(/people[\s\S]{0,80}user_id\s*:/);
    }
  });

  it("keeps student portal provisioning opt-in and after the canonical student RPC", () => {
    const studentAction = read("src/app/app/students/actions.ts");
    expect(studentAction).toContain('val(formData, "enable_portal_access") === "on"');
    expect(studentAction.indexOf('"create_student_with_enrolment"')).toBeLessThan(studentAction.lastIndexOf("provisionStudentPortalAccess(supabase"));
    expect(studentAction).toContain('roleCode: "student"');
    expect(studentAction).toContain("personId");
    expect(studentAction).toContain("context.active_school_id");
    expect(studentAction).not.toMatch(/people[\s\S]{0,80}user_id\s*:/);
  });

  it("requires a valid portal email and supports a retry without creating another student", () => {
    const studentAction = read("src/app/app/students/actions.ts");
    expect(studentAction).toContain("A valid login email is required");
    expect(studentAction).toContain("retryStudentPortalAccess");
    expect(studentAction).toContain('requireSchoolRecord(supabase, "students", studentId');
    expect(read("src/components/students/student-create-form.tsx")).toContain("Retry portal access");
  });

  it("does not link an unrelated existing Auth account by email", () => {
    expect(edge).toContain('code: "existing_account"');
    expect(read("src/app/app/account-access/actions.ts")).toContain("An account already exists for this email address.");
    expect(edge).toContain("personId && !recoverablePartialInvitation");
    expect(edge).toContain('action === "link-existing"');
    expect(read("src/app/app/account-access/actions.ts")).toContain('action: "link-existing"');
    expect(read("src/components/users/enable-system-access.tsx")).toContain("Link existing account");
  });

  it("blocks conflicting links and platform administrators before explicit linking", () => {
    expect(edge).toContain("cannot be onboarded to a school");
    expect(edge).toContain("This student is already linked to another account.");
    expect(edge).toContain("already linked to another person and cannot be attached to this student");
  });

  it("manages student access by school role without deleting the Auth identity", () => {
    expect(edge).toContain('action === "enable-school-access" || action === "disable-school-access"');
    expect(edge).toContain('.from("membership_roles")\n            .delete()');
    expect(edge).toContain("Do not ban the Auth account or end the membership");
    const management = read("src/components/users/student-portal-management.tsx");
    expect(management).toContain("Disable portal access");
    expect(management).toContain("Re-enable portal access");
    expect(management).toContain("Send password reset");
  });

  it("generates temporary passwords only inside the trusted Edge Function", () => {
    expect(edge).toContain("crypto.getRandomValues");
    expect(edge).not.toContain("body.temporaryPassword");
    expect(read("src/app/app/platform/users/actions.ts")).not.toContain("temporary_password");
  });

  it("issues an existing student's replacement temporary password only after an explicit confirmation flow", () => {
    const management = read("src/components/users/student-portal-management.tsx");
    const actions = read("src/app/app/account-access/actions.ts");
    expect(management).toContain("Issue temporary password");
    expect(management).toContain("Confirm and issue temporary password");
    expect(management).toContain("will replace the student&apos;s current password");
    expect(management).toContain("This password will not be shown again.");
    expect(actions).toContain("issueStudentTemporaryPassword");
    expect(actions).toContain('action: "issue-temporary-password"');
    expect(edge).toContain('action === "issue-temporary-password"');
    expect(edge).toContain("authAdmin.auth.admin.updateUserById(userId, { password: temporaryPassword })");
    expect(edge).toContain("must_change_password: true");
  });

  it("keeps passwords exclusively in Supabase Auth and never adds domain password columns", () => {
    expect(edge).not.toMatch(/(?:students|people|profiles)\.?(?:password|password_hash)/i);
    expect(read("src/app/auth/change-password/actions.ts")).toContain("supabase.auth.updateUser({ password: parsed.data.password })");
    expect(read("src/app/auth/change-password/actions.ts")).not.toMatch(/bcrypt|argon2|encrypted_password/);
  });

  it("provisions membership and role before explicit person linkage", () => {
    expect(edge.indexOf('.from("membership_roles").upsert')).toBeLessThan(edge.indexOf('dbAdmin.rpc("link_person_to_user"'));
    expect(edge).toContain("target_person_id: personId");
    expect(edge).toContain("person linkage failed");
  });

  it("keeps retries idempotent and protects existing passwords", () => {
    expect(edge).toContain('onConflict: "school_id,user_id"');
    expect(edge).toContain('onConflict: "membership_id,role_id"');
    expect(edge).toContain("recoverablePartialInvitation");
    expect(edge).toContain("!invited.last_sign_in_at");
  });

  it("enforces cross-school membership and users.manage for links", () => {
    expect(linkMigration).toContain("private.has_permission(target_school_id, 'users.manage')");
    expect(linkMigration).toContain("sm.school_id = target_school_id");
    expect(peopleMigration).toContain("requires users.manage");
  });

  it("prevents person reassignment and duplicate same-school links", () => {
    expect(linkMigration).toContain("Person is already linked to another user");
    expect(linkMigration).toContain("User is already linked to another person in this school");
  });

  it("protects the authoritative password-change flag", () => {
    expect(linkMigration).toContain("protect_profile_password_change_flag");
    expect(linkMigration).toContain("drop function if exists public.complete_first_login_password_change");
    expect(passwordMigration).toContain("old.encrypted_password is distinct from new.encrypted_password");
    expect(passwordMigration).toContain("must_change_password = false");
  });

  it("never clears the profile flag in application password-change code", () => {
    const action = read("src/app/auth/change-password/actions.ts");
    expect(action).toContain("auth.updateUser");
    expect(action).not.toMatch(/from\(["']profiles["']\)[\s\S]*\.update\(/);
    expect(action).toContain('select("must_change_password")');
  });

  it("forces navigation through the profile-backed change-password route", () => {
    const proxy = read("src/lib/supabase/proxy.ts");
    expect(proxy).toContain('url.pathname = "/auth/change-password"');
    expect(proxy).toContain("isNavigationRequest");
    expect(read("src/app/(auth)/actions.ts")).toContain("/auth/change-password?next=");
  });
});
