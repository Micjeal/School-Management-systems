import { Badge } from "@/components/ui/badge";

interface WebhookStatusBadgeProps {
  status: string;
}

export function WebhookStatusBadge({ status }: WebhookStatusBadgeProps) {
  const colors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    disabled: "bg-slate-100 text-slate-700",
  };

  const colorClass = colors[status] || "bg-slate-100 text-slate-700";

  return (
    <Badge className={colorClass}>
      {status}
    </Badge>
  );
}
