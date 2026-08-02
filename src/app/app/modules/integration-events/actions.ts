/**
 * Server actions for integration events
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { validateEventId } from "@/lib/integration-events/validation";
import type { RetryResult } from "@/lib/integration-events/types";

/**
 * Retry a failed or dead-letter integration event
 */
export async function retryIntegrationEventAction(formData: FormData): Promise<void> {
  const context = await requireUserContext("settings.manage");
  const supabase = await createClient();

  const eventIdStr = formData.get("eventId") as string;
  if (!eventIdStr) {
    redirect("/app/modules/integration-events?error=Missing event ID");
  }

  const eventId = validateEventId(eventIdStr);

  // Load the event
  const { data: event, error: eventError } = await (supabase
    .from("integration_events")
    .select("*")
    .eq("id", eventId)
    .single() as any);

  if (eventError || !event) {
    redirect("/app/modules/integration-events?error=Event not found");
  }

  // Verify scope access
  if (event.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if (event.school_id !== null && event.school_id !== context.active_school_id) {
    redirect("/access-denied");
  }

  // Check if event can be retried
  if (event.status !== "failed" && event.status !== "dead_letter") {
    redirect(`/app/modules/integration-events/${eventId}?error=Event cannot be retried in its current state`);
  }

  // Load the connection
  if (!event.integration_connection_id) {
    redirect(`/app/modules/integration-events/${eventId}?error=No connection associated with this event`);
  }

  const { data: connection, error: connectionError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", event.integration_connection_id)
    .single() as any);

  if (connectionError || !connection) {
    redirect(`/app/modules/integration-events/${eventId}?error=Connection not found`);
  }

  // Verify connection is active
  if (connection.status !== "active") {
    redirect(`/app/modules/integration-events/${eventId}?error=Connection must be active before retrying`);
  }

  // Check if integration worker exists
  // For now, we'll assume it doesn't exist since it hasn't been implemented yet
  const workerExists = false;
  if (!workerExists) {
    redirect(`/app/modules/integration-events/${eventId}?error=Integration processing has not been configured`);
  }

  // Queue the event for retry
  const { error: updateError } = await (supabase
    .from("integration_events")
    .update({
      status: "queued",
      next_retry_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", eventId) as any);

  if (updateError) {
    redirect(`/app/modules/integration-events/${eventId}?error=Failed to queue event for retry`);
  }

  revalidatePath("/app/modules/integration-events");
  revalidatePath(`/app/modules/integration-events/${eventId}`);
  redirect(`/app/modules/integration-events/${eventId}?message=Event queued for retry`);
}

/**
 * Get event summary statistics
 */
export async function getEventSummary(
  schoolId: string | null,
): Promise<{
  totalEvents: number;
  processing: number;
  failed: number;
  deadLetter: number;
  completionRate: number | null;
}> {
  const supabase = await createClient();

  let query = supabase.from("integration_events").select("status", { count: "exact", head: true });

  if (schoolId === null) {
    query = query.is("school_id", null);
  } else {
    query = query.eq("school_id", schoolId);
  }

  const { count: totalEvents } = await (query as any);

  const { count: processing } = await (supabase
    .from("integration_events")
    .select("status", { count: "exact", head: true })
    .in("status", ["received", "queued", "processing"])
    .filter("school_id", schoolId === null ? "is" : "eq", schoolId) as any);

  const { count: failed } = await (supabase
    .from("integration_events")
    .select("status", { count: "exact", head: true })
    .eq("status", "failed")
    .filter("school_id", schoolId === null ? "is" : "eq", schoolId) as any);

  const { count: deadLetter } = await (supabase
    .from("integration_events")
    .select("status", { count: "exact", head: true })
    .eq("status", "dead_letter")
    .filter("school_id", schoolId === null ? "is" : "eq", schoolId) as any);

  const { count: completed } = await (supabase
    .from("integration_events")
    .select("status", { count: "exact", head: true })
    .eq("status", "completed")
    .filter("school_id", schoolId === null ? "is" : "eq", schoolId) as any);

  const { count: ignored } = await (supabase
    .from("integration_events")
    .select("status", { count: "exact", head: true })
    .eq("status", "ignored")
    .filter("school_id", schoolId === null ? "is" : "eq", schoolId) as any);

  const terminalEvents = (completed || 0) + (ignored || 0) + (deadLetter || 0);
  const completionRate =
    terminalEvents > 0 ? Math.round(((completed || 0) / terminalEvents) * 100) : null;

  return {
    totalEvents: totalEvents || 0,
    processing: processing || 0,
    failed: failed || 0,
    deadLetter: deadLetter || 0,
    completionRate,
  };
}
