"use client";

import { useState } from "react";
import { PortalRoleSwitcher } from "./portal-role-switcher";
import type { PortalRole } from "@/lib/portal/resolve-portal-role";

interface PortalClientProps {
  children: React.ReactNode;
  availableRoles: PortalRole[];
  initialRole: PortalRole;
}

export function PortalClient({ children, availableRoles, initialRole }: PortalClientProps) {
  const [selectedRole, setSelectedRole] = useState<PortalRole>(initialRole);

  // For now, we only show the primary role
  // Multi-role switching would require server actions to reload with different context
  // This is a placeholder for future enhancement

  return (
    <div>
      {availableRoles.length > 1 && (
        <div className="mb-4">
          <PortalRoleSwitcher
            currentRole={selectedRole}
            availableRoles={availableRoles}
            onRoleChange={setSelectedRole}
          />
        </div>
      )}
      {children}
    </div>
  );
}
