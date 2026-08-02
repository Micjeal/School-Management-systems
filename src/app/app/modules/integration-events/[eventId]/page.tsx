import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { IntegrationEventStatus } from "@/components/integration-events/integration-event-status";
import { IntegrationEventPayload } from "@/components/integration-events/integration-event-payload";
import { RetryEventButton } from "@/components/integration-events/retry-event-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { validateEventId } from "@/lib/integration-events/validation";
import { getScopeLabel } from "@/lib/integration-events/filters";
import type { IntegrationEventWithConnection } from "@/lib/integration-events/types";

export default async function IntegrationEventDetailPage({
  params,
  searchParams,
}: {
  params: { eventId: string };
  searchParams: { message?: string; error?: string };
}) {
  const context = await requireUserContext("settings.manage");
  const supabase = await createClient();

  // Validate event ID
  const eventId = validateEventId(params.eventId);

  // Load the event with connection and school info
  const { data: event, error: eventError } = await (supabase
    .from("integration_events")
    .select(`
      *,
      integration_connections!left(name, provider, status, last_connected_at, last_error),
      schools!left(name)
    `)
    .eq("id", eventId)
    .maybeSingle() as any);

  if (eventError || !event) {
    notFound();
  }

  // Verify scope access
  if (event.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if (event.school_id !== null && event.school_id !== context.active_school_id) {
    redirect("/access-denied");
  }

  const scopeLabel = getScopeLabel(event.school_id, event.schools?.name);
  const connectionName = event.integration_connections?.name || "Removed connection";
  const connectionProvider = event.integration_connections?.provider || "Unknown";
  const connectionStatus = event.integration_connections?.status;
  const workerExists = false; // TODO: Check if worker is deployed

  const directionLabels: Record<string, string> = {
    inbound: "Inbound (provider → SchoolDB)",
    outbound: "Outbound (SchoolDB → provider)",
  };

  function formatDateTime(dateString: string | null): string {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/modules/integration-events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Event #{eventId}</h1>
          <p className="text-muted-foreground">
            {event.event_type}
          </p>
        </div>
      </div>

      {/* Messages */}
      {searchParams.message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded">
          {searchParams.message}
        </div>
      )}
      {searchParams.error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {searchParams.error}
        </div>
      )}

      {/* Event summary */}
      <Card>
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Event ID: </span>
              {eventId}
            </div>
            <div>
              <span className="text-muted-foreground">Event type: </span>
              <span className="font-mono">{event.event_type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Direction: </span>
              {directionLabels[event.direction] || event.direction}
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              <IntegrationEventStatus status={event.status} />
            </div>
            <div>
              <span className="text-muted-foreground">Scope: </span>
              {scopeLabel}
            </div>
            <div>
              <span className="text-muted-foreground">Connection: </span>
              {event.integration_connection_id ? (
                <Link
                  href={`/app/modules/integrations/${event.integration_connection_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {connectionName}
                </Link>
              ) : (
                "Removed connection"
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Provider: </span>
              {connectionProvider}
            </div>
            <div>
              <span className="text-muted-foreground">Received: </span>
              {formatDateTime(event.received_at)}
            </div>
            <div>
              <span className="text-muted-foreground">Processed: </span>
              {formatDateTime(event.processed_at)}
            </div>
            <div>
              <span className="text-muted-foreground">Retries: </span>
              {event.retry_count}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider identifiers */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Identifiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground">Provider event ID: </span>
              {event.provider_event_id ? (
                <span className="font-mono">{event.provider_event_id}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Idempotency key: </span>
              {event.idempotency_key ? (
                <span className="font-mono">{event.idempotency_key}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Payload hash: </span>
              {event.payload_hash ? (
                <span className="font-mono">{event.payload_hash}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground">Received: </span>
              {formatDateTime(event.received_at)}
            </div>
            <div>
              <span className="text-muted-foreground">Retry scheduled: </span>
              {event.next_retry_at ? formatDateTime(event.next_retry_at) : "Not scheduled"}
            </div>
            <div>
              <span className="text-muted-foreground">Processed: </span>
              {event.processed_at ? formatDateTime(event.processed_at) : "Not yet processed"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payload */}
      <Card>
        <CardHeader>
          <CardTitle>Event Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationEventPayload payload={event.payload} />
        </CardContent>
      </Card>

      {/* Error details */}
      {event.error_message && (
        <Card>
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="text-destructive">{event.error_message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <RetryEventButton
            eventId={eventId}
            status={event.status}
            connectionStatus={connectionStatus}
            workerExists={workerExists}
          />
        </CardContent>
      </Card>

      {/* Connection info */}
      {event.integration_connection_id && event.integration_connections && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Connection name: </span>
                {connectionName}
              </div>
              <div>
                <span className="text-muted-foreground">Provider: </span>
                {connectionProvider}
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                {connectionStatus}
              </div>
              <div>
                <span className="text-muted-foreground">Last connected: </span>
                {formatDateTime(event.integration_connections.last_connected_at)}
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Last error: </span>
                {event.integration_connections.last_error ? (
                  <span className="text-destructive">{event.integration_connections.last_error}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>
            {event.integration_connection_id && (
              <div className="mt-4">
                <Link href={`/app/modules/integrations/${event.integration_connection_id}`}>
                  <Button variant="secondary" size="sm">
                    View integration
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
