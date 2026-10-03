"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { IntegrationEventStatus } from "@/lib/integration-events/types";
import { retryIntegrationEventAction } from "@/app/app/modules/integration-events/actions";

interface RetryEventButtonProps {
  eventId: number;
  status: IntegrationEventStatus;
  connectionStatus?: string;
  workerExists?: boolean;
}

export function RetryEventButton({
  eventId,
  status,
  connectionStatus,
  workerExists = false
}: RetryEventButtonProps) {
  const canRetry = status === "failed" || status === "dead_letter";
  const connectionActive = connectionStatus === "active";

  if (!canRetry) {
    return <span className="text-xs text-muted-foreground">Retry unavailable</span>;
  }

  if (!workerExists) {
    return (
      <span className="text-xs text-muted-foreground">
        Retry unavailable - Integration worker is not deployed
      </span>
    );
  }

  if (!connectionActive) {
    return (
      <span className="text-xs text-muted-foreground">
        Retry unavailable - Enable and test the integration connection first
      </span>
    );
  }

  return (
    <form action={retryIntegrationEventAction}>
      <input type="hidden" name="eventId" value={eventId.toString()} />
      <Button type="submit" variant="secondary" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry event
      </Button>
    </form>
  );
}
