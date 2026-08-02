import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { displayValue, formatDate, titleCase } from "@/lib/formatting";

function cellValue(key: string, value: unknown) {
  if (key.includes("status") || key === "priority" || key === "decision") return <Badge value={value}/>;
  if (key.endsWith("_at") || key.endsWith("_date") || key.endsWith("_on")) return formatDate(value);
  const text = displayValue(value);
  return text.length > 72 ? `${text.slice(0, 69)}…` : text;
}
export function DataTable({ rows, columns, detailBase }: { rows: Record<string, unknown>[]; columns: readonly string[]; detailBase?: string }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{titleCase(column)}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={String(row.__recordKey ?? row.id ?? index)} className="hover:bg-slate-50">{columns.map((column, colIndex) => <td key={column} className="max-w-sm whitespace-nowrap px-4 py-3 text-sm text-slate-700">{colIndex === 0 && detailBase && row.__recordKey ? <Link className="font-semibold text-blue-700 hover:underline" href={`${detailBase}/${row.__recordKey}`}>{cellValue(column, row[column])}</Link> : cellValue(column, row[column])}</td>)}</tr>)}</tbody></table></div>;
}
