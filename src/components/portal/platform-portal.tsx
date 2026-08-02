import Link from "next/link";
import { Shield, Building2, Users, LayoutDashboard, Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalSection } from "./portal-section";
import { formatDate } from "@/lib/formatting";
import type { PlatformPortalData } from "@/lib/portal/portal-types";

type PlatformPortalProps = {
  data: PlatformPortalData;
};

export function PlatformPortal({ data }: PlatformPortalProps) {
  return (
    <PortalSection title="My platform access" icon={<Shield className="h-5 w-5 text-slate-600" />}>
      <div className="grid gap-5 lg:grid-cols-2">
        <PlatformSummaryCard data={data} />
        <PlatformQuickActionsCard />
        {data.recentNotifications && data.recentNotifications.length > 0 && (
          <PlatformNotificationsCard notifications={data.recentNotifications} />
        )}
      </div>
    </PortalSection>
  );
}

function PlatformSummaryCard({ data }: { data: PlatformPortalData }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Platform Summary</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Platform Roles</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {data.platformRoles.map((role) => (
              <Badge key={role.id} className="text-xs">{role.name}</Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Schools Managed</span>
          <span className="text-sm font-medium">{data.schoolCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformQuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Platform Actions</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Link
            href="/platform"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
          >
            <LayoutDashboard className="h-5 w-5 shrink-0 text-slate-500" />
            <span>Open platform dashboard</span>
          </Link>
          <Link
            href="/platform/schools"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
          >
            <Building2 className="h-5 w-5 shrink-0 text-slate-500" />
            <span>Manage schools</span>
          </Link>
          <Link
            href="/platform/users"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
          >
            <Users className="h-5 w-5 shrink-0 text-slate-500" />
            <span>Manage users</span>
          </Link>
          <Link
            href="/platform/audit"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
          >
            <Activity className="h-5 w-5 shrink-0 text-slate-500" />
            <span>View audit activity</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformNotificationsCard({ notifications }: { notifications: any[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <h3 className="font-semibold">Recent Platform Notifications</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start justify-between gap-2 rounded-lg border p-3 ${
              notification.isRead ? "border-slate-200 bg-slate-50" : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="mt-1 text-xs text-slate-600">{formatDate(notification.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-xs">{notification.type}</Badge>
              {!notification.isRead && <div className="h-2 w-2 rounded-full bg-blue-600" />}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
