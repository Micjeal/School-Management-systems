"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
import { isAssignedTeacher } from "@/lib/access/teaching";
const v = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export async function createAssessment(f: FormData) {
  const c = await requireUserContext("assessments.manage");
  if (!c.active_school_id) redirect("/app/assessments/new?error=Select%20a%20school");
  const s = await createClient();
  await requireSchoolRecord(s, "class_sections", v(f, "class_section_id"), c.active_school_id);
  const { data, error } = await (s.from("assessments") as any)
    .insert({
      school_id: c.active_school_id,
      academic_year_id: v(f, "academic_year_id"),
      term_id: v(f, "term_id"),
      class_section_id: v(f, "class_section_id"),
      subject_id: v(f, "subject_id"),
      assessment_type_id: v(f, "assessment_type_id"),
      title: v(f, "title"),
      description: v(f, "description") || null,
      assessment_date: v(f, "assessment_date") || null,
      maximum_score: Number(v(f, "maximum_score")),
      weight: Number(v(f, "weight") || 100),
      grading_scale_id: v(f, "grading_scale_id") || null,
      status: "draft",
      created_by: c.user_id
    })
    .select("id")
    .single();
  if (error) redirect(`/app/assessments/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/assessments");
  redirect(`/app/assessments/${data.id}`);
}
export async function updateAssessment(id: string, f: FormData) {
  const c = await requireUserContext("assessments.manage");
  const s = await createClient();
  const assessment = await requireSchoolRecord(s, "assessments", id, c.active_school_id, "id,class_section_id,subject_id,status");
  if (assessment.status !== "draft") redirect(`/app/assessments/${id}?error=Only%20draft%20assessments%20can%20be%20edited`);
  if (!c.permissions.includes("results.moderate") && !(await isAssignedTeacher(c, assessment.class_section_id, assessment.subject_id))) throw new Error("RECORD_NOT_FOUND");
  const maximumScore = Number(v(f, "maximum_score"));
  const weight = Number(v(f, "weight"));
  if (!v(f, "title") || !Number.isFinite(maximumScore) || maximumScore <= 0 || !Number.isFinite(weight) || weight < 0) {
    redirect(`/app/assessments/${id}?error=Enter%20valid%20assessment%20values`);
  }
  const { error } = await (s.from("assessments") as any)
    .update({ title: v(f, "title"), assessment_date: v(f, "assessment_date") || null, maximum_score: maximumScore, weight })
    .eq("id", id)
    .eq("school_id", c.active_school_id)
    .eq("status", "draft");
  if (error) redirect(`/app/assessments/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/assessments/${id}`);
  revalidatePath("/app/assessments");
  redirect(`/app/assessments/${id}?message=Assessment%20updated`);
}
export async function saveMarks(id: string, f: FormData) {
  const c = await requireUserContext("results.enter");
  const s = await createClient();
  const assessment = await requireSchoolRecord(s, "assessments", id, c.active_school_id, "id,class_section_id,subject_id");
  if (!c.permissions.includes("results.moderate") && !(await isAssignedTeacher(c, assessment.class_section_id, assessment.subject_id))) throw new Error("RECORD_NOT_FOUND");
  const { error } = await s.rpc(
    "save_mark_entries" as any,
    {
      target_assessment_id: id,
      entries: JSON.parse(v(f, "entries") || "[]"),
      submit_entries: f.get("submit_entries") === "yes"
    } as any
  );
  if (error) redirect(`/app/assessments/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/assessments/${id}`);
  redirect(`/app/assessments/${id}?message=Marks%20saved`);
}
export async function moderateMarks(id: string, f: FormData) {
  const c = await requireUserContext("results.moderate");
  const s = await createClient();
  await requireSchoolRecord(s, "assessments", id, c.active_school_id);
  const approve = f.get("approve") === "yes";
  const { error } = await s.rpc(
    "moderate_assessment_marks" as any,
    { target_assessment_id: id, approve, note: v(f, "note") || null } as any
  );
  if (error) redirect(`/app/assessments/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/assessments/${id}`);
  redirect(`/app/assessments/${id}?message=Moderation%20completed`);
}
export async function calculateResults(f: FormData) {
  const c = await requireUserContext("results.moderate");
  if (!c.active_school_id) redirect("/app/assessments?error=Select%20a%20school");
  const s = await createClient();
  await requireSchoolRecord(s, "class_sections", v(f, "class_section_id"), c.active_school_id);
  const { error } = await s.rpc(
    "calculate_class_results" as any,
    {
      target_school_id: c.active_school_id,
      target_academic_year_id: v(f, "academic_year_id"),
      target_term_id: v(f, "term_id"),
      target_class_section_id: v(f, "class_section_id")
    } as any
  );
  if (error) redirect(`/app/assessments?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/assessments");
  redirect("/app/assessments?message=Results%20and%20report%20cards%20calculated");
}
export async function publishResults(f: FormData) {
  const c = await requireUserContext("results.publish");
  if (!c.active_school_id) redirect("/app/assessments?error=Select%20a%20school");
  const s = await createClient();
  const { data: publication, error: createError } = await (s.from("result_publications") as any)
    .insert({
      school_id: c.active_school_id,
      academic_year_id: v(f, "academic_year_id"),
      term_id: v(f, "term_id"),
      class_section_id: v(f, "class_section_id"),
      publication_type: "term_results",
      status: "draft"
    })
    .select("id")
    .single();
  if (createError) redirect(`/app/assessments?error=${encodeURIComponent(createError.message)}`);
  const { error } = await s.rpc(
    "publish_class_results" as any,
    { publication_id: publication.id } as any
  );
  if (error) redirect(`/app/assessments?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/assessments");
  redirect("/app/assessments?message=Results%20published");
}
