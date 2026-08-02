"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

export async function decideRefund(formData: FormData) {
  const context = await requireUserContext("finance.refund");
  const supabase = await createClient();
  
  const refundId = formData.get("refund_id") as string;
  const approve = formData.get("approve") === "true";
  const decisionNote = formData.get("decision_note") as string;

  if (!refundId) {
    redirect("/app/finance/refunds?error=Invalid request");
  }

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
