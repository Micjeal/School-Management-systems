"use server";

// @ts-ignore - Supabase types for integration_connections table not in generated types
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { resolveIntegrationScope, canManageIntegration } from "@/lib/integrations/scope";
import {
  validateIntegrationConnection,
  validateConfiguration,
  sanitizeConfiguration,
  containsSecretValues,
} from "@/lib/integrations/validation";
import { getProviderByCode } from "@/lib/integrations/providers";
import type { UserContext } from "@/types/context";

async function validateSchoolExists(supabase: Awaited<ReturnType<typeof createClient>>, schoolId: string): Promise<boolean> {
  const { data } = await supabase
    .from("schools")
    .select("id")
    .eq("id", schoolId)
    .maybeSingle();
  return !!data;
}

export async function createIntegrationAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");

  const name = formData.get("name") as string;
  const provider = formData.get("provider") as string;
  const requestedSchoolId = formData.get("school_id") as string | null;
  const configurationRaw = formData.get("configuration") as string | null;

  // Validate provider exists
  const providerDefinition = getProviderByCode(provider);
  if (!providerDefinition) {
    redirect(`/app/modules/integrations/new?error=${encodeURIComponent("Invalid provider selected.")}`);
  }

  // Check if provider is implemented
  if (!providerDefinition.implemented) {
    redirect(`/app/modules/integrations/new?error=${encodeURIComponent("This provider has not been implemented yet.")}`);
  }

  // Validate connection fields
  const validation = validateIntegrationConnection({
    name,
    provider,
  });

  if (!validation.valid) {
    const error = validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
    redirect(`/app/modules/integrations/new?error=${encodeURIComponent(error)}`);
  }

  // Parse and validate configuration
  let configuration: Record<string, unknown> = {};
  if (configurationRaw) {
    try {
      configuration = JSON.parse(configurationRaw);
    } catch {
      redirect(`/app/modules/integrations/new?error=${encodeURIComponent("Invalid configuration JSON.")}`);
    }

    // Check for secret values in configuration
    if (containsSecretValues(configuration)) {
      redirect(`/app/modules/integrations/new?error=${encodeURIComponent("Configuration must not contain secret values. Use secure credential storage instead.")}`);
    }

    // Validate configuration schema
    const configValidation = validateConfiguration(provider, configuration);
    if (!configValidation.success) {
      const error = configValidation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      redirect(`/app/modules/integrations/new?error=${encodeURIComponent(error)}`);
    }

    // Sanitize configuration (strip unknown keys)
    configuration = sanitizeConfiguration(provider, configuration);
  }

  // Resolve target school server-side
  const targetSchoolId = await resolveIntegrationScope(context, requestedSchoolId);

  // If a school was specified (not platform-wide), validate it exists
  if (targetSchoolId) {
    const supabase = await createClient();
    const schoolExists = await validateSchoolExists(supabase, targetSchoolId);
    if (!schoolExists) {
      redirect(`/app/modules/integrations/new?error=${encodeURIComponent("Invalid school selected.")}`);
    }
  }

  const supabase = await createClient();

  // Derive integration_type from provider
  const integrationType = providerDefinition.integrationType;

  // Insert with status = inactive (not active until tested)
  const { data, error } = await (supabase
    .from("integration_connections")
    .insert({
      school_id: targetSchoolId,
      provider,
      integration_type: integrationType,
      name,
      configuration,
      status: "inactive",
    } as any)
    .select("id")
    .single() as any);

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      redirect(`/app/modules/integrations/new?error=${encodeURIComponent("An integration with this provider, type and name already exists in this scope.")}`);
    }
    redirect(`/app/modules/integrations/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/integrations");
  redirect(`/app/modules/integrations/${data.id}?message=${encodeURIComponent("Integration created. Configure credentials and test to activate.")}`);
}

export async function updateIntegrationAction(connectionId: string, formData: FormData) {
  const context = await requireUserContext("settings.manage");

  const name = formData.get("name") as string;
  const configurationRaw = formData.get("configuration") as string | null;
  const currentVersion = parseInt(formData.get("version") as string, 10);

  const supabase = await createClient();

  // Load existing connection to verify authorization
  const { data: existing, error: loadError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration not found.")}`);
  }

  // Verify caller can manage this connection's scope
  if (!canManageIntegration(context, (existing as any)?.school_id)) {
    redirect("/access-denied");
  }

  // Validate name
  const validation = validateIntegrationConnection({ name, provider: (existing as any).provider });
  if (!validation.valid) {
    const error = validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
    redirect(`/app/modules/integrations/${connectionId}/edit?error=${encodeURIComponent(error)}`);
  }

  // Parse and validate configuration
  let configuration = (existing as any).configuration;
  if (configurationRaw) {
    try {
      configuration = JSON.parse(configurationRaw);
    } catch {
      redirect(`/app/modules/integrations/${connectionId}/edit?error=${encodeURIComponent("Invalid configuration JSON.")}`);
    }

    // Check for secret values in configuration
    if (containsSecretValues(configuration)) {
      redirect(`/app/modules/integrations/${connectionId}/edit?error=${encodeURIComponent("Configuration must not contain secret values.")}`);
    }

    // Validate configuration schema
    const configValidation = validateConfiguration((existing as any).provider, configuration);
    if (!configValidation.success) {
      const error = configValidation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      redirect(`/app/modules/integrations/${connectionId}/edit?error=${encodeURIComponent(error)}`);
    }

    // Sanitize configuration
    configuration = sanitizeConfiguration((existing as any).provider, configuration);
  }

  // Update with optimistic concurrency using version
  const { data, error } = await (supabase as any)
    .from("integration_connections")
    .update({
      name,
      configuration,
      version: currentVersion + 1,
    })
    .eq("id", connectionId)
    .eq("version", currentVersion)
    .select("id, version")
    .maybeSingle();

  if (error || !data) {
    if (error?.code === "PGRST116") {
      redirect(`/app/modules/integrations/${connectionId}/edit?error=${encodeURIComponent("This integration was changed by another administrator. Refresh and try again.")}`);
    }
    if (error?.code === "23505") {
      redirect(`/app/modules/integrations/${connectionId}/edit?error=${encodeURIComponent("An integration with this provider, type and name already exists in this scope.")}`);
    }
    redirect(`/app/modules/integrations/${connectionId}/edit?error=${encodeURIComponent(error?.message || "Update failed")}`);
  }

  revalidatePath("/app/modules/integrations");
  revalidatePath(`/app/modules/integrations/${connectionId}`);
  redirect(`/app/modules/integrations/${connectionId}?message=${encodeURIComponent("Integration updated")}`);
}

