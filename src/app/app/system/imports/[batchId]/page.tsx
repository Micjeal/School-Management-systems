import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { processImportBatch } from "../actions";

export default async function ImportBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const context = await requireUserContext("settings.manage");
  const supabase = await createClient();
  
  const { data: batch } = await (supabase.from("import_batches") as any)
    .eq("id", batchId)
    .eq("school_id", context.active_school_id)
    .single();
    
  if (!batch) notFound();

  const { data: rows } = await (supabase.from("import_rows") as any)
    .select("*")
    .eq("import_batch_id", batchId)
    .order("row_number");

  return (
    <div>
      <PageHeader 
        title={`Import ${batch.import_type}`}
        description={`Batch created ${new Date(batch.created_at).toLocaleString()}`}
        backHref="/app/system/imports"
      />
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Status</h2>
            <Badge>{batch.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Rows</p>
              <p className="text-sm text-slate-900">{batch.processed_rows || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Success</p>
              <p className="text-sm text-slate-900">{batch.success_rows || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Failed</p>
              <p className="text-sm text-slate-900">{batch.failed_rows || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="text-sm text-slate-900">{batch.completed_at ? new Date(batch.completed_at).toLocaleString() : "Not completed"}</p>
            </div>
          </div>
          {batch.error_summary && (
            <div>
              <p className="text-sm font-medium text-slate-500">Error Summary</p>
              <p className="text-sm text-slate-900">{batch.error_summary}</p>
            </div>
          )}
          {batch.status === "uploaded" || batch.status === "ready" || batch.status === "failed" || batch.status === "completed_with_errors" ? (
            <form action={processImportBatch}>
              <input type="hidden" name="batch_id" value={batchId} />
              <Button className="bg-blue-600 hover:bg-blue-700">Process Import</Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Import Rows</h2>
        </CardHeader>
        <CardContent>
          {rows && rows.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {rows.map((row: any) => (
                <div key={row.id} className="flex justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Row {row.row_number}</p>
                    <p className="text-sm text-slate-500">{row.status}</p>
                  </div>
                  {row.errors && row.errors.length > 0 && (
                    <div className="text-sm text-red-600">
                      {row.errors.map((e: any, i: number) => (
                        <p key={i}>{e.message}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No rows yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
