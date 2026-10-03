import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createGuardian } from "../actions";

export default async function NewGuardian({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const c = await requireUserContext("guardians.create");
  const p = await searchParams;
  const s = await createClient();
  const sid = c.active_school_id;

  return (
    <div>
      <PageHeader
        title="Add guardian"
        description="Creates the person and guardian profile in one protected transaction."
        backHref="/app/guardians"
      />
      {p.error ? (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{p.error}</p>
      ) : null}
      <form action={createGuardian} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Personal information</h2>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            <Field name="first_name" label="First name" required />
            <Field name="middle_name" label="Middle name" />
            <Field name="last_name" label="Last name" required />
            <DateField name="date_of_birth" label="Date of birth" />
            <div>
              <Label>Gender</Label>
              <Select name="gender">
                <option value="">Select</option>
                <option>female</option>
                <option>male</option>
                <option>other</option>
                <option>prefer_not_to_say</option>
              </Select>
            </div>
            <Field name="nationality_code" label="Nationality code" defaultValue="UG" />
            <Field name="primary_email" label="Email" type="email" />
            <Field name="primary_phone" label="Phone" />
            <Field name="address" label="Address" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Guardian details</h2>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue="active">
                <option>active</option>
                <option>inactive</option>
              </Select>
            </div>
            <div>
              <Label>Preferred contact method</Label>
              <Select name="preferred_contact_method" defaultValue="phone">
                <option>phone</option>
                <option>email</option>
                <option>sms</option>
                <option>in_person</option>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" name="portal_enabled" id="portal_enabled" defaultChecked />
              <Label htmlFor="portal_enabled">Enable portal access</Label>
            </div>
            <Field name="occupation" label="Occupation" />
            <Field name="employer" label="Employer" />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button>Create guardian</Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = false
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function DateField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input name={name} type="date" />
    </div>
  );
}