export async function testIntegrationAction(connectionId: string) {
  const context = await requireUserContext("settings.manage");

  const supabase = await createClient();

  // Load existing connection
  const { data: existing, error: loadError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration not found.")}`);
  }

  // Verify authorization
  if (!canManageIntegration(context, (existing as any)?.school_id)) {
    redirect("/access-denied");
  }

  // Check if provider is implemented
  const providerDefinition = getProviderByCode((existing as any).provider);
  if (!providerDefinition || !providerDefinition.implemented) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("This provider has not been implemented yet.")}`);
  }

  // Call the integration test RPC (to be implemented)
  // For now, return a placeholder error
  redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration testing not yet implemented. No provider adapter exists.")}`);
}

export async function activateIntegrationAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const connectionId = formData.get("connectionId") as string;

  const supabase = await createClient();

  // Load existing connection
  const { data: existing, error: loadError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration not found.")}`);
  }

  // Verify authorization
  if (!canManageIntegration(context, (existing as any)?.school_id)) {
    redirect("/access-denied");
  }

  // Update to active
  const { error } = await (supabase as any)
    .from("integration_connections")
    .update({ status: "active", last_error: null })
    .eq("id", connectionId);

  if (error) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/integrations");
  revalidatePath(`/app/modules/integrations/${connectionId}`);
  redirect(`/app/modules/integrations/${connectionId}?message=${encodeURIComponent("Integration activated")}`);
}

export async function disableIntegrationAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const connectionId = formData.get("connectionId") as string;

  const supabase = await createClient();

  // Load existing connection
  const { data: existing, error: loadError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration not found.")}`);
  }

  // Verify authorization
  if (!canManageIntegration(context, (existing as any)?.school_id)) {
    redirect("/access-denied");
  }

  // Update to disabled
  const { error } = await (supabase as any)
    .from("integration_connections")
    .update({ status: "disabled" })
    .eq("id", connectionId);

  if (error) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/integrations");
  revalidatePath(`/app/modules/integrations/${connectionId}`);
  redirect(`/app/modules/integrations/${connectionId}?message=${encodeURIComponent("Integration disabled")}`);
}

