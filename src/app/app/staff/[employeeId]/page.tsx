import { notFound } from "next/navigation";
import { getAccessContext } from "@/lib/auth/get-access-context";
import { isUuid } from "@/lib/auth/access-errors";
import { getAuthorizedEmployeeDetail } from "@/lib/staff/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateEmployee } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { AccountAccessCard } from "@/components/users/account-access-card";

export default async function Employee({ params, searchParams }: { params: Promise<{ employeeId: string }>; searchParams: Promise<{ message?: string; error?: string }> }) {
  const { employeeId } = await params;
  if (!isUuid(employeeId)) notFound();
  const context = await getAccessContext("staff.read");
  if (!context.activeSchoolId) notFound();
  const detail = await getAuthorizedEmployeeDetail(context, employeeId);
  if (!detail) notFound();
  const { employee, assignments, qualifications, leave } = detail as any;
  const notice = await searchParams;
  const canManage = context.isPlatformAdmin || context.permissionCodes.includes("staff.manage");
  const canManageUsers = context.isPlatformAdmin || context.isPlatformSuperAdmin || context.permissionCodes.includes("users.manage");
  const s = await createClient();
  const { data: personAccount } = canManageUsers ? await s.from("people").select("id,user_id,primary_email").eq("id", employee.person_id).eq("school_id", context.activeSchoolId).maybeSingle() : { data: null };
  const [{ data: accountProfile }, { data: accountRoles }] = canManageUsers
    ? await Promise.all([
        personAccount?.user_id ? s.from("profiles").select("is_active,must_change_password").eq("id", personAccount.user_id).maybeSingle() : Promise.resolve({ data: null }),
        (s.from("roles") as any).select("code,name").eq("code", "teacher").eq("is_active", true).or(`school_id.eq.${context.activeSchoolId},school_id.is.null`).order("name")
      ])
    : [{ data: null }, { data: [] }];
  return (
    <div>
      <PageHeader
        title={`${employee.people?.first_name} ${employee.people?.last_name}`}
        description={`${employee.employee_number} · ${employee.employment_type}`}
        backHref="/app/staff"
      />
      {notice.message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice.message}</p> : null}
      {notice.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{notice.error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {canManageUsers && personAccount ? <AccountAccessCard recordType="employee" recordId={employeeId} personId={personAccount.id} userId={personAccount.user_id} email={personAccount.primary_email} profile={accountProfile} roles={accountRoles ?? []} /> : null}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Employment record</h2>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Status" value={<Badge>{employee.status}</Badge>} />
            <Info label="Hire date" value={formatDate(employee.hire_date)} />
            <Info label="Email" value={employee.people?.primary_email} />
            <Info label="Phone" value={employee.people?.primary_phone} />
          </CardContent>
        </Card>
        {canManage ? (
          <Card>
            <CardHeader><h2 className="font-semibold">Edit employee</h2></CardHeader>
            <CardContent>
              <form action={updateEmployee.bind(null, employeeId)} className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" name="first_name" value={employee.people?.first_name} required />
                <Field label="Middle name" name="middle_name" value={employee.people?.middle_name} />
                <Field label="Last name" name="last_name" value={employee.people?.last_name} required />
                <Field label="Email" name="primary_email" value={employee.people?.primary_email} type="email" />
                <Field label="Phone" name="primary_phone" value={employee.people?.primary_phone} />
                <div><Label htmlFor="employment_type">Employment type</Label><Select id="employment_type" name="employment_type" defaultValue={employee.employment_type}>{["full_time","part_time","contract","temporary","volunteer","intern"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</Select></div>
                <div><Label htmlFor="status">Status</Label><Select id="status" name="status" defaultValue={employee.status}>{["active","inactive","suspended","terminated"].map((value) => <option key={value}>{value}</option>)}</Select></div>
                <div className="sm:col-span-2 flex justify-end"><Button>Save employee</Button></div>
              </form>
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Assignments</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.map((item: any) => (
              <div className="rounded-xl bg-slate-50 p-3" key={item.id}>
                <p className="font-semibold">{item.job_title}</p>
                <p className="text-xs text-slate-500">
                  {item.departments?.name ?? "No department"} · {item.campuses?.name ?? "No campus"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Qualifications</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {qualifications.map((item: any) => (
              <div key={item.id}>
                <p className="font-semibold">{item.qualification_name}</p>
                <p className="text-xs text-slate-500">
                  {item.institution} · {item.field_of_study}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Leave</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {leave.map((item: any) => (
              <div className="flex justify-between" key={item.id}>
                <span>{item.leave_types?.name}</span>
                <Badge>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, name, value, type = "text", required = false }: { label: string; name: string; value?: string | null; type?: string; required?: boolean }) {
  return <div><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={value ?? ""} required={required} /></div>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm">{value ?? "—"}</div>
    </div>
  );
}
