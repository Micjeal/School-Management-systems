import "server-only";
import type { UserContext } from "@/types/context";
import type { PortalPersonas } from "./portal-types";

export type PortalRole =
  | "student"
  | "guardian"
  | "teacher"
  | "employee"
  | "platform_admin"
  | "none";

export interface PortalRoleResolution {
  primaryRole: PortalRole;
  availableRoles: PortalRole[];
  hasMultipleRoles: boolean;
  canSwitchRoles: boolean;
}

/**
 * Resolves the appropriate portal role based on user context and personas.
 * 
 * Priority order:
 * 1. Platform admin (platform view) → platform_admin
 * 2. Student role + student persona → student
 * 3. Guardian role + guardian persona → guardian
 * 4. Teacher role + employee persona (is_teacher) → teacher
 * 5. Employee role + employee persona → employee
 * 6. None → none
 */
export function resolvePortalRole(
  context: UserContext,
  personas: PortalPersonas
): PortalRoleResolution {
  const availableRoles: PortalRole[] = [];

  // Platform admin
  if (context.is_platform_admin && !context.active_school_id) {
    return {
      primaryRole: "platform_admin",
      availableRoles: ["platform_admin"],
      hasMultipleRoles: false,
      canSwitchRoles: false
    };
  }

  // Check for student role + persona
  const hasStudentRole = context.memberships.some((m) =>
    m.roles.some((r) => r.code === "student")
  );
  if (hasStudentRole && personas.student) {
    availableRoles.push("student");
  }

  // Check for guardian role + persona
  const hasGuardianRole = context.memberships.some((m) =>
    m.roles.some((r) => r.code === "parent" || r.code === "guardian")
  );
  if (hasGuardianRole && personas.guardian) {
    availableRoles.push("guardian");
  }

  // Check for teacher role + employee persona
  const hasTeacherRole = context.memberships.some((m) =>
    m.roles.some((r) => r.code === "teacher" || r.code === "class_teacher")
  );
  if (hasTeacherRole && personas.employee?.isTeacher) {
    availableRoles.push("teacher");
  }

  // Check for employee role + employee persona (non-teacher)
  const hasEmployeeRole = context.memberships.some((m) =>
    m.roles.some((r) =>
      [
        "principal",
        "deputy_principal",
        "director_of_studies",
        "school_admin",
        "school_owner",
        "accountant",
        "bursar",
        "cashier",
        "hr_manager",
        "librarian",
        "nurse",
        "boarding_warden",
        "transport_manager"
      ].includes(r.code)
    )
  );
  if (hasEmployeeRole && personas.employee && !personas.employee.isTeacher) {
    availableRoles.push("employee");
  }

  // Fallback to employee if they have employee persona but no specific role
  if (availableRoles.length === 0 && personas.employee) {
    availableRoles.push("employee");
  }

  // Determine primary role with priority
  let primaryRole: PortalRole = "none";
  if (availableRoles.includes("student")) {
    primaryRole = "student";
  } else if (availableRoles.includes("guardian")) {
    primaryRole = "guardian";
  } else if (availableRoles.includes("teacher")) {
    primaryRole = "teacher";
  } else if (availableRoles.includes("employee")) {
    primaryRole = "employee";
  }

  return {
    primaryRole,
    availableRoles,
    hasMultipleRoles: availableRoles.length > 1,
    canSwitchRoles: availableRoles.length > 1
  };
}

/**
 * Gets the display label for a portal role.
 */
export function getPortalRoleLabel(role: PortalRole): string {
  switch (role) {
    case "student":
      return "Student Portal";
    case "guardian":
      return "Parent Portal";
    case "teacher":
      return "Teacher Portal";
    case "employee":
      return "Staff Portal";
    case "platform_admin":
      return "Platform Portal";
    case "none":
      return "No Portal";
  }
}