export async function reconnectIntegrationAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const connectionId = formData.get("connectionId") as string;

  const supabase = await createClient();

  // Load existing connection
  const { data: existing, error: loadError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration not found.")}`);
  }

  // Verify authorization
  if (!canManageIntegration(context, (existing as any)?.school_id)) {
    redirect("/access-denied");
  }

  // Check if provider supports OAuth
  const providerDefinition = getProviderByCode((existing as any).provider);
  if (!providerDefinition) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Invalid provider.")}`);
  }

  if (providerDefinition.supportsOAuth) {
    // Redirect to OAuth flow (to be implemented)
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("OAuth reconnection not yet implemented.")}`);
  } else {
    // For non-OAuth providers, prompt for credential rotation
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Credential rotation not yet implemented.")}`);
  }
}

export async function requestIntegrationSyncAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const connectionId = formData.get("connectionId") as string;

  const supabase = await createClient();

  // Load existing connection
  const { data: existing, error: loadError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration not found.")}`);
  }

  // Verify authorization
  if (!canManageIntegration(context, (existing as any)?.school_id)) {
    redirect("/access-denied");
  }

  // Check if provider supports outbound events
  const providerDefinition = getProviderByCode((existing as any).provider);
  if (!providerDefinition || !providerDefinition.supportsOutbound) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("This provider does not support synchronization.")}`);
  }

  // Enqueue a sync event
  const { error } = await (supabase
    .from("integration_events")
    .insert({
      school_id: (existing as any).school_id,
      integration_connection_id: connectionId,
      event_type: "integration.sync_requested",
      direction: "outbound",
      status: "queued",
      payload: {
        requested_by: context.user_id,
        mode: "incremental",
      },
      idempotency_key: `sync:${connectionId}:${Date.now()}`,
    } as any) as any);

  if (error) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/integrations");
  revalidatePath(`/app/modules/integrations/${connectionId}`);
  redirect(`/app/modules/integrations/${connectionId}?message=${encodeURIComponent("Sync request queued")}`);
}

export async function retryIntegrationEventAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const eventId = formData.get("eventId") as string;

  const supabase = await createClient();

  // Load the event
  const { data: event, error: loadError } = await (supabase
    .from("integration_events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle() as any);

  if (loadError || !event) {
    redirect(`/app/modules/integrations?error=${encodeURIComponent("Event not found.")}`);
  }

  // Load the connection to verify scope
  const { data: connection, error: connectionError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", (event as any).integration_connection_id)
    .maybeSingle() as any);

  if (connectionError || !connection) {
    redirect(`/app/modules/integrations?error=${encodeURIComponent("Associated integration not found.")}`);
  }

  // Verify authorization
  if (!canManageIntegration(context, (connection as any).school_id)) {
    redirect("/access-denied");
  }

  // Verify connection is active
  if ((connection as any).status !== "active") {
    redirect(`/app/modules/integrations?error=${encodeURIComponent("Integration must be active to retry events.")}`);
  }

  // Update event for retry
  const { error } = await (supabase as any)
    .from("integration_events")
    .update({
      status: "queued",
      next_retry_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", eventId);

  if (error) {
    redirect(`/app/modules/integrations?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/integrations");
  redirect(`/app/modules/integrations?message=${encodeURIComponent("Event queued for retry")}`);
}

export async function deleteIntegrationAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const connectionId = formData.get("connectionId") as string;

  // Only platform super admins can permanently delete
  const isSuperAdmin = context.platform_roles.some((r) => r.code === "super_admin");
  if (!isSuperAdmin) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Only platform super administrators may permanently delete integrations. Use Disable instead.")}`);
  }

  const supabase = await createClient();

  // Load existing connection
  const { data: existing, error: loadError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent("Integration not found.")}`);
  }

  // Delete the connection (integration_events will have connection_id set to NULL via ON DELETE SET NULL)
  const { error } = await (supabase
    .from("integration_connections")
    .delete()
    .eq("id", connectionId) as any);

  if (error) {
    redirect(`/app/modules/integrations/${connectionId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/integrations");
  redirect(`/app/modules/integrations?message=${encodeURIComponent("Integration permanently deleted")}`);
}
