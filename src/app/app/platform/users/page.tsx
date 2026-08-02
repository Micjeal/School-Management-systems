import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inviteUser } from "./actions";
import Link from "next/link";
import { Mail, Lock, Shield, UserPlus, Building2, Users } from "lucide-react";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const qp = await searchParams;
  const c = await requireUserContext("users.read");
  const s = await createClient();
  
  // Use searchParams school_id if provided, otherwise use active school
  const targetSchoolId = qp.school_id || c.active_school_id;

  // Load all schools for platform admins
  const { data: schools } = await (s.from("schools") as any).select("id,name,slug,status").eq("status", "active").order("name");

  // Only load roles and members if a school is selected
  let roles = null;
  let members = null;
  let filteredRoles = [];

  if (targetSchoolId) {
    const [rolesResult, membersResult] = await Promise.all([
      (s.from("roles") as any).select("id,code,name,school_id").or(`school_id.eq.${targetSchoolId},school_id.is.null`).eq("is_active", true).order("name"),
      (s.from("school_memberships") as any).select("id,user_id,status,joined_at,profiles:user_id(display_name,first_name,last_name,is_active),membership_roles(roles(code,name))").eq("school_id", targetSchoolId)
    ]);
    roles = rolesResult.data;
    members = membersResult.data;
    filteredRoles = (roles ?? []).filter((r: any) => !["super_admin", "platform_admin"].includes(r.code));
  }

  return (
    <div>
      <PageHeader title="Users and invitations" description="Invite accounts through a JWT-protected Edge Function and assign school roles without exposing administrative credentials." />
      {qp.message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{qp.message}</p> : null}
      {qp.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{qp.error}</p> : null}
      
      {c.is_platform_admin && (
        <Card className="mb-6 border-slate-200">
          <CardContent className="pt-6">
            <form method="get" className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="school_selector" className="mb-2">Select school to manage users</Label>
                <Select
                  id="school_selector"
                  name="school_id"
              defaultValue={targetSchoolId ?? ""}
              className="w-full"
            >
              <option value="">Select a school</option>
              {(schools ?? []).map((school: any) => (
                <option value={school.id} key={school.id}>{school.name}</option>
              ))}
            </Select>
              </div>
              <Button type="submit">
                <Building2 className="mr-2 h-4 w-4" />
                Load
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {targetSchoolId ? (
        <div className="grid gap-6 xl:grid-cols-[.65fr_1.35fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-slate-500" />
                Invite new user
              </CardTitle>
              <CardDescription>
                Create a new account and assign roles for this school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={inviteUser} className="space-y-5">
                <input type="hidden" name="school_id" value={targetSchoolId} />
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    Email address
                  </Label>
                  <Input id="email" name="email" type="email" required placeholder="user@example.com" className="h-10" />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    Temporary password
                  </Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="temporary_password" className="text-xs text-slate-500">Password</Label>
                      <Input id="temporary_password" name="temporary_password" type="password" required minLength={10} autoComplete="new-password" placeholder="At least 10 characters" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password" className="text-xs text-slate-500">Confirm</Label>
                      <Input id="confirm_password" name="confirm_password" type="password" required minLength={10} autoComplete="new-password" placeholder="Repeat the password" className="h-10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role_code" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500" />
                    School role
                  </Label>
                  <Select id="role_code" name="role_code" className="h-10">
                    <option value="">Select a role</option>
                    {filteredRoles.map((r: any) => <option value={r.code} key={r.id}>{r.name}</option>)}
                  </Select>
                  {filteredRoles.length === 0 ? (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <p className="text-sm text-amber-700">
                        No active roles are available for this school. Check role seeding and RLS policies.
                      </p>
                    </div>
                  ) : null}
                </div>
                {c.is_platform_admin ? (
                  <div className="space-y-2">
                    <Label htmlFor="platform_role" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-500" />
                      Platform role
                    </Label>
                    <Select id="platform_role" name="platform_role" className="h-10">
                      <option value="">None</option>
                      <option value="platform_admin">Platform administrator</option>
                    </Select>
                  </div>
                ) : null}
                <Button className="w-full h-11" disabled={filteredRoles.length === 0}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create account
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-500" />
                School members
              </CardTitle>
              <CardDescription>
                Manage existing users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(members ?? []).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No members yet. Invite your first user to get started.</p>
                </div>
              ) : (
                (members ?? []).map((m: any) => (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors" key={m.id}>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{m.profiles?.display_name || `${m.profiles?.first_name ?? ""} ${m.profiles?.last_name ?? ""}` || m.user_id}</p>
                      <p className="text-xs text-slate-500 mt-1">{m.membership_roles?.map((x: any) => x.roles?.name).filter(Boolean).join(", ") || "No role assigned"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={m.profiles?.is_active === false ? "secondary" : "default"} className="text-xs">
                        {m.profiles?.is_active === false ? "disabled" : m.status}
                      </Badge>
                      {c.permissions.includes("users.manage") ? (
                        <Link href={`/app/platform/users/${m.id}/roles`}>
                          <Button variant="outline" size="sm" className="h-8">
                            Edit access
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a school</h3>
            <p className="text-slate-600">Please select a school to manage users and invitations.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
