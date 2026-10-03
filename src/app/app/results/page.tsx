import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/formatting";

export default async function Results({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const qp = await searchParams;
  const c = await requireUserContext("assessments.read");
  if (!c.active_school_id) return <div>Select a school.</div>;
  const s = await createClient();
  const sid = c.active_school_id;

  const [{ data: years }, { data: terms }, { data: sections }, { data: subjects }] =
    await Promise.all([
      (s.from("academic_years") as any)
        .select("id,name,is_current")
        .eq("school_id", sid)
        .order("starts_on", { ascending: false }),
      (s.from("terms") as any)
        .select("id,name,is_current")
        .eq("school_id", sid)
        .order("starts_on", { ascending: false }),
      (s.from("class_sections") as any)
        .select("id,name,class_groups(name)")
        .eq("school_id", sid)
        .eq("status", "active"),
      (s.from("subjects") as any).select("id,name").eq("school_id", sid)
    ]);

  let results: any[] = [];
  let hasFilters = qp.academic_year_id || qp.term_id || qp.class_section_id || qp.subject_id;

  if (hasFilters) {
    const isTeacher = c.permissions.includes("assessments.manage");
    const isSchoolAdmin = c.permissions.includes("assessments.read");

    let query = (s.from("subject_results") as any)
      .select(
        "id,total_score,percentage_score,grade,status,remarks,calculated_at,students(id,admission_number,people(first_name,last_name)),subjects(name),terms(name),class_sections(name,class_groups(name))"
      )
      .eq("school_id", sid);

    if (qp.academic_year_id) query = query.eq("academic_year_id", qp.academic_year_id);
    if (qp.term_id) query = query.eq("term_id", qp.term_id);
    if (qp.class_section_id) query = query.eq("class_section_id", qp.class_section_id);
    if (qp.subject_id) query = query.eq("subject_id", qp.subject_id);

    // Only show published results to students/guardians
    if (!isTeacher && !isSchoolAdmin) {
      query = query.eq("status", "published");
    }

    const { data } = await query.order("calculated_at", { ascending: false }).limit(100);
    results = data ?? [];
  }

  return (
    <div>
      <PageHeader
        title="Results"
        description="View published academic results and report cards."
      />
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Filter results</h2>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4">
            <input type="hidden" name="school_id" value={sid ?? ""} />
            <SelectField
              name="academic_year_id"
              label="Academic year"
              rows={years}
              defaultId={(years ?? []).find((x: any) => x.is_current)?.id}
            />
            <SelectField
              name="term_id"
              label="Term"
              rows={terms}
              defaultId={(terms ?? []).find((x: any) => x.is_current)?.id}
            />
            <SelectField
              name="class_section_id"
              label="Class section"
              rows={(sections ?? []).map((x: any) => ({
                id: x.id,
                name: `${x.class_groups?.name} — ${x.name}`
              }))}
            />
            <SelectField name="subject_id" label="Subject" rows={subjects} />
            <div className="md:col-span-4 flex justify-end">
              <Button>Filter results</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasFilters && (
        <Card className="mt-6">
          <CardHeader>
            <h2 className="font-semibold">
              Results {results.length > 0 ? `(${results.length})` : ""}
            </h2>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((r: any) => (
                  <div
                    className="flex items-center justify-between rounded-xl border p-3"
                    key={r.id}
                  >
                    <div>
                      <p className="font-semibold">
                        {r.students?.people?.first_name} {r.students?.people?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.students?.admission_number} · {r.class_sections?.class_groups?.name} —{" "}
                        {r.class_sections?.name} · {r.subjects?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{r.percentage_score ?? "—"}%</p>
                      <Badge>{r.grade ?? r.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">No results found for selected filters.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SelectField({
  name,
  label,
  rows,
  defaultId
}: {
  name: string;
  label: string;
  rows: any[] | null;
  defaultId?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select name={name} defaultValue={defaultId ?? ""}>
        <option value="">All</option>
        {(rows ?? []).map((x: any) => (
          <option value={x.id} key={x.id}>
            {x.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
