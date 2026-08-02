import type { UserContext } from "@/types/context";

export async function resolveIntegrationScope(
  context: UserContext,
  requestedSchoolId: string | null,
): Promise<string | null> {
  if (!context.is_platform_admin) {
    if (!context.active_school_id) {
      throw new Error("Select a school first.");
    }

    return context.active_school_id;
  }

  if (!requestedSchoolId || requestedSchoolId === "__platform__") {
    return null;
  }

  return requestedSchoolId;
}

export function getScopeLabel(schoolId: string | null, schoolName?: string): string {
  if (schoolId === null) {
    return "Platform";
  }

  return schoolName || "Unknown School";
}

export function canManageIntegration(
  context: UserContext,
  connectionSchoolId: string | null,
): boolean {
  // Platform admins can manage platform integrations
  if (connectionSchoolId === null) {
    return context.is_platform_admin;
  }

  // School admins can manage their school's integrations
  if (context.is_platform_admin) {
    return true;
  }

  return context.active_school_id === connectionSchoolId;
}
