import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { IntegrationEventSummary } from "@/components/integration-events/integration-event-summary";
import { IntegrationEventTable } from "@/components/integration-events/integration-event-table";
import { IntegrationEventFilters } from "@/components/integration-events/integration-event-filters";
import { Button } from "@/components/ui/button";
import { RefreshCw, RadioTower } from "lucide-react";
import { buildEventFilters, getScopeLabel } from "@/lib/integration-events/filters";
import { getEventSummary } from "./actions";
import type { IntegrationEventWithConnection, IntegrationEventFilters as FilterType } from "@/lib/integration-events/types";

export default async function IntegrationEventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    connectionId?: string;
    provider?: string;
    eventType?: string;
    direction?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    hasError?: string;
  }>;
}) {
  const context = await requireUserContext("settings.manage");
  const params = await searchParams;

  // Platform admins need to select a school or be in platform view
  if (!context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  const supabase = await createClient();

  // Determine scope based on user role
  const schoolId = context.is_platform_admin && !context.active_school_id
    ? null
    : context.active_school_id;

  // Build filters
  const filters = buildEventFilters(params);

  // Build query
  let query = supabase
    .from("integration_events")
    .select(`
      *,
      integration_connections!left(name, provider, status),
      schools!left(name)
    `);

  // Apply scope filter
  if (schoolId === null) {
    query = query.is("school_id", null);
  } else {
    query = query.eq("school_id", schoolId);
  }

  // Apply search filter
  if (filters.search) {
    query = query.or(
      `event_type.ilike.%${filters.search}%,provider_event_id.ilike.%${filters.search}%,idempotency_key.ilike.%${filters.search}%,error_message.ilike.%${filters.search}%`
    );
  }

  // Apply connection filter
  if (filters.connectionId) {
    query = query.eq("integration_connection_id", filters.connectionId);
  }

  // Apply provider filter
  if (filters.provider) {
    query = query.eq("integration_connections.provider", filters.provider);
  }

  // Apply event type filter
  if (filters.eventType) {
    query = query.eq("event_type", filters.eventType);
  }

  // Apply direction filter
  if (filters.direction) {
    query = query.eq("direction", filters.direction);
  }

  // Apply status filter
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  // Apply date range filter
  if (filters.startDate) {
    query = query.gte("received_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("received_at", filters.endDate);
  }

  // Apply error filter
  if (filters.hasError === "yes") {
    query = query.not("error_message", "is", null);
  } else if (filters.hasError === "no") {
    query = query.is("error_message", null);
  } else if (filters.hasError === "retry") {
    query = query.not("next_retry_at", "is", null);
  }

  // Order by received_at desc, id desc
  query = query.order("received_at", { ascending: false }).order("id", { ascending: false });

  // Fetch events
  const { data: events, error: eventsError } = await (query as any);

  if (eventsError) {
    console.error("Error fetching events:", eventsError);
  }

  // Transform events to include connection name
  const eventsWithConnection: IntegrationEventWithConnection[] = (events || []).map((event: any) => ({
    ...event,
    connection_name: event.integration_connections?.name,
    connection_provider: event.integration_connections?.provider,
    connection_status: event.integration_connections?.status,
    school_name: event.schools?.name,
  }));

  // Get summary statistics
  const summary = await getEventSummary(schoolId);

  const scopeLabel = getScopeLabel(schoolId, null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RadioTower className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Integration Events</h1>
            <p className="text-muted-foreground">
              Monitor provider activity, processing status, retries and failures.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/app/modules/integrations">
            <Button variant="secondary" size="sm">
              Open integrations
            </Button>
          </Link>
        </div>
      </div>

      {/* Scope indicator */}
      <div className="text-sm text-muted-foreground">
        {scopeLabel} events
      </div>

      {/* Summary cards */}
      <IntegrationEventSummary summary={summary} />

      {/* Filters */}
      <IntegrationEventFilters />

      {/* Event table */}
      <IntegrationEventTable events={eventsWithConnection} />
    </div>
  );
}
