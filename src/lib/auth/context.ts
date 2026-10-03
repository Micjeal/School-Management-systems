import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserContext, MembershipSummary, RoleSummary } from "@/types/context";
import { resolveActiveSchoolId } from "@/lib/auth/school-switching";

export const ACTIVE_SCHOOL_COOKIE = "schooldb_active_school";
export const PLATFORM_VIEW_VALUE = "__platform__";

async function fallbackContext(userId: string): Promise<UserContext> {
  const supabase = await createClient();
  const [{ data: profile }, { data: memberships }, { data: platformRoleRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,display_name,first_name,last_name,must_change_password,is_active")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("school_memberships")
      .select(
        "id,school_id,campus_id,status,ended_at,schools(name,slug,status,subscription_status),membership_roles(roles(id,code,name))"
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`ended_at.is.null,ended_at.gt.${new Date().toISOString()}`),
    supabase.from("platform_user_roles").select("roles(id,code,name)").eq("user_id", userId)
  ]);
  const parsedMemberships: MembershipSummary[] = (memberships ?? []).map((row: any) => ({
    membership_id: row.id,
    school_id: row.school_id,
    school_name: row.schools?.name ?? "School",
    school_slug: row.schools?.slug ?? "",
    school_status: row.schools?.status ?? "active",
    subscription_status: row.schools?.subscription_status ?? "trial",
    campus_id: row.campus_id,
    status: row.status,
    roles: (row.membership_roles ?? []).map((item: any) => item.roles).filter(Boolean)
  }));
  const platformRoles = (platformRoleRows ?? [])
    .map((row: any) => row.roles)
    .filter(Boolean) as RoleSummary[];
  return {
    user_id: userId,
    profile: (profile ?? {}) as UserContext["profile"],
    is_platform_admin: platformRoles.some((r) =>
      ["super_admin", "platform_admin"].includes(r.code)
    ),
    platform_roles: platformRoles,
    memberships: parsedMemberships,
    active_school: null,
    permissions: [],
    features: [],
    active_school_id: null
  };
}

const PLATFORM_VIEW = "__platform__";

export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const selectionCookie = cookieStore.get(ACTIVE_SCHOOL_COOKIE);
  const savedSelection = selectionCookie?.value ?? null;

  const platformViewRequested = savedSelection === PLATFORM_VIEW;

  let schoolId = platformViewRequested || !savedSelection ? null : savedSelection;

  let base: UserContext;
  const rpc = (await supabase.rpc(
    "get_my_context" as any,
    { target_school_id: schoolId } as any
  )) as any;
  if (rpc.error || !rpc.data) base = await fallbackContext(user.id);
  else base = rpc.data as unknown as UserContext;

  // Only automatically select a school for non-platform users when no cookie exists
  if (!selectionCookie && !base.is_platform_admin && base.memberships.length > 0) {
    schoolId = base.memberships[0]!.school_id;
  }

  let authorizedSchoolId = resolveActiveSchoolId(
    schoolId,
    base.active_school,
    base.is_platform_admin,
    base.memberships,
  );

  if (schoolId && authorizedSchoolId !== schoolId) {
    const refreshed = (await supabase.rpc(
      "get_my_context" as any,
      { target_school_id: schoolId } as any
    )) as any;
    if (!refreshed.error && refreshed.data) {
      base = refreshed.data as unknown as UserContext;
      authorizedSchoolId = resolveActiveSchoolId(
        schoolId,
        base.active_school,
        base.is_platform_admin,
        base.memberships,
      );
    }
  }

  // Never promote the browser cookie to trusted context. The RPC (or the
  // verified fallback membership below) is the authority for school scope.
  base.active_school_id = authorizedSchoolId;

  if (!authorizedSchoolId) {
    base.active_school = null;
  }

  return base;
}

export async function requireUserContext(permission?: string): Promise<UserContext> {
  const context = await getUserContext();
  if (!context) redirect("/login");
  if (context.profile.is_active === false) redirect("/access-denied?reason=disabled");
  if (context.profile.must_change_password) redirect("/auth/change-password");

  // Super admins should bypass all permission checks
  const isSuperAdmin = context.platform_roles.some((r) => r.code === "super_admin");

  if (
    permission &&
    !isSuperAdmin &&
    !context.is_platform_admin &&
    !context.permissions.includes(permission)
  ) {
    redirect(`/access-denied?permission=${encodeURIComponent(permission)}`);
  }
  return context;
}
