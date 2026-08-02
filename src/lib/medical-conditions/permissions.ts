import type { UserContext } from "@/types/context";
import type { MedicalCondition } from "./types";

export function canManageGlobalConditions(context: UserContext): boolean {
  return context.is_platform_admin;
}

export function canManageSchoolConditions(context: UserContext, schoolId: string): boolean {
  if (context.is_platform_admin) return true;
  
  const membership = context.memberships.find(
    (m) => m.school_id === schoolId && m.status === "active"
  );
  
  if (!membership) return false;
  
  return context.permissions.includes("health.manage");
}

export function canEditCondition(context: UserContext, condition: MedicalCondition): boolean {
  if (condition.school_id === null) {
    return canManageGlobalConditions(context);
  }
  
  return canManageSchoolConditions(context, condition.school_id);
}

export function canDeleteCondition(context: UserContext, condition: MedicalCondition): boolean {
  return canEditCondition(context, condition);
}

export function canViewCondition(context: UserContext, condition: MedicalCondition): boolean {
  if (condition.school_id === null) {
    return true;
  }
  
  if (context.is_platform_admin) return true;
  
  const membership = context.memberships.find(
    (m) => m.school_id === condition.school_id && m.status === "active"
  );
  
  return membership !== undefined;
}

export function getEffectiveScope(context: UserContext): "global" | "school" | "mixed" {
  if (context.is_platform_admin && !context.active_school_id) {
    return "global";
  }
  
  if (context.active_school_id) {
    return "school";
  }
  
  return "school";
}
