import { createClient } from "@/lib/supabase/server";
import type { MedicalCondition, MedicalConditionWithUsage, MedicalConditionFilters } from "./types";

export async function getMedicalConditions(filters: MedicalConditionFilters = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("medical_conditions")
    .select(`
      id,
      school_id,
      code,
      name,
      condition_type,
      description,
      created_at,
      schools(name)
    `);

  if (filters.scope === "global") {
    query = query.is("school_id", null);
  } else if (filters.scope === "school") {
    query = query.not("school_id", "is", null);
    if (filters.school_id) {
      query = query.eq("school_id", filters.school_id);
    }
  } else if (filters.scope === "all" && filters.school_id) {
    query = query.or(`school_id.is.null,school_id.eq.${filters.school_id}`);
  }

  if (filters.type && filters.type !== "all") {
    query = query.eq("condition_type", filters.type);
  }

  if (filters.search) {
    query = query.or(`code.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
  }

  query = query.order("name", { ascending: true }).order("code", { ascending: true });

  const { data, error } = await query;

  if (error) throw error;

  return data as MedicalCondition[];
}

export async function getMedicalConditionById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("medical_conditions")
    .select(`
      id,
      school_id,
      code,
      name,
      condition_type,
      description,
      created_at,
      schools(name)
    `)
    .eq("id", id)
    .maybeSingle();
  
  if (error) throw error;
  
  return data as MedicalCondition | null;
}

export async function getMedicalConditionsWithUsage(filters: MedicalConditionFilters = {}) {
  const supabase = await createClient();
  
  const conditions = await getMedicalConditions(filters);
  
  const conditionIds = conditions.map((c) => c.id);
  
  let usageCounts: Record<string, number> = {};
  
  if (conditionIds.length > 0) {
    const { data: usageData, error: usageError } = await supabase
      .from("student_medical_conditions")
      .select("medical_condition_id")
      .in("medical_condition_id", conditionIds);
    
    if (!usageError && usageData) {
      usageCounts = usageData.reduce((acc, row) => {
        acc[row.medical_condition_id] = (acc[row.medical_condition_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }
  
  const results: MedicalConditionWithUsage[] = conditions.map((condition) => ({
    ...condition,
    school_name: (condition as any).schools?.name || null,
    usage_count: usageCounts[condition.id] || 0,
  }));
  
  if (filters.usage === "in_use") {
    return results.filter((r) => r.usage_count > 0);
  }
  
  if (filters.usage === "unused") {
    return results.filter((r) => r.usage_count === 0);
  }
  
  return results;
}

export async function getConditionUsageCount(conditionId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("student_medical_conditions")
    .select("id", { count: "exact", head: true })
    .eq("medical_condition_id", conditionId);
  
  if (error) throw error;
  
  return data?.length || 0;
}

export async function checkDuplicateCode(
  code: string,
  schoolId: string | null,
  excludeId?: string
): Promise<{ exists: boolean; scope: "global" | "school" | null }> {
  const supabase = await createClient();
  
  let query = supabase
    .from("medical_conditions")
    .select("id, school_id")
    .eq("code", code);
  
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  
  if (schoolId === null) {
    query = query.is("school_id", null);
  } else {
    query = query.eq("school_id", schoolId);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) throw error;
  
  if (!data) return { exists: false, scope: null };
  
  return { 
    exists: true, 
    scope: data.school_id === null ? "global" : "school" 
  };
}

export async function checkSimilarName(
  name: string,
  schoolId: string | null,
  excludeId?: string
): Promise<{ exists: boolean; similarName: string | null }> {
  const supabase = await createClient();
  
  const normalizedName = name.trim().toLowerCase();
  
  let query = supabase
    .from("medical_conditions")
    .select("id, name, school_id")
    .ilike("name", `%${normalizedName}%`);
  
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  
  if (schoolId === null) {
    query = query.is("school_id", null);
  } else {
    query = query.eq("school_id", schoolId);
  }
  
  const { data, error } = await query.limit(5);
  
  if (error) throw error;
  
  if (!data || data.length === 0) return { exists: false, similarName: null };
  
  const exactMatch = data.find((d) => d.name.trim().toLowerCase() === normalizedName);
  if (exactMatch) {
    return { exists: true, similarName: exactMatch.name };
  }
  
  return { exists: true, similarName: data[0]!.name };
}

export async function getSchoolsForSelector(limit: number = 100) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("schools")
    .select("id, name, slug")
    .eq("status", "active")
    .order("name", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data || [];
}
