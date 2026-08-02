import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Globe, Building2, Settings, Lock } from "lucide-react";

export default async function RolesPage() {
  const context = await requireUserContext("roles.manage");
  const supabase = await createClient();

  const { data: roles } = await supabase
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
    .order("school_id")
    .order("name") as any;

  const isSuperAdmin = context.platform_roles.some(
    (r) => r.code === "super_admin",
  );

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Manage system and school roles"
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {roles?.map((role: any) => {
              const isGlobalRole = role.school_id === null;
              const isPlatformAdminRole = ["super_admin", "platform_admin"].includes(role.code);
              const canEdit = isSuperAdmin || (isGlobalRole ? false : context.permissions.includes("roles.manage"));

              return (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{role.name}</h3>
                      <p className="text-sm text-slate-500 font-mono">{role.code}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {isGlobalRole ? (
                        <Badge className="gap-1 bg-slate-100 text-slate-700">
                          <Globe className="h-3 w-3" />
                          Global
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-slate-100 text-slate-700">
                          <Building2 className="h-3 w-3" />
                          School
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

                    {role.description && (
                      <p className="text-sm text-slate-600">{role.description}</p>
                    )}

                    {!isGlobalRole && role.school && (
                      <p className="text-sm text-slate-500 mt-1">
                        School: {role.school.name}
                      </p>
                    )}

                    {isPlatformAdminRole && (
                      <div className="flex items-center gap-2 text-amber-700 mt-2">
                        <Lock className="h-4 w-4" />
                        <p className="text-xs">Platform administrator role - managed by platform authorization</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/app/platform/roles/${role.id}/permissions`}>
                      <Button variant="secondary" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Permissions
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}

            {roles?.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>No roles found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
