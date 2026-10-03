"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_SCHOOL_COOKIE, PLATFORM_VIEW_VALUE, getUserContext } from "@/lib/auth/context";
import { maySelectSchool, readSchoolSelection } from "@/lib/auth/school-switching";

function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith("/app") || value.startsWith("//")) {
    return "/app";
  }
  return value;
}

export async function switchSchoolAction(formData: FormData) {
  const selection = readSchoolSelection(formData, PLATFORM_VIEW_VALUE);
  const context = await getUserContext();

  if (!context) {
    redirect("/login");
  }

  if (selection.kind === "missing") {
    redirect("/app?error=Select+a+school");
  }
  if (selection.kind === "invalid") {
    redirect("/access-denied?reason=invalid-school");
  }

  const platformViewRequested = selection.kind === "platform";

  if (platformViewRequested) {
    if (!context.is_platform_admin) {
      redirect("/access-denied");
    }
  } else {
    const supabase = await createClient();

    const { data: school, error } = await supabase
      .from("schools")
      .select("id, status")
      .eq("id", selection.schoolId)
      .maybeSingle();

    if (error || !school || school.status !== "active") {
      redirect("/access-denied?reason=school-unavailable");
    }

    if (!maySelectSchool(context.is_platform_admin, context.memberships, selection.schoolId)) {
      redirect("/access-denied?reason=school-access");
    }
  }

  const cookieStore = await cookies();

  // Expire the obsolete path variant before writing the one canonical cookie.
  cookieStore.set(ACTIVE_SCHOOL_COOKIE, "", { path: "/app", maxAge: 0 });
  if (platformViewRequested) {
    cookieStore.delete(ACTIVE_SCHOOL_COOKIE);
  } else {
    cookieStore.set(ACTIVE_SCHOOL_COOKIE, selection.schoolId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

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
