"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function addRole(formData: FormData) {
  const context = await requireUserContext("users.manage");
  const supabase = await createClient();

  const membershipId = value(formData, "membership_id");
  const roleId = value(formData, "role_id");
  const expiresAt = formData.get("expires_at") as string | null;

  if (!membershipId || !roleId) {
    redirect("/app/platform/users?error=Membership+and+role+are+required");
  }

  // Verify the membership belongs to the user's active school
  const { data: membership } = await (supabase
    .from("school_memberships") as any)
    .select("id,school_id")
    .eq("id", membershipId)
    .eq("school_id", context.active_school_id)
    .maybeSingle();

  if (!membership) {
    redirect("/app/platform/users?error=Membership+not+found");
  }

  // Verify the role is a school role (not platform role)
  const { data: role } = await (supabase.from("roles") as any)
    .select("id,code,school_id")
    .eq("id", roleId)
    .maybeSingle();

  if (!role || ["super_admin", "platform_admin"].includes(role.code)) {
    redirect("/app/platform/users?error=Invalid+role");
  }

  // Add the role
  const { error } = await (supabase.from("membership_roles") as any).insert({
    membership_id: membershipId,
    role_id: roleId,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    assigned_by: context.profile.id,
  });

  if (error) {
    redirect(`/app/platform/users/${membershipId}/roles?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/platform/users");
  redirect(`/app/platform/users/${membershipId}/roles?message=Role+added`);
}

export async function removeRole(formData: FormData) {
  const membershipId = value(formData, "membership_id");
  const roleId = value(formData, "role_id");

  if (!membershipId || !roleId) {
    redirect(
      `/app/platform/users/${membershipId}/roles?error=${encodeURIComponent(
        "Membership and role are required.",
      )}`,
    );
  }

  const context = await requireUserContext();
  const supabase = await createClient();

  const { data: membership, error: membershipError } =
    await supabase
      .from("school_memberships")
      .select("id, school_id, user_id")
      .eq("id", membershipId)
      .maybeSingle() as any;

  if (membershipError || !membership) {
    redirect(
      `/app/platform/users/${membershipId}/roles?error=${encodeURIComponent(
        membershipError?.message ?? "Membership not found.",
      )}`,
    );
  }

  const canManage =
    context.is_platform_admin ||
    context.permissions?.includes("users.manage");

  if (!canManage) {
    redirect("/access-denied");
  }

  if (
    !context.is_platform_admin &&
    membership.school_id !== context.active_school_id
  ) {
    redirect("/access-denied");
  }

  // Protect against removing the final school_owner role
  const { data: role } = await supabase
    .from("roles")
    .select("code")
    .eq("id", roleId)
    .maybeSingle() as any;

  if (role?.code === "school_owner") {
    const { count } = await supabase
      .from("membership_roles")
      .select(
        `
        membership_id,
        role:roles!inner(code),
        membership:school_memberships!inner(school_id,status)
      `,
        {
          count: "exact",
          head: true,
        },
      )
      .eq("role.code", "school_owner")
      .eq("membership.school_id", membership.school_id)
      .eq("membership.status", "active");

    if ((count ?? 0) <= 1) {
      redirect(
        `/app/platform/users/${membershipId}/roles?error=${encodeURIComponent(
          "You cannot remove the school's final owner.",
        )}`,
      );
    }
  }

  const { error } = await supabase
    .from("membership_roles")
    .delete()
    .eq("membership_id", membershipId)
    .eq("role_id", roleId);

  if (error) {
    redirect(
      `/app/platform/users/${membershipId}/roles?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath(
    `/app/platform/users/${membershipId}/roles`,
  );

  revalidatePath("/app/platform/users");

  redirect(
    `/app/platform/users/${membershipId}/roles?message=${encodeURIComponent(
      "Role removed",
    )}`,
  );
}

export async function updateMembershipStatus(formData: FormData) {
  const context = await requireUserContext("users.manage");
  const supabase = await createClient();

  const membershipId = value(formData, "membership_id");
  const status = value(formData, "status");

  if (!membershipId || !status) {
    redirect("/app/platform/users?error=Membership+and+status+are+required");
  }

  if (!["active", "suspended", "inactive"].includes(status)) {
    redirect("/app/platform/users?error=Invalid+status");
  }

  // Verify the membership belongs to the user's active school
  const { data: membership } = await (supabase
    .from("school_memberships") as any)
    .select("id,school_id")
    .eq("id", membershipId)
    .eq("school_id", context.active_school_id)
    .maybeSingle();

  if (!membership) {
    redirect("/app/platform/users?error=Membership+not+found");
  }

  // Update status
  const { error } = await (supabase.from("school_memberships") as any)
    .update({ status })
    .eq("id", membershipId);

  if (error) {
    redirect(`/app/platform/users/${membershipId}/roles?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/platform/users");
  redirect(`/app/platform/users/${membershipId}/roles?message=Membership+updated`);
}
