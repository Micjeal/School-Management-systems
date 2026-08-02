"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronDown,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  UserRound,
  FolderLock,
} from "lucide-react";

import { SchoolSwitcher } from "@/components/layout/school-switcher";
import { HeaderSearch } from "@/components/layout/header-search";
import { UserMenu } from "@/components/layout/user-menu";
import { MODULE_GROUPS, MODULES } from "@/config/modules";
import type { UserContext } from "@/types/context";

type AppHeaderProps = {
  context: UserContext;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  switchSchoolAction: (formData: FormData) => void | Promise<void>;
};

function canSee(
  context: UserContext,
  module: (typeof MODULES)[number],
) {
  if (module.platformOnly && !context.is_platform_admin) {
    return false;
  }

  if (
    !module.platformOnly &&
    module.schoolScoped &&
    !context.active_school_id
  ) {
    return false;
  }

  return (
    context.is_platform_admin ||
    !module.permission ||
    context.permissions.includes(module.permission)
  );
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileLink({
  href,
  icon: Icon,
  label,
  pathname,
}: {
  href: string;
  icon: any;
  label: string;
  pathname: string;
}) {
  const active = isActiveRoute(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function getPageContext(pathname: string) {
  const routeLabels: Record<string, { title: string; description: string }> = {
    "/app": {
      title: "Dashboard",
      description: "Overview of your school",
    },
    "/app/students": {
      title: "Students",
      description: "Manage student records",
    },
    "/app/staff": {
      title: "Staff",
      description: "Manage employees and assignments",
    },
    "/app/platform/users": {
      title: "Users",
      description: "Manage user access and school roles",
    },
  };

  // Try exact match first
  if (routeLabels[pathname]) {
    return routeLabels[pathname];
  }

  // Try prefix match
  for (const [route, labels] of Object.entries(routeLabels)) {
    if (pathname.startsWith(route + "/")) {
      return labels;
    }
  }

  return null;
}

export function AppHeader({
  context,
  sidebarCollapsed,
  toggleSidebar,
  switchSchoolAction,
}: AppHeaderProps) {
  const pathname = usePathname();
  
  const visibleGroups = MODULE_GROUPS.map((group) => ({
    ...group,
    modules: MODULES.filter(
      (module) => module.group === group.id && canSee(context, module),
    ),
  })).filter((group) => group.modules.length > 0);

  const activeMembership = context.memberships.find(
    (membership) => membership.school_id === context.active_school_id,
  );

  const contextName = activeMembership?.school_name || "Platform administration";
  const pageContext = getPageContext(pathname);

  return (
    <header
      className="
        no-print sticky top-0 z-40
        border-b border-slate-200
        bg-white/95 backdrop-blur
      "
    >
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <details className="relative lg:hidden">
          <summary
            aria-label="Open navigation"
            className="list-none rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </summary>

          <div className="absolute left-0 top-11 max-h-[75vh] w-[min(20rem,85vw)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="mb-3 flex items-center gap-3 border-b border-slate-100 px-2 pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                SD
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-950">
                  SchoolDB
                </span>
                <span className="block text-xs text-slate-500">
                  {contextName}
                </span>
              </span>
            </div>

            <div className="space-y-1">
              <MobileLink
                href="/app"
                icon={LayoutDashboard}
                label="Dashboard"
                pathname={pathname}
              />
              <MobileLink
                href="/app/portal"
                icon={UserRound}
                label="My portal"
                pathname={pathname}
              />
              <MobileLink
                href="/app/files"
                icon={FolderLock}
                label="Private files"
                pathname={pathname}
              />
            </div>

            {visibleGroups.map((group) => (
              <section key={group.id} className="mt-4">
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.modules.map((module) => (
                    <MobileLink
                      key={module.id}
                      href={
                        module.workflowHref ??
                        `/app/modules/${module.id}`
                      }
                      icon={module.icon}
                      label={module.label}
                      pathname={pathname}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </details>

        {/* Mobile logo */}
        <Link href="/app" className="font-black text-slate-950 lg:hidden">
          SchoolDB
        </Link>

        {/* Sidebar toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          aria-expanded={!sidebarCollapsed}
          aria-controls="desktop-sidebar"
          className="
            hidden h-10 w-10 items-center justify-center
            rounded-xl text-slate-600
            transition-colors
            hover:bg-slate-100 hover:text-slate-950
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            lg:inline-flex
          "
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        {/* Page context */}
        {pageContext && (
          <div className="hidden min-w-0 xl:block">
            <p className="truncate text-sm font-semibold text-slate-900">
              {pageContext.title}
            </p>

            <p className="truncate text-xs text-slate-500">
              {pageContext.description}
            </p>
          </div>
        )}

        {/* Search */}
        <HeaderSearch />

        {/* Right controls */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SchoolSwitcher
            activeSchoolId={context.active_school_id}
            memberships={context.memberships}
            isPlatformAdmin={context.is_platform_admin}
            action={switchSchoolAction}
          />

          <Link
            href="/app/notifications"
            aria-label="Notifications"
            className="
              relative inline-flex h-10 w-10
              items-center justify-center
              rounded-xl text-slate-600
              transition-colors
              hover:bg-slate-100
              hover:text-slate-950
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
            "
          >
            <Bell className="h-5 w-5" />
          </Link>

          <UserMenu context={context} />
        </div>
      </div>
    </header>
  );
}
