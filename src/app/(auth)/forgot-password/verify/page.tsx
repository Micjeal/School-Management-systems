import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resendRecoveryOtpAction, verifyRecoveryOtpAction } from "../../actions";

export default async function VerifyRecoveryPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams;
  return <main className="mx-auto max-w-md p-6"><h1 className="text-3xl font-bold">Verify Your Email</h1><p className="mt-2 text-sm text-slate-500">Enter the six-digit code from your email.</p><Card className="mt-6"><CardContent><form action={verifyRecoveryOtpAction} className="space-y-5">{p.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{p.error}</p> : null}{p.message ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{p.message}</p> : null}<div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div><Label htmlFor="token">Verification code</Label><Input id="token" name="token" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required /></div><Button className="w-full">Verify code</Button><Button type="submit" formAction={resendRecoveryOtpAction} variant="outline" className="w-full">Resend code</Button></form></CardContent></Card><Link href="/forgot-password" className="mt-5 block text-center text-sm font-medium text-blue-700">Back</Link></main>;
}
