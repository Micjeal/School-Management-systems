"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

export async function processImportBatch(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const supabase = await createClient();
  
  const batchId = formData.get("batch_id") as string;

  if (!batchId) {
    redirect("/app/system/imports?error=Invalid request");
  }

  const { error } = await supabase.rpc("process_import_batch" as any, {
    target_import_batch_id: batchId,
  } as any);

  if (error) {
    redirect(`/app/system/imports/${batchId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/system/imports");
  redirect(`/app/system/imports/${batchId}?message=Import processed`);
}
