"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { isUuid } from "@/lib/auth/access-errors";

export async function saveRolePermissions(roleId: string, formData: FormData) {
  const context = await requireUserContext("roles.manage");
  if (!isUuid(roleId)) redirect("/app/platform/roles?error=Invalid%20role");

  const permissionIds = formData.getAll("permission_ids").map(String).filter(Boolean);

  const supabase = await createClient();
  let roleQuery = supabase.from("roles").select("id,school_id,code").eq("id", roleId);
  if (!context.is_platform_admin) {
    if (!context.active_school_id) redirect("/access-denied");
    roleQuery = roleQuery.eq("school_id", context.active_school_id);
  }
  const { data: role } = await roleQuery.maybeSingle();
  const isSuperAdmin = context.platform_roles.some((item) => item.code === "super_admin");
  if (!role || (role.school_id === null && !isSuperAdmin) || ["super_admin", "platform_admin"].includes(role.code)) redirect("/access-denied");

  const { error } = await supabase.rpc("set_role_permissions", {
    target_role_id: roleId,
    target_permission_ids: permissionIds
  } as any);

  if (error) {
    redirect(
      `/app/platform/roles/${roleId}/permissions` + `?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/app/platform/roles/${roleId}/permissions`);

  revalidatePath("/app", "layout");

  redirect(
    `/app/platform/roles/${roleId}/permissions` +
      `?message=${encodeURIComponent("Role permissions updated")}`
  );
}
