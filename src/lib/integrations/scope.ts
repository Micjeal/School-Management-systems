import type { UserContext } from "@/types/context";

export async function resolveIntegrationScope(
  context: UserContext,
  _requestedSchoolId: string | null,
): Promise<string | null> {
  if (!context.is_platform_admin) {
    if (!context.active_school_id) {
      throw new Error("Select a school first.");
    }

    return context.active_school_id;
  }

  return context.active_school_id;
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
    return context.active_school_id === connectionSchoolId;
  }

  return context.active_school_id === connectionSchoolId;
}
