import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarksGrid } from "@/components/forms/marks-grid";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveMarks, moderateMarks, updateAssessment } from "../actions";
import { isUuid } from "@/lib/auth/access-errors";
import { isAssignedTeacher } from "@/lib/access/teaching";
export default async function Assessment({
  params,
  searchParams
}: {
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { assessmentId } = await params;
  if (!isUuid(assessmentId)) notFound();
  const qp = await searchParams;
  const c = await requireUserContext("assessments.read");
  if (!c.active_school_id) notFound();
  const s = await createClient();
  const { data: a } = await (s.from("assessments") as any)
    .select("id,academic_year_id,class_section_id,subject_id,title,assessment_date,maximum_score,weight,status,subjects(name),class_sections(name,class_groups(name)),assessment_types(name)")
    .eq("id", assessmentId)
    .eq("school_id", c.active_school_id)
    .maybeSingle();
  if (!a) notFound();
  if (!c.permissions.includes("results.moderate") && !(await isAssignedTeacher(c, a.class_section_id, a.subject_id))) notFound();
  const [{ data: enrolments }, { data: marks }] = await Promise.all([
    (s.from("student_enrolments") as any)
      .select("student_id,students(admission_number,people(first_name,last_name))")
      .eq("school_id", c.active_school_id)
      .eq("academic_year_id", a.academic_year_id)
      .eq("class_section_id", a.class_section_id)
      .eq("enrolment_status", "active"),
    (s.from("mark_entries") as any)
      .select("id,student_id,score,is_absent,is_exempt,remarks,status")
      .eq("assessment_id", assessmentId)
      .eq("school_id", c.active_school_id)
  ]);
  const markMap = new Map((marks ?? []).map((m: any) => [m.student_id, m]));
  const rows = (enrolments ?? []).map((e: any) => {
    const m: any = markMap.get(e.student_id);
    return {
      student_id: e.student_id,
      name: `${e.students?.people?.first_name ?? ""} ${e.students?.people?.last_name ?? ""}`,
      admission_number: e.students?.admission_number ?? "",
      score: m?.score ?? null,
      is_absent: m?.is_absent ?? false,
      is_exempt: m?.is_exempt ?? false,
      remarks: m?.remarks ?? ""
    };
  });
  const editable = !["published", "locked", "cancelled", "moderated"].includes(a.status);
  return (
    <div>
      <PageHeader
        title={a.title}
        description={`${a.class_sections?.class_groups?.name} — ${a.class_sections?.name} · ${a.subjects?.name} · maximum ${a.maximum_score}`}
        backHref="/app/assessments"
      />
      {qp.message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{qp.message}</p>
      ) : null}
      {qp.error ? (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{qp.error}</p>
      ) : null}
      <div className="mb-4 flex items-center justify-between">
        <Badge>{a.status}</Badge>
        <p className="text-sm text-slate-500">
          {rows.length} learners · weight {a.weight}%
        </p>
      </div>
      {a.status === "draft" && (c.is_platform_admin || c.permissions.includes("assessments.manage")) ? (
        <Card className="mb-6">
          <CardHeader><h2 className="font-semibold">Edit assessment</h2></CardHeader>
          <CardContent><form action={updateAssessment.bind(null, assessmentId)} className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2"><Label>Title</Label><Input name="title" defaultValue={a.title} required /></div>
            <div><Label>Assessment date</Label><Input name="assessment_date" type="date" defaultValue={a.assessment_date ?? ""} /></div>
            <div><Label>Maximum score</Label><Input name="maximum_score" type="number" min="0.01" step="0.01" defaultValue={a.maximum_score} required /></div>
            <div><Label>Weight</Label><Input name="weight" type="number" min="0" step="0.01" defaultValue={a.weight} required /></div>
            <div className="md:col-span-3 flex items-end justify-end"><Button>Save assessment</Button></div>
          </form></CardContent>
        </Card>
      ) : null}
      <MarksGrid
        rows={rows}
        maximumScore={Number(a.maximum_score)}
        action={saveMarks.bind(null, assessmentId)}
        editable={editable}
      />
      {a.status === "submitted" || a.status === "moderated" ? (
        <Card className="mt-6">
          <CardHeader>
            <h2 className="font-semibold">Moderation</h2>
          </CardHeader>
          <CardContent>
            <form
              action={moderateMarks.bind(null, assessmentId)}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <Label>Moderation note</Label>
                <Input name="note" />
              </div>
              <Button name="approve" value="yes">
                Approve marks
              </Button>
              <Button variant="danger" name="approve" value="no">
                Return to teacher
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
