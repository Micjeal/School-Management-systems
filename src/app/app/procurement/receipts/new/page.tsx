import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createGoodsReceipt } from "@/app/app/procurement/actions";
import { redirect } from "next/navigation";

export default async function NewGoodsReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;
  const context = await requireUserContext("inventory.manage");
  const supabase = await createClient();
  
  const [{ data: locations }, { data: order }] = await Promise.all([
    (supabase.from("inventory_locations") as any)
      .select("id,name")
      .eq("school_id", context.active_school_id)
      .eq("status", "active")
      .order("name"),
    order_id ? (supabase.from("purchase_orders") as any)
      .select("id,purchase_order_number,suppliers(name),purchase_order_items(*,inventory_items(code,name))")
      .eq("id", order_id)
      .eq("school_id", context.active_school_id)
      .single() : Promise.resolve({ data: null })
  ]);

  if (order_id && !order) {
    redirect("/app/procurement?error=Order not found");
  }

  return (
    <div>
      <PageHeader 
        title="New Goods Receipt" 
        description="Record receipt of items against a purchase order"
        backHref="/app/procurement"
      />
      <Card>
        <CardContent>
          <form action={createGoodsReceipt} className="grid gap-5 md:grid-cols-3">
            <div>
              <Label>Purchase Order</Label>
              <Select name="purchase_order_id" required defaultValue={order_id || ""}>
                <option value="">Select order</option>
                {order && <option value={order.id}>{order.purchase_order_number} - {order.suppliers?.name}</option>}
              </Select>
            </div>
            <div>
              <Label>Receipt Number</Label>
              <Input name="goods_receipt_number" placeholder="Auto-generated if blank" />
            </div>
            <div>
              <Label>Delivery Note</Label>
              <Input name="delivery_note_number" placeholder="Supplier delivery note number" />
            </div>
            <div>
              <Label>Storage Location</Label>
              <Select name="inventory_location_id" required>
                <option value="">Select location</option>
                {(locations ?? []).map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Received Date</Label>
              <Input name="received_at" type="date" defaultValue={new Date().toISOString().slice(0,10)} required />
            </div>
            <div className="md:col-span-3">
              <Label>Notes</Label>
              <Textarea name="notes" placeholder="Any notes about the receipt..." />
            </div>
            {order && order.purchase_order_items && (
              <div className="md:col-span-3 border-t pt-4">
                <h3 className="font-semibold mb-3">Receipt Items</h3>
                <div className="space-y-3">
                  {order.purchase_order_items.map((item: any, index: number) => {
                    const remaining = item.quantity - (item.received_quantity || 0);
                    if (remaining <= 0) return null;
                    return (
                      <div key={item.id} className="grid gap-3 md:grid-cols-6 items-end rounded-lg border p-3">
                        <div className="md:col-span-2">
                          <p className="font-medium text-sm">{item.inventory_items?.name}</p>
                          <p className="text-xs text-slate-500">{item.inventory_items?.code}</p>
                          <p className="text-xs text-slate-500">Remaining: {remaining}</p>
                        </div>
                        <input type="hidden" name={`item_${index}_id`} value={item.id} />
                        <input type="hidden" name={`item_${index}_inventory_id`} value={item.inventory_item_id} />
                        <div>
                          <Label className="text-xs">Qty Received</Label>
                          <Input name={`item_${index}_quantity`} type="number" min="0" max={remaining} step="1" required />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Cost</Label>
                          <Input name={`item_${index}_cost`} type="number" min="0" step="0.01" defaultValue={item.unit_price} />
                        </div>
                        <div>
                          <Label className="text-xs">Condition</Label>
                          <Select name={`item_${index}_condition`} defaultValue="accepted">
                            <option value="accepted">Accepted</option>
                            <option value="partial">Partial</option>
                            <option value="rejected">Rejected</option>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Reason</Label>
                          <Input name={`item_${index}_reason`} placeholder="If rejected..." />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="md:col-span-3 flex justify-end gap-3">
              <Button variant="secondary" name="post_now" value="false">Save Draft</Button>
              <Button name="post_now" value="true">Post Receipt</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
