import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { decideApproval } from "@/app/app/approvals/actions";

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ approvalId: string }>;
}) {
  const { approvalId } = await params;
  const context = await requireUserContext();
  const supabase = await createClient();
  
  const { data: approval } = await supabase.rpc("get_my_pending_approvals" as any) as any;
  const approvalDetail = approval?.find((a: any) => a.approval_request_id === approvalId);
  
  if (!approvalDetail) notFound();

  return (
    <div>
      <PageHeader 
        title="Approval Request" 
        description={`Review ${approvalDetail.request_type} request`}
        backHref="/app/approvals"
      />
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Request Details</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Type</p>
            <p className="text-sm text-slate-900">{approvalDetail.request_type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Entity</p>
            <p className="text-sm text-slate-900">{approvalDetail.entity_name}</p>
          </div>
          {approvalDetail.amount && (
            <div>
              <p className="text-sm font-medium text-slate-500">Amount</p>
              <p className="text-sm text-slate-900">{approvalDetail.amount}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-500">Requested by</p>
            <p className="text-sm text-slate-900">{approvalDetail.requested_by}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Requested at</p>
            <p className="text-sm text-slate-900">{new Date(approvalDetail.requested_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Current Step</p>
            <p className="text-sm text-slate-900">{approvalDetail.current_step}</p>
          </div>
          {approvalDetail.description && (
            <div>
              <p className="text-sm font-medium text-slate-500">Description</p>
              <p className="text-sm text-slate-900">{approvalDetail.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold">Approval History</h2>
        </CardHeader>
        <CardContent>
          {approvalDetail.approval_history && approvalDetail.approval_history.length > 0 ? (
            <div className="space-y-3">
              {approvalDetail.approval_history.map((history: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-slate-600">{history.approver}</span>
                  <span className="text-slate-900">{history.decision}</span>
                  <span className="text-slate-500">{new Date(history.decided_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No approval history yet</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold">Your Decision</h2>
        </CardHeader>
        <CardContent>
          <form action={decideApproval} className="space-y-4">
            <input type="hidden" name="approval_id" value={approvalId} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (required for rejection)
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
                name="decision" 
                value="approve"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Approve
              </Button>
              <Button 
                type="submit" 
                name="decision" 
                value="reject"
                variant="danger"
              >
                Reject
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
