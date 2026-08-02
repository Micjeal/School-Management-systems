"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function decideApproval(formData: FormData) {
  const approvalId = formData.get("approval_id") as string;
  const decision = formData.get("decision") as string;
  const decisionNote = formData.get("decision_note") as string;

  if (!approvalId || !decision) {
    redirect("/app/approvals?error=Invalid request");
  }

  if (decision === "reject" && !decisionNote?.trim()) {
    redirect(`/app/approvals/${approvalId}?error=Rejection requires a note`);
  }

  const supabase = await createClient();
  
  const { error } = await supabase.rpc("decide_approval_step" as any, {
    target_approval_request_id: approvalId,
    approve: decision === "approve",
    decision_note: decisionNote || null,
  } as any);

  if (error) {
    redirect(`/app/approvals/${approvalId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/approvals");
  redirect("/app/approvals?message=Decision recorded");
}
