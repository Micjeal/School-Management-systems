import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateGuardian } from "../../actions";
import { isUuid } from "@/lib/auth/access-errors";

export default async function EditGuardian({
  params
}: {
  params: Promise<{ guardianId: string }>;
}) {
  const { guardianId } = await params;
  if (!isUuid(guardianId)) notFound();
  const c = await requireUserContext("guardians.manage");
  if (!c.active_school_id) notFound();
  const s = await createClient();
  const schoolId = c.active_school_id;

  const { data: guardian } = await (s.from("guardians") as any)
    .select(
      "id,status,portal_enabled,preferred_contact_method,occupation,employer,people(id,first_name,middle_name,last_name,gender,date_of_birth,primary_email,primary_phone,address)"
    )
    .eq("id", guardianId)
    .eq("school_id", schoolId)
    .maybeSingle();

  if (!guardian) notFound();

  const p = guardian.people ?? {};

  return (
    <div>
      <PageHeader
        title={`Edit ${p.first_name} ${p.last_name}`}
        description="Update guardian profile and settings."
        backHref={`/app/guardians/${guardianId}`}
      />
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Guardian profile</h2>
        </CardHeader>
        <CardContent>
          <form action={updateGuardian.bind(null, guardianId)} className="grid gap-4 sm:grid-cols-2">
            <Field name="first_name" label="First name" value={p.first_name} required />
            <Field name="middle_name" label="Middle name" value={p.middle_name} />
            <Field name="last_name" label="Last name" value={p.last_name} required />
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
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Link href={`/app/guardians/${guardianId}`}>
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

function Field({
  name,
  label,
  value,
  type = "text",
  required = false
}: {
  name: string;
  label: string;
  value: any;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input name={name} type={type} defaultValue={value ?? ""} required={required} />
    </div>
  );
}
