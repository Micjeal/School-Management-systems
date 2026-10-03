import "server-only";
import type { ModuleConfig, FieldConfig } from "@/config/modules";
import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";
import type { PublicTableName } from "@/types/database.generated";
import type { RelationOptions } from "@/components/forms/module-form";

const moduleKeys = (module: ModuleConfig) =>
  module.primaryKey?.length ? module.primaryKey : ["id"];

function moduleProjection(module: ModuleConfig): string {
  return [
    ...new Set([
      ...moduleKeys(module),
      ...module.columns,
      ...(module.fields ?? []).map((field) => field.name),
      ...(module.schoolScoped ? ["school_id"] : [])
    ])
  ].join(",");
}

export function encodeRecordKey(module: ModuleConfig, row: Record<string, unknown>): string {
  const keys = moduleKeys(module);
  const values = keys.map((key) => row[key]);
  if (values.some((value) => value === undefined || value === null)) {
    throw new Error(`Record from ${module.table} is missing primary-key data.`);
  }
  if (keys.length === 1) return encodeURIComponent(String(values[0]));
  return Buffer.from(JSON.stringify(values), "utf8").toString("base64url");
}

export function decodeRecordKey(
  module: ModuleConfig,
  token: string
): Record<string, string | number | boolean> {
  const keys = moduleKeys(module);
  if (keys.length === 1) return { [keys[0]!]: decodeURIComponent(token) };
  let values: unknown;
  try {
    values = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid record key.");
  }
  if (!Array.isArray(values) || values.length !== keys.length)
    throw new Error("Invalid record key.");
  return Object.fromEntries(
    keys.map((key, index) => [key, values[index] as string | number | boolean])
  );
}

function applyRecordKey(query: any, module: ModuleConfig, token: string) {
  for (const [column, value] of Object.entries(decodeRecordKey(module, token)))
    query = query.eq(column, value);
  return query;
}

export async function listModuleRecords(
  module: ModuleConfig,
  context: UserContext,
  page = 1,
  query = ""
) {
  if (module.schoolScoped && !context.active_school_id) return { rows: [], count: 0 };
  const supabase = await createClient();
  const from = Math.max(0, (page - 1) * 25);
  let request = (supabase as any).from(String(module.table))
    .select(moduleProjection(module), { count: "exact" })
    .range(from, from + 24)
    .order(module.orderBy ?? "created_at", { ascending: false, nullsFirst: false });
  if (module.schoolScoped) request = request.eq("school_id", context.active_school_id);
  if (query) {
    const searchable = module.columns
      .filter(
        (column) =>
          !column.endsWith("_id") && !column.includes("date") && !column.includes("amount")
      )
      .slice(0, 4);
    if (searchable.length)
      request = request.or(
        searchable.map((column) => `${column}.ilike.%${query.replaceAll(",", "")}%`).join(",")
      );
  }
  const { data, error, count } = await request;
  if (error) throw new Error(error.message);
  const rows = ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    ...row,
    __recordKey: encodeRecordKey(module, row)
  }));
  return { rows, count: count ?? 0 };
}

export async function getModuleRecord(
  module: ModuleConfig,
  context: UserContext,
  recordKey: string
) {
  if (module.schoolScoped && !context.active_school_id) return null;
  const supabase = await createClient();
  let request = (supabase as any).from(String(module.table)).select(moduleProjection(module));
  request = applyRecordKey(request, module, recordKey);
  if (module.schoolScoped) request = request.eq("school_id", context.active_school_id);
  const { data, error } = await request.maybeSingle();
  if (error) throw new Error(error.message);
  return data as Record<string, unknown> | null;
}

export function filterByRecordKey(query: any, module: ModuleConfig, recordKey: string) {
  return applyRecordKey(query, module, recordKey);
}

export async function getRelationOptions(
  fields: readonly FieldConfig[],
  context: UserContext
): Promise<RelationOptions> {
  const supabase = await createClient();
  const output: RelationOptions = {};
  for (const field of fields) {
    if (field.type !== "relation" || !field.relation) continue;
    if (field.relation.schoolScoped !== false && !context.active_school_id) {
      output[field.name] = [];
      continue;
    }
    let request = (supabase as any).from(String(field.relation.table))
      .select(`${field.relation.value},${field.relation.label}`)
      .limit(50);
    if (field.relation.schoolScoped !== false) {
      request = field.relation.includeGlobal
        ? request.or(`school_id.eq.${context.active_school_id},school_id.is.null`)
        : request.eq("school_id", context.active_school_id);
    }
    const { data } = await request;
    output[field.name] = (data ?? []).map((row: any) => ({
      value: String(row[field.relation!.value]),
      label: String(row[field.relation!.label] ?? row[field.relation!.value])
    }));
  }
  return output;
}
