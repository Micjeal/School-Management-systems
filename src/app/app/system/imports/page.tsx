import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ImportsPage() {
  const context = await requireUserContext("settings.manage");
  const supabase = await createClient();
  
  const { data: batches } = await (supabase.from("import_batches") as any)
    .select("id,import_type,status,created_at,started_at,completed_at,processed_rows,success_rows,failed_rows")
    .eq("school_id", context.active_school_id)
    .order("created_at", { ascending: false });
    
  if (!batches || batches.length === 0) {
    return (
      <div>
        <PageHeader 
          title="Data Imports" 
          description="Import students, employees, inventory items, and suppliers from CSV/XLSX"
          actionHref="/app/system/imports/new"
          actionLabel="New Import"
        />
        <div className="mt-6 text-center py-12 text-slate-500">
          No import batches yet. Start your first import to get started.
        </div>
      </div>
    );
  }

  const columns = ["import_type", "status", "processed_rows", "success_rows", "failed_rows", "created_at"];
  const rows = batches.map((batch: any) => ({
    ...batch,
    created_at: new Date(batch.created_at).toLocaleDateString(),
    __recordKey: batch.id,
  }));

  return (
    <div>
      <PageHeader 
        title="Data Imports" 
        description="Import students, employees, inventory items, and suppliers from CSV/XLSX"
        actionHref="/app/system/imports/new"
        actionLabel="New Import"
      />
      <DataTable 
        rows={rows} 
        columns={columns} 
        detailBase="/app/system/imports"
      />
    </div>
  );
}
