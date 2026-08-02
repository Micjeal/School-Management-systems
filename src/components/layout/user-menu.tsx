"use client";

import Link from "next/link";
import { Building2, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/app/actions";
import type { UserContext } from "@/types/context";

type UserMenuProps = {
  context: UserContext;
};

export function UserMenu({ context }: UserMenuProps) {
  const activeMembership = context.memberships.find(
    (membership) => membership.school_id === context.active_school_id,
  );

  const name =
    context.profile.display_name ||
    [context.profile.first_name, context.profile.last_name]
      .filter(Boolean)
      .join(" ") ||
    "SchoolDB user";

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SD";

  const primaryRole =
    context.platform_roles[0]?.name ||
    activeMembership?.roles[0]?.name ||
    "School user";

  return (
    <details className="relative">
      <summary
        className="
          flex cursor-pointer list-none
          items-center gap-2 rounded-xl
          p-1.5 pr-2
          transition-colors
          hover:bg-slate-100
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-blue-500
        "
      >
        <div
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full bg-blue-600
            text-xs font-bold text-white
          "
        >
          {initials}
        </div>

        <div className="hidden min-w-0 text-left lg:block">
          <p className="max-w-36 truncate text-sm font-semibold text-slate-900">
            {name}
          </p>

          <p className="max-w-36 truncate text-xs text-slate-500">
            {primaryRole}
          </p>
        </div>

        <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
      </summary>

      <div
        className="
          absolute right-0 top-12
          w-72 rounded-2xl
          border border-slate-200
          bg-white p-2
          shadow-xl shadow-slate-900/10
        "
      >
        <div className="mb-2 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {primaryRole}
              </p>
            </div>
          </div>
        </div>

        {activeMembership && (
          <div className="mb-2 rounded-xl bg-slate-50 p-3">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500">
                  Active school
                </p>
                <p className="truncate text-sm text-slate-950">
                  {activeMembership.school_name}
                </p>
              </div>
            </div>

            {activeMembership.roles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {activeMembership.roles.map((role) => (
                  <Badge key={role.id} className="text-xs">
                    {role.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {context.platform_roles.length > 0 && (
          <div className="mb-2 rounded-xl bg-slate-50 p-3">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500">
                  Platform role
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {context.platform_roles.map((role) => (
                    <Badge
                      key={role.id}
                      className="bg-blue-100 text-xs text-blue-700"
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 space-y-1">
          <Link
            href="/app/profile"
            className="
              flex items-center gap-2 rounded-lg
              px-3 py-2 text-sm text-slate-600
              hover:bg-slate-100 hover:text-slate-950
            "
          >
            <User className="h-4 w-4" />
            Profile
          </Link>

          <Link
            href="/app/settings"
            className="
              flex items-center gap-2 rounded-lg
              px-3 py-2 text-sm text-slate-600
              hover:bg-slate-100 hover:text-slate-950
            "
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="
                flex w-full items-center gap-2 rounded-lg
                px-3 py-2 text-sm text-slate-600
                hover:bg-slate-100 hover:text-slate-950
              "
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}
