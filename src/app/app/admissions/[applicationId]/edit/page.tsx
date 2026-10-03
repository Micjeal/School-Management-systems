import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateApplication } from "../../actions";
import { isUuid } from "@/lib/auth/access-errors";

export default async function EditApplication({
  params
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  if (!isUuid(applicationId)) notFound();
  const c = await requireUserContext("admissions.manage");
  if (!c.active_school_id) notFound();
  const s = await createClient();
  const schoolId = c.active_school_id;

  const [{ data: application }, { data: years }, { data: campuses }, { data: grades }] =
    await Promise.all([
      (s.from("applications") as any)
        .select(
          "id,application_number,status,decision,notes,submitted_at,academic_year_id,campus_id,desired_grade_level_id"
        )
        .eq("id", applicationId)
        .eq("school_id", schoolId)
        .maybeSingle(),
      (s.from("academic_years") as any).select("id,name").eq("school_id", schoolId),
      (s.from("campuses") as any).select("id,name").eq("school_id", schoolId),
      (s.from("grade_levels") as any).select("id,name").eq("school_id", schoolId)
    ]);

  if (!application) notFound();

  return (
    <div>
      <PageHeader
        title={`Edit application ${application.application_number}`}
        description="Update application details and notes."
        backHref={`/app/admissions/${applicationId}`}
      />
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Application details</h2>
        </CardHeader>
        <CardContent>
          <form action={updateApplication.bind(null, applicationId)} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Application number</Label>
              <Input name="application_number" defaultValue={application.application_number} required />
            </div>
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue={application.status}>
                <option>draft</option>
                <option>submitted</option>
                <option>under_review</option>
                <option>waitlisted</option>
                <option>accepted</option>
                <option>rejected</option>
                <option>withdrawn</option>
                <option>enrolled</option>
              </Select>
            </div>
            <div>
              <Label>Decision</Label>
              <Select name="decision" defaultValue={application.decision ?? ""}>
                <option value="">Pending</option>
                <option>accepted</option>
                <option>rejected</option>
                <option>waitlisted</option>
              </Select>
            </div>
            <div>
              <Label>Academic year</Label>
              <Select name="academic_year_id" defaultValue={application.academic_year_id ?? ""}>
                <option value="">Select</option>
                {(years ?? []).map((y: any) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Campus</Label>
              <Select name="campus_id" defaultValue={application.campus_id ?? ""}>
                <option value="">Select</option>
                {(campuses ?? []).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Desired grade</Label>
              <Select name="desired_grade_level_id" defaultValue={application.desired_grade_level_id ?? ""}>
                <option value="">Select</option>
                {(grades ?? []).map((g: any) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea name="notes" defaultValue={application.notes ?? ""} rows={4} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Link href={`/app/admissions/${applicationId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button>Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
