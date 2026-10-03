"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { PASSWORD_UPDATED, RECOVERY_SESSION_ERROR } from "@/lib/auth/password-recovery";

const passwordSchema = z.object({
  password: z.string().min(12, "Use at least 12 characters").regex(/[a-z]/, "Include a lowercase letter").regex(/[A-Z]/, "Include an uppercase letter").regex(/[0-9]/, "Include a number").regex(/[^A-Za-z0-9]/, "Include a symbol"),
  confirm: z.string(),
  next: z.string().optional()
}).refine(value => value.password === value.confirm, { message: "Passwords do not match" });

export async function changeFirstLoginPassword(formData: FormData) {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  const destination = safeNextPath(String(formData.get("next") ?? "/app"));
  const recovery = formData.get("recovery") === "1";
  const formPath = `/auth/change-password?next=${encodeURIComponent(destination)}${recovery ? "&recovery=1" : ""}`;
  const supabase = await createClient();
  const { data: before, error: userError } = await supabase.auth.getUser();
  if (userError || !before.user) redirect(`/login?error=${encodeURIComponent(RECOVERY_SESSION_ERROR)}`);
  if (!parsed.success) redirect(`${formPath}&error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid password")}`);
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const message = error.code === "same_password" ? "Choose a password different from your current password."
      : error.code === "weak_password" ? "Choose a stronger password that meets the requirements."
      : "Unable to update your password. Try again or request a new reset link.";
    redirect(`${formPath}&error=${encodeURIComponent(message)}`);
  }
  let profileVerified = false;
  try {
    await supabase.auth.refreshSession();
    const { data: profile, error: profileError } = await supabase.from("profiles").select("must_change_password").eq("id", before.user.id).maybeSingle();
    profileVerified = !profileError && profile?.must_change_password === false;
  } catch {
    // Auth succeeded. A delayed profile read must never ask for another update.
  }
  if (recovery || !profileVerified) {
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (signOutError) redirect("/auth/change-password?completed=1");
    redirect(`/login?message=${encodeURIComponent(PASSWORD_UPDATED)}`);
  }
  redirect(destination);
}

export async function finishPasswordRecovery() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) redirect("/auth/change-password?completed=1&error=Unable%20to%20sign%20out.%20Please%20try%20again.");
  redirect(`/login?message=${encodeURIComponent(PASSWORD_UPDATED)}`);
}
