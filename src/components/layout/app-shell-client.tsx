"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  ChevronDown,
  FileSearch,
  FolderLock,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  School,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { logoutAction, switchSchoolAction } from "@/app/app/actions";
import { SchoolSwitcher } from "@/components/layout/school-switcher";
import { MODULE_GROUPS, MODULES } from "@/config/modules";
import type { UserContext } from "@/types/context";
import type { SchoolSwitcherOption } from "@/lib/auth/get-school-switcher-options";

const SIDEBAR_STORAGE_KEY = "schooldb.sidebar.collapsed";

type AppShellClientProps = {
  context: UserContext;
  schoolOptions: SchoolSwitcherOption[];
  children: ReactNode;
};

type NavigationLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
};

type RouteContext = {
  title: string;
  description: string;
};

const STATIC_ROUTE_CONTEXTS: readonly (RouteContext & { href: string })[] = [
  {
    href: "/app/platform/users",
    title: "Users",
    description: "Manage user access and school roles",
  },
  {
    href: "/app/platform/roles",
    title: "Roles",
    description: "Configure roles and permissions",
  },
  {
    href: "/app/students",
    title: "Students",
    description: "Manage student records and enrolment",
  },
  {
    href: "/app/staff",
    title: "Staff",
    description: "Manage employees and assignments",
  },
  {
    href: "/app/finance",
    title: "Finance",
    description: "Review billing, payments and accounts",
  },
  {
    href: "/app/notifications",
    title: "Notifications",
    description: "Review recent alerts and updates",
  },
  {
    href: "/app/search",
    title: "Search",
    description: "Find records across SchoolDB",
  },
  {
    href: "/app",
    title: "Dashboard",
    description: "Overview of your active school context",
  },
];

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

