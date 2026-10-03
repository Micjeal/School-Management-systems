import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("teacher lifecycle contract", () => {
  const staff = read("src/app/app/staff/actions.ts");
  const edge = read("supabase/functions/admin-users/index.ts");

  it("uses the canonical employee RPC before optional teacher provisioning", () => {
    expect(staff).toContain('"create_employee_with_assignment"');
    expect(staff.indexOf('"create_employee_with_assignment"')).toBeLessThan(staff.indexOf("provisionTeacherPortalAccess"));
    expect(staff).toContain('roleCode: "teacher"');
    expect(staff).not.toContain('roleCode: "class_teacher"');
  });

  it("requires an email only when teacher portal access is requested", () => {
    expect(staff).toContain('portalRequested && !validEmail(loginEmail)');
    expect(staff).toContain("Enter a valid login email.");
  });

  it("uses the trusted active-school context and created person identifier", () => {
    expect(staff).toContain("c.active_school_id");
    expect(staff).toContain("const personId = String((data as any).person_id)");
  });

  it("returns temporary credentials only from the immediate edge-function result", () => {
    expect(edge).toContain("crypto.getRandomValues");
    expect(staff).toContain("result.temporaryPassword");
    expect(staff).not.toMatch(/localStorage|sessionStorage|cookies/);
  });

  it("keeps existing-account linking explicit and supports teacher password issuance", () => {
    expect(edge).toContain('action === "link-existing"');
    expect(edge).toContain('action === "issue-temporary-password"');
    expect(edge).toContain('["student", "teacher"].includes(roleCode)');
    expect(edge).toContain("updateUserById(userId, { password: temporaryPassword })");
  });
});
