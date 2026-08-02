"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_SCHOOL_COOKIE, PLATFORM_VIEW_VALUE, getUserContext } from "@/lib/auth/context";

const schoolIdSchema = z.string().uuid();

function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith("/app") || value.startsWith("//")) {
    return "/app";
  }
  return value;
}

export async function switchSchoolAction(formData: FormData) {
  const selectedValue = String(formData.get("school_id") ?? "");
  const context = await getUserContext();

  if (!context) {
    redirect("/login");
  }

  const platformViewRequested = selectedValue === PLATFORM_VIEW_VALUE || selectedValue === "";

  if (platformViewRequested) {
    if (!context.is_platform_admin) {
      redirect("/access-denied");
    }
  } else {
    const parsed = schoolIdSchema.safeParse(selectedValue);

    if (!parsed.success) {
      redirect("/access-denied?reason=invalid-school");
    }

    const supabase = await createClient();

    const { data: school, error } = await supabase
      .from("schools")
      .select("id, status")
      .eq("id", parsed.data)
      .maybeSingle();

    if (error || !school || school.status === "archived") {
      redirect("/access-denied?reason=school-unavailable");
    }

    if (!context.is_platform_admin) {
      const allowed = context.memberships.some(
        (membership) =>
          membership.school_id === parsed.data && membership.status === "active",
      );

      if (!allowed) {
        redirect("/access-denied?reason=school-access");
      }
    }
  }

  const cookieStore = await cookies();

  cookieStore.set(ACTIVE_SCHOOL_COOKIE, platformViewRequested ? PLATFORM_VIEW_VALUE : selectedValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/app", "layout");

  const returnTo = safeReturnPath(String(formData.get("return_to") ?? ""));

  redirect(returnTo);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Clear the active school cookie
  const store = await cookies();
  store.delete(ACTIVE_SCHOOL_COOKIE);

  redirect("/login");
}
