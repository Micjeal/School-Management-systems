import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRefund } from "../actions";
import { redirect } from "next/navigation";

export default async function NewRefund({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const c = await requireUserContext("finance.refund"); if (!c.active_school_id) redirect("/app?error=Select+a+school");
  const s = await createClient();
  const { data: payments } = await s.from("payments").select("id,payment_reference,amount,currency_code")
    .eq("school_id", c.active_school_id).eq("status", "posted").order("payment_date", { ascending: false }).limit(100);
  const { error } = await searchParams;
  return <div><PageHeader title="Request refund" description="Refund eligibility and remaining amount are validated on the server." backHref="/app/finance/refunds" />
    {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    <Card><CardContent><form action={createRefund} className="space-y-4">
      <div><Label htmlFor="payment_id">Eligible payment</Label><Select id="payment_id" name="payment_id" required><option value="">Select payment</option>{(payments ?? []).map(p => <option key={p.id} value={p.id}>{p.payment_reference} — {p.currency_code} {p.amount}</option>)}</Select></div>
      <div><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" min="0.01" step="0.01" required /></div>
      <div><Label htmlFor="reason">Reason</Label><Textarea id="reason" name="reason" required /></div>
      <Button>Submit refund request</Button>
    </form></CardContent></Card></div>;
}
