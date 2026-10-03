import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { RECOVERY_SESSION_ERROR } from "@/lib/auth/password-recovery";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changeFirstLoginPassword, finishPasswordRecovery } from "./actions";

export default async function ChangePassword({ searchParams }: { searchParams: Promise<{ error?: string; next?: string; recovery?: string; completed?: string }> }) {
  const query = await searchParams;
  const destination = safeNextPath(query.next);
  const recovery = query.recovery === "1";
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(`/login?error=${encodeURIComponent(RECOVERY_SESSION_ERROR)}`);
  if (query.completed === "1") return <main className="mx-auto max-w-md p-6"><h1 className="text-3xl font-bold">Finish signing out</h1><p className="my-4">Sign out before signing in with your new password.</p>{query.error ? <p role="alert">{query.error}</p> : null}<form action={finishPasswordRecovery}><Button>Sign out and return to login</Button></form></main>;
  const { data: profile } = await supabase.from("profiles").select("must_change_password,is_active").eq("id", user.id).maybeSingle();
  if (profile?.is_active === false) redirect("/access-denied?reason=disabled");
  if (!recovery && profile && !profile.must_change_password) redirect(destination);
  return <main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-md">
    <h1 className="text-3xl font-bold">{recovery ? "Choose a new password" : "Secure your account"}</h1>
    <p className="mt-2 text-sm text-slate-500">{recovery ? "Reset your password, then sign in again." : "Replace your temporary password before using SchoolDB."}</p>
    <p id="password-policy" className="mt-2 text-sm text-slate-500">Use at least 12 characters, including uppercase and lowercase letters, a number and a symbol.</p>
    <Card className="mt-6"><CardContent><form action={changeFirstLoginPassword} className="space-y-5">
      <input type="hidden" name="next" value={destination}/><input type="hidden" name="recovery" value={recovery ? "1" : "0"}/>
      {query.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{query.error}</p> : null}
      <div><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" minLength={12} autoComplete="new-password" aria-describedby="password-policy" required/></div>
      <div><Label htmlFor="confirm">Confirm new password</Label><Input id="confirm" name="confirm" type="password" minLength={12} autoComplete="new-password" required/></div>
      <Button className="w-full">Save new password</Button>
    </form></CardContent></Card>
    <Link href="/forgot-password" className="mt-5 block text-center text-sm font-medium text-blue-700">Request a new verification code</Link>
  </div></main>;
}
