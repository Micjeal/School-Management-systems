import { notFound, redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function InventoryItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const c = await requireUserContext("inventory.manage"); if (!c.active_school_id) redirect("/app?error=Select+a+school"); const s = await createClient(); const { itemId } = await params;
  const item = await requireSchoolRecord(s, "inventory_items", itemId, c.active_school_id, "id,code,name,category,unit_of_measure,reorder_level,status").catch(() => null);
  if (!item) notFound();
  const { data: balances } = await s.from("inventory_stock_balances").select("quantity_on_hand,quantity_reserved,average_cost,inventory_locations(code,name)").eq("school_id", c.active_school_id).eq("inventory_item_id", itemId);
  return <div><PageHeader title={`${item.code} — ${item.name}`} description={`${item.category ?? "Uncategorised"} · ${item.unit_of_measure} · ${item.status}`} backHref="/app/inventory/items" />
    <Card><CardHeader><h2 className="font-semibold">School stock balances</h2></CardHeader><CardContent><div className="space-y-3">{(balances ?? []).map((b, i) => <div key={i} className="flex justify-between rounded-xl border p-3"><span>{b.inventory_locations?.name ?? "Location"}</span><span>{b.quantity_on_hand} on hand · {b.quantity_reserved} reserved</span></div>)}{!balances?.length ? <p className="text-sm text-slate-500">No stock balance has been recorded.</p> : null}</div></CardContent></Card>
  </div>;
}
