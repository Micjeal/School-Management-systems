"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

const ENABLED_EXPORT_TYPES = new Set([
  "students",
  "invoices",
  "payments",
  "attendance",
  "results",
  "library",
  "inventory",
]);

export async function requestExportAction(formData: FormData) {
  const context = await requireUserContext("reports.export");
  if (!context.active_school_id) redirect("/app/system/exports?error=Select+a+school");

  const exportType = String(formData.get("export_type") ?? "");
  if (!ENABLED_EXPORT_TYPES.has(exportType)) {
    redirect("/app/system/exports?error=Unsupported+export+type");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("export_jobs").insert({
    school_id: context.active_school_id,
    requested_by: context.user_id,
    export_type: exportType,
    format: "csv",
    status: "queued",
    filters: {},
  });

  if (error) redirect(`/app/system/exports?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/system/exports");
  redirect("/app/system/exports?message=Export+queued");
}

export async function cancelExportAction(formData: FormData) {
  await requireUserContext("reports.export");
  const jobId = String(formData.get("job_id") ?? "");
  if (!jobId) redirect("/app/system/exports?error=Invalid+request");

  const supabase = await createClient();
  const { data: cancelled, error } = await supabase.rpc("cancel_export_job", {
    target_export_job_id: jobId,
  });

  if (error || !cancelled) {
    redirect("/app/system/exports?error=The+queued+export+could+not+be+cancelled");
  }
  revalidatePath("/app/system/exports");
  redirect("/app/system/exports?message=Export+cancelled");
}
