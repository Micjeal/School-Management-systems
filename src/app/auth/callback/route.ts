import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { RECOVERY_EXPIRED } from "@/lib/auth/password-recovery";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const recovery = url.searchParams.get("recovery") === "1" || next.split("?")[0] === "/reset-password";
  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  };

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return redirectTo(recovery ? "/auth/change-password?recovery=1" : next);
    } catch {
      // Expired, consumed and failed exchanges share a safe public response.
    }
  }

  return redirectTo(recovery
    ? `/forgot-password?error=${encodeURIComponent(RECOVERY_EXPIRED)}`
    : "/login?error=Unable%20to%20complete%20authentication");
}
