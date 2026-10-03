"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";

export async function createRefund(formData: FormData) {
  const context = await requireUserContext("finance.refund");
  if (!context.active_school_id) redirect("/app/finance/refunds/new?error=Select+a+school");
  const supabase = await createClient();
  const paymentId = String(formData.get("payment_id") ?? "");
  const amount = Number(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim();
  const payment = await requireSchoolRecord(
    supabase, "payments", paymentId, context.active_school_id, "id,amount,status,payment_reference"
  );
  const { data: prior } = await supabase.from("refunds").select("amount,status")
    .eq("school_id", context.active_school_id).eq("payment_id", paymentId)
    .in("status", ["requested", "approved", "processed"]);
  const alreadyRefunded = (prior ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  if (payment.status !== "posted" || !Number.isFinite(amount) || amount <= 0 || amount > Number(payment.amount) - alreadyRefunded || !reason) {
    redirect("/app/finance/refunds/new?error=Payment+is+not+eligible+for+that+refund+amount");
  }
  const reference = `REF-${Date.now().toString().slice(-10)}`;
  const { error } = await supabase.rpc("create_refund_request", {
    target_school_id: context.active_school_id,
    target_payment_id: paymentId,
    target_amount: amount,
    target_reason: reason,
    target_refund_reference: reference,
  });
  if (error) redirect(`/app/finance/refunds/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/finance/refunds");
  redirect("/app/finance/refunds?message=Refund+request+created");
}

export async function decideRefund(formData: FormData) {
  const context = await requireUserContext("finance.refund");
  const supabase = await createClient();
  
  const refundId = formData.get("refund_id") as string;
  const approve = formData.get("approve") === "true";
  const decisionNote = formData.get("decision_note") as string;

  if (!refundId) {
    redirect("/app/finance/refunds?error=Invalid request");
  }
  const refund = await requireSchoolRecord(supabase, "refunds", refundId, context.active_school_id, "id,status");
  if (refund.status !== "requested") redirect(`/app/finance/refunds/${refundId}?error=Refund%20is%20no%20longer%20awaiting%20approval`);

  if (!approve && !decisionNote?.trim()) {
    redirect(`/app/finance/refunds/${refundId}?error=Rejection requires a note`);
  }

  const { error } = await supabase.rpc("decide_refund_request" as any, {
    target_refund_id: refundId,
    approve: approve,
    decision_note: decisionNote || null,
  } as any);

  if (error) {
    redirect(`/app/finance/refunds/${refundId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/finance/refunds");
  redirect(`/app/finance/refunds/${refundId}?message=Decision recorded`);
}

export async function processRefund(formData: FormData) {
  const context = await requireUserContext("finance.refund");
  const supabase = await createClient();
  
  const refundId = formData.get("refund_id") as string;
  const providerReference = formData.get("provider_reference") as string;

  if (!refundId) {
    redirect("/app/finance/refunds?error=Invalid request");
  }
  const refund = await requireSchoolRecord(supabase, "refunds", refundId, context.active_school_id, "id,status");
  if (refund.status !== "approved") redirect(`/app/finance/refunds/${refundId}?error=Refund%20must%20be%20approved%20before%20processing`);

  const { error } = await supabase.rpc("process_refund" as any, {
    target_refund_id: refundId,
    target_provider_reference: providerReference || null,
  } as any);

  if (error) {
    redirect(`/app/finance/refunds/${refundId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/finance/refunds");
  redirect(`/app/finance/refunds/${refundId}?message=Refund processed`);
}
