"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
import { isUuid } from "@/lib/auth/access-errors";

const v = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function createBoardingAssignment(f: FormData) {
  const c = await requireUserContext("boarding.manage");
  if (!c.active_school_id) redirect("/app/boarding/assignments?error=Select+a+school");
  const s = await createClient();
  const studentId = v(f, "student_id");
  const bedId = v(f, "bed_id");
  const academicYearId = v(f, "academic_year_id");
  if (!isUuid(studentId)) redirect("/app/boarding/assignments/new?error=Invalid+student");
  if (!isUuid(bedId)) redirect("/app/boarding/assignments/new?error=Invalid+bed");
  await requireSchoolRecord(s, "students", studentId, c.active_school_id);
  await requireSchoolRecord(s, "boarding_beds", bedId, c.active_school_id);
  const { error } = await (s.from("boarding_assignments") as any).insert({
    student_id: studentId,
    bed_id: bedId,
    school_id: c.active_school_id,
    academic_year_id: academicYearId || null,
    term_id: v(f, "term_id") || null,
    starts_on: v(f, "starts_on") || new Date().toISOString().slice(0, 10),
    ends_on: v(f, "ends_on") || null,
    status: "active",
  });
  if (error) redirect(`/app/boarding/assignments/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/boarding/assignments");
  redirect("/app/boarding/assignments?message=Assignment+created");
}

export async function saveBoardingRollCall(f: FormData) {
  const c = await requireUserContext("boarding.manage");
  if (!c.active_school_id) redirect("/app/boarding/roll-call?error=Select+a+school");
  const s = await createClient();
  const hostelId = v(f, "hostel_id");
  const sessionDate = v(f, "session_date");
  const sessionType = v(f, "session_type") || "evening";
  if (!isUuid(hostelId)) redirect("/app/boarding/roll-call?error=Invalid+hostel");
  const studentIdsStr = v(f, "student_ids");
  const studentIds = studentIdsStr.split(",").filter(Boolean);
  if (studentIds.length === 0)
    redirect(`/app/boarding/roll-call?hostel_id=${hostelId}&error=No+students+to+record`);
  const records = studentIds.map((studentId) => ({
    school_id: c.active_school_id,
    student_id: studentId,
    hostel_id: hostelId,
    session_date: sessionDate,
    session_type: sessionType,
    attendance_status: v(f, `att_${studentId}`) || "present",
    recorded_by: c.user_id,
  }));
  const { error } = await (s.from("boarding_attendance") as any).upsert(records, {
    onConflict: "school_id,student_id,hostel_id,session_date,session_type",
  });
  if (error)
    redirect(
      `/app/boarding/roll-call?hostel_id=${hostelId}&error=${encodeURIComponent(error.message)}`
    );
  revalidatePath("/app/boarding/roll-call");
  redirect(`/app/boarding/roll-call?hostel_id=${hostelId}&message=Roll+call+saved`);
}

export async function createBoardingIncident(f: FormData) {
  await requireUserContext("boarding.manage");
  void f;
  redirect("/app/boarding/incidents?error=This+feature+is+not+yet+configured");
}

export async function resolveIncident(f: FormData) {
  await requireUserContext("boarding.manage");
  void f;
  redirect("/app/boarding/incidents?error=This+feature+is+not+yet+configured");
}
