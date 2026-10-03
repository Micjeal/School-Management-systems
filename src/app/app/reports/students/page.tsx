import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
export default async function StudentReport(){const c=await requireUserContext("reports.read");await requireUserContext("students.read");if(!c.active_school_id)redirect("/app?error=Select+a+school");const s=await createClient();const {count}=await s.from("students").select("id",{count:"exact",head:true}).eq("school_id",c.active_school_id);return <div><PageHeader title="Student register report" description="Hardcoded report: active-school student count." backHref="/app/reports"/><Card><CardContent><p className="text-3xl font-bold">{count??0}</p><p className="text-sm text-slate-500">Students in the active school</p></CardContent></Card></div>}
