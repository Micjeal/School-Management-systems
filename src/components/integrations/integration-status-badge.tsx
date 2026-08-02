import { Badge } from "@/components/ui/badge";
import type { IntegrationStatus } from "@/lib/integrations/types";

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
}

export function IntegrationStatusBadge({ status }: IntegrationStatusBadgeProps) {
  const labels: Record<IntegrationStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    error: "Error",
    disabled: "Disabled",
  };

  return <Badge>{labels[status]}</Badge>;
}
