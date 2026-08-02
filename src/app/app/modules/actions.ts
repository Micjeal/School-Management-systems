"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { moduleById, moduleWritePermission } from "@/config/modules";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { normalizeFormData } from "@/lib/validation/form-data";
import { encodeRecordKey, filterByRecordKey } from "@/lib/data/module-data";
import type { PublicTableName } from "@/types/database.generated";

function messagePath(path: string, type: "error" | "message", message: string): never {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export async function saveModuleRecord(moduleId: string, recordKey: string | null, formData: FormData) {
  const moduleConfig = moduleById(moduleId);
  if (!moduleConfig) throw new Error("Unknown module");
  const context = await requireUserContext(moduleWritePermission(moduleConfig) ?? moduleConfig.permission);
  if (moduleConfig.platformOnly && !context.is_platform_admin) redirect("/access-denied");
  if (moduleConfig.readOnly) throw new Error("This module is read-only");

  const payload = normalizeFormData(moduleConfig.fields ?? [], formData);
  if (moduleConfig.schoolScoped) {
    if (!context.active_school_id) messagePath(`/app/modules/${moduleId}/${recordKey ?? "new"}`, "error", "Select a school first.");
    payload.school_id = context.active_school_id;
  }

  const supabase = await createClient();
  const table = String(moduleConfig.table);
  let request: any;
  if (recordKey) {
    request = (supabase.from(table) as any).update(payload);
    request = filterByRecordKey(request, moduleConfig, recordKey);
    if (moduleConfig.schoolScoped && context.active_school_id) request = request.eq("school_id", context.active_school_id);
  } else {
    request = (supabase.from(table) as any).insert(payload);
  }
  const result = await request.select("*").single();
  if (result.error) messagePath(`/app/modules/${moduleId}/${recordKey ?? "new"}`, "error", result.error.message);

  const savedKey = encodeRecordKey(moduleConfig, result.data as Record<string, unknown>);
  revalidatePath(`/app/modules/${moduleId}`);
  redirect(`/app/modules/${moduleId}/${savedKey}?message=${encodeURIComponent(recordKey ? "Record updated" : "Record created")}`);
}

export async function deleteModuleRecord(moduleId: string, recordKey: string) {
  const moduleConfig = moduleById(moduleId);
  if (!moduleConfig) throw new Error("Unknown module");
  const context = await requireUserContext(moduleWritePermission(moduleConfig) ?? moduleConfig.permission);
  if (moduleConfig.platformOnly && !context.is_platform_admin) redirect("/access-denied");
  if (moduleConfig.readOnly) throw new Error("Read-only module");

  const supabase = await createClient();
  let request = (supabase.from(String(moduleConfig.table)) as any).delete();
  request = filterByRecordKey(request, moduleConfig, recordKey);
  if (moduleConfig.schoolScoped && context.active_school_id) request = request.eq("school_id", context.active_school_id);
  const { error } = await request;
  if (error) messagePath(`/app/modules/${moduleId}/${recordKey}`, "error", error.message);
  revalidatePath(`/app/modules/${moduleId}`);
  redirect(`/app/modules/${moduleId}?message=${encodeURIComponent("Record deleted")}`);
}
