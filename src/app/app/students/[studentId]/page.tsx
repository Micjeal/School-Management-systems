import { notFound } from "next/navigation";
import { getAccessContext } from "@/lib/auth/get-access-context";
import { canReadStudent } from "@/lib/access/students";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/formatting";
import { updateStudent } from "../actions";
import { isUuid } from "@/lib/auth/access-errors";
import { AccountAccessCard } from "@/components/users/account-access-card";
export default async function StudentDetail({
  params,
  searchParams
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { studentId } = await params;
  if (!isUuid(studentId)) notFound();
  const qp = await searchParams;
  const context = await getAccessContext();
  if (!context.activeSchoolId) notFound();
  const access = await canReadStudent(context, studentId);
  if (!access.allowed) notFound();
  const schoolId = context.activeSchoolId;
  const canManageUsers = context.isPlatformAdmin || context.isPlatformSuperAdmin || context.permissionCodes.includes("users.manage");
  const s = await createClient();
  // Authorize the parent row before loading any related or sensitive records.
  const { data: student } = await (s.from("students") as any)
    .select(
      access.relationship === "teacher"
        ? "id,person_id,admission_number,student_number,boarding_status,status,current_campus_id,people(id,first_name,middle_name,last_name),campuses(name)"
        : `id,person_id,admission_number,student_number,admission_date,boarding_status,status,current_campus_id,people(id,first_name,middle_name,last_name,gender,date_of_birth,primary_email,primary_phone${canManageUsers ? ",user_id" : ""}),campuses(name)`
    )
    .eq("id", studentId)
    .eq("school_id", schoolId)
    .maybeSingle();
  if (!student) notFound();
  const [
    { data: enrolments },
    { data: guardians },
    { data: attendance },
    { data: invoices },
    { data: results },
    { data: campuses }
  ] = await Promise.all([
    (s.from("student_enrolments") as any)
      .select(
        "id,enrolled_on,status,academic_years(name),terms(name),class_sections(name,class_groups(name))"
      )
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .order("enrolled_on", { ascending: false }),
    access.relationship === "school" || access.relationship === "class_teacher"
      ? (s.from("student_guardians") as any)
      .select("id,relationship_type,guardians(id,people(first_name,last_name,primary_phone))")
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      : Promise.resolve({ data: [] }),
    access.academic ? (s.from("student_attendance_records") as any)
      .select("attendance_status")
      .eq("student_id", studentId)
      .eq("school_id", schoolId) : Promise.resolve({ data: [] }),
    access.finance ? (s.from("invoices") as any)
      .select("id,invoice_number,total_amount,balance_due,status,due_date")
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .order("invoice_date", { ascending: false }) : Promise.resolve({ data: [] }),
    access.academic ? (s.from("subject_results") as any)
      .select(
        "id,total_score,percentage_score,grade,status,remarks,calculated_at,subjects(name),terms(name)"
      )
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .in("status", access.relationship === "school" ? ["draft", "calculated", "published"] : ["published"])
      .order("calculated_at", { ascending: false })
      .limit(20) : Promise.resolve({ data: [] }),
    access.update ? (s.from("campuses") as any).select("id,name").eq("school_id", schoolId) : Promise.resolve({ data: [] })
  ]);
  const p = student.people ?? {};
  const [{ data: accountProfile }, { data: portalRoles }, { data: accountMembership }] = canManageUsers
    ? await Promise.all([
        p.user_id ? s.from("profiles").select("is_active,must_change_password").eq("id", p.user_id).maybeSingle() : Promise.resolve({ data: null }),
        (s.from("roles") as any).select("code,name").eq("code", "student").eq("is_active", true).or(`school_id.eq.${schoolId},school_id.is.null`)
        ,p.user_id ? (s.from("school_memberships") as any).select("status,membership_roles(roles(code))").eq("school_id", schoolId).eq("user_id", p.user_id).maybeSingle() : Promise.resolve({ data: null })
      ])
    : [{ data: null }, { data: [] }, { data: null }];
  const studentRoleActive = Boolean(accountMembership?.membership_roles?.some((assignment: any) => assignment.roles?.code === "student"));
  const present = (attendance ?? []).filter((a: any) =>
    ["present", "late"].includes(a.attendance_status)
  ).length;
  const balance = (invoices ?? []).reduce((x: number, i: any) => x + Number(i.balance_due ?? 0), 0);
  return (
    <div>
      <PageHeader
        title={`${p.first_name} ${p.last_name}`}
        description={`${student.admission_number} · ${student.campuses?.name ?? "No campus"}`}
        backHref="/app/students"
      />
      {qp.message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{qp.message}</p>
      ) : null}
      {qp.error ? (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{qp.error}</p>
      ) : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Mini l="Status" v={<Badge>{student.status}</Badge>} />
        <Mini l="Attendance" v={`${present}/${attendance?.length ?? 0}`} />
        <Mini l="Outstanding" v={formatMoney(balance)} />
        <Mini l="Enrolments" v={enrolments?.length ?? 0} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Student profile</h2>
          </CardHeader>
          <CardContent>
            <form
              action={access.update ? updateStudent.bind(null, studentId) : undefined}
              className="grid gap-4 sm:grid-cols-2"
            >
              <F n="first_name" l="First name" v={p.first_name} />
              <F n="middle_name" l="Middle name" v={p.middle_name} />
              <F n="last_name" l="Last name" v={p.last_name} />
              <F n="date_of_birth" l="Date of birth" v={p.date_of_birth} type="date" />
              <F n="primary_email" l="Email" v={p.primary_email} type="email" />
              <F n="primary_phone" l="Phone" v={p.primary_phone} />
              <F n="student_number" l="Student number" v={student.student_number} />
              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={student.status}>
                  {["active", "suspended", "withdrawn", "graduated", "transferred", "archived"].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    )
                  )}
                </Select>
              </div>
              <div>
                <Label>Boarding</Label>
                <Select name="boarding_status" defaultValue={student.boarding_status}>
                  {["day", "boarding", "weekly_boarding"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Campus</Label>
                <Select name="current_campus_id" defaultValue={student.current_campus_id ?? ""}>
                  <option value="">None</option>
                  {(campuses ?? []).map((x: any) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </Select>
              </div>
              <input type="hidden" name="gender" value={p.gender ?? ""} />
              <div className="sm:col-span-2 flex justify-end">
                {access.update ? <Button>Save profile</Button> : null}
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          {canManageUsers ? <AccountAccessCard recordType="student" recordId={studentId} personId={student.person_id} userId={p.user_id} email={p.primary_email} profile={accountProfile} roles={portalRoles ?? []} studentRoleActive={studentRoleActive} membershipStatus={accountMembership?.status} label="Enable student portal" /> : null}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Enrolment history</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {(enrolments ?? []).map((e: any) => (
                <div className="rounded-xl bg-slate-50 p-3" key={e.id}>
                  <p className="font-semibold">
                    {e.class_sections?.class_groups?.name} — {e.class_sections?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {e.academic_years?.name} · {e.terms?.name ?? "All year"} ·{" "}
                    {formatDate(e.enrolled_on)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Guardians</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {(guardians ?? []).map((g: any) => (
                <div key={g.id}>
                  <p className="font-semibold">
                    {g.guardians?.people?.first_name} {g.guardians?.people?.last_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {g.relationship_type} · {g.guardians?.people?.primary_phone}
                  </p>
                </div>
              ))}
              {!guardians?.length ? (
                <p className="text-sm text-slate-500">No linked guardian.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Invoices</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {(invoices ?? []).map((i: any) => (
              <div className="flex justify-between rounded-xl bg-slate-50 p-3" key={i.id}>
                <div>
                  <p className="font-semibold">{i.invoice_number}</p>
                  <p className="text-xs text-slate-500">Due {formatDate(i.due_date)}</p>
                </div>
                <div className="text-right">
                  <p>{formatMoney(i.balance_due)}</p>
                  <Badge>{i.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Published and calculated results</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {(results ?? []).map((r: any) => (
              <div className="flex justify-between rounded-xl bg-slate-50 p-3" key={r.id}>
                <div>
                  <p className="font-semibold">{r.subjects?.name}</p>
                  <p className="text-xs text-slate-500">{r.terms?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{r.percentage_score ?? "—"}%</p>
                  <Badge>{r.grade ?? r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function F({ n, l, v, type = "text" }: { n: string; l: string; v: any; type?: string }) {
  return (
    <div>
      <Label>{l}</Label>
      <Input name={n} type={type} defaultValue={v ?? ""} />
    </div>
  );
}
function Mini({ l, v }: { l: string; v: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{l}</p>
      <div className="mt-2 text-xl font-bold">{v}</div>
    </div>
  );
}
