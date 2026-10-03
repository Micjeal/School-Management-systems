import "server-only";
import type { AccessContext } from "@/lib/auth/get-access-context";
import { hasPermission, requireActiveSchool } from "@/lib/auth/get-access-context";
import { createClient } from "@/lib/supabase/server";

export type StudentAccess = {
  allowed: boolean;
  relationship: "school" | "self" | "guardian" | "teacher" | "class_teacher" | "none";
  academic: boolean;
  finance: boolean;
  update: boolean;
};

const denied = (): StudentAccess => ({
  allowed: false,
  relationship: "none",
  academic: false,
  finance: false,
  update: false
});

export async function canReadStudent(
  context: AccessContext,
  studentId: string
): Promise<StudentAccess> {
  const schoolId = requireActiveSchool(context);
  const supabase = await createClient();
  const { data: student } = await (supabase.from("students") as any)
    .select("id,person_id")
    .eq("id", studentId)
    .eq("school_id", schoolId)
    .maybeSingle();
  if (!student) return denied();

  if (hasPermission(context, "students.read")) {
    return {
      allowed: true,
      relationship: "school",
      academic: true,
      finance: hasPermission(context, "finance.read"),
      update: hasPermission(context, "students.update")
    };
  }

  const { data: person } = await (supabase.from("people") as any)
    .select("id")
    .eq("id", student.person_id)
    .eq("school_id", schoolId)
    .eq("user_id", context.userId)
    .maybeSingle();
  if (person)
    return { allowed: true, relationship: "self", academic: true, finance: true, update: false };

  const { data: guardian } = await (supabase.from("guardians") as any)
    .select("id,people!inner(id)")
    .eq("school_id", schoolId)
    .eq("people.school_id", schoolId)
    .eq("people.user_id", context.userId)
    .maybeSingle();
  if (guardian) {
    const { data: link } = await (supabase.from("student_guardians") as any)
      .select("receives_academic_reports,receives_financial_notices,is_financially_responsible")
      .eq("school_id", schoolId)
      .eq("student_id", studentId)
      .eq("guardian_id", guardian.id)
      .maybeSingle();
    if (link)
      return {
        allowed: true,
        relationship: "guardian",
        academic: link.receives_academic_reports,
        finance: link.receives_financial_notices || link.is_financially_responsible,
        update: false
      };
  }

  const { data: employee } = await (supabase.from("employees") as any)
    .select("id,people!inner(id)")
    .eq("school_id", schoolId)
    .eq("people.school_id", schoolId)
    .eq("people.user_id", context.userId)
    .maybeSingle();
  if (!employee) return denied();
  const { data: enrolments } = await (supabase.from("student_enrolments") as any)
    .select("class_section_id")
    .eq("school_id", schoolId)
    .eq("student_id", studentId)
    .eq("enrolment_status", "active");
  const sectionIds = (enrolments ?? []).map((row: any) => row.class_section_id);
  if (!sectionIds.length) return denied();
  const { data: assignment } = await (supabase.from("teacher_assignments") as any)
    .select("id,is_primary")
    .eq("school_id", schoolId)
    .eq("employee_id", employee.id)
    .in("class_section_id", sectionIds)
    .or(`ends_on.is.null,ends_on.gt.${new Date().toISOString().slice(0, 10)}`)
    .limit(1)
    .maybeSingle();
  if (!assignment) return denied();
  return {
    allowed: true,
    relationship: assignment.is_primary ? "class_teacher" : "teacher",
    academic: true,
    finance: false,
    update: false
  };
}

export async function canUpdateStudent(
  context: AccessContext,
  studentId: string
): Promise<boolean> {
  const access = await canReadStudent(context, studentId);
  return access.allowed && access.update;
}
