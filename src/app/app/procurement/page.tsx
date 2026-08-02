import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";

export default async function ProcurementPage() {
  const context = await requireUserContext("inventory.manage");
  const supabase = await createClient();
  
  const { data: orders } = await (supabase.from("purchase_orders") as any)
    .select("id,purchase_order_number,supplier_id,suppliers(name),order_date,total_amount,status")
    .eq("school_id", context.active_school_id)
    .order("order_date", { ascending: false });
    
  if (!orders || orders.length === 0) {
    return (
      <div>
        <PageHeader 
          title="Procurement" 
          description="Manage purchase orders and goods receipts"
          actionHref="/app/procurement/orders/new"
          actionLabel="New Purchase Order"
        />
        <div className="mt-6 text-center py-12 text-slate-500">
          No purchase orders yet. Create your first order to get started.
        </div>
      </div>
    );
  }

  const columns = ["purchase_order_number", "suppliers", "order_date", "total_amount", "status"];
  const rows = orders.map((order: any) => ({
    ...order,
    suppliers: order.suppliers?.name || "Unknown",
    __recordKey: order.id,
  }));

  return (
    <div>
      <PageHeader 
        title="Procurement" 
        description="Manage purchase orders and goods receipts"
        actionHref="/app/procurement/orders/new"
        actionLabel="New Purchase Order"
      />
      <DataTable 
        rows={rows} 
        columns={columns} 
        detailBase="/app/procurement/orders"
      />
    </div>
  );
}
