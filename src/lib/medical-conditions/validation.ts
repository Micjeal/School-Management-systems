import type { ConditionType } from "./types";

export function normalizeCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function validateCode(value: string): { valid: boolean; error?: string } {
  const normalized = normalizeCode(value);
  
  if (!normalized || normalized.length === 0) {
    return { valid: false, error: "Code is required" };
  }
  
  if (normalized.length < 2) {
    return { valid: false, error: "Code must be at least 2 characters" };
  }
  
  if (normalized.length > 50) {
    return { valid: false, error: "Code must be no more than 50 characters" };
  }
  
  return { valid: true };
}

export function validateName(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();
  
  if (!trimmed || trimmed.length === 0) {
    return { valid: false, error: "Name is required" };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  
  if (trimmed.length > 120) {
    return { valid: false, error: "Name must be no more than 120 characters" };
  }
  
  return { valid: true };
}

export function validateConditionType(value: string): { valid: boolean; error?: string; value?: ConditionType } {
  const validTypes: ConditionType[] = ["condition", "allergy", "disability", "dietary", "other"];
  
  if (!validTypes.includes(value as ConditionType)) {
    return { valid: false, error: "Invalid condition type" };
  }
  
  return { valid: true, value: value as ConditionType };
}

export function validateDescription(value: string): { valid: boolean; error?: string } {
  if (value && value.length > 2000) {
    return { valid: false, error: "Description must be no more than 2,000 characters" };
  }
  
  return { valid: true };
}

export function validateCreateInput(input: {
  code: string;
  name: string;
  condition_type: string;
  description?: string;
}): { valid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  const codeValidation = validateCode(input.code);
  if (!codeValidation.valid) {
    errors.code = [codeValidation.error!];
  }

  const nameValidation = validateName(input.name);
  if (!nameValidation.valid) {
    errors.name = [nameValidation.error!];
  }

  const typeValidation = validateConditionType(input.condition_type);
  if (!typeValidation.valid) {
    errors.condition_type = [typeValidation.error!];
  }

  if (input.description !== undefined) {
    const descValidation = validateDescription(input.description);
    if (!descValidation.valid) {
      errors.description = [descValidation.error!];
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
