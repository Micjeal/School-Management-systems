import "server-only";
import { getUserContext } from "@/lib/auth/context";

export type SchoolScope =
  | { mode: "platform"; activeSchoolId: null; isPlatformAdmin: true }
  | { mode: "school"; activeSchoolId: string; isPlatformAdmin: boolean };

export async function resolveSchoolScope(): Promise<SchoolScope | null> {
  const context = await getUserContext();
  if (!context) return null;
  if (context.active_school_id) {
    return {
      mode: "school",
      activeSchoolId: context.active_school_id,
      isPlatformAdmin: context.is_platform_admin
    };
  }
  return context.is_platform_admin
    ? { mode: "platform", activeSchoolId: null, isPlatformAdmin: true }
    : null;
}
