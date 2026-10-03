import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";
import { updateGuardian } from "../actions";
import { isUuid } from "@/lib/auth/access-errors";
import { AccountAccessCard } from "@/components/users/account-access-card";

export default async function GuardianDetail({
  params,
  searchParams
}: {
  params: Promise<{ guardianId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { guardianId } = await params;
  if (!isUuid(guardianId)) notFound();
  const qp = await searchParams;
  const c = await requireUserContext("guardians.read");
  if (!c.active_school_id) notFound();
  const s = await createClient();
  const schoolId = c.active_school_id;
  const canManageUsers = c.is_platform_admin || c.permissions.includes("users.manage");

  const { data: guardian } = await (s.from("guardians") as any)
    .select(
      `id,person_id,status,portal_enabled,preferred_contact_method,occupation,employer,people(id,first_name,middle_name,last_name,gender,date_of_birth,primary_email,primary_phone,address${canManageUsers ? ",user_id" : ""})`
    )
    .eq("id", guardianId)
    .eq("school_id", schoolId)
    .maybeSingle();

  if (!guardian) notFound();

  const { data: students } = await (s.from("student_guardians") as any)
    .select(
      "id,relationship_type,is_primary,is_emergency_contact,is_financially_responsible,can_pick_up,receives_academic_reports,receives_financial_notices,students(id,admission_number,people(first_name,last_name),status)"
    )
    .eq("guardian_id", guardianId)
    .eq("school_id", schoolId);

  const canManage = c.permissions.includes("guardians.manage");

  const p = guardian.people ?? {};
  const [{ data: accountProfile }, { data: portalRoles }] = canManageUsers
    ? await Promise.all([
        p.user_id ? s.from("profiles").select("is_active,must_change_password").eq("id", p.user_id).maybeSingle() : Promise.resolve({ data: null }),
        (s.from("roles") as any).select("code,name").eq("code", "parent").eq("is_active", true).or(`school_id.eq.${schoolId},school_id.is.null`)
      ])
    : [{ data: null }, { data: [] }];

  return (
    <div>
      <PageHeader
        title={`${p.first_name} ${p.last_name}`}
        description={`Guardian · ${guardian.status}`}
        backHref="/app/guardians"
      />
      {qp.message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{qp.message}</p>
      ) : null}
      {qp.error ? (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{qp.error}</p>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Guardian profile</h2>
          </CardHeader>
          <CardContent>
            <form
              action={canManage ? updateGuardian.bind(null, guardianId) : undefined}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Field name="first_name" label="First name" value={p.first_name} />
              <Field name="middle_name" label="Middle name" value={p.middle_name} />
              <Field name="last_name" label="Last name" value={p.last_name} />
              <Field name="date_of_birth" label="Date of birth" value={p.date_of_birth} type="date" />
              <Field name="primary_email" label="Email" value={p.primary_email} type="email" />
              <Field name="primary_phone" label="Phone" value={p.primary_phone} />
              <Field name="address" label="Address" value={p.address} />
              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={guardian.status}>
                  <option>active</option>
                  <option>inactive</option>
                </Select>
              </div>
              <div>
                <Label>Preferred contact</Label>
                <Select name="preferred_contact_method" defaultValue={guardian.preferred_contact_method}>
                  <option>phone</option>
                  <option>email</option>
                  <option>sms</option>
                  <option>in_person</option>
                </Select>
              </div>
              <div>
                <Label>Occupation</Label>
                <Input name="occupation" defaultValue={guardian.occupation ?? ""} />
              </div>
              <div>
                <Label>Employer</Label>
                <Input name="employer" defaultValue={guardian.employer ?? ""} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="portal_enabled"
                  id="portal_enabled"
                  defaultChecked={guardian.portal_enabled}
                />
                <Label htmlFor="portal_enabled">Enable portal access</Label>
              </div>
              <input type="hidden" name="gender" value={p.gender ?? ""} />
              <div className="sm:col-span-2 flex justify-end">
                {canManage ? <Button>Save profile</Button> : null}
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          {canManageUsers ? <AccountAccessCard recordType="guardian" recordId={guardianId} personId={guardian.person_id} userId={p.user_id} email={p.primary_email} profile={accountProfile} roles={portalRoles ?? []} label="Enable guardian portal" /> : null}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Linked students</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {(students ?? []).map((sg: any) => (
                <div className="rounded-xl bg-slate-50 p-3" key={sg.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {sg.students?.people?.first_name} {sg.students?.people?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sg.students?.admission_number} · {sg.relationship_type}
                      </p>
                    </div>
                    <Badge>{sg.students?.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sg.is_primary && <Badge variant="secondary">Primary</Badge>}
                    {sg.is_emergency_contact && <Badge variant="destructive">Emergency</Badge>}
                    {sg.is_financially_responsible && <Badge variant="outline">Financial</Badge>}
                    {sg.can_pick_up && <Badge variant="outline">Pick-up</Badge>}
                    {sg.receives_academic_reports && <Badge variant="outline">Reports</Badge>}
                    {sg.receives_financial_notices && <Badge variant="outline">Notices</Badge>}
                  </div>
                </div>
              ))}
              {!students?.length ? (
                <p className="text-sm text-slate-500">No linked students.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  value,
  type = "text"
}: {
  name: string;
  label: string;
  value: any;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input name={name} type={type} defaultValue={value ?? ""} />
    </div>
  );
}
