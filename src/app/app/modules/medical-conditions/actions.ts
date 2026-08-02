"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { normalizeCode, validateCreateInput } from "@/lib/medical-conditions/validation";
import { checkDuplicateCode, checkSimilarName, getConditionUsageCount } from "@/lib/medical-conditions/queries";
import { canManageGlobalConditions, canManageSchoolConditions } from "@/lib/medical-conditions/permissions";
import type { ConditionType } from "@/lib/medical-conditions/types";

const schoolIdSchema = z.string().uuid();

export type MedicalConditionActionState = {
  success: boolean;
  message?: string;
  values?: {
    scope: string;
    target_school_id: string;
    code: string;
    name: string;
    condition_type: string;
    description: string;
  };
  fieldErrors?: Record<string, string[]>;
};

export async function createMedicalConditionAction(
  previousState: MedicalConditionActionState,
  formData: FormData,
): Promise<MedicalConditionActionState> {
  const context = await requireUserContext("health.manage");
  const supabase = await createClient();

  const scope = String(formData.get("scope") ?? "");
  const submittedTargetSchoolId = String(formData.get("target_school_id") ?? "");
  const code = String(formData.get("code") ?? "");
  const name = String(formData.get("name") ?? "");
  const conditionType = String(formData.get("condition_type") ?? "");
  const description = String(formData.get("description") ?? "");

  let resolvedSchoolId: string | null = null;
  const fieldErrors: Record<string, string[]> = {};

  if (scope === "global") {
    if (!context.is_platform_admin) {
      return {
        success: false,
        message: "Only platform administrators can create global medical conditions.",
        values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
      };
    }
    resolvedSchoolId = null;
  } else if (scope === "current_school") {
    if (!context.active_school_id) {
      return {
        success: false,
        message: "Select a school before creating a school-specific condition.",
        values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
      };
    }
    // Validate that active_school_id is a valid UUID (not __platform__ or other non-UUID values)
    const parsedActiveSchoolId = schoolIdSchema.safeParse(context.active_school_id);
    if (!parsedActiveSchoolId.success) {
      return {
        success: false,
        message: "Please select a valid school. Platform administration view cannot be used for school-specific conditions.",
        values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
      };
    }
    resolvedSchoolId = parsedActiveSchoolId.data;
  } else if (scope === "specific_school") {
    if (!context.is_platform_admin) {
      return {
        success: false,
        message: "You cannot create conditions for another school.",
        values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
      };
    }

    const parsedSchoolId = schoolIdSchema.safeParse(submittedTargetSchoolId);
    if (!parsedSchoolId.success) {
      return {
        success: false,
        message: "Select a valid school.",
        fieldErrors: { target_school_id: ["Select a valid school."] },
        values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
      };
    }

    const { data: targetSchool, error: targetSchoolError } = await supabase
      .from("schools")
      .select("id, name, status")
      .eq("id", parsedSchoolId.data)
      .maybeSingle() as any;

    if (targetSchoolError || !targetSchool || targetSchool.status === "archived") {
      return {
        success: false,
        message: "The selected school is not available.",
        fieldErrors: { target_school_id: ["The selected school is not available."] },
        values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
      };
    }

    resolvedSchoolId = targetSchool.id;
  } else {
    return {
      success: false,
      message: "Select a valid catalogue scope.",
      values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
    };
  }

  const validation = validateCreateInput({
    code,
    name,
    condition_type: conditionType as ConditionType,
    description: description || undefined,
  });

  if (!validation.valid) {
    return {
      success: false,
      message: "Check the highlighted fields.",
      fieldErrors: validation.errors,
      values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
    };
  }

  const normalizedCode = normalizeCode(code);

  if (!canManageGlobalConditions(context) && resolvedSchoolId === null) {
    return {
      success: false,
      message: "You do not have permission to manage global medical conditions.",
      values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
    };
  }

  if (resolvedSchoolId && !canManageSchoolConditions(context, resolvedSchoolId)) {
    return {
      success: false,
      message: "You do not have permission to manage conditions for this school.",
      values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
    };
  }

  const duplicateCheck = await checkDuplicateCode(normalizedCode, resolvedSchoolId);
  if (duplicateCheck.exists) {
    const scopeText = duplicateCheck.scope === "global" ? "global" : "this school";
    return {
      success: false,
      message: `A condition with code ${normalizedCode} already exists in ${scopeText} catalogue.`,
      values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
    };
  }

  const similarCheck = await checkSimilarName(name, resolvedSchoolId);
  if (similarCheck.exists && similarCheck.similarName) {
    return {
      success: false,
      message: `A condition with a similar name "${similarCheck.similarName}" already exists in this catalogue.`,
      values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
    };
  }

  const { data, error } = await supabase
    .from("medical_conditions")
    .insert({
      school_id: resolvedSchoolId,
      code: normalizedCode,
      name: name.trim(),
      condition_type: conditionType as ConditionType,
      description: description?.trim() || null,
    } as any)
    .select("id, name, school_id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "A condition with this code already exists.",
        values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
      };
    }
    return {
      success: false,
      message: "Failed to create condition.",
      values: { scope, target_school_id: submittedTargetSchoolId, code, name, condition_type: conditionType, description },
    };
  }

  revalidatePath("/app/modules/medical-conditions");

  let message = "";
  if (resolvedSchoolId === null) {
    message = `"${name}" was added to the global medical-condition catalogue.`;
  } else if (resolvedSchoolId === context.active_school_id) {
    const schoolName = context.active_school?.name || "current school";
    message = `"${name}" was added to ${schoolName}.`;
  } else {
    const { data: school } = await supabase
      .from("schools")
      .select("name")
      .eq("id", resolvedSchoolId)
      .single() as any;
    message = `"${name}" was added to ${school?.name || "the selected school"}.`;
  }

  return { success: true, message };
}

