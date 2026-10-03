"use client";

import { useActionState } from "react";
import { enableSystemAccess, linkExistingSystemAccess, type ProvisionState } from "@/app/app/account-access/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const initialState: ProvisionState = { status: "idle" };

export function EnableSystemAccess({ recordType, recordId, personId, email, roles, label = "Enable system access" }: { recordType: "student" | "employee" | "guardian"; recordId: string; personId: string; email?: string | null; roles: { code: string; name: string }[]; label?: string }) {
  const [state, action, pending] = useActionState(enableSystemAccess, initialState);
  const [linkState, linkAction, linkPending] = useActionState(linkExistingSystemAccess, initialState);
  const result = linkState.status !== "idle" ? linkState : state;
  const roleCode = roles[0]?.code ?? "";
  return <form action={action} className="space-y-4">
    <input type="hidden" name="record_type" value={recordType}/><input type="hidden" name="record_id" value={recordId}/><input type="hidden" name="person_id" value={personId}/>
    <div><Label htmlFor={`${recordType}-access-email`}>Login email</Label><Input id={`${recordType}-access-email`} name="email" type="email" defaultValue={email ?? ""} required/></div>
    <div><Label htmlFor={`${recordType}-access-role`}>School role</Label><Select id={`${recordType}-access-role`} name="role_code" required defaultValue={roleCode}>{roles.map(role=><option key={role.code} value={role.code}>{role.name}</option>)}</Select></div>
    <Button disabled={pending || !roles.length}>{pending ? "Provisioning..." : label}</Button>
    {result.status === "existing-account" ? <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3"><p className="text-sm text-amber-900">An account already exists for this email address.</p>{result.canLink ? <Button disabled={linkPending} formAction={linkAction} type="submit" variant="secondary">{linkPending ? "Linking..." : "Link existing account"}</Button> : <p className="text-sm text-red-700">This account cannot be linked to this person.</p>}</div> : null}
    {result.message && result.status !== "existing-account" ? <p className={result.status === "error" ? "text-sm text-red-700" : "text-sm text-emerald-700"}>{result.message}</p> : null}
    {result.temporaryPassword ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-3"><p className="text-xs font-semibold uppercase text-amber-800">Temporary password - shown once</p><code className="mt-1 block break-all text-sm">{result.temporaryPassword}</code><p className="mt-1 text-xs text-amber-700">Share it securely. It is not stored by SchoolDB.</p></div> : null}
  </form>;
}
