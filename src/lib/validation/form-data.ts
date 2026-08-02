import type { FieldConfig } from "@/config/modules";
export function normalizeFormData(fields: readonly FieldConfig[], formData: FormData) {
  const record: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = formData.get(field.name);
    if (field.type === "checkbox") { record[field.name] = raw === "on" || raw === "true"; continue; }
    if (raw === null || raw === "") { if (field.optional) record[field.name] = null; continue; }
    const text = String(raw).trim();
    if (field.type === "number") { const value=Number(text); if(!Number.isFinite(value)) throw new Error(`${field.label} must be a number`); record[field.name]=value; }
    else if (field.type === "json") { try { record[field.name]=JSON.parse(text); } catch { throw new Error(`${field.label} must contain valid JSON`); } }
    else if (field.type === "array") { record[field.name]=text.split(/[,\n]/).map((item)=>item.trim()).filter(Boolean); }
    else record[field.name]=text;
  }
  return record;
}
