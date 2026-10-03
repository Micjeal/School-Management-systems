"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
import { invokeAdminUsers } from "@/app/app/platform/users/actions";

const val = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const validEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

export type StudentCreateState = {
  status: "idle" | "error" | "portal-success" | "portal-failure" | "existing-account";
  message?: string;
  studentId?: string;
  personId?: string;
  loginEmail?: string;
  temporaryPassword?: string;
  canLink?: boolean;
};

const initialState: StudentCreateState = { status: "idle" };

async function provisionStudentPortalAccess(supabase: Awaited<ReturnType<typeof createClient>>, schoolId: string, studentId: string, personId: string, loginEmail: string): Promise<StudentCreateState> {
  const { data: role, error: roleError } = await (supabase.from("roles") as any)
    .select("code")
    .eq("code", "student")
    .eq("is_active", true)
    .or(`school_id.eq.${schoolId},school_id.is.null`)
    .maybeSingle();
  if (roleError || !role) return { status: "portal-failure", message: "The student role is not available for this school.", studentId, personId, loginEmail };

  try {
    const result = await invokeAdminUsers(supabase, {
      action: "invite",
      email: loginEmail,
      schoolId,
      roleCode: "student",
      personId,
      platformRole: null
    });
    if (result.code === "existing_account") {
      return { status: "existing-account", message: "An account already exists for this email address.", studentId, personId, loginEmail, canLink: result.canLink === true };
    }
    const temporaryPassword = typeof result.temporaryPassword === "string" ? result.temporaryPassword : undefined;
    return {
      status: "portal-success",
      message: "Student created successfully. Portal access enabled.",
      studentId,
      personId,
      loginEmail,
      temporaryPassword
    };
  } catch (error) {
    return {
      status: "portal-failure",
      message: error instanceof Error ? error.message : "Student created successfully, but portal access could not be enabled.",
      studentId,
      personId,
      loginEmail
    };
  }
}

export async function createStudent(_previousState: StudentCreateState = initialState, formData: FormData): Promise<StudentCreateState> {
  const context = await requireUserContext("students.create");
  if (!context.active_school_id) redirect("/app/select-school");
  const portalRequested = val(formData, "enable_portal_access") === "on";
  const loginEmail = val(formData, "login_email").toLowerCase();
  const canManagePortal = context.is_platform_admin || context.platform_roles.some((role) => role.code === "super_admin") || context.permissions.includes("users.manage");
  if (portalRequested && !canManagePortal) return { status: "error", message: "You are not allowed to enable student portal access." };
  if (portalRequested && !validEmail(loginEmail)) return { status: "error", message: "A valid login email is required to enable portal access." };

  const supabase = await createClient();
  const schoolId = context.active_school_id;
  if (val(formData, "current_campus_id")) await requireSchoolRecord(supabase, "campuses", val(formData, "current_campus_id"), schoolId);
  if (val(formData, "academic_year_id")) await requireSchoolRecord(supabase, "academic_years", val(formData, "academic_year_id"), schoolId);
  if (val(formData, "term_id")) await requireSchoolRecord(supabase, "terms", val(formData, "term_id"), schoolId);
  if (val(formData, "class_section_id")) await requireSchoolRecord(supabase, "class_sections", val(formData, "class_section_id"), schoolId);
  const enrolment = val(formData, "academic_year_id") && val(formData, "class_section_id") ? { academic_year_id: val(formData, "academic_year_id"), term_id: val(formData, "term_id"), class_section_id: val(formData, "class_section_id"), roll_number: val(formData, "roll_number"), enrolled_on: val(formData, "admission_date") } : null;
  const { data, error } = await supabase.rpc("create_student_with_enrolment" as any, {
    target_school_id: schoolId,
    person_data: { first_name: val(formData, "first_name"), middle_name: val(formData, "middle_name"), last_name: val(formData, "last_name"), gender: val(formData, "gender"), date_of_birth: val(formData, "date_of_birth"), nationality_code: val(formData, "nationality_code") || "UG", primary_email: val(formData, "primary_email"), primary_phone: val(formData, "primary_phone") },
    student_data: { admission_number: val(formData, "admission_number"), student_number: val(formData, "student_number"), admission_date: val(formData, "admission_date"), boarding_status: val(formData, "boarding_status"), current_campus_id: val(formData, "current_campus_id") },
    enrolment_data: enrolment,
    guardians_data: []
  } as any);
  if (error) return { status: "error", message: error.message };
  const studentId = String((data as any).student_id);
  const personId = String((data as any).person_id);
  revalidatePath("/app/students");
  if (!portalRequested) redirect(`/app/students/${studentId}?message=Student%20admitted`);
  return provisionStudentPortalAccess(supabase, schoolId, studentId, personId, loginEmail);
}

