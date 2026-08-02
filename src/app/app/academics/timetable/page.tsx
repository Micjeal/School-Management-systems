import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TimetablePage() {
  const context = await requireUserContext("academics.manage");
  const supabase = await createClient();
  
  const { data: versions } = await (supabase.from("timetable_versions") as any)
    .select("id,name,status,academic_year_id,term_id,academic_years(name),terms(name),published_at")
    .eq("school_id", context.active_school_id)
    .order("created_at", { ascending: false });
    
  if (!versions || versions.length === 0) {
    return (
      <div>
        <PageHeader 
          title="Timetable" 
          description="Manage class schedules with conflict detection"
          actionHref="/app/academics/timetable/new"
          actionLabel="Create Timetable Version"
        />
        <div className="mt-6 text-center py-12 text-slate-500">
          No timetable versions yet. Create your first timetable to get started.
        </div>
      </div>
    );
  }

  const columns = ["name", "academic_years", "terms", "status", "published_at"];
  const rows = versions.map((version: any) => ({
    ...version,
    academic_years: version.academic_years?.name || "Unknown",
    terms: version.terms?.name || "All year",
    published_at: version.published_at ? new Date(version.published_at).toLocaleDateString() : "Not published",
    __recordKey: version.id,
  }));

  return (
    <div>
      <PageHeader 
        title="Timetable" 
        description="Manage class schedules with conflict detection"
        actionHref="/app/academics/timetable/new"
        actionLabel="Create Timetable Version"
      />
      <DataTable 
        rows={rows} 
        columns={columns} 
        detailBase="/app/academics/timetable"
      />
    </div>
  );
}
