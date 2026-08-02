import { notFound, redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label, Input, Select } from "@/components/ui/input";
import Link from "next/link";
import { addRole, removeRole, updateMembershipStatus } from "./actions";

export default async function MembershipRoles({
  params,
}: {
  params: Promise<{ membershipId: string }>;
}) {
  const { membershipId } = await params;
  const context = await requireUserContext("users.read");
  
  if (!context.active_school_id) {
    return <div>Select a school to manage roles</div>;
  }

  const supabase = await createClient();

  // Get membership details with current roles
  const { data: membership, error: membershipError } = await (supabase
    .from("school_memberships") as any)
    .select(`
      id,
      school_id,
      user_id,
      campus_id,
      status,
      joined_at,
      ended_at,
      profile:profiles!school_memberships_user_id_fkey(
        id,
        display_name,
        first_name,
        last_name,
        phone,
        is_active
      ),
      campus:campuses(
        id,
        name,
        code
      ),
      membership_roles(
        role_id,
        assigned_at,
        expires_at,
        role:roles(
          id,
          code,
          name,
          description,
          school_id,
          is_active
        )
      )
    `)
    .eq("id", membershipId)
    .maybeSingle();

  if (membershipError) {
    console.error("Membership query failed:", {
      membershipId,
      code: membershipError.code,
      message: membershipError.message,
      details: membershipError.details,
      hint: membershipError.hint,
    });
    throw new Error(`Could not load membership: ${membershipError.message}`);
  }

  if (!membership) {
    notFound();
  }

  // Verify the membership belongs to the user's active school
  if (membership.school_id !== context.active_school_id) {
    console.error("Membership school mismatch:", membership.school_id, context.active_school_id);
    notFound();
  }

  // Get available school roles (excluding platform roles)
  const { data: availableRoles } = await (supabase.from("roles") as any)
    .select("id,code,name,description")
    .or(`school_id.eq.${context.active_school_id},school_id.is.null`)
    .eq("is_active", true)
    .not("code", "in", "(super_admin,platform_admin)")
    .order("name");

  // Handle profile data (may be array due to Supabase response format)
  const profile = Array.isArray(membership.profile)
    ? membership.profile[0]
    : membership.profile;

  const memberName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    "School member";

  // Handle roles data shape
  const assignedRoles =
    membership.membership_roles?.map((assignment: any) => {
      const role = Array.isArray(assignment.role)
        ? assignment.role[0]
        : assignment.role;

      return {
        ...assignment,
        role,
      };
    }) ?? [];

  return (
    <div>
      <PageHeader
        title="Manage access"
        description={`Edit roles and permissions for ${memberName}`}
        backHref="/app/platform/users"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Current roles</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedRoles.length ? (
              assignedRoles.map((assignment: any) => (
                <div
                  key={assignment.role_id}
                  className="flex justify-between items-center rounded-xl border p-3"
                >
                  <div>
                    <p className="font-medium">{assignment.role?.name}</p>
                    <p className="text-xs text-slate-500">{assignment.role?.code}</p>
                    {assignment.expires_at && (
                      <p className="text-xs text-slate-400">
                        Expires: {new Date(assignment.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{membership.status}</Badge>
                    <form action={removeRole}>
                      <input type="hidden" name="role_id" value={assignment.role_id} />
                      <input type="hidden" name="membership_id" value={membershipId} />
                      <Button variant="secondary" size="sm" type="submit">
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No roles assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Membership status</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <div className="mt-2">
                <Badge>{membership.status}</Badge>
              </div>
            </div>
            <div>
              <Label>Joined</Label>
              <p className="mt-1 text-sm">
                {membership.joined_at
                  ? new Date(membership.joined_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label>User ID</Label>
              <p className="mt-1 text-sm font-mono">{membership.user_id}</p>
            </div>
            <div>
              <Label>School ID</Label>
              <p className="mt-1 text-sm font-mono">{membership.school_id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Add role</h2>
          </CardHeader>
          <CardContent>
            <form action={addRole} className="space-y-4">
              <input type="hidden" name="membership_id" value={membershipId} />
              <div>
                <Label>Role</Label>
                <Select name="role_id">
                  <option value="">Select role to add</option>
                  {(availableRoles || []).map((role: any) => (
                    <option value={role.id} key={role.id}>
                      {role.name} ({role.code})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Expiry date (optional)</Label>
                <Input name="expires_at" type="date" />
              </div>
              <Button type="submit">Add role</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Update membership status</h2>
          </CardHeader>
          <CardContent>
            <form action={updateMembershipStatus} className="space-y-4">
              <input type="hidden" name="membership_id" value={membershipId} />
              <div>
                <Label>Status</Label>
                <Select name="status">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <Button type="submit">Update status</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold">Available school roles</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(availableRoles || []).map((role: any) => (
                <div
                  key={role.id}
                  className="rounded-xl border p-3 hover:bg-slate-50"
                >
                  <p className="font-medium">{role.name}</p>
                  <p className="text-xs text-slate-500">{role.code}</p>
                  {role.description && (
                    <p className="mt-1 text-xs text-slate-400">
                      {role.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
