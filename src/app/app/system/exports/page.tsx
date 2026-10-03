import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { cancelExportAction, requestExportAction } from "./actions";

const EXPORT_TYPES = ["students", "invoices", "payments", "attendance", "results", "library", "inventory"] as const;

export default async function ExportsPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const context = await requireUserContext("reports.export");
  const query = await searchParams;
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("export_jobs")
    .select("id,export_type,format,status,row_count,created_at,completed_at")
    .eq("school_id", context.active_school_id ?? "")
    .order("created_at", { ascending: false })
    .limit(50);

  return <div>
    <PageHeader title="Exports" description="Request authorized CSV exports and track your jobs." />
    {query.message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{query.message}</p> : null}
    {query.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{query.error}</p> : null}
    <form action={requestExportAction} className="mb-6 flex max-w-xl items-end gap-3 rounded-xl border bg-white p-4">
      <label className="flex-1 text-sm font-medium text-slate-700">Export type
        <select name="export_type" required className="mt-1 block h-10 w-full rounded-md border px-3">
          {EXPORT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          <option value="employees" disabled>employees (disabled pending hardened worker deployment)</option>
        </select>
      </label>
      <Button type="submit">Queue CSV</Button>
    </form>
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>{["Type","Format","Status","Rows","Created","Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
      <tbody>{(jobs ?? []).map((job) => <tr key={job.id} className="border-b last:border-0">
        <td className="px-4 py-3">{job.export_type}</td><td className="px-4 py-3">{job.format}</td><td className="px-4 py-3">{job.status}</td><td className="px-4 py-3">{job.row_count ?? "—"}</td><td className="px-4 py-3">{new Date(job.created_at).toLocaleString()}</td>
        <td className="px-4 py-3">{job.status === "queued" ? <form action={cancelExportAction}><input type="hidden" name="job_id" value={job.id}/><Button type="submit" variant="outline" size="sm">Cancel</Button></form> : "—"}</td>
      </tr>)}</tbody></table>
    </div>
  </div>;
}
