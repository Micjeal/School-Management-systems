import { requireUserContext } from "@/lib/auth/context";
import { getSchoolSwitcherOptions } from "@/lib/auth/get-school-switcher-options";
import { getPortalData } from "@/lib/portal/get-portal-data";
import { resolvePortalRole, getPortalRoleLabel } from "@/lib/portal/resolve-portal-role";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSummary } from "@/components/portal/portal-summary";
import { PortalAlerts } from "@/components/portal/portal-alerts";
import { PortalQuickActions } from "@/components/portal/portal-quick-actions";
import { EmployeePortal } from "@/components/portal/employee-portal";
import { StudentPortal } from "@/components/portal/student-portal";
import { GuardianPortal } from "@/components/portal/guardian-portal";
import { TeacherPortal } from "@/components/portal/teacher-portal";
import { PlatformPortal } from "@/components/portal/platform-portal";
import { RoleWorkspace } from "@/components/portal/role-workspace";
import { PortalRoleSwitcher } from "@/components/portal/portal-role-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { SchoolSwitcher } from "@/components/layout/school-switcher";
import { Building2 } from "lucide-react";
import { switchSchoolAction } from "@/app/app/actions";

export default async function PortalPage() {
  const context = await requireUserContext();
  const schoolOptions = await getSchoolSwitcherOptions(context);
  const schoolId = context.active_school_id;

  // Platform administrator in platform view
  if (!schoolId && context.is_platform_admin) {
    const data = await getPortalData(context);
    return (
      <PageContainer width="wide">
        <PageHeader
          title="Platform Portal"
          description="Platform administration and school management."
        />
        <PortalSummary context={context} data={data} />
        <PlatformPortal data={data.personas.platformAdmin!} />
        <PortalAlerts data={data} />
        <PortalQuickActions actions={data.quickActions} />
      </PageContainer>
    );
  }

  // No school selected for ordinary user
  if (!schoolId) {
    if (context.memberships.length === 0) {
      return (
        <PageContainer width="wide">
          <PageHeader
            title="My portal"
            description="Your personal records, tasks and school services."
          />
          <Card>
            <CardContent className="p-6">
              <PortalEmptyState
                icon={<Building2 className="h-8 w-8" />}
                title="No school membership"
                description="Your account is not currently connected to an active school. Contact your school administrator if you believe this is an error."
              />
            </CardContent>
          </Card>
        </PageContainer>
      );
    }

    return (
      <PageContainer width="wide">
        <PageHeader
          title="My portal"
          description="Your personal records, tasks and school services."
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900">Select a school</h3>
              <p className="mt-2 text-sm text-slate-600">
                Select a school to open your personal portal.
              </p>
              <div className="mt-6">
                <SchoolSwitcher
                  activeSchoolId={context.active_school_id}
                  schools={schoolOptions}
                  isPlatformAdmin={context.is_platform_admin}
                  action={switchSchoolAction}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Load portal data and resolve role
  const data = await getPortalData(context);
  const roleResolution = resolvePortalRole(context, data.personas);

  // If no portal identity exists
  if (roleResolution.primaryRole === "none") {
    return (
      <PageContainer width="wide">
        <PageHeader
          title="My portal"
          description="Your personal records, tasks and school services."
        />
        <Card>
          <CardContent className="p-6">
            <PortalEmptyState
              icon={<Building2 className="h-8 w-8" />}
              title="No personal portal profile"
              description="No personal portal profile is linked to this account. Contact your school administrator."
            />
          </CardContent>
        </Card>
        <RoleWorkspace context={context} />
      </PageContainer>
    );
  }

  // Render role-specific portal
  return (
    <PageContainer width="wide">
      <PageHeader
        title={getPortalRoleLabel(roleResolution.primaryRole)}
        description={
          roleResolution.primaryRole === "teacher"
            ? "Your teaching assignments, classes, and academic tasks."
            : roleResolution.primaryRole === "student"
            ? "Your classes, attendance, results, and school activities."
            : roleResolution.primaryRole === "guardian"
            ? "Your children's progress, attendance, and school information."
            : "Your employment information and school services."
        }
      />

      <PortalSummary context={context} data={data} />

      <PortalAlerts data={data} />

      <PortalQuickActions actions={data.quickActions} />

      {/* Role-specific portal content */}
      {roleResolution.primaryRole === "student" && data.personas.student && (
        <StudentPortal data={data.personas.student} />
      )}

      {roleResolution.primaryRole === "guardian" && data.personas.guardian && (
        <GuardianPortal data={data.personas.guardian} />
      )}

      {roleResolution.primaryRole === "teacher" && data.personas.employee && (
        <TeacherPortal data={data.personas.employee} />
      )}

      {roleResolution.primaryRole === "employee" && data.personas.employee && (
        <EmployeePortal data={data.personas.employee} />
      )}

      {/* Fallback for platform admin viewing a school */}
      {!data.hasLinkedPerson && context.is_platform_admin && (
        <Card>
          <CardContent className="p-6">
            <PortalEmptyState
              icon={<Building2 className="h-8 w-8" />}
              title="No personal portal profile"
              description="As a platform administrator, you have access to school administration through the main application. Your personal portal profile is not linked to this school."
            />
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
