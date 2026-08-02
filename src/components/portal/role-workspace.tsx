import Link from "next/link";
import { BriefcaseBusiness, Users, UserCog, WalletCards, CalendarCheck, FileText, BookOpen, Building2, Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PortalSection } from "./portal-section";
import { PortalEmptyState } from "./portal-empty-state";
import type { UserContext } from "@/types/context";

type RoleWorkspaceProps = {
  context: UserContext;
};

export function RoleWorkspace({ context }: RoleWorkspaceProps) {
  const quickActions = buildQuickActions(context);

  if (quickActions.length === 0) {
    return (
      <PortalSection title="My work access" icon={<BriefcaseBusiness className="h-5 w-5 text-slate-600" />}>
        <Card>
          <CardContent className="p-6">
            <PortalEmptyState
              icon={<BriefcaseBusiness className="h-8 w-8" />}
              title="No administrative access"
              description="You do not have any administrative permissions at this time."
            />
          </CardContent>
        </Card>
      </PortalSection>
    );
  }

  return (
    <PortalSection title="My work access" icon={<BriefcaseBusiness className="h-5 w-5 text-slate-600" />}>
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Administrative Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                >
                  <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PortalSection>
  );
}

function buildQuickActions(context: UserContext) {
  const actions: Array<{
    label: string;
    href: string;
    permission: string;
    icon: any;
  }> = [
    {
      label: "Manage students",
      href: "/app/students",
      permission: "students.read",
      icon: Users,
    },
    {
      label: "Manage staff",
      href: "/app/staff",
      permission: "staff.read",
      icon: UserCog,
    },
    {
      label: "Finance",
      href: "/app/finance/invoices",
      permission: "finance.read",
      icon: WalletCards,
    },
    {
      label: "Attendance",
      href: "/app/attendance",
      permission: "attendance.read",
      icon: CalendarCheck,
    },
    {
      label: "Assessments",
      href: "/app/assessments",
      permission: "assessments.read",
      icon: FileText,
    },
    {
      label: "Library",
      href: "/app/library/circulation",
      permission: "library.manage",
      icon: BookOpen,
    },
    {
      label: "School setup",
      href: "/app/setup",
      permission: "school.setup",
      icon: Building2,
    },
    {
      label: "Audit log",
      href: "/app/audit",
      permission: "audit.read",
      icon: Activity,
    },
  ];

  // Filter by permissions or platform admin status
  return actions.filter(
    (action) =>
      context.is_platform_admin ||
      context.permissions.includes(action.permission),
  );
}
