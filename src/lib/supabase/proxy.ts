import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.generated";
import { RECOVERY_SESSION_ERROR } from "@/lib/auth/password-recovery";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const protectedPath = path.startsWith("/app") || path === "/change-password" || path === "/auth/change-password";
  const authPath = path === "/login" || path === "/forgot-password" || path === "/forgot-password/verify";

  if (protectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    if (path === "/auth/change-password" || path === "/change-password") {
      url.search = `?error=${encodeURIComponent(RECOVERY_SESSION_ERROR)}`;
    }
    return NextResponse.redirect(url);
  }
  const isNavigationRequest = request.method === "GET" || request.method === "HEAD";
  if (user && path.startsWith("/app") && isNavigationRequest) {
    const { data: profile } = await supabase.from("profiles").select("must_change_password,is_active").eq("id", user.id).maybeSingle();
    if (profile?.is_active === false) {
      const url = request.nextUrl.clone(); url.pathname = "/access-denied"; url.search = "?reason=disabled"; return NextResponse.redirect(url);
    }
    if (profile?.must_change_password) {
      const url = request.nextUrl.clone(); url.pathname = "/auth/change-password"; url.searchParams.set("next", `${path}${request.nextUrl.search}`); return NextResponse.redirect(url);
    }
  }
  if (authPath && user && isNavigationRequest) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }
  return response;
}
