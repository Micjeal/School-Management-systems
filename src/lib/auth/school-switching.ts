import { isUuid } from "@/lib/auth/access-errors";

type SwitchMembership = {
  school_id: string;
  status: string;
};

export type SchoolSelection =
  | { kind: "missing" }
  | { kind: "invalid" }
  | { kind: "platform" }
  | { kind: "school"; schoolId: string };

export function readSchoolSelection(
  formData: FormData,
  platformValue: string,
): SchoolSelection {
  const raw = formData.get("school_id");
  if (typeof raw !== "string" || raw === "") return { kind: "missing" };
  if (raw === platformValue) return { kind: "platform" };
  return isUuid(raw) ? { kind: "school", schoolId: raw } : { kind: "invalid" };
}

export function maySelectSchool(
  isPlatformAdmin: boolean,
  memberships: SwitchMembership[],
  schoolId: string,
): boolean {
  return (
    isPlatformAdmin ||
    memberships.some(
      (membership) =>
        membership.school_id === schoolId && membership.status === "active",
    )
  );
}

export function resolveActiveSchoolId(
  selectedSchoolId: string | null,
  activeSchool: Record<string, unknown> | null,
  isPlatformAdmin: boolean,
  memberships: SwitchMembership[],
): string | null {
  if (!selectedSchoolId || !activeSchool) return null;
  if (
    activeSchool.id !== selectedSchoolId ||
    activeSchool.status !== "active"
  ) {
    return null;
  }
  return maySelectSchool(isPlatformAdmin, memberships, selectedSchoolId)
    ? selectedSchoolId
    : null;
}
