import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Archive, Building2, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/formatting";

export default async function InventoryPage() {
  const c = await requireUserContext("inventory.manage");

  if (!c.active_school_id) {
    return (
      <PageContainer>
        <EmptyState title="Select a school" description="Switch to a school to view inventory." />
      </PageContainer>
    );
  }

  const supabase = await createClient();
  const sid = c.active_school_id;

  const [
    { count: itemCount },
    { count: supplierCount },
    { data: recentMovements },
  ] = await Promise.all([
    (supabase.from("inventory_items") as any)
      .select("id", { count: "exact", head: true })
      .eq("school_id", sid)
      .eq("status", "active"),
    (supabase.from("suppliers") as any)
      .select("id", { count: "exact", head: true })
      .eq("school_id", sid)
      .eq("status", "active"),
    (supabase.from("stock_movements") as any)
      .select("id,movement_type,quantity,occurred_at,inventory_items(code,name)")
      .eq("school_id", sid)
      .order("occurred_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Inventory"
        description="Manage stock items, suppliers, and track movement of goods."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Items card */}
        <Link href="/app/inventory/items">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Archive className="h-5 w-5" />
                </span>
                <h2 className="font-semibold text-slate-900">Inventory Items</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{itemCount ?? 0}</p>
              <p className="mt-1 text-sm text-slate-500">Active items in catalogue</p>
            </CardContent>
          </Card>
        </Link>

        {/* Suppliers card */}
        <Link href="/app/inventory/suppliers">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </span>
                <h2 className="font-semibold text-slate-900">Suppliers</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{supplierCount ?? 0}</p>
              <p className="mt-1 text-sm text-slate-500">Active approved vendors</p>
            </CardContent>
          </Card>
        </Link>

        {/* Movements card */}
        <Link href="/app/inventory/movements">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <h2 className="font-semibold text-slate-900">Stock Movements</h2>
              </div>
            </CardHeader>
            <CardContent>
              {recentMovements && recentMovements.length > 0 ? (
                <ul className="space-y-2">
                  {recentMovements.map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-slate-700">
                        {m.inventory_items?.code} — {m.inventory_items?.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge>{m.movement_type}</Badge>
                        <span className="text-xs text-slate-400">{formatDate(m.occurred_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No movements recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
