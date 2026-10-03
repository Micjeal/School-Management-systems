"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
import { invokeAdminUsers } from "@/app/app/platform/users/actions";
const v = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const validEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

export type TeacherCreateState = {
  status: "idle" | "error" | "employee-success" | "portal-success" | "portal-failure" | "existing-account";
  message?: string; employeeId?: string; personId?: string; loginEmail?: string;
  temporaryPassword?: string; canLink?: boolean;
};
function employeeError(error: { code?: string; message?: string }) {
  if (error.code === "23505" || /duplicate/i.test(error.message ?? "")) return "An employee with this number already exists.";
  return "Unable to create the employee. Check the required details and try again.";
}

export async function createEmployee(_previous: TeacherCreateState = { status: "idle" }, f: FormData): Promise<TeacherCreateState> {
  const c = await requireUserContext("staff.manage");
  if (!c.active_school_id) return { status: "error", message: "Select an active school before creating an employee." };
  const isTeacher = v(f, "is_teacher") === "on";
  const portalRequested = v(f, "enable_portal_access") === "on";
  const loginEmail = v(f, "login_email").toLowerCase();
  const canManagePortal = c.is_platform_admin || c.platform_roles.some((role) => role.code === "super_admin") || c.permissions.includes("users.manage");
  if (portalRequested && !isTeacher) return { status: "error", message: "Portal access can only be enabled here for a teacher." };
  if (portalRequested && !canManagePortal) return { status: "error", message: "You do not have permission to manage teacher accounts." };
  if (portalRequested && !validEmail(loginEmail)) return { status: "error", message: "Enter a valid login email." };
  const s = await createClient();
  if (v(f, "campus_id")) await requireSchoolRecord(s, "campuses", v(f, "campus_id"), c.active_school_id);
  if (v(f, "department_id")) await requireSchoolRecord(s, "departments", v(f, "department_id"), c.active_school_id);
  const contract = v(f, "contract_number")
    ? {
        contract_number: v(f, "contract_number"),
        contract_type: v(f, "contract_type"),
        starts_on: v(f, "hire_date"),
        ends_on: v(f, "contract_ends_on"),
        base_salary: Number(v(f, "base_salary") || 0),
        currency_code: "UGX",
        pay_frequency: v(f, "pay_frequency") || "monthly",
        status: "active"
      }
    : null;
  const { data, error } = await s.rpc(
    "create_employee_with_assignment" as any,
    {
      target_school_id: c.active_school_id,
      person_data: {
        first_name: v(f, "first_name"),
        middle_name: v(f, "middle_name"),
        last_name: v(f, "last_name"),
        gender: v(f, "gender"),
        date_of_birth: v(f, "date_of_birth"),
        primary_email: v(f, "primary_email"),
        primary_phone: v(f, "primary_phone"),
        preferred_name: v(f, "preferred_name"),
        nationality_code: v(f, "nationality_code") || "UG"
      },
      employee_data: {
        employee_number: v(f, "employee_number"),
        employment_type: v(f, "employment_type"),
        hire_date: v(f, "hire_date"),
        tax_identifier: v(f, "tax_identifier"),
        social_security_number: v(f, "social_security_number")
      },
      assignment_data: {
        campus_id: v(f, "campus_id"),
        department_id: v(f, "department_id"),
        job_title: v(f, "job_title"),
        starts_on: v(f, "hire_date"),
        is_primary: true
      },
      contract_data: contract
    } as any
  );
  if (error || !data) return { status: "error", message: employeeError(error ?? {}) };
  const employeeId = String((data as any).employee_id);
  const personId = String((data as any).person_id);
  revalidatePath("/app/staff");
  if (!portalRequested) return { status: "employee-success", message: isTeacher ? "Teacher created successfully." : "Employee created successfully.", employeeId, personId };
  return provisionTeacherPortalAccess(s, c.active_school_id, employeeId, personId, loginEmail);
}

