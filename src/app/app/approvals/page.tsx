import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default async function ApprovalsPage() {
  const context = await requireUserContext();
  const supabase = await createClient();
  
  const { data: approvals } = await supabase.rpc("get_my_pending_approvals" as any) as any;
  
  if (!approvals || approvals.length === 0) {
    return (
      <div>
        <PageHeader title="Approvals" description="Review and act on pending approval requests" />
        <EmptyState title="No pending approvals" description="You have no approval requests waiting for your action." />
      </div>
    );
  }

  const columns = [
    "request_type",
    "entity_name", 
    "amount",
    "requested_by",
    "requested_at",
    "current_step",
  ];

  const rows = approvals.map((approval: any) => ({
    ...approval,
    __recordKey: approval.approval_request_id,
  }));

  return (
    <div>
      <PageHeader title="Approvals" description="Review and act on pending approval requests" />
      <DataTable 
        rows={rows} 
        columns={columns} 
        detailBase="/app/approvals"
      />
    </div>
  );
}
