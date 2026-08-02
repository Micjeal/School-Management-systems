export type ConditionType = "condition" | "allergy" | "disability" | "dietary" | "other";

export type ConditionScope = "global" | "school";

export interface MedicalCondition {
  id: string;
  school_id: string | null;
  code: string;
  name: string;
  condition_type: ConditionType;
  description: string | null;
  created_at: string;
}

export interface MedicalConditionWithUsage extends MedicalCondition {
  school_name: string | null;
  usage_count: number;
}

export interface MedicalConditionFilters {
  scope?: "all" | "global" | "school";
  type?: ConditionType | "all";
  search?: string;
  school_id?: string;
  usage?: "all" | "in_use" | "unused";
}

export interface CreateConditionInput {
  scope: ConditionScope;
  school_id?: string;
  code: string;
  name: string;
  condition_type: ConditionType;
  description?: string;
}

export interface UpdateConditionInput {
  code: string;
  name: string;
  condition_type: ConditionType;
  description?: string;
}

export interface ConditionTypeLabel {
  value: ConditionType;
  label: string;
  color: string;
}

export const CONDITION_TYPE_LABELS: ConditionTypeLabel[] = [
  { value: "condition", label: "Medical condition", color: "blue" },
  { value: "allergy", label: "Allergy", color: "red" },
  { value: "disability", label: "Disability or support need", color: "violet" },
  { value: "dietary", label: "Dietary requirement", color: "amber" },
  { value: "other", label: "Other", color: "slate" },
];

export function getConditionTypeLabel(type: ConditionType): string {
  return CONDITION_TYPE_LABELS.find((t) => t.value === type)?.label || type;
}

export function getConditionTypeColor(type: ConditionType): string {
  return CONDITION_TYPE_LABELS.find((t) => t.value === type)?.color || "slate";
}
