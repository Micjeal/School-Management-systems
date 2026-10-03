"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { createStudent, linkExistingStudentPortalAccess, retryStudentPortalAccess, type StudentCreateState } from "@/app/app/students/actions";

type Row = { id: string; name: string };
const initialState: StudentCreateState = { status: "idle" };

export function StudentCreateForm({ campuses, years, terms, sections }: { campuses: Row[]; years: Row[]; terms: Row[]; sections: Row[] }) {
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [state, formAction, pending] = useActionState(createStudent, initialState);
  const [retryState, retryAction, retryPending] = useActionState(retryStudentPortalAccess, initialState);
  const [linkState, linkAction, linkPending] = useActionState(linkExistingStudentPortalAccess, initialState);
  const result = linkState.status !== "idle" ? linkState : retryState.status !== "idle" ? retryState : state;
  const copy = async (value: string) => { await navigator.clipboard?.writeText(value); };

  if (result.status === "portal-success") return <Card><CardHeader><h2 className="font-semibold">Student created successfully</h2></CardHeader><CardContent className="space-y-4"><p className="text-emerald-700">Portal access enabled</p><p><span className="font-semibold">Login email:</span> {result.loginEmail}</p><p><span className="font-semibold">Temporary password:</span> <code className="ml-1 break-all rounded bg-amber-50 px-2 py-1">{result.temporaryPassword}</code></p><p className="text-sm text-amber-800">Save this temporary password now. It will not be shown again.</p><div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" onClick={() => result.loginEmail && copy(result.loginEmail)}>Copy email</Button><Button type="button" variant="secondary" onClick={() => result.temporaryPassword && copy(result.temporaryPassword)}>Copy temporary password</Button><Button asChild><Link href={`/app/students/${result.studentId}`}>Open student</Link></Button></div></CardContent></Card>;

  if (result.status === "portal-failure") return <Card><CardHeader><h2 className="font-semibold">Student created successfully</h2></CardHeader><CardContent className="space-y-4"><p className="text-amber-800">Student created successfully, but portal access could not be enabled.</p><p className="text-sm text-red-700">{result.message}</p><form action={retryAction} className="space-y-3"><input type="hidden" name="student_id" value={result.studentId} /><input type="hidden" name="person_id" value={result.personId} /><input type="hidden" name="login_email" value={result.loginEmail} /><Button disabled={retryPending}>{retryPending ? "Retrying…" : "Retry portal access"}</Button></form><Button asChild variant="secondary"><Link href={`/app/students/${result.studentId}`}>Open student</Link></Button></CardContent></Card>;

  if (result.status === "existing-account") return <Card><CardHeader><h2 className="font-semibold">Student created successfully</h2></CardHeader><CardContent className="space-y-4"><p className="text-amber-800">An account already exists for this email address.</p><p className="text-sm text-slate-600">No account has been attached to this student. Linking requires explicit confirmation.</p>{result.message && result.message !== "An account already exists for this email address." ? <p className="text-sm text-red-700">{result.message}</p> : null}{result.canLink ? <form action={linkAction}><input type="hidden" name="student_id" value={result.studentId} /><input type="hidden" name="person_id" value={result.personId} /><input type="hidden" name="login_email" value={result.loginEmail} /><Button disabled={linkPending}>{linkPending ? "Linking..." : "Link existing account"}</Button></form> : <p className="text-sm text-red-700">This account cannot be linked to this student.</p>}<Button asChild variant="secondary"><Link href={`/app/students/${result.studentId}`}>Open student</Link></Button></CardContent></Card>;

  return <form action={formAction} className="space-y-6">
    {result.status === "error" ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{result.message}</p> : null}
    <Card><CardHeader><h2 className="font-semibold">Personal information</h2></CardHeader><CardContent className="grid gap-5 md:grid-cols-3"><F n="first_name" l="First name" /><F n="middle_name" l="Middle name" optional /><F n="last_name" l="Last name" /><D n="date_of_birth" l="Date of birth" /><div><Label>Gender</Label><Select name="gender"><option value="">Select</option><option>female</option><option>male</option><option>other</option><option>prefer_not_to_say</option></Select></div><F n="nationality_code" l="Nationality code" d="UG" optional /><F n="primary_email" l="Email" type="email" optional /><F n="primary_phone" l="Phone" optional /></CardContent></Card>
    <Card><CardHeader><h2 className="font-semibold">Admission and optional enrolment</h2></CardHeader><CardContent className="grid gap-5 md:grid-cols-3"><F n="admission_number" l="Admission number" /><F n="student_number" l="Student number" optional /><D n="admission_date" l="Admission date" /><div><Label>Boarding status</Label><Select name="boarding_status" defaultValue="day"><option>day</option><option>boarding</option><option>weekly_boarding</option></Select></div><Sel n="current_campus_id" l="Campus" rows={campuses} /><Sel n="academic_year_id" l="Academic year" rows={years} /><Sel n="term_id" l="Term" rows={terms} /><Sel n="class_section_id" l="Class section" rows={sections} /><F n="roll_number" l="Roll number" optional /></CardContent></Card>
    <Card><CardHeader><h2 className="font-semibold">Portal Access</h2></CardHeader><CardContent className="space-y-4"><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="enable_portal_access" checked={portalEnabled} onChange={(event) => setPortalEnabled(event.target.checked)} /> Enable student portal access</label>{portalEnabled ? <div><Label htmlFor="login_email">Login email *</Label><Input id="login_email" name="login_email" type="email" required /><p className="mt-1 text-sm text-slate-500">A temporary password will be generated. The student must change it on first login.</p></div> : null}</CardContent></Card>
    <div className="flex justify-end"><Button disabled={pending}>{pending ? "Admitting…" : "Admit student"}</Button></div>
  </form>;
}

function F({ n, l, d, type = "text", optional = false }: { n: string; l: string; d?: string; type?: string; optional?: boolean }) { return <div><Label>{l}{optional ? "" : " *"}</Label><Input name={n} type={type} defaultValue={d} required={!optional} /></div>; }
function D({ n, l }: { n: string; l: string }) { return <div><Label>{l}</Label><Input name={n} type="date" /></div>; }
function Sel({ n, l, rows }: { n: string; l: string; rows: Row[] }) { return <div><Label>{l}</Label><Select name={n}><option value="">Select…</option>{rows.map((row) => <option value={row.id} key={row.id}>{row.name}</option>)}</Select></div>; }
