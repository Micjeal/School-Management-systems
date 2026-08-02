"use client";

import { Badge } from "@/components/ui/badge";
import type { IntegrationEventStatus } from "@/lib/integration-events/types";

interface IntegrationEventStatusProps {
  status: IntegrationEventStatus;
}

const STATUS_CONFIG: Record<
  IntegrationEventStatus,
  { label: string; color: string }
> = {
  received: { label: "Received", color: "bg-slate-100 text-slate-700" },
  queued: { label: "Queued", color: "bg-amber-100 text-amber-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
  ignored: { label: "Ignored", color: "bg-slate-100 text-slate-700" },
  dead_letter: {
    label: "Dead Letter",
    color: "bg-red-900 text-red-100",
  },
};

export function IntegrationEventStatus({
  status,
}: IntegrationEventStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}
