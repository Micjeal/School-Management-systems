"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";

function withMessage(path: string, type: "error" | "message", value: string): never {
  redirect(`${path}?${type}=${encodeURIComponent(value)}`);
}

export async function loginAction(formData: FormData) {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(6), next: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) withMessage("/login", "error", "Enter a valid email and password.");
  console.log("Login attempt", { email: parsed.data.email, passwordLength: parsed.data.password.length });
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    console.log("Login failed", { email: parsed.data.email, error: error.message });
    withMessage("/login", "error", error.message);
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) withMessage("/login", "error", "Authentication did not complete.");
  const { data: profile } = await supabase.from("profiles").select("must_change_password,is_active").eq("id", user.id).maybeSingle() as any;
  if (profile?.is_active === false) { await supabase.auth.signOut(); redirect("/access-denied?reason=disabled"); }
  if (profile?.must_change_password) redirect("/change-password");
  
  // Check for platform roles and school memberships
  const [{ data: platformRoles }, { data: memberships }] = await Promise.all([
    supabase.from("platform_user_roles").select("roles(code)").eq("user_id", user.id) as any,
    supabase.from("school_memberships").select("school_id,status,schools(name,slug)").eq("user_id", user.id).eq("status", "active") as any
  ]);
  
  const isPlatformAdmin = (platformRoles ?? []).some((r: any) => ["super_admin", "platform_admin"].includes(r.roles?.code));
  const activeMemberships = (memberships ?? []).filter((m: any) => m.status === "active");
  
  // Platform admin goes to platform dashboard
  if (isPlatformAdmin) {
    redirect("/app/platform/schools");
  }
  
  // No active memberships
  if (activeMemberships.length === 0) {
    redirect("/access-denied?reason=no_membership");
  }
  
  // Single membership - auto-select and redirect
  if (activeMemberships.length === 1) {
    const schoolId = activeMemberships[0]!.school_id;
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("schooldb_active_school", schoolId);
    redirect("/app");
  }
  
  // Multiple memberships - show school selector
  redirect("/app/select-school");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) withMessage("/forgot-password", "error", "Enter a valid email address.");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password` });
  if (error) withMessage("/forgot-password", "error", error.message);
  withMessage("/forgot-password", "message", "Check your email for the secure reset link.");
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = z.object({ password: z.string().min(10), confirm: z.string() }).refine((v: { password: string; confirm: string }) => v.password === v.confirm, { message: "Passwords do not match" }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) withMessage("/reset-password", "error", parsed.error.issues[0]?.message ?? "Invalid password");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) withMessage("/reset-password", "error", error.message);
  redirect("/app");
}
