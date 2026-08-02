import { requireUserContext } from "@/lib/auth/context";
import { getSchoolSwitcherOptions } from "@/lib/auth/get-school-switcher-options";
import { getPortalData } from "@/lib/portal/get-portal-data";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSummary } from "@/components/portal/portal-summary";
import { PortalAlerts } from "@/components/portal/portal-alerts";
import { PortalQuickActions } from "@/components/portal/portal-quick-actions";
import { EmployeePortal } from "@/components/portal/employee-portal";
import { StudentPortal } from "@/components/portal/student-portal";
import { GuardianPortal } from "@/components/portal/guardian-portal";
import { PlatformPortal } from "@/components/portal/platform-portal";
import { RoleWorkspace } from "@/components/portal/role-workspace";
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
          title="My portal"
          description="Your personal records, tasks and school services."
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

  // Normal school portal
  const data = await getPortalData(context);

  return (
    <PageContainer width="wide">
      <PageHeader
        title="My portal"
        description="Your personal records, tasks and school services."
      />

      <PortalSummary context={context} data={data} />

      <PortalAlerts data={data} />

      <PortalQuickActions actions={data.quickActions} />

      {data.personas.employee && (
        <EmployeePortal data={data.personas.employee} />
      )}

      {data.personas.student && (
        <StudentPortal data={data.personas.student} />
      )}

      {data.personas.guardian && (
        <GuardianPortal data={data.personas.guardian} />
      )}

      {data.personas.platformAdmin && (
        <PlatformPortal data={data.personas.platformAdmin} />
      )}

      {!data.hasLinkedPerson && (
        <RoleWorkspace context={context} />
      )}
    </PageContainer>
  );
}
