"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationEventStatus } from "./integration-event-status";
import type { IntegrationEventWithConnection } from "@/lib/integration-events/types";

interface IntegrationEventTableProps {
  events: IntegrationEventWithConnection[];
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "Not processed";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatReceived(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function IntegrationEventTable({ events }: IntegrationEventTableProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <div className="text-muted-foreground mb-4">
          No integration events yet
        </div>
        <p className="text-sm text-muted-foreground">
          Provider and synchronization activity will appear here after an integration is configured and starts exchanging data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const connectionName = event.connection_name || "Removed connection";
        const canRetry = event.status === "failed" || event.status === "dead_letter";
        const retryLabel = event.retry_count > 0 ? `${event.retry_count} retries` : "0";

        return (
          <div key={event.id.toString()} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 text-sm">
              <div className="font-medium">
                {formatReceived(event.received_at)}
              </div>
              <div className="max-w-[150px] truncate">
                {connectionName}
              </div>
              <div className="font-mono text-xs">
                {event.event_type}
              </div>
              <div>
                <Badge className={
                  event.direction === "inbound"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-violet-100 text-violet-700"
                }>
                  {event.direction}
                </Badge>
              </div>
              <div>
                <IntegrationEventStatus status={event.status} />
              </div>
              <div>
                {retryLabel}
              </div>
              <div>
                {formatDateTime(event.processed_at)}
              </div>
              <div className="max-w-[200px] truncate">
                {event.error_message ? (
                  <span className="text-destructive">{event.error_message}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/app/modules/integration-events/${event.id}`}>
                <Button variant="secondary" size="sm">
                  View details
                </Button>
              </Link>
              {canRetry && (
                <span className="text-xs text-muted-foreground self-center">
                  Retry available on detail page
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
