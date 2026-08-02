"use client";

import { Badge } from "@/components/ui/badge";
import type { IntegrationEvent } from "@/lib/integrations/types";

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

interface IntegrationEventsTableProps {
  events: IntegrationEvent[];
}

export function IntegrationEventsTable({ events }: IntegrationEventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const received = formatDistanceToNow(new Date(event.received_at));
        const processed = event.processed_at
          ? formatDistanceToNow(new Date(event.processed_at))
          : "-";

        const canRetry = event.status === "failed" || event.status === "dead_letter";

        return (
          <div key={event.id} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Received: </span>
                {received}
              </div>
              <div>
                <span className="text-muted-foreground">Direction: </span>
                <Badge>{event.direction}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Event type: </span>
                {event.event_type}
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge>{event.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Retries: </span>
                {event.retry_count}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="max-w-[150px] truncate">
                <span className="text-muted-foreground">Provider event ID: </span>
                {event.provider_event_id || "-"}
              </div>
              <div>
                <span className="text-muted-foreground">Processed: </span>
                {processed}
              </div>
              <div className="max-w-[200px] truncate">
                <span className="text-muted-foreground">Error: </span>
                {event.error_message ? (
                  <span className="text-destructive">{event.error_message}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>
            {canRetry && (
              <span className="text-xs text-muted-foreground">
                This event can be retried via the detail page
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
