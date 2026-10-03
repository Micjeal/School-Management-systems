import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";
import { issueBook, returnBook } from "../actions";

export default async function Circulation({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const qp = await searchParams;
  const c = await requireUserContext("library.manage");
  const s = await createClient();
  const sid = c.active_school_id;

  const [{ data: copies }, { data: students }, { data: employees }, { data: loans }] =
    await Promise.all([
      (s.from("library_copies") as any)
        .select("id,accession_number,barcode,library_items(title)")
        .eq("school_id", sid)
        .eq("circulation_status", "available"),
      (s.from("students") as any)
        .select("id,admission_number,people(first_name,last_name)")
        .eq("school_id", sid)
        .eq("status", "active"),
      (s.from("employees") as any)
        .select("id,employee_number,people(first_name,last_name)")
        .eq("school_id", sid)
        .eq("status", "active"),
      (s.from("library_loans") as any)
        .select(
          "id,due_at,status,student_id,employee_id,library_copies(accession_number,library_items(title)),students(admission_number,people(first_name,last_name)),employees(employee_number,people(first_name,last_name))"
        )
        .eq("school_id", sid)
        .in("status", ["active", "overdue"])
        .order("due_at")
    ]);

  return (
    <div>
      <PageHeader
        title="Library circulation"
        description="Issue available copies, track due dates, process returns and assess fines atomically."
        backHref="/app/library"
      />
      {qp.message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{qp.message}</p>
      ) : null}
      {qp.error ? (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{qp.error}</p>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Issue item</h2>
          </CardHeader>
          <CardContent>
            <form action={issueBook} className="space-y-4">
              <div>
                <Label>Available copy</Label>
                <Select name="copy_id" required>
                  <option value="">Select</option>
                  {(copies ?? []).map((x: any) => (
                    <option value={x.id} key={x.id}>
                      {x.library_items?.title} — {x.accession_number}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Borrower type</Label>
                <Select name="borrower_type" defaultValue="student">
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                </Select>
              </div>
              <div>
                <Label>Student</Label>
                <Select name="student_id">
                  <option value="">Select</option>
                  {(students ?? []).map((x: any) => (
                    <option value={x.id} key={x.id}>
                      {x.admission_number} — {x.people?.first_name} {x.people?.last_name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Employee</Label>
                <Select name="employee_id">
                  <option value="">Select</option>
                  {(employees ?? []).map((x: any) => (
                    <option value={x.id} key={x.id}>
                      {x.employee_number} — {x.people?.first_name} {x.people?.last_name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Due date</Label>
                <Input name="due_at" type="date" required />
              </div>
              <Button className="w-full">Issue item</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Active loans</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {(loans ?? []).map((loan: any) => (
              <div key={loan.id} className="rounded-xl bg-slate-50 p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{loan.library_copies?.library_items?.title}</p>
                    <p className="text-xs text-slate-500">{loan.library_copies?.accession_number}</p>
                  </div>
                  <Badge>{loan.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {loan.students
                    ? `${loan.students?.admission_number} — ${loan.students?.people?.first_name} ${loan.students?.people?.last_name}`
                    : `${loan.employees?.employee_number} — ${loan.employees?.people?.first_name} ${loan.employees?.people?.last_name}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">Due: {formatDate(loan.due_at)}</p>
                <form action={returnBook.bind(null, loan.id)} className="mt-3">
                  <Button size="sm" variant="outline">
                    Return
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
