"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
import { isAssignedTeacher } from "@/lib/access/teaching";
const v = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export async function openAttendance(f: FormData) {
  const c = await requireUserContext("attendance.record");
  if (!c.active_school_id) redirect("/app/attendance?error=Select%20a%20school");
  const s = await createClient();
  const classSectionId = v(f, "class_section_id");
  await requireSchoolRecord(s, "class_sections", classSectionId, c.active_school_id);
  if (!c.permissions.includes("attendance.correct") && !(await isAssignedTeacher(c, classSectionId, v(f, "subject_id") || null))) throw new Error("RECORD_NOT_FOUND");
  const { data, error } = await s.rpc(
    "open_attendance_session" as any,
    {
      target_school_id: c.active_school_id,
      target_academic_year_id: v(f, "academic_year_id"),
      target_term_id: v(f, "term_id") || null,
      target_class_section_id: v(f, "class_section_id"),
      target_session_date: v(f, "session_date"),
      target_session_type: v(f, "session_type") || "daily",
      target_subject_id: v(f, "subject_id") || null,
      target_starts_at: v(f, "starts_at") || null,
      target_ends_at: v(f, "ends_at") || null,
      default_attendance_status: "present"
    } as any
  );
  if (error) redirect(`/app/attendance?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/attendance");
  redirect(`/app/attendance/${(data as any).session_id}`);
}
export async function saveAttendance(sessionId: string, f: FormData) {
  const c = await requireUserContext("attendance.record");
  const records = JSON.parse(v(f, "records") || "[]");
  const s = await createClient();
  const session = await requireSchoolRecord(s, "attendance_sessions", sessionId, c.active_school_id, "id,class_section_id,subject_id");
  if (!c.permissions.includes("attendance.correct") && !(await isAssignedTeacher(c, session.class_section_id, session.subject_id))) throw new Error("RECORD_NOT_FOUND");
  const { error } = await s.rpc(
    "save_attendance_records" as any,
    {
      target_session_id: sessionId,
      records,
      submit_session: f.get("submit_session") === "yes"
    } as any
  );
  if (error) redirect(`/app/attendance/${sessionId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/attendance/${sessionId}`);
  redirect(`/app/attendance/${sessionId}?message=Attendance%20saved`);
}
export async function lockAttendance(sessionId: string) {
  const c = await requireUserContext("attendance.correct");
  const s = await createClient();
  await requireSchoolRecord(s, "attendance_sessions", sessionId, c.active_school_id);
  const { error } = await s.rpc(
    "lock_attendance_session" as any,
    { target_session_id: sessionId } as any
  );
  if (error) redirect(`/app/attendance/${sessionId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/attendance/${sessionId}`);
  redirect(`/app/attendance/${sessionId}?message=Attendance%20locked`);
}
