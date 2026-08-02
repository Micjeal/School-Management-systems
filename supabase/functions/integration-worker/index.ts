import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get secret keys from environment
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (!secretKeysRaw) {
      throw new Error("SUPABASE_SECRET_KEYS not configured");
    }

    const secretKeys = JSON.parse(secretKeysRaw);
    const serviceKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceKey) {
      throw new Error("Service role key not available");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Claim queued events
    const { data: events, error: claimError } = await supabase.rpc(
      "claim_integration_events",
      { p_batch_size: 10 }
    );

    if (claimError) {
      console.error("Error claiming events:", claimError);
      return new Response(
        JSON.stringify({ error: "Failed to claim events" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: "No events to process" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process each event
    const results = [];
    for (const event of events) {
      try {
        // Load integration connection
        const { data: connection, error: connectionError } = await supabase
          .from("integration_connections")
          .select("*")
          .eq("id", event.integration_connection_id)
          .single();

        if (connectionError || !connection) {
          console.error(`Connection not found for event ${event.id}:`, connectionError);
          await markEventFailed(supabase, event.id, "Connection not found");
          results.push({ eventId: event.id, success: false, error: "Connection not found" });
          continue;
        }

        // Check if connection is active
        if (connection.status !== "active") {
          console.error(`Connection ${connection.id} is not active, skipping event ${event.id}`);
          await markEventIgnored(supabase, event.id, "Connection not active");
          results.push({ eventId: event.id, success: false, error: "Connection not active" });
          continue;
        }

        // Get provider adapter (not implemented yet)
        const providerAdapter = getProviderAdapter(connection.provider);
        if (!providerAdapter) {
          console.error(`No adapter implemented for provider ${connection.provider}`);
          await markEventFailed(supabase, event.id, "Provider not implemented");
          results.push({ eventId: event.id, success: false, error: "Provider not implemented" });
          continue;
        }

        // Load credentials from secure storage (not implemented yet)
        const credentials = await loadCredentials(supabase, connection.id);
        if (!credentials) {
          console.error(`No credentials found for connection ${connection.id}`);
          await markEventFailed(supabase, event.id, "Credentials not configured");
          results.push({ eventId: event.id, success: false, error: "Credentials not configured" });
          continue;
        }

        // Process event based on direction
        let processResult;
        if (event.direction === "inbound") {
          if (!providerAdapter.processInboundEvent) {
            await markEventIgnored(supabase, event.id, "Inbound processing not supported");
            results.push({ eventId: event.id, success: false, error: "Inbound processing not supported" });
            continue;
          }
          processResult = await providerAdapter.processInboundEvent(event, connection, credentials);
        } else {
          if (!providerAdapter.processOutboundEvent) {
            await markEventIgnored(supabase, event.id, "Outbound processing not supported");
            results.push({ eventId: event.id, success: false, error: "Outbound processing not supported" });
            continue;
          }
          processResult = await providerAdapter.processOutboundEvent(event, connection, credentials);
        }

        // Handle result
        if (processResult.success) {
          await markEventCompleted(supabase, event.id);
          await updateConnectionHealth(supabase, connection.id, null);
          results.push({ eventId: event.id, success: true });
        } else {
          // Determine if should retry
          const shouldRetry = processResult.shouldRetry !== false && event.retry_count < 5;
          const retryDelay = processResult.retryDelay || calculateRetryDelay(event.retry_count);

          if (shouldRetry) {
            await markEventForRetry(supabase, event.id, processResult.error, retryDelay);
            await updateConnectionHealth(supabase, connection.id, processResult.error);
            results.push({ eventId: event.id, success: false, error: processResult.error, willRetry: true });
          } else {
            await markEventDeadLetter(supabase, event.id, processResult.error);
            await updateConnectionHealth(supabase, connection.id, processResult.error);
            results.push({ eventId: event.id, success: false, error: processResult.error, willRetry: false });
          }
        }
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
        await markEventForRetry(supabase, event.id, error.message, 60); // Retry after 1 minute on unexpected error
        results.push({ eventId: event.id, success: false, error: error.message, willRetry: true });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Worker error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper functions

function getProviderAdapter(providerCode: string) {
  // No providers are implemented yet
  // When implemented, this would return the appropriate adapter
  return null;
}

async function loadCredentials(supabase: any, connectionId: string) {
  // Not implemented yet - would load from secure storage
  return null;
}

function calculateRetryDelay(retryCount: number): number {
  const delays = [0, 60, 300, 1800, 7200]; // 0, 1min, 5min, 30min, 2hrs
  return delays[Math.min(retryCount, delays.length - 1)] * 1000;
}

async function markEventCompleted(supabase: any, eventId: number) {
  await supabase
    .from("integration_events")
    .update({
      status: "completed",
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventId);
}

async function markEventFailed(supabase: any, eventId: number, errorMessage: string) {
  await supabase
    .from("integration_events")
    .update({
      status: "failed",
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventId);
}

async function markEventIgnored(supabase: any, eventId: number, reason: string) {
  await supabase
    .from("integration_events")
    .update({
      status: "ignored",
      error_message: reason,
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventId);
}

async function markEventForRetry(supabase: any, eventId: number, errorMessage: string, delaySeconds: number) {
  const nextRetryAt = new Date(Date.now() + delaySeconds * 1000).toISOString();
  await supabase
    .from("integration_events")
    .update({
      status: "queued",
      error_message: errorMessage,
      retry_count: supabase.rpc("increment_retry_count", { p_event_id: eventId }),
      next_retry_at: nextRetryAt,
    })
    .eq("id", eventId);
}

async function markEventDeadLetter(supabase: any, eventId: number, errorMessage: string) {
  await supabase
    .from("integration_events")
    .update({
      status: "dead_letter",
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventId);
}

async function updateConnectionHealth(supabase: any, connectionId: string, error: string | null) {
  if (error) {
    await supabase
      .from("integration_connections")
      .update({
        status: "error",
        last_error: error,
      })
      .eq("id", connectionId);
  } else {
    await supabase
      .from("integration_connections")
      .update({
        last_connected_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", connectionId);
  }
}
