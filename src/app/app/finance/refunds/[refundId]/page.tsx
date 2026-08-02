import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { processRefund, decideRefund } from "@/app/app/finance/refunds/actions";

export default async function RefundDetailPage({
  params,
}: {
  params: Promise<{ refundId: string }>;
}) {
  const { refundId } = await params;
  const context = await requireUserContext("finance.refund");
  const supabase = await createClient();
  
  const { data: refund } = await (supabase.from("refunds") as any)
    .select("*,profiles(first_name,last_name),payments(payment_reference,amount,currency_code)")
    .eq("id", refundId)
    .eq("school_id", context.active_school_id)
    .single();
    
  if (!refund) notFound();

  return (
    <div>
      <PageHeader 
        title={`Refund ${refund.refund_reference}`}
        description={refund.payments?.payment_reference || "Unknown payment"}
        backHref="/app/finance/refunds"
      />
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Refund Details</h2>
            <Badge>{refund.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Amount</p>
              <p className="text-sm text-slate-900">{refund.payments?.currency_code} {Number(refund.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Requested By</p>
              <p className="text-sm text-slate-900">{refund.profiles?.first_name} {refund.profiles?.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Requested At</p>
              <p className="text-sm text-slate-900">{new Date(refund.requested_at).toLocaleString()}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Reason</p>
            <p className="text-sm text-slate-900">{refund.reason}</p>
          </div>
          {refund.approved_at && (
            <div>
              <p className="text-sm font-medium text-slate-500">Approved At</p>
              <p className="text-sm text-slate-900">{new Date(refund.approved_at).toLocaleString()}</p>
            </div>
          )}
          {refund.processed_at && (
            <div>
              <p className="text-sm font-medium text-slate-500">Processed At</p>
              <p className="text-sm text-slate-900">{new Date(refund.processed_at).toLocaleString()}</p>
            </div>
          )}
          {refund.provider_reference && (
            <div>
              <p className="text-sm font-medium text-slate-500">Provider Reference</p>
              <p className="text-sm text-slate-900">{refund.provider_reference}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {refund.status === "requested" && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Approve or Reject</h2>
          </CardHeader>
          <CardContent>
            <form action={decideRefund} className="space-y-4">
              <input type="hidden" name="refund_id" value={refundId} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Decision Note (required for rejection)
                </label>
                <Textarea 
                  name="decision_note" 
                  placeholder="Add any notes about your decision..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  name="approve" 
                  value="true"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Approve Refund
                </Button>
                <Button 
                  type="submit" 
                  name="approve" 
                  value="false"
                  variant="danger"
                >
                  Reject Refund
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {refund.status === "approved" && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Process Refund</h2>
          </CardHeader>
          <CardContent>
            <form action={processRefund} className="space-y-4">
              <input type="hidden" name="refund_id" value={refundId} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Provider Reference (optional)
                </label>
                <Textarea 
                  name="provider_reference" 
                  placeholder="Reference from payment provider..."
                  rows={2}
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Process Refund
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
