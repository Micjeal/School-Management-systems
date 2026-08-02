import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "../actions";
export default async function ForgotPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) { const p=await searchParams; return <><h1 className="text-3xl font-bold">Reset password</h1><p className="mt-2 text-sm text-slate-500">We will email a time-limited recovery link.</p><Card className="mt-6"><CardContent><form action={forgotPasswordAction} className="space-y-5">{p.error?<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{p.error}</p>:null}{p.message?<p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{p.message}</p>:null}<div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required/></div><Button className="w-full">Send recovery link</Button></form></CardContent></Card><Link href="/login" className="mt-5 block text-center text-sm font-medium text-blue-700">Return to sign in</Link></>; }
