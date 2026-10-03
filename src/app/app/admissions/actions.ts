"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
const v = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export async function decideApplication(id: string, f: FormData) {
  const c = await requireUserContext("admissions.manage");
  const decision = v(f, "decision");
  const s = await createClient();
  await requireSchoolRecord(s, "applications", id, c.active_school_id);
  const { error } = await (s.from("applications") as any)
    .update({
      status: decision,
      decision,
      decision_at: new Date().toISOString(),
      decision_by: c.user_id,
      notes: v(f, "notes") || null
    })
    .eq("id", id)
    .eq("school_id", c.active_school_id);
  if (error) redirect(`/app/admissions/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/admissions/${id}`);
  redirect(`/app/admissions/${id}?message=Decision%20saved`);
}
export async function updateApplication(id: string, f: FormData) {
  const c = await requireUserContext("admissions.manage");
  const s = await createClient();
  await requireSchoolRecord(s, "applications", id, c.active_school_id);

  const { error } = await (s.from("applications") as any)
    .update({
      application_number: v(f, "application_number"),
      status: v(f, "status"),
      decision: v(f, "decision") || null,
      academic_year_id: v(f, "academic_year_id") || null,
      campus_id: v(f, "campus_id") || null,
      desired_grade_level_id: v(f, "desired_grade_level_id") || null,
      notes: v(f, "notes") || null
    })
    .eq("id", id)
    .eq("school_id", c.active_school_id);

  if (error) redirect(`/app/admissions/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/admissions/${id}`);
  redirect(`/app/admissions/${id}?message=Application%20updated`);
}

export async function convertApplication(id: string, f: FormData) {
  const c = await requireUserContext("admissions.manage");
  const s = await createClient();
  await requireSchoolRecord(s, "applications", id, c.active_school_id);
  await requireSchoolRecord(s, "class_sections", v(f, "class_section_id"), c.active_school_id);
  const { data, error } = await s.rpc(
    "convert_application_to_student" as any,
    {
      target_application_id: id,
      admission_number: v(f, "admission_number"),
      class_section_id: v(f, "class_section_id"),
      target_term_id: v(f, "term_id") || null,
      roll_number: v(f, "roll_number") || null
    } as any
  );
  if (error) redirect(`/app/admissions/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/admissions");
  redirect(`/app/students/${(data as any).student_id}?message=Applicant%20enrolled`);
}
