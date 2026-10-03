"use client";
import { useActionState } from "react";
import { inviteUserInteractive, type InviteState } from "@/app/app/platform/users/actions";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const initial: InviteState = { status: "idle" };
export function PlatformInviteForm({ schoolId, roles, canAssignPlatformRole }: { schoolId: string; roles: { code: string; name: string }[]; canAssignPlatformRole: boolean }) {
  const [state, action, pending] = useActionState(inviteUserInteractive, initial);
  return <form action={action} className="space-y-5"><input type="hidden" name="school_id" value={schoolId}/><div><Label htmlFor="invite_email">Email address</Label><Input id="invite_email" name="email" type="email" required/></div><p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">A high-entropy temporary password is generated inside the trusted function.</p><div><Label htmlFor="invite_role">School role</Label><Select id="invite_role" name="role_code" required><option value="">Select role</option>{roles.map(role=><option key={role.code} value={role.code}>{role.name}</option>)}</Select></div>{canAssignPlatformRole?<div><Label htmlFor="invite_platform_role">Platform role</Label><Select id="invite_platform_role" name="platform_role"><option value="">None</option><option value="platform_admin">Platform administrator</option></Select></div>:null}<Button className="w-full" disabled={pending||!roles.length}>{pending?"Creating…":"Create account"}</Button>{state.message?<p className={state.status==="error"?"text-sm text-red-700":"text-sm text-emerald-700"}>{state.message}</p>:null}{state.temporaryPassword?<div className="rounded-xl border border-amber-300 bg-amber-50 p-3"><p className="text-xs font-semibold uppercase text-amber-800">Temporary password — shown once</p><code className="mt-1 block break-all">{state.temporaryPassword}</code></div>:null}</form>;
}
