import type { UserContext } from "@/types/context";

export function canManageAnnouncements(context: UserContext, schoolId: string | null) {
  if (context.is_platform_admin) {
    return true;
  }

  return context.permissions.includes("communications.send") && Boolean(schoolId);
}

export function canReadAnnouncements(context: UserContext, schoolId: string | null) {
  if (context.is_platform_admin) {
    return true;
  }

  return Boolean(schoolId) && (
    context.permissions.includes("communications.read") ||
    context.permissions.includes("communications.send")
  );
}

export function isRecipientFeedView(context: UserContext, schoolId: string | null) {
  if (!schoolId) {
    return false;
  }

  return !canReadAnnouncements(context, schoolId) && !canManageAnnouncements(context, schoolId);
}
