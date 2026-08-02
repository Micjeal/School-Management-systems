import Link from "next/link";
import { UserRound, FolderLock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PortalData } from "@/lib/portal/portal-types";
import type { UserContext } from "@/types/context";

type PortalSummaryProps = {
  context: UserContext;
  data: PortalData;
};

export function PortalSummary({ context, data }: PortalSummaryProps) {
  const { user, school, membership, personas } = data;
  const roles = membership?.roles ?? [];
  const platformRoles = context.platform_roles ?? [];

  // Calculate profile completeness (simplified)
  const profileCompleteness = user.firstName && user.lastName ? 80 : 40;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-600">
              {user.initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {user.displayName}
              </h2>
              {school && (
                <p className="text-sm text-slate-600">{school.name}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role.id}>{role.name}</Badge>
                ))}
                {platformRoles.length > 0 && (
                  <Badge className="bg-slate-50 text-slate-700">
                    {platformRoles.map((r: any) => r.name).join(", ")}
                  </Badge>
                )}
              </div>
              {personas.employee && (
                <p className="mt-1 text-sm text-slate-500">
                  Employee No. {personas.employee.employeeNumber}
                </p>
              )}
              {personas.student && (
                <p className="mt-1 text-sm text-slate-500">
                  Admission No. {personas.student.admissionNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="text-sm">
              <span className="font-medium text-slate-900">Profile</span>{" "}
              <span className="text-slate-600">{profileCompleteness}% complete</span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/app/profile"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <UserRound className="h-4 w-4" />
                Edit profile
              </Link>
              <Link
                href="/app/files"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <FolderLock className="h-4 w-4" />
                Private files
              </Link>
              {user.mustChangePassword && (
                <Link
                  href="/change-password"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Change password
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
