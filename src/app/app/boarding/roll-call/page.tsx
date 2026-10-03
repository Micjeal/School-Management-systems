import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select, Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { saveBoardingRollCall } from "../actions";

export default async function RollCallPage({ searchParams }: { searchParams: Promise<{ hostel_id?: string; error?: string; message?: string }> }) {
  const c = await requireUserContext("boarding.manage"); if (!c.active_school_id) redirect("/app?error=Select+a+school"); const s = await createClient(); const q = await searchParams;
  const { data: hostels } = await s.from("hostels").select("id,name").eq("school_id", c.active_school_id).eq("status", "active").order("name");
  const { data: assignments } = q.hostel_id ? await (s.from("boarding_assignments") as any).select("student_id,students(admission_number,people(first_name,last_name)),boarding_beds!inner(hostel_rooms!inner(hostel_id))").eq("school_id", c.active_school_id).eq("status", "active").eq("boarding_beds.hostel_rooms.hostel_id", q.hostel_id) : { data: [] };
  const ids = (assignments ?? []).map((a: any) => a.student_id);
  return <div><PageHeader title="Boarding roll call" description="Only active students assigned to the selected hostel are loaded." />
    {q.error ? <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{q.error}</p> : null}{q.message ? <p className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{q.message}</p> : null}
    <Card><CardContent><form method="GET" className="mb-6 flex gap-3"><Select name="hostel_id" defaultValue={q.hostel_id ?? ""} required><option value="">Select hostel</option>{(hostels ?? []).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</Select><Button>Load</Button></form>
    {q.hostel_id ? <form action={saveBoardingRollCall} className="space-y-3"><input type="hidden" name="hostel_id" value={q.hostel_id}/><input type="hidden" name="student_ids" value={ids.join(",")}/><div className="grid gap-3 sm:grid-cols-2"><div><Label>Date</Label><Input name="session_date" type="date" defaultValue={new Date().toISOString().slice(0,10)} required/></div><div><Label>Session</Label><Select name="session_type" defaultValue="evening"><option>morning</option><option>evening</option><option>night</option></Select></div></div>{(assignments ?? []).map((a: any) => <div key={a.student_id} className="flex items-center justify-between rounded-xl border p-3"><span>{a.students?.admission_number} — {a.students?.people?.first_name} {a.students?.people?.last_name}</span><Select name={`att_${a.student_id}`} defaultValue="present" className="w-36"><option>present</option><option>absent</option><option>leave</option><option>sick</option></Select></div>)}{ids.length ? <Button>Save roll call</Button> : <p className="text-sm text-slate-500">No active students are assigned to this hostel.</p>}</form> : null}</CardContent></Card></div>;
}
