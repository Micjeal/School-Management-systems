import Link from "next/link";
import { 
  UserRound, 
  FolderLock, 
  Megaphone, 
  MessageSquare, 
  Bell,
  CalendarCheck,
  FileText,
  CalendarDays,
  ReceiptText,
  ChartNoAxesColumnIncreasing,
  WalletCards,
  GraduationCap,
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PortalQuickAction } from "@/lib/portal/portal-types";

type PortalQuickActionsProps = {
  actions: PortalQuickAction[];
};

const ICON_MAP: Record<string, any> = {
  UserRound,
  FolderLock,
  Megaphone,
  MessageSquare,
  Bell,
  CalendarCheck,
  FileText,
  CalendarDays,
  ReceiptText,
  ChartNoAxesColumnIncreasing,
  WalletCards,
  GraduationCap,
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  BookOpen,
};

export function PortalQuickActions({ actions }: PortalQuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 font-semibold">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = ICON_MAP[action.icon] || UserRound;
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
  );
}