function moduleHref(module: (typeof MODULES)[number]) {
  return module.workflowHref ?? `/app/modules/${module.id}`;
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getRouteContext(pathname: string): RouteContext {
  const staticMatch = [...STATIC_ROUTE_CONTEXTS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((route) => isActiveRoute(pathname, route.href));

  const moduleMatch = [...MODULES]
    .map((module) => ({
      module,
      href: moduleHref(module),
    }))
    .sort((a, b) => b.href.length - a.href.length)
    .find((entry) => isActiveRoute(pathname, entry.href));

  if (moduleMatch && (!staticMatch || moduleMatch.href.length > staticMatch.href.length)) {
    return {
      title: moduleMatch.module.label,
      description: moduleMatch.module.description,
    };
  }

  return staticMatch ?? {
    title: "SchoolDB",
    description: "School management workspace",
  };
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "SD";
}

function NavigationLink({
  href,
  icon: Icon,
  label,
  pathname,
  collapsed = false,
  onNavigate,
}: NavigationLinkProps) {
  const active = isActiveRoute(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={[
        "group relative flex min-h-11 rounded-xl text-sm font-medium",
        "transition-colors duration-150 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-slate-950",
        collapsed ? "justify-center px-2" : "items-center gap-3 px-3",
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-950/30"
          : "text-slate-300 hover:bg-slate-900 hover:text-white",
      ].join(" ")}
    >
      <Icon
        aria-hidden="true"
        className={[
          "h-5 w-5 shrink-0",
          active
            ? "text-white"
            : "text-slate-400 group-hover:text-slate-200",
        ].join(" ")}
        strokeWidth={1.9}
      />

      <span className={collapsed ? "sr-only" : "truncate"}>
        {label}
      </span>
    </Link>
  );
}

function MobileNavigationLink({
  href,
  icon: Icon,
  label,
  pathname,
  onNavigate,
}: NavigationLinkProps) {
  const active = isActiveRoute(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.9} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppShellClient({
  context,
  schoolOptions,
  children,
}: AppShellClientProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarPreferenceLoaded, setSidebarPreferenceLoaded] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    setSidebarCollapsed(saved === "true");
    setSidebarPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!sidebarPreferenceLoaded) {
      return;
    }

    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed, sidebarPreferenceLoaded]);

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavigationOpen]);

  const visibleGroups = useMemo(
    () =>
      MODULE_GROUPS.map((group) => ({
        ...group,
        modules: MODULES.filter(
          (module) =>
            module.group === group.id && canSee(context, module),
        ),
      })).filter((group) => group.modules.length > 0),
    [context],
  );

  const activeMembership = context.memberships.find(
    (membership) => membership.school_id === context.active_school_id,
  );

  const name =
    context.profile.display_name ||
    [context.profile.first_name, context.profile.last_name]
      .filter(Boolean)
      .join(" ") ||
    "SchoolDB user";

  const initials = getInitials(name);
  const primaryRole =
    context.platform_roles[0]?.name ||
    activeMembership?.roles[0]?.name ||
    "School user";
  const activeSchoolName =
    context.active_school?.name ?? activeMembership?.school_name ?? null;
  const contextName = activeSchoolName || "Platform administration";
  const ContextIcon = activeSchoolName ? School : Building2;
  const routeContext = getRouteContext(pathname);

  const closeMobileNavigation = () => setMobileNavigationOpen(false);

  return (
    <div
      className={[
        "min-h-screen bg-slate-50 lg:grid",
        "transition-[grid-template-columns] ease-in-out",
        "motion-reduce:transition-none",
        sidebarPreferenceLoaded ? "duration-200" : "duration-0",
        sidebarCollapsed
          ? "lg:grid-cols-[80px_minmax(0,1fr)]"
          : "lg:grid-cols-[280px_minmax(0,1fr)]",
      ].join(" ")}
    >
      <aside
        id="desktop-sidebar"
        className="no-print hidden h-screen border-r border-slate-800 bg-slate-950 text-slate-100 lg:sticky lg:top-0 lg:flex lg:flex-col"
      >
        <div className="shrink-0 border-b border-slate-800 p-4">
          <Link
            href="/app"
            aria-label="SchoolDB dashboard"
            className={[
              "flex items-center",
              sidebarCollapsed ? "justify-center" : "gap-3",
            ].join(" ")}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
              SD
            </span>

            {!sidebarCollapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-base font-bold text-white">
                  SchoolDB
                </span>
                <span className="block truncate text-xs text-slate-500">
                  School management
                </span>
              </span>
            ) : null}
          </Link>
        </div>

        <div className="shrink-0 px-3 pt-3">
          <div
            title={sidebarCollapsed ? contextName : undefined}
            className={[
              "rounded-xl border border-slate-800 bg-slate-900/70",
              sidebarCollapsed
                ? "flex justify-center p-2.5"
                : "flex items-center gap-3 p-3",
            ].join(" ")}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <ContextIcon aria-hidden="true" className="h-4 w-4" />
            </span>

            {!sidebarCollapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {contextName}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {activeMembership ? "Active school" : "Platform view"}
                </span>
              </span>
            ) : null}
          </div>
        </div>

        <nav className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {!sidebarCollapsed ? (
            <form action="/app/search" className="relative mb-4">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                name="q"
                aria-label="Search navigation and records"
                placeholder="Search SchoolDB"
                className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </form>
          ) : null}

          <div className="space-y-1">
            <NavigationLink
              href="/app"
              icon={LayoutDashboard}
              label="Dashboard"
              collapsed={sidebarCollapsed}
              pathname={pathname}
            />
            <NavigationLink
              href="/app/portal"
              icon={UserRound}
              label="My portal"
              collapsed={sidebarCollapsed}
              pathname={pathname}
            />
            <NavigationLink
              href="/app/files"
              icon={FolderLock}
              label="Private files"
              collapsed={sidebarCollapsed}
              pathname={pathname}
            />
          </div>

          {visibleGroups.map((group) => (
            <section key={group.id} className="mt-5">
              {sidebarCollapsed ? (
                <div
                  className="mx-2 mb-3 h-px bg-slate-800"
                  aria-hidden="true"
                />
              ) : (
                <div className="mb-2 flex items-center gap-2 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                    {group.label}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-slate-900" />
                </div>
              )}

              <div className="space-y-1">
                {group.modules.map((module) => (
                  <NavigationLink
                    key={module.id}
                    href={moduleHref(module)}
                    icon={module.icon}
                    label={module.label}
                    collapsed={sidebarCollapsed}
                    pathname={pathname}
                  />
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-3">
          <div
            className={[
              "flex items-center rounded-xl",
              sidebarCollapsed
                ? "justify-center"
                : "gap-3 bg-slate-900/60 p-2",
            ].join(" ")}
          >
            <span
              title={sidebarCollapsed ? name : undefined}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
            >
              {initials}
            </span>

            {!sidebarCollapsed ? (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {primaryRole}
                  </span>
                </span>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    title="Sign out"
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </aside>

      {mobileNavigationOpen ? (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileNavigation}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]"
          />

          <aside className="relative flex h-full w-[min(20rem,86vw)] flex-col border-r border-slate-800 bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <Link href="/app" onClick={closeMobileNavigation} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                  SD
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-950">SchoolDB</span>
                  <span className="block max-w-44 truncate text-xs text-slate-500">
                    {contextName}
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={closeMobileNavigation}
                aria-label="Close navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <nav className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
              <form action="/app/search" className="relative mb-4">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  name="q"
                  aria-label="Search SchoolDB"
                  placeholder="Search SchoolDB"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </form>

              <div className="space-y-1">
                <MobileNavigationLink
                  href="/app"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  pathname={pathname}
                  onNavigate={closeMobileNavigation}
                />
                <MobileNavigationLink
                  href="/app/portal"
                  icon={UserRound}
                  label="My portal"
                  pathname={pathname}
                  onNavigate={closeMobileNavigation}
                />
                <MobileNavigationLink
                  href="/app/files"
                  icon={FolderLock}
                  label="Private files"
                  pathname={pathname}
                  onNavigate={closeMobileNavigation}
                />
              </div>

              {visibleGroups.map((group) => (
                <section key={group.id} className="mt-5">
                  <div className="mb-2 flex items-center gap-2 px-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {group.label}
                    </span>
                    <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                  </div>

                  <div className="space-y-1">
                    {group.modules.map((module) => (
                      <MobileNavigationLink
                        key={module.id}
                        href={moduleHref(module)}
                        icon={module.icon}
                        label={module.label}
                        pathname={pathname}
                        onNavigate={closeMobileNavigation}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </nav>

            <div className="shrink-0 border-t border-slate-200 p-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-950">
                    {name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {primaryRole}
                  </span>
                </span>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileNavigationOpen(true)}
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
              aria-controls="desktop-sidebar"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:inline-flex"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen aria-hidden="true" className="h-5 w-5" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="h-5 w-5" />
              )}
            </button>

            <div className="hidden min-w-0 shrink-0 xl:block">
              <p className="max-w-48 truncate text-sm font-semibold text-slate-900">
                {routeContext.title}
              </p>
              <p className="max-w-56 truncate text-xs text-slate-500">
                {routeContext.description}
              </p>
            </div>

            <form action="/app/search" className="relative hidden max-w-xl flex-1 md:block">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                name="q"
                aria-label="Search SchoolDB"
                placeholder="Search students, staff, invoices…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </form>

            <Link
              href="/app/search"
              aria-label="Search"
              className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
            >
              <FileSearch aria-hidden="true" className="h-5 w-5" />
            </Link>

            <div className="ml-auto hidden min-w-0 items-center gap-2 md:flex">
              <SchoolSwitcher
                activeSchoolId={context.active_school_id}
                schools={schoolOptions}
                isPlatformAdmin={context.is_platform_admin}
                action={switchSchoolAction}
              />
            </div>

            <Link
              href="/app/notifications"
              aria-label="Notifications"
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
            </Link>

            <details className="relative shrink-0">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials}
                </span>

                <span className="hidden min-w-0 text-left lg:block">
                  <span className="block max-w-36 truncate text-sm font-semibold text-slate-900">
                    {name}
                  </span>
                  <span className="block max-w-36 truncate text-xs text-slate-500">
                    {primaryRole}
                  </span>
                </span>

                <ChevronDown aria-hidden="true" className="hidden h-4 w-4 text-slate-400 lg:block" />
              </summary>

              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {primaryRole}
                  </p>
                </div>

                <div className="my-1 h-px bg-slate-100" />

                <div className="px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Current context
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <ContextIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" />
                    <p className="truncate text-sm font-medium text-slate-800">
                      {contextName}
                    </p>
                  </div>
                </div>

                <div className="my-1 h-px bg-slate-100" />

                <Link
                  href="/app/profile"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <UserRound aria-hidden="true" className="h-4 w-4" />
                  Profile settings
                </Link>

                {context.is_platform_admin || context.permissions.includes("settings.manage") ? (
                  <Link
                    href="/app/setup"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings aria-hidden="true" className="h-4 w-4" />
                    Settings
                  </Link>
                ) : null}

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </details>
          </div>

          <div className="border-t border-slate-100 px-4 py-2 md:hidden">
            <SchoolSwitcher
              activeSchoolId={context.active_school_id}
              schools={schoolOptions}
              isPlatformAdmin={context.is_platform_admin}
              action={switchSchoolAction}
            />
          </div>
        </header>

        <main id="main-content" className="min-w-0">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
