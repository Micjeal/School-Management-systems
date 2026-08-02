import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Lock, Globe, Building2, AlertTriangle } from "lucide-react";
import { PermissionMatrix } from "@/components/roles/permission-matrix";
import { saveRolePermissions } from "./actions";

type PermissionItem = {
  id: string;
  code: string;
  module: string;
  name: string;
  description: string | null;
  risk_level: string;
};

type Role = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  school_id: string | null;
  is_system: boolean;
  is_active: boolean;
  school: {
    id: string;
    name: string;
  } | null;
};

export default async function RolePermissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { roleId } = await params;
  const qp = await searchParams;
  const context = await requireUserContext("roles.read");
  const supabase = await createClient();

  // Load role details
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select(`
      id,
      code,
      name,
      description,
      school_id,
      is_system,
      is_active,
      school:schools(id,name)
    `)
    .eq("id", roleId)
    .single() as any;

  if (roleError || !role) {
    return (
      <div>
        <PageHeader title="Role Permissions" />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">
              {roleError?.message || "The selected role no longer exists."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedRole = role as Role;

  // Check authorization for editing
  const isGlobalRole = typedRole.school_id === null;
  const isSuperAdmin = context.platform_roles.some(
    (r) => r.code === "super_admin",
  );
  const isPlatformAdmin = context.platform_roles.some(
    (r) => r.code === "platform_admin",
  );

  let canEdit = false;
  let editDisabledReason: string | null = null;

  if (!typedRole.is_active) {
    canEdit = false;
    editDisabledReason = "Inactive roles cannot be modified";
  } else if (isGlobalRole) {
    canEdit = isSuperAdmin;
    if (!isSuperAdmin) {
      editDisabledReason = "Platform super administrator access is required to modify global roles";
    }
  } else {
    // School-specific role
    canEdit = isPlatformAdmin || context.permissions.includes("roles.manage");
    if (!canEdit) {
      editDisabledReason = "The roles.manage permission is required";
    }
  }

  // Platform admin roles should not be edited through permission matrix
  const isPlatformAdminRole = ["super_admin", "platform_admin"].includes(typedRole.code);
  if (isPlatformAdminRole) {
    canEdit = false;
    editDisabledReason = "Platform administrator access is controlled by platform authorization. This role should not be edited through the school permission matrix.";
  }

  // Load all permissions
  const { data: permissions } = await supabase
    .from("permissions")
    .select(`
      id,
      code,
      module,
      name,
      description,
      risk_level
    `)
    .order("module")
    .order("name");

  // Load existing role permissions
  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId) as any;

  const initialPermissionIds =
    rolePermissions?.map((row: any) => row.permission_id) || [];

  const totalPermissions = permissions?.length || 0;
  const selectedCount = initialPermissionIds.length;

  return (
    <div>
      <PageHeader
        title="Role Permissions"
        description={`Manage permissions for ${typedRole.name}`}
      />

      {qp.message && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          {qp.message}
          {typedRole.name} now has {selectedCount} permissions.
        </div>
      )}

      {qp.error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {qp.error}
        </div>
      )}

      {/* Role details card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Link href="/app/platform/users">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to users
                  </Button>
                </Link>
              </div>

              <div>
                <h1 className="text-2xl font-bold">{typedRole.name}</h1>
                <p className="text-sm text-slate-500">Code: {typedRole.code}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isGlobalRole ? (
                  <Badge className="gap-1 bg-slate-100 text-slate-700">
                    <Globe className="h-3 w-3" />
                    Global role
                  </Badge>
                ) : (
                  <Badge className="gap-1 bg-slate-100 text-slate-700">
                    <Building2 className="h-3 w-3" />
                    School role
                  </Badge>
                )}

                {role.is_active ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-700">
                    Inactive
                  </Badge>
                )}

                {role.is_system ? (
                  <Badge className="bg-amber-100 text-amber-700">
                    System
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700">
                    Custom
                  </Badge>
                )}
              </div>

              <div className="text-sm">
                <span className="font-semibold">{selectedCount}</span> of{" "}
                <span className="font-semibold">{totalPermissions}</span>{" "}
                permissions selected
              </div>
            </div>

            {editDisabledReason && (
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg max-w-md">
                <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{editDisabledReason}</p>
              </div>
            )}
          </div>

          {/* Scope warning */}
          {isGlobalRole && (
            <div className="mt-4 flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold">Global role</p>
                <p>
                  Changes to this role affect every school that uses it.
                </p>
              </div>
            </div>
          )}

          {!isGlobalRole && typedRole.school && (
            <div className="mt-4 flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
              <Building2 className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold">School role</p>
                <p>
                  These permissions apply only within {typedRole.school.name}.
                </p>
              </div>
            </div>
          )}

          {isPlatformAdminRole && (
            <div className="mt-4 flex items-start gap-2 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-semibold">Platform administrator role</p>
                <p>
                  Platform administrator access is controlled by platform authorization.
                  This role should not be edited through the school permission matrix.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission matrix */}
      {permissions && (
        <PermissionMatrix
          roleId={roleId}
          permissions={permissions as PermissionItem[]}
          initialPermissionIds={initialPermissionIds}
          disabled={!canEdit}
          action={async (formData: FormData) => {
            "use server";
            await saveRolePermissions(roleId, formData);
          }}
        />
      )}
    </div>
  );
}
