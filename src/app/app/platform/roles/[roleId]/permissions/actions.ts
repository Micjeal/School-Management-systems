"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

export async function saveRolePermissions(
  roleId: string,
  formData: FormData,
) {
  await requireUserContext("roles.manage");

  const permissionIds = formData
    .getAll("permission_ids")
    .map(String)
    .filter(Boolean);

  const supabase = await createClient();

  const { error } = await supabase.rpc("set_role_permissions", {
    target_role_id: roleId,
    target_permission_ids: permissionIds,
  } as any);

  if (error) {
    redirect(
      `/app/platform/roles/${roleId}/permissions` +
      `?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath(
    `/app/platform/roles/${roleId}/permissions`,
  );

  revalidatePath("/app", "layout");

  redirect(
    `/app/platform/roles/${roleId}/permissions` +
    `?message=${encodeURIComponent(
      "Role permissions updated",
    )}`,
  );
}