export async function updateMedicalConditionAction(conditionId: string, formData: FormData) {
  const context = await requireUserContext("health.manage");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("medical_conditions")
    .select("id, school_id, code, name, condition_type, description")
    .eq("id", conditionId)
    .maybeSingle() as any;

  if (!existing) {
    return { error: "The medical condition could not be found." };
  }

  const isGlobal = existing.school_id === null;
  const effectiveSchoolId = existing.school_id;

  if (isGlobal && !canManageGlobalConditions(context)) {
    return { error: "You do not have permission to manage global medical conditions." };
  }

  if (!isGlobal && effectiveSchoolId && !canManageSchoolConditions(context, effectiveSchoolId)) {
    return { error: "You do not have permission to manage conditions for this school." };
  }

  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const conditionType = formData.get("condition_type") as ConditionType;
  const description = formData.get("description") as string | null;

  const validation = validateCreateInput({
    code,
    name,
    condition_type: conditionType,
    description: description || undefined,
  });

  if (!validation.valid) {
    return { error: "Validation failed", details: validation.errors };
  }

  const normalizedCode = normalizeCode(code);

  if (normalizedCode !== existing.code) {
    const usageCount = await getConditionUsageCount(conditionId);
    if (usageCount > 0) {
      return { 
        error: "This condition is in use. Changing its code may affect reporting and integrations.",
        requiresConfirmation: true,
      };
    }
  }

  const duplicateCheck = await checkDuplicateCode(normalizedCode, effectiveSchoolId, conditionId);
  if (duplicateCheck.exists) {
    const scopeText = duplicateCheck.scope === "global" ? "global" : "this school";
    return { 
      error: `A condition with code ${normalizedCode} already exists in ${scopeText} catalogue.` 
    };
  }

  const { error } = await supabase
    .from("medical_conditions")
    .update({
      code: normalizedCode,
      name: name.trim(),
      condition_type: conditionType,
      description: description?.trim() || null,
    } as any)
    .eq("id", conditionId) as any;

  if (error) {
    if (error.code === "23505") {
      return { error: "A condition with this code already exists." };
    }
    return { error: "Failed to update condition." };
  }

  revalidatePath("/app/modules/medical-conditions");
  revalidatePath(`/app/modules/medical-conditions/${conditionId}`);
  return { success: true };
}

export async function deleteMedicalConditionAction(conditionId: string) {
  const context = await requireUserContext("health.manage");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("medical_conditions")
    .select("id, school_id")
    .eq("id", conditionId)
    .maybeSingle() as any;

  if (!existing) {
    return { error: "The medical condition could not be found." };
  }

  const isGlobal = existing.school_id === null;
  const effectiveSchoolId = existing.school_id;

  if (isGlobal && !canManageGlobalConditions(context)) {
    return { error: "You do not have permission to manage global medical conditions." };
  }

  if (!isGlobal && effectiveSchoolId && !canManageSchoolConditions(context, effectiveSchoolId)) {
    return { error: "You do not have permission to manage conditions for this school." };
  }

  const usageCount = await getConditionUsageCount(conditionId);
  if (usageCount > 0) {
    return { 
      error: "This condition cannot be deleted because it is assigned to student medical records." 
    };
  }

  const { error } = await supabase
    .from("medical_conditions")
    .delete()
    .eq("id", conditionId);

  if (error) {
    if (error.code === "23503") {
      return { 
        error: "This condition cannot be deleted because it is assigned to student medical records." 
      };
    }
    return { error: "Failed to delete condition." };
  }

  revalidatePath("/app/modules/medical-conditions");
  return { success: true };
}