export async function retryStudentPortalAccess(_previousState: StudentCreateState = initialState, formData: FormData): Promise<StudentCreateState> {
  const context = await requireUserContext("users.manage");
  if (!context.active_school_id) redirect("/app/select-school");
  const studentId = val(formData, "student_id");
  const personId = val(formData, "person_id");
  const loginEmail = val(formData, "login_email").toLowerCase();
  if (!validEmail(loginEmail)) return { status: "error", message: "A valid login email is required to enable portal access." };
  const supabase = await createClient();
  const student = await requireSchoolRecord(supabase, "students", studentId, context.active_school_id, "id,person_id");
  if (student.person_id !== personId) return { status: "error", message: "The selected student person record is not available in the active school." };
  return provisionStudentPortalAccess(supabase, context.active_school_id, studentId, personId, loginEmail);
}

export async function linkExistingStudentPortalAccess(_previousState: StudentCreateState = initialState, formData: FormData): Promise<StudentCreateState> {
  const context = await requireUserContext("users.manage");
  if (!context.active_school_id) redirect("/app/select-school");
  const studentId = val(formData, "student_id");
  const personId = val(formData, "person_id");
  const loginEmail = val(formData, "login_email").toLowerCase();
  if (!validEmail(loginEmail)) return { status: "error", message: "A valid login email is required." };
  const supabase = await createClient();
  const student = await requireSchoolRecord(supabase, "students", studentId, context.active_school_id, "id,person_id");
  if (student.person_id !== personId) return { status: "error", message: "The selected student person record is not available in the active school." };
  try {
    const result = await invokeAdminUsers(supabase, { action: "link-existing", email: loginEmail, schoolId: context.active_school_id, roleCode: "student", personId, platformRole: null });
    if (result.code === "existing_account") return { status: "existing-account", message: "An account already exists for this email address.", studentId, personId, loginEmail, canLink: result.canLink === true };
    revalidatePath(`/app/students/${studentId}`);
    return { status: "portal-success", message: "Portal access enabled for the existing account.", studentId, personId, loginEmail };
  } catch (error) {
    return { status: "existing-account", message: error instanceof Error ? error.message : "The existing account cannot be linked.", studentId, personId, loginEmail, canLink: false };
  }
}

export async function updateStudent(studentId: string, formData: FormData) {
  const c = await requireUserContext("students.update");
  const s = await createClient();
  await requireSchoolRecord(s, "students", studentId, c.active_school_id);
  const { data: student } = await (s.from("students") as any).select("person_id").eq("id", studentId).eq("school_id", c.active_school_id).single();
  if (!student) redirect("/app/students");
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    (s.from("people") as any).update({ first_name: val(formData, "first_name"), middle_name: val(formData, "middle_name") || null, last_name: val(formData, "last_name"), gender: val(formData, "gender") || null, date_of_birth: val(formData, "date_of_birth") || null, primary_email: val(formData, "primary_email") || null, primary_phone: val(formData, "primary_phone") || null }).eq("id", student.person_id).eq("school_id", c.active_school_id),
    (s.from("students") as any).update({ student_number: val(formData, "student_number") || null, boarding_status: val(formData, "boarding_status"), status: val(formData, "status"), current_campus_id: val(formData, "current_campus_id") || null }).eq("id", studentId).eq("school_id", c.active_school_id)
  ]);
  if (e1 || e2) redirect(`/app/students/${studentId}?error=${encodeURIComponent((e1 || e2).message)}`);
  revalidatePath(`/app/students/${studentId}`);
  redirect(`/app/students/${studentId}?message=Student%20updated`);
}
