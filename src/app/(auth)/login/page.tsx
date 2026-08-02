import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  return <><div className="mb-8 lg:hidden"><p className="text-2xl font-black">SchoolDB</p></div><h1 className="text-3xl font-bold tracking-tight">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in to your authorized school workspace.</p><Card className="mt-6"><CardContent><form action={loginAction} className="space-y-5"><input type="hidden" name="next" value={params.next ?? ""}/>{params.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}<div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required/></div><div><div className="flex justify-between"><Label htmlFor="password">Password</Label><Link href="/forgot-password" className="text-sm font-medium text-blue-700 hover:underline">Forgot password?</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" required/></div><Button className="w-full" type="submit">Sign in securely</Button></form></CardContent></Card><p className="mt-5 text-center text-xs text-slate-500">Accounts are created by a platform or school administrator.</p></>;
}
