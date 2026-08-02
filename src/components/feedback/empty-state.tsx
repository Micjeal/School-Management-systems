import Link from "next/link";
import { Inbox } from "lucide-react";
export function EmptyState({ title = "No records found", description = "Create the first record or adjust the current filters.", actionHref, actionLabel = "Create record" }: { title?: string; description?: string; actionHref?: string; actionLabel?: string }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Inbox className="mb-3 h-10 w-10 text-slate-400"/><h3 className="font-semibold text-slate-900">{title}</h3><p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>{actionHref ? <Link className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" href={actionHref}>{actionLabel}</Link> : null}</div>;
}
