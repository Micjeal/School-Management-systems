import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RefundsPage() {
  const context = await requireUserContext("finance.refund");
  const supabase = await createClient();
  
  const { data: refunds } = await (supabase.from("refunds") as any)
    .select("id,refund_reference,amount,reason,status,requested_at,requested_by,profiles(first_name,last_name),payments(payment_reference)")
    .eq("school_id", context.active_school_id)
    .order("requested_at", { ascending: false });
    
  if (!refunds || refunds.length === 0) {
    return (
      <div>
        <PageHeader 
          title="Refunds" 
          description="Manage refund requests and processing"
          actionHref="/app/finance/payments"
          actionLabel="Request Refund"
        />
        <div className="mt-6 text-center py-12 text-slate-500">
          No refund requests yet. Go to payments to request a refund.
        </div>
      </div>
    );
  }

  const columns = ["refund_reference", "amount", "reason", "status", "requested_at"];
  const rows = refunds.map((refund: any) => ({
    ...refund,
    requested_at: new Date(refund.requested_at).toLocaleDateString(),
    __recordKey: refund.id,
  }));

  return (
    <div>
      <PageHeader 
        title="Refunds" 
        description="Manage refund requests and processing"
        actionHref="/app/finance/payments"
        actionLabel="Request Refund"
      />
      <DataTable 
        rows={rows} 
        columns={columns} 
        detailBase="/app/finance/refunds"
      />
    </div>
  );
}
