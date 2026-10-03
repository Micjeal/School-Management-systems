import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("student portal authorization contract", () => {
  const migration = read("supabase/migrations/20260917101127_student_portal_self_service.sql");
  const portal = read("src/app/app/portal/[section]/page.tsx");
  const dashboard = read("src/app/app/page.tsx");
  const studentDashboard = read("src/components/portal/student-dashboard.tsx");
  const navigation = read("src/components/layout/app-shell-client.tsx");

  it("derives the student from auth, selected school, person and the student role", () => {
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("r.code = 'student'");
    expect(migration).toContain("where school_id = target_school_id and user_id = auth.uid()");
    expect(migration).toContain("person_id = v_person.id");
  });

  it("does not grant a broad student-record permission to student portal access", () => {
    expect(migration).not.toContain("grant students.read");
    expect(migration).toContain(
      "revoke all on function public.get_my_student_portal(uuid) from public, anon"
    );
  });

  it("uses portal-only student routes and rejects unknown section URLs", () => {
    expect(portal).toContain("if (!SECTIONS.has(section)) notFound()");
    expect(portal).toContain("if (!student) notFound()");
    expect(portal).toContain("getPortalData(context)");
  });

  it("selects the student dashboard before the administrative loader is created", () => {
    expect(dashboard).toContain('role.code === "student"');
    expect(dashboard.indexOf("<StudentDashboard")).toBeLessThan(
      dashboard.lastIndexOf("const supabase = await createClient()")
    );
    expect(studentDashboard).toContain("My Attendance");
    expect(studentDashboard).toContain("My Results");
    expect(studentDashboard).toContain("My Fees");
  });

  it("gives a student-only account portal navigation rather than module navigation or global search", () => {
    expect(navigation).toContain("STUDENT_NAVIGATION");
    expect(navigation).toContain("!sidebarCollapsed && !isStudentOnly");
    expect(navigation).toContain("!isStudentOnly &&");
    expect(navigation).toContain("visibleGroups.map");
  });
});
