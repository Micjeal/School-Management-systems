import "server-only";
import type { AccessContext } from "@/lib/auth/get-access-context";
import { hasPermission, requireActiveSchool } from "@/lib/auth/get-access-context";
import { createClient } from "@/lib/supabase/server";
import {
  EMPLOYEE_DIRECTORY_COLUMNS,
  EMPLOYEE_HR_COLUMNS,
  EMPLOYEE_SELF_COLUMNS
} from "./projections";

export type StaffDirectoryFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

export async function getAuthorizedStaffDirectory(
  context: AccessContext,
  filters: StaffDirectoryFilters = {}
) {
  const schoolId = requireActiveSchool(context);
  if (!hasPermission(context, "staff.read")) return { rows: [], count: 0 };
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 25));
  const offset = (page - 1) * pageSize;
  const supabase = await createClient();
  let query = (supabase.from("employees") as any)
    .select(EMPLOYEE_DIRECTORY_COLUMNS, { count: "exact" })
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);
  if (filters.status) query = query.eq("status", filters.status);
  const search = filters.search?.replace(/[,%()]/g, "").trim();
  if (search) query = query.or(`employee_number.ilike.%${search}%`);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { rows: data ?? [], count: count ?? 0 };
}

export async function getAuthorizedEmployeeDetail(context: AccessContext, employeeId: string) {
  const schoolId = requireActiveSchool(context);
  if (!hasPermission(context, "staff.read")) return null;
  const supabase = await createClient();
  const { data: employee, error } = await (supabase.from("employees") as any)
    .select(EMPLOYEE_HR_COLUMNS)
    .eq("id", employeeId)
    .eq("school_id", schoolId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!employee) return null;
  const [{ data: assignments }, { data: qualifications }, { data: leave }] = await Promise.all([
    (supabase.from("employee_assignments") as any)
      .select("id,job_title,is_primary,starts_on,ends_on,departments(name),campuses(name)")
      .eq("employee_id", employeeId)
      .eq("school_id", schoolId),
    (supabase.from("employee_qualifications") as any)
      .select("id,qualification_name,institution,field_of_study,awarded_on")
      .eq("employee_id", employeeId)
      .eq("school_id", schoolId),
    (supabase.from("leave_requests") as any)
      .select("id,starts_on,ends_on,status,leave_types(name)")
      .eq("employee_id", employeeId)
      .eq("school_id", schoolId)
      .order("requested_at", { ascending: false })
      .limit(25)
  ]);
  return {
    employee,
    assignments: assignments ?? [],
    qualifications: qualifications ?? [],
    leave: leave ?? []
  };
}

export async function getMyEmployeeRecord(context: AccessContext) {
  const schoolId = requireActiveSchool(context);
  const supabase = await createClient();
  const { data, error } = await (supabase.from("employees") as any)
    .select(EMPLOYEE_SELF_COLUMNS)
    .eq("school_id", schoolId)
    .eq("people.school_id", schoolId)
    .eq("people.user_id", context.userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}
