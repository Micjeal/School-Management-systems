import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPurchaseOrder } from "@/app/app/procurement/actions";

export default async function NewPurchaseOrderPage() {
  const context = await requireUserContext("inventory.manage");
  const supabase = await createClient();
  
  const [{ data: suppliers }, { data: items }] = await Promise.all([
    (supabase.from("suppliers") as any)
      .select("id,name")
      .eq("school_id", context.active_school_id)
      .eq("status", "active")
      .order("name"),
    (supabase.from("inventory_items") as any)
      .select("id,code,name,standard_cost")
      .eq("school_id", context.active_school_id)
      .eq("status", "active")
      .order("code")
  ]);

  return (
    <div>
      <PageHeader 
        title="New Purchase Order" 
        description="Create a purchase order with line items"
        backHref="/app/procurement"
      />
      <Card>
        <CardContent>
          <form action={createPurchaseOrder} className="grid gap-5 md:grid-cols-3">
            <div>
              <Label>Supplier</Label>
              <Select name="supplier_id" required>
                <option value="">Select supplier</option>
                {(suppliers ?? []).map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Order Date</Label>
              <Input name="order_date" type="date" defaultValue={new Date().toISOString().slice(0,10)} required />
            </div>
            <div>
              <Label>Expected Delivery</Label>
              <Input name="expected_delivery_date" type="date" />
            </div>
            <div>
              <Label>Currency</Label>
              <Select name="currency_code" defaultValue="UGX">
                <option value="UGX">UGX</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label>Notes</Label>
              <Textarea name="notes" placeholder="Any additional notes..." />
            </div>
            <div className="md:col-span-3 border-t pt-4">
              <h3 className="font-semibold mb-3">Line Items</h3>
              <div id="line-items" className="space-y-3">
                <div className="grid gap-3 md:grid-cols-5 items-end">
                  <div>
                    <Label>Item</Label>
                    <Select name="item_0" required>
                      <option value="">Select item</option>
                      {(items ?? []).map((i: any) => (
                        <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input name="quantity_0" type="number" min="1" step="1" required />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input name="unit_price_0" type="number" min="0" step="0.01" required />
                  </div>
                  <div>
                    <Label>Tax</Label>
                    <Input name="tax_0" type="number" min="0" step="0.01" defaultValue="0" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input name="description_0" placeholder="Optional" />
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3">
              <Button variant="secondary" name="post_now" value="false">Save Draft</Button>
              <Button name="post_now" value="true">Submit Order</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
