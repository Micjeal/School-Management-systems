import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inviteSchoolUser } from "@/app/app/users/actions";

export default async function SchoolUsers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const qp = await searchParams;
  const context = await requireUserContext("users.manage");
  const supabase = await createClient();
  const schoolId = context.active_school_id;

  const [{ data: members }, { data: roles }] = await Promise.all([
    (supabase.from("school_memberships") as any)
      .select("id,user_id,status,joined_at,left_at,profiles:user_id(display_name,first_name,last_name,is_active),membership_roles(roles(code,name))")
      .eq("school_id", schoolId)
      .order("joined_at", { ascending: false }),
    (supabase.from("roles") as any)
      .select("id,code,name,school_id")
      .or(`school_id.eq.${schoolId},school_id.is.null`)
      .eq("is_active", true)
      .order("name")
  ]);

  return (
    <div>
      <PageHeader 
        title="School Users" 
        description="Manage school members, roles and invitations"
      />
      {qp.message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{qp.message}</p> : null}
      {qp.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{qp.error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[.65fr_1.35fr]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Invite school user</h2>
          </CardHeader>
          <CardContent>
            <form action={inviteSchoolUser} className="space-y-4">
              <input type="hidden" name="school_id" value={schoolId ?? ""} />
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required />
              </div>
              <div>
                <Label>First name</Label>
                <Input name="first_name" required />
              </div>
              <div>
                <Label>Last name</Label>
                <Input name="last_name" required />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input name="phone" />
              </div>
              <div>
                <Label>School role</Label>
                <Select name="role_code" required>
                  <option value="">Select role</option>
                  {(roles ?? []).filter((r: any) => !["super_admin", "platform_admin"].includes(r.code)).map((r: any) => (
                    <option value={r.code} key={r.id}>{r.name}</option>
                  ))}
                </Select>
              </div>
              <Button className="w-full">Send invitation</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">School members</h2>
          </CardHeader>
          <CardContent>
            {members && members.length > 0 ? (
              <div className="space-y-3">
                {members.map((m: any) => (
                  <div key={m.id} className="flex justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{m.profiles?.display_name || `${m.profiles?.first_name} ${m.profiles?.last_name}`}</p>
                      <p className="text-sm text-slate-500">
                        {m.profiles?.is_active ? "Active" : "Inactive"} · Joined {new Date(m.joined_at).toLocaleDateString()}
                      </p>
                      <div className="mt-1 flex gap-1">
                        {(m.membership_roles ?? []).map((mr: any) => (
                          <Badge key={mr.roles.id}>{mr.roles.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge>{m.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No members yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