async function provisionTeacherPortalAccess(s: Awaited<ReturnType<typeof createClient>>, schoolId: string, employeeId: string, personId: string, loginEmail: string): Promise<TeacherCreateState> {
  try {
    const result = await invokeAdminUsers(s, { action: "invite", email: loginEmail, schoolId, roleCode: "teacher", personId, platformRole: null });
    if (result.code === "existing_account") return { status: "existing-account", message: "An account already exists for this email address.", employeeId, personId, loginEmail, canLink: result.canLink === true };
    const temporaryPassword = typeof result.temporaryPassword === "string" ? result.temporaryPassword : undefined;
    if (!temporaryPassword) return { status: "portal-failure", message: "Teacher created successfully, but portal access could not be enabled. Try again.", employeeId, personId, loginEmail };
    return { status: "portal-success", message: "Teacher created successfully. Portal access enabled.", employeeId, personId, loginEmail, temporaryPassword };
  } catch {
    return { status: "portal-failure", message: "Teacher created successfully, but portal access could not be enabled. Try again.", employeeId, personId, loginEmail };
  }
}

export async function retryTeacherPortalAccess(_previous: TeacherCreateState, f: FormData): Promise<TeacherCreateState> {
  const c = await requireUserContext("users.manage");
  const employeeId = v(f, "employee_id"), personId = v(f, "person_id"), loginEmail = v(f, "login_email").toLowerCase();
  if (!c.active_school_id || !validEmail(loginEmail)) return { status: "error", message: "Enter a valid login email." };
  const s = await createClient();
  const employee = await requireSchoolRecord(s, "employees", employeeId, c.active_school_id, "id,person_id");
  if (employee.person_id !== personId) return { status: "error", message: "This teacher is not available in the active school." };
  return provisionTeacherPortalAccess(s, c.active_school_id, employeeId, personId, loginEmail);
}

export async function linkExistingTeacherPortalAccess(_previous: TeacherCreateState, f: FormData): Promise<TeacherCreateState> {
  const c = await requireUserContext("users.manage");
  const employeeId = v(f, "employee_id"), personId = v(f, "person_id"), loginEmail = v(f, "login_email").toLowerCase();
  if (!c.active_school_id || !validEmail(loginEmail)) return { status: "error", message: "Enter a valid login email." };
  const s = await createClient();
  const employee = await requireSchoolRecord(s, "employees", employeeId, c.active_school_id, "id,person_id");
  if (employee.person_id !== personId) return { status: "error", message: "This teacher is not available in the active school." };
  try {
    const result = await invokeAdminUsers(s, { action: "link-existing", email: loginEmail, schoolId: c.active_school_id, roleCode: "teacher", personId, platformRole: null });
    if (result.code === "existing_account") return { status: "existing-account", message: "An account already exists for this email address.", employeeId, personId, loginEmail, canLink: result.canLink === true };
    revalidatePath(`/app/staff/${employeeId}`);
    return { status: "portal-success", message: "Portal access enabled for the existing account.", employeeId, personId, loginEmail };
  } catch { return { status: "error", message: "The existing account cannot be linked safely." }; }
}

export async function updateEmployee(employeeId: string, f: FormData) {
  const c = await requireUserContext("staff.manage");
  const s = await createClient();
  const employee = await requireSchoolRecord(
    s,
    "employees",
    employeeId,
    c.active_school_id,
    "id,person_id"
  );
  const status = v(f, "status");
  const employmentType = v(f, "employment_type");
  const allowedStatuses = new Set(["active", "inactive", "suspended", "terminated"]);
  const allowedTypes = new Set(["full_time", "part_time", "contract", "temporary", "volunteer", "intern"]);
  if (!allowedStatuses.has(status) || !allowedTypes.has(employmentType)) {
    redirect(`/app/staff/${employeeId}?error=Invalid%20employment%20value`);
  }
  const [{ error: personError }, { error: employeeError }] = await Promise.all([
    (s.from("people") as any)
      .update({
        first_name: v(f, "first_name"),
        middle_name: v(f, "middle_name") || null,
        last_name: v(f, "last_name"),
        primary_email: v(f, "primary_email") || null,
        primary_phone: v(f, "primary_phone") || null
      })
      .eq("id", employee.person_id)
      .eq("school_id", c.active_school_id),
    (s.from("employees") as any)
      .update({ employment_type: employmentType, status })
      .eq("id", employeeId)
      .eq("school_id", c.active_school_id)
  ]);
  const error = personError || employeeError;
  if (error) redirect(`/app/staff/${employeeId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/staff/${employeeId}`);
  revalidatePath("/app/staff");
  redirect(`/app/staff/${employeeId}?message=Employee%20updated`);
}
