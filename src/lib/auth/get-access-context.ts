import "server-only";
import { requireUserContext } from "@/lib/auth/context";
import { AccessScopeError } from "@/lib/auth/access-errors";

export type AccessContext = {
  userId: string;
  isPlatformAdmin: boolean;
  isPlatformSuperAdmin: boolean;
  activeSchoolId: string | null;
  activeMembershipId: string | null;
  roleCodes: string[];
  permissionCodes: string[];
  campusId: string | null;
};

export async function getAccessContext(permission?: string): Promise<AccessContext> {
  const context = await requireUserContext(permission);
  const membership = context.active_school_id
    ? (context.memberships.find((item) => item.school_id === context.active_school_id) ?? null)
    : null;
  return {
    userId: context.user_id,
    isPlatformAdmin: context.is_platform_admin,
    isPlatformSuperAdmin: context.platform_roles.some((role) => role.code === "super_admin"),
    activeSchoolId: context.active_school_id,
    activeMembershipId: membership?.membership_id ?? null,
    roleCodes: [...context.platform_roles, ...(membership?.roles ?? [])].map((role) => role.code),
    permissionCodes: context.permissions,
    campusId: membership?.campus_id ?? null
  };
}

export function requireActiveSchool(context: AccessContext): string {
  if (!context.activeSchoolId) throw new AccessScopeError("ACTIVE_SCHOOL_REQUIRED");
  return context.activeSchoolId;
}

export function hasPermission(context: AccessContext, permission: string): boolean {
  return context.isPlatformSuperAdmin || context.permissionCodes.includes(permission);
}
