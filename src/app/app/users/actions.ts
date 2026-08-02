"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

const v = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function inviteSchoolUser(formData: FormData) {
  const context = await requireUserContext("users.manage");
  const supabase = await createClient();
  const schoolId = v(formData, "school_id") || context.active_school_id;
  const email = v(formData, "email");
  const firstName = v(formData, "first_name");
  const lastName = v(formData, "last_name");
  const phone = v(formData, "phone") || null;
  const roleCode = v(formData, "role_code");

  if (!email || !firstName || !lastName || !roleCode) {
    redirect("/app/users?error=Missing required fields");
  }

  if (!schoolId) {
    redirect("/app/users?error=No active school selected");
  }

  // Verify the role is a school role, not a platform role
  const { data: role, error: roleError } = await (supabase.from("roles") as any)
    .select("id,code,name,school_id")
    .or(`and(school_id.eq.${schoolId},code.eq.${roleCode}),and(school_id.is.null,code.eq.${roleCode})`)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (roleError || !role) {
    redirect("/app/users?error=Invalid role");
  }

  if (["super_admin", "platform_admin"].includes(role.code)) {
    redirect("/app/users?error=Cannot assign platform roles through school invitation");
  }

  // Use the Edge Function for secure invitation
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: {
      action: "invite",
      email,
      schoolId,
      roleCode,
      platformRole: null // Never assign platform roles from school context
    }
  });

  if (error || (data as any)?.error) {
    redirect(`/app/users?error=${encodeURIComponent(error?.message || (data as any).error)}`);
  }

  revalidatePath("/app/users");
  redirect("/app/users?message=Invitation sent");
}
