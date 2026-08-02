import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setPurchaseOrderStatus } from "@/app/app/procurement/actions";
import Link from "next/link";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const context = await requireUserContext("inventory.manage");
  const supabase = await createClient();
  
  const { data: order } = await (supabase.from("purchase_orders") as any)
    .select("*,suppliers(name),purchase_order_items(*,inventory_items(code,name))")
    .eq("id", orderId)
    .eq("school_id", context.active_school_id)
    .single();
    
  if (!order) notFound();

  const { data: receipts } = await (supabase.from("goods_receipts") as any)
    .select("id,goods_receipt_number,received_at,status")
    .eq("purchase_order_id", orderId)
    .order("received_at", { ascending: false });

  return (
    <div>
      <PageHeader 
        title={`Order ${order.purchase_order_number}`}
        description={order.suppliers?.name || "Unknown supplier"}
        backHref="/app/procurement"
      />
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Order Details</h2>
            <Badge>{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Order Date</p>
              <p className="text-sm text-slate-900">{new Date(order.order_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Expected Delivery</p>
              <p className="text-sm text-slate-900">{order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Amount</p>
              <p className="text-sm text-slate-900">{order.currency_code} {Number(order.total_amount).toFixed(2)}</p>
            </div>
          </div>
          {order.notes && (
            <div>
              <p className="text-sm font-medium text-slate-500">Notes</p>
              <p className="text-sm text-slate-900">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold">Line Items</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.purchase_order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{item.inventory_items?.name || "Unknown item"}</p>
                  <p className="text-sm text-slate-500">{item.inventory_items?.code || item.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.quantity} × {Number(item.unit_price).toFixed(2)}</p>
                  <p className="text-sm text-slate-500">Received: {item.received_quantity || 0}/{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Goods Receipts</h2>
            <Link href={`/app/procurement/receipts/new?order_id=${orderId}`}>
              <Button size="sm">Create Receipt</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {receipts && receipts.length > 0 ? (
            <div className="space-y-2">
              {receipts.map((receipt: any) => (
                <Link 
                  key={receipt.id} 
                  href={`/app/procurement/receipts/${receipt.id}`}
                  className="flex justify-between rounded-lg border p-3 hover:bg-slate-50"
                >
                  <span className="font-medium">{receipt.goods_receipt_number}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{new Date(receipt.received_at).toLocaleDateString()}</span>
                    <Badge>{receipt.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No goods receipts yet</p>
          )}
        </CardContent>
      </Card>

      {order.status === "draft" && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Actions</h2>
          </CardHeader>
          <CardContent>
            <form action={setPurchaseOrderStatus} className="flex gap-3">
              <input type="hidden" name="order_id" value={orderId} />
              <Button type="submit" name="status" value="approved" className="bg-emerald-600 hover:bg-emerald-700">
                Approve Order
              </Button>
              <Button type="submit" name="status" value="cancelled" variant="danger">
                Cancel Order
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
