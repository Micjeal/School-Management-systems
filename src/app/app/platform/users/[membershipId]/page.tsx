import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MembershipPage({ params }: { params: Promise<{ membershipId: string }> }) {
  const c = await requireUserContext("users.read"); const s = await createClient(); const { membershipId } = await params;
  let query = (s.from("school_memberships") as any).select("id,school_id,status,joined_at,profiles:user_id(display_name,first_name,last_name,is_active),schools(name,code),campuses(name,code),membership_roles(roles(code,name))").eq("id", membershipId);
  if (!c.is_platform_admin) query = query.eq("school_id", c.active_school_id);
  const { data: member } = await query.maybeSingle(); if (!member) notFound();
  const profile = member.profiles; const roles = (member.membership_roles ?? []).map((r: any) => r.roles).filter(Boolean);
  return <div><PageHeader title={profile?.display_name || `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "School member"} description="Safe school membership details; authentication metadata is not queried." backHref="/app/platform/users" />
    <Card><CardContent><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs uppercase text-slate-500">School</dt><dd>{member.schools?.name} ({member.schools?.code})</dd></div><div><dt className="text-xs uppercase text-slate-500">Campus</dt><dd>{member.campuses?.name ?? "All campuses"}</dd></div><div><dt className="text-xs uppercase text-slate-500">Status</dt><dd><Badge>{member.status}</Badge></dd></div><div><dt className="text-xs uppercase text-slate-500">Joined</dt><dd>{new Date(member.joined_at).toLocaleDateString()}</dd></div><div className="sm:col-span-2"><dt className="text-xs uppercase text-slate-500">Roles</dt><dd>{roles.map((r:any)=>r.name).join(", ") || "No roles"}</dd></div></dl><div className="mt-6"><Button asChild><Link href={`/app/platform/users/${membershipId}/roles`}>Edit access roles</Link></Button></div></CardContent></Card></div>;
}
