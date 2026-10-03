import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";

export async function isAssignedTeacher(
  context: UserContext,
  classSectionId: string,
  subjectId?: string | null
): Promise<boolean> {
  const schoolId = context.active_school_id;
  if (!schoolId) return false;
  const supabase = await createClient();
  const { data: employee } = await (supabase.from("employees") as any)
    .select("id,people!inner(id)")
    .eq("school_id", schoolId)
    .eq("people.school_id", schoolId)
    .eq("people.user_id", context.user_id)
    .maybeSingle();
  if (!employee) return false;
  let query = (supabase.from("teacher_assignments") as any)
    .select("id")
    .eq("school_id", schoolId)
    .eq("employee_id", employee.id)
    .eq("class_section_id", classSectionId)
    .or(`ends_on.is.null,ends_on.gt.${new Date().toISOString().slice(0, 10)}`)
    .limit(1);
  if (subjectId) query = query.eq("subject_id", subjectId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}
