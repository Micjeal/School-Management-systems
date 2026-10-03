"use server";

import { requireUserContext } from "@/lib/auth/context";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invokeAdminUsers } from "@/app/app/platform/users/actions";
import { isUuid } from "@/lib/auth/access-errors";
import { publicEnv } from "@/lib/env";
import { recoveryRedirect } from "@/lib/auth/password-recovery";

export type ProvisionState = { status: "idle" | "error" | "success" | "existing-account"; message?: string; temporaryPassword?: string; email?: string; canLink?: boolean };
export type PortalManagementState = { status: "idle" | "error" | "success"; message?: string };
export type TemporaryPasswordState = { status: "idle" | "error" | "success"; message?: string; email?: string; temporaryPassword?: string };

export async function enableSystemAccess(_previous: ProvisionState, formData: FormData): Promise<ProvisionState> {
  const context = await requireUserContext("users.manage");
  const schoolId = context.active_school_id;
  const recordType = String(formData.get("record_type") ?? "");
  const recordId = String(formData.get("record_id") ?? "");
  const personId = String(formData.get("person_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleCode = String(formData.get("role_code") ?? "").trim();
  if (!schoolId || !isUuid(recordId) || !isUuid(personId) || !/^\S+@\S+\.\S+$/.test(email) || !roleCode) {
    return { status: "error", message: "Valid school, person, email, and role are required." };
  }
  const table = recordType === "student" ? "students" : recordType === "employee" ? "employees" : recordType === "guardian" ? "guardians" : null;
  if (!table) return { status: "error", message: "Unsupported account record type." };
  if (recordType === "student" && roleCode !== "student") return { status: "error", message: "Student portal access requires the student role." };
  const supabase = await createClient();
  const { data: record, error: recordError } = await (supabase.from(table) as any).select("id,person_id").eq("id", recordId).eq("school_id", schoolId).maybeSingle();
  if (recordError || !record || record.person_id !== personId) return { status: "error", message: "The selected person is not available in the active school." };
  const { data: role } = await (supabase.from("roles") as any).select("code").eq("code", roleCode).eq("is_active", true).or(`school_id.eq.${schoolId},school_id.is.null`).maybeSingle();
  if (!role || ["super_admin", "platform_admin"].includes(role.code)) return { status: "error", message: "That school role cannot be assigned." };
  try {
    const result = await invokeAdminUsers(supabase, { action: "invite", email, schoolId, roleCode, personId, platformRole: null });
    if (result.code === "existing_account") return { status: "existing-account", message: "An account already exists for this email address.", email, canLink: result.canLink === true };
    return { status: "success", message: "System access enabled and linked to this person.", temporaryPassword: typeof result.temporaryPassword === "string" ? result.temporaryPassword : undefined };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Account provisioning failed." };
  }
}

export async function linkExistingSystemAccess(_previous: ProvisionState, formData: FormData): Promise<ProvisionState> {
  const context = await requireUserContext("users.manage");
  const schoolId = context.active_school_id;
  const recordType = String(formData.get("record_type") ?? "");
  const recordId = String(formData.get("record_id") ?? "");
  const personId = String(formData.get("person_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleCode = String(formData.get("role_code") ?? "").trim();
  const table = recordType === "student" ? "students" : recordType === "employee" ? "employees" : recordType === "guardian" ? "guardians" : null;
  if (!schoolId || !table || !isUuid(recordId) || !isUuid(personId) || !/^\S+@\S+\.\S+$/.test(email) || !roleCode) return { status: "error", message: "Valid active-school account details are required." };
  if (recordType === "student" && roleCode !== "student") return { status: "error", message: "Student portal access requires the student role." };
  const supabase = await createClient();
  const { data: record } = await (supabase.from(table) as any).select("id,person_id").eq("id", recordId).eq("school_id", schoolId).maybeSingle();
  if (!record || record.person_id !== personId) return { status: "error", message: "The selected person is not available in the active school." };
  try {
    const result = await invokeAdminUsers(supabase, { action: "link-existing", email, schoolId, roleCode, personId, platformRole: null });
    if (result.code === "existing_account") return { status: "existing-account", message: "An account already exists for this email address.", email, canLink: result.canLink === true };
    return { status: "success", message: "Existing account linked and school access ensured." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "The existing account cannot be linked." };
  }
}

export async function manageStudentPortalAccess(_previous: PortalManagementState, formData: FormData): Promise<PortalManagementState> {
  const context = await requireUserContext("users.manage");
  const schoolId = context.active_school_id;
  const studentId = String(formData.get("student_id") ?? "");
  const personId = String(formData.get("person_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const operation = String(formData.get("operation") ?? "");
  if (!schoolId || !isUuid(studentId) || !isUuid(personId) || !isUuid(userId) || !["enable", "disable", "repair"].includes(operation)) return { status: "error", message: "The active student account context is invalid." };
  const supabase = await createClient();
  const { data: student } = await (supabase.from("students") as any).select("id,person_id").eq("id", studentId).eq("school_id", schoolId).maybeSingle();
  if (!student || student.person_id !== personId) return { status: "error", message: "The selected student is not available in the active school." };
  try {
    await invokeAdminUsers(supabase, { action: operation === "disable" ? "disable-school-access" : "enable-school-access", schoolId, personId, userId, roleCode: "student" });
    return { status: "success", message: operation === "disable" ? "Student portal access disabled. The Auth account and other school roles were preserved." : "Student portal access is active." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Unable to update portal access." };
  }
}

export async function sendStudentPortalPasswordReset(_previous: PortalManagementState, formData: FormData): Promise<PortalManagementState> {
  const context = await requireUserContext("users.manage");
  const schoolId = context.active_school_id;
  const studentId = String(formData.get("student_id") ?? "");
  const personId = String(formData.get("person_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!schoolId || !isUuid(studentId) || !isUuid(personId) || !isUuid(userId) || !/^\S+@\S+\.\S+$/.test(email)) return { status: "error", message: "The active student account context is invalid." };
  const supabase = await createClient();
  const { data: student } = await (supabase.from("students") as any).select("person_id,people!inner(user_id)").eq("id", studentId).eq("school_id", schoolId).maybeSingle();
  if (!student || student.person_id !== personId || student.people?.user_id !== userId) return { status: "error", message: "The linked student account is not available in the active school." };
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: recoveryRedirect(publicEnv.NEXT_PUBLIC_SITE_URL) });
  if (error) return { status: "error", message: "Unable to send a password reset at this time." };
  return { status: "success", message: "Password reset instructions have been sent." };
}

export async function issueStudentTemporaryPassword(_previous: TemporaryPasswordState, formData: FormData): Promise<TemporaryPasswordState> {
  const context = await requireUserContext("users.manage");
  const schoolId = context.active_school_id;
  const studentId = String(formData.get("student_id") ?? "");
  const personId = String(formData.get("person_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  if (!schoolId || !isUuid(studentId) || !isUuid(personId) || !isUuid(userId)) return { status: "error", message: "The active student account context is invalid." };
  const supabase = await createClient();
  const { data: student } = await (supabase.from("students") as any).select("person_id,people!inner(user_id,primary_email)").eq("id", studentId).eq("school_id", schoolId).maybeSingle();
  if (!student || student.person_id !== personId || student.people?.user_id !== userId) return { status: "error", message: "The linked student account is not available in the active school." };
  try {
    const result = await invokeAdminUsers(supabase, { action: "issue-temporary-password", schoolId, personId, userId, roleCode: "student" });
    const temporaryPassword = typeof result.temporaryPassword === "string" ? result.temporaryPassword : undefined;
    const email = typeof result.email === "string" ? result.email : student.people.primary_email;
    if (!temporaryPassword || !email) return { status: "error", message: "Temporary password issuance did not return the required account details." };
    revalidatePath(`/app/students/${studentId}`);
    return { status: "success", message: "Portal access enabled. Give this temporary password to the student. They must change it after signing in.", email, temporaryPassword };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Unable to issue a temporary password." };
  }
}
