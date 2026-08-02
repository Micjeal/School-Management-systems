import { cn } from "@/lib/utils";
export function Badge({ children, value, className }: { children?: React.ReactNode; value?: unknown; className?: string }) {
  const text = String(children ?? value ?? "—");
  const positive = /active|paid|posted|approved|present|published|completed|available|success/i.test(text);
  const negative = /failed|rejected|suspended|overdue|absent|cancelled|archived|void/i.test(text);
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", positive ? "bg-emerald-50 text-emerald-700" : negative ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700", className)}>{text.replaceAll("_", " ")}</span>;
}
