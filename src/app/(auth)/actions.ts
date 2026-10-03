"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { isAuthRateLimit, recoveryRedirect, RECOVERY_EXPIRED, RECOVERY_SUCCESS } from "@/lib/auth/password-recovery";
import { changeFirstLoginPassword } from "@/app/auth/change-password/actions";

function withMessage(path: string, type: "error" | "message", value: string): never {
  redirect(`${path}?${type}=${encodeURIComponent(value)}`);
}

export async function loginAction(formData: FormData) {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(6), next: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) withMessage("/login", "error", "Enter a valid email and password.");
  const supabase = await createClient();
  const destination = safeNextPath(parsed.data.next);
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      const projectRef = new URL(publicEnv.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
      console.error("[auth][login]", {
        email: parsed.data.email,
        projectRef,
        status: error.status,
        code: error.code,
        message: error.message,
      });
    }
    withMessage("/login", "error", error.message);
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) withMessage("/login", "error", "Authentication did not complete.");
  const { data: profile } = await supabase.from("profiles").select("must_change_password,is_active").eq("id", user.id).maybeSingle() as any;
  if (profile?.is_active === false) { await supabase.auth.signOut(); redirect("/access-denied?reason=disabled"); }
  if (profile?.must_change_password) redirect(`/auth/change-password?next=${encodeURIComponent(destination)}`);
  
  // Check for platform roles and school memberships
  const [{ data: platformRoles }, { data: memberships }] = await Promise.all([
    supabase.from("platform_user_roles").select("roles(code)").eq("user_id", user.id) as any,
    supabase.from("school_memberships").select("school_id,status,schools(name,slug)").eq("user_id", user.id).eq("status", "active") as any
  ]);
  
  const isPlatformAdmin = (platformRoles ?? []).some((r: any) => ["super_admin", "platform_admin"].includes(r.roles?.code));
  const activeMemberships = (memberships ?? []).filter((m: any) => m.status === "active");
  
  // Platform admin goes to platform dashboard
  if (isPlatformAdmin) {
    redirect(destination === "/app" ? "/app/platform/schools" : destination);
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
    redirect(destination);
  }
  
  // Multiple memberships - show school selector
  redirect("/app/select-school");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) withMessage("/forgot-password", "error", "Enter a valid email address.");
  const supabase = await createClient();
  let rateLimited = false;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: recoveryRedirect(publicEnv.NEXT_PUBLIC_SITE_URL) });
    if (error && process.env.NODE_ENV !== "production") {
      console.error("[auth][password-recovery] Supabase reset email failed", {
        status: error.status,
        code: error.code,
        message: error.message,
      });
    }
    rateLimited = isAuthRateLimit(error);
    // Never expose account-specific Auth errors to this public form.
  } catch {
    withMessage("/forgot-password", "error", "Unable to request a reset email right now. Please try again later.");
  }
  if (rateLimited) withMessage("/forgot-password", "error", "Please wait before requesting another verification code.");
  redirect(`/forgot-password/verify?message=${encodeURIComponent(RECOVERY_SUCCESS)}`);
}

export async function verifyRecoveryOtpAction(formData: FormData) {
  const parsed = z.object({ email: z.string().trim().email(), token: z.string().trim().regex(/^\d{6}$/) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) withMessage("/forgot-password/verify", "error", RECOVERY_EXPIRED);
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email: parsed.data.email, token: parsed.data.token, type: "recovery" });
  if (error) withMessage("/forgot-password/verify", "error", RECOVERY_EXPIRED);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) withMessage("/forgot-password/verify", "error", RECOVERY_EXPIRED);
  redirect("/auth/change-password?recovery=1");
}

export async function resendRecoveryOtpAction(formData: FormData) {
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) withMessage("/forgot-password/verify", "error", "Enter a valid email address.");
  const supabase = await createClient();
  let rateLimited = false;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: recoveryRedirect(publicEnv.NEXT_PUBLIC_SITE_URL) });
    rateLimited = isAuthRateLimit(error);
  } catch { /* Keep resend behavior generic. */ }
  if (rateLimited) withMessage("/forgot-password/verify", "error", "Please wait before requesting another verification code.");
  withMessage("/forgot-password/verify", "message", RECOVERY_SUCCESS);
}

export async function resetPasswordAction(formData: FormData) {
  formData.set("recovery", "1");
  return changeFirstLoginPassword(formData);
}
