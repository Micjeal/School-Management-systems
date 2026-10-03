"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortalRole } from "@/lib/portal/resolve-portal-role";
import { getPortalRoleLabel } from "@/lib/portal/resolve-portal-role";

interface PortalRoleSwitcherProps {
  currentRole: PortalRole;
  availableRoles: PortalRole[];
  onRoleChange: (role: PortalRole) => void;
}

export function PortalRoleSwitcher({
  currentRole,
  availableRoles,
  onRoleChange
}: PortalRoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (availableRoles.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Viewing as:</span>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {getPortalRoleLabel(currentRole)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-md border bg-white p-1 shadow-lg">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => {
                onRoleChange(role);
                setIsOpen(false);
              }}
              disabled={role === currentRole}
              className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {getPortalRoleLabel(role)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
