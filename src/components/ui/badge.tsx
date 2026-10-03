import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function Badge({ children, value, className, variant }: { children?: React.ReactNode; value?: unknown; className?: string; variant?: BadgeVariant }) {
  const text = String(children ?? value ?? "—");
  const positive = /active|paid|posted|approved|present|published|completed|available|success/i.test(text);
  const negative = /failed|rejected|suspended|overdue|absent|cancelled|archived|void/i.test(text);
  const tone = variant === "destructive"
    ? "bg-red-50 text-red-700"
    : variant === "outline"
      ? "border border-slate-300 bg-transparent text-slate-700"
      : variant === "secondary"
        ? "bg-slate-100 text-slate-700"
        : positive
          ? "bg-emerald-50 text-emerald-700"
          : negative
            ? "bg-red-50 text-red-700"
            : "bg-slate-100 text-slate-700";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tone, className)}>{text.replaceAll("_", " ")}</span>;
}
