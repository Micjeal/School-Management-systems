"use server";

// @ts-ignore - Supabase types for webhook_endpoints table not in generated types
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { validateWebhookEndpoint, validateWebhookURL, validateWebhookStatus } from "@/lib/webhooks/validation";
import { isValidEventType } from "@/lib/webhooks/event-types";
import type { UserContext } from "@/types/context";

function resolveTargetSchoolId(
  context: UserContext,
  requestedSchoolId: string | null,
): string | null {
  if (!context.is_platform_admin) {
    if (!context.active_school_id) {
      throw new Error("Select a school first.");
    }
    return context.active_school_id;
  }

  if (requestedSchoolId === null || requestedSchoolId === "__platform__") {
    return null;
  }

  return requestedSchoolId;
}

async function validateSchoolExists(supabase: Awaited<ReturnType<typeof createClient>>, schoolId: string): Promise<boolean> {
  const { data } = await supabase
    .from("schools")
    .select("id")
    .eq("id", schoolId)
    .maybeSingle();
  return !!data;
}

export async function createWebhookEndpointAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const eventTypes = formData.getAll("event_types") as string[];
  const status = formData.get("status") as string || "active";
  const requestedSchoolId = formData.get("school_id") as string | null;
  const secretReference = formData.get("secret_reference") as string | null;

  // Only platform admins can set secret reference
  const approvedSecretReference = context.is_platform_admin ? secretReference : null;

  // Validate all fields
  const validation = validateWebhookEndpoint({
    name,
    url,
    event_types: eventTypes,
    status,
    secret_reference: approvedSecretReference,
  });

  if (!validation.valid) {
    const error = validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
    redirect(`/app/modules/webhooks?error=${encodeURIComponent(error)}`);
  }

  // Resolve target school server-side
  const targetSchoolId = resolveTargetSchoolId(context, requestedSchoolId);

  // If a school was specified (not platform-wide), validate it exists
  if (targetSchoolId) {
    const supabase = await createClient();
    const schoolExists = await validateSchoolExists(supabase, targetSchoolId);
    if (!schoolExists) {
      redirect(`/app/modules/webhooks?error=${encodeURIComponent("Invalid school selected.")}`);
    }
  }

  const supabase = await createClient();

  // Insert only approved columns - system fields are managed by the database
  const { data, error } = await (supabase
    .from("webhook_endpoints")
    .insert({
      school_id: targetSchoolId,
      name,
      url,
      event_types: eventTypes,
      secret_reference: approvedSecretReference,
      status,
    } as any)
    .select("id")
    .single() as any);

  if (error) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/webhooks");
  redirect(`/app/modules/webhooks/${data.id}?message=${encodeURIComponent("Webhook endpoint created")}`);
}

export async function updateWebhookEndpointAction(endpointId: string, formData: FormData) {
  const context = await requireUserContext("settings.manage");
  
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const eventTypes = formData.getAll("event_types") as string[];
  const status = formData.get("status") as string;
  const currentVersion = parseInt(formData.get("version") as string, 10);
  const secretReference = formData.get("secret_reference") as string | null;

  // Only platform admins can modify secret reference
  const approvedSecretReference = context.is_platform_admin ? secretReference : null;

  // Validate all fields
  const validation = validateWebhookEndpoint({
    name,
    url,
    event_types: eventTypes,
    status,
    secret_reference: approvedSecretReference,
  });

  if (!validation.valid) {
    const error = validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
    redirect(`/app/modules/webhooks/${endpointId}?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();

  // Load existing endpoint to verify authorization
  const { data: existing, error: loadError } = await (supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent("Webhook endpoint not found.")}`);
  }

  // Verify caller can manage this endpoint's scope
  if ((existing as any)?.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if ((existing as any)?.school_id && (existing as any)?.school_id !== context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  // Update with optimistic concurrency using version
  const { data, error } = await (supabase as any)
    .from("webhook_endpoints")
    .update({
      name,
      url,
      event_types: eventTypes,
      status,
      secret_reference: approvedSecretReference,
      version: currentVersion + 1,
    })
    .eq("id", endpointId)
    .eq("version", currentVersion)
    .select("id, version")
    .maybeSingle();

  if (error || !data) {
    if (error?.code === "PGRST116") {
      // No row returned - version mismatch or endpoint changed
      redirect(`/app/modules/webhooks/${endpointId}?error=${encodeURIComponent("This webhook was changed by another user. Refresh and try again.")}`);
    }
    redirect(`/app/modules/webhooks/${endpointId}?error=${encodeURIComponent(error?.message || "Update failed")}`);
  }

  revalidatePath("/app/modules/webhooks");
  revalidatePath(`/app/modules/webhooks/${endpointId}`);
  redirect(`/app/modules/webhooks/${endpointId}?message=${encodeURIComponent("Webhook endpoint updated")}`);
}

export async function pauseWebhookEndpointAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const endpointId = formData.get("endpointId") as string;
  
  const supabase = await createClient();

  // Load existing endpoint
  const { data: existing, error: loadError } = await (supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent("Webhook endpoint not found.")}`);
  }

  // Verify authorization
  if ((existing as any)?.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if ((existing as any)?.school_id && (existing as any)?.school_id !== context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  // Update to paused
  const { error } = await (supabase as any)
    .from("webhook_endpoints")
    .update({ status: "paused" })
    .eq("id", endpointId);

  if (error) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/webhooks");
  revalidatePath(`/app/modules/webhooks/${endpointId}`);
  redirect(`/app/modules/webhooks/${endpointId}?message=${encodeURIComponent("Webhook endpoint paused")}`);
}

export async function resumeWebhookEndpointAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const endpointId = formData.get("endpointId") as string;
  
  const supabase = await createClient();

  // Load existing endpoint
  const { data: existing, error: loadError } = await (supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent("Webhook endpoint not found.")}`);
  }

  // Verify authorization
  if ((existing as any)?.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if ((existing as any)?.school_id && (existing as any)?.school_id !== context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  // Update to active
  const { error } = await (supabase as any)
    .from("webhook_endpoints")
    .update({ status: "active" })
    .eq("id", endpointId);

  if (error) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/webhooks");
  revalidatePath(`/app/modules/webhooks/${endpointId}`);
  redirect(`/app/modules/webhooks/${endpointId}?message=${encodeURIComponent("Webhook endpoint resumed")}`);
}

export async function disableWebhookEndpointAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const endpointId = formData.get("endpointId") as string;
  
  const supabase = await createClient();

  // Load existing endpoint
  const { data: existing, error: loadError } = await (supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent("Webhook endpoint not found.")}`);
  }

  // Verify authorization
  if ((existing as any)?.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if ((existing as any)?.school_id && (existing as any)?.school_id !== context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  // Update to disabled
  const { error } = await (supabase as any)
    .from("webhook_endpoints")
    .update({ status: "disabled" })
    .eq("id", endpointId);

  if (error) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/webhooks");
  revalidatePath(`/app/modules/webhooks/${endpointId}`);
  redirect(`/app/modules/webhooks/${endpointId}?message=${encodeURIComponent("Webhook endpoint disabled")}`);
}

export async function deleteWebhookEndpointAction(formData: FormData) {
  const context = await requireUserContext("settings.manage");
  const endpointId = formData.get("endpointId") as string;
  
  // Only platform super admins can permanently delete
  const isSuperAdmin = context.platform_roles.some((r) => r.code === "super_admin");
  if (!isSuperAdmin) {
    redirect(`/app/modules/webhooks/${endpointId}?error=${encodeURIComponent("Only platform super administrators may permanently delete webhooks. Use Pause or Disable instead.")}`);
  }
  
  const supabase = await createClient();

  // Load existing endpoint
  const { data: existing, error: loadError } = await (supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/webhooks?error=${encodeURIComponent("Webhook endpoint not found.")}`);
  }

  // Delete the endpoint (cascades to webhook_deliveries)
  const { error } = await (supabase
    .from("webhook_endpoints")
    .delete()
    .eq("id", endpointId) as any);

  if (error) {
    redirect(`/app/modules/webhooks/${endpointId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/webhooks");
  redirect(`/app/modules/webhooks?message=${encodeURIComponent("Webhook endpoint permanently deleted")}`);
}

export async function testWebhookEndpointAction(endpointId: string) {
  const context = await requireUserContext("settings.manage");
  
  const supabase = await createClient();

  // Load existing endpoint
  const { data: existing, error: loadError } = await (supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (loadError || !existing) {
    redirect(`/app/modules/webhooks/${endpointId}?error=${encodeURIComponent("Webhook endpoint not found.")}`);
  }

  // Verify authorization
  if ((existing as any)?.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if ((existing as any)?.school_id && (existing as any)?.school_id !== context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  // Call the webhook worker's test endpoint via RPC
  // This is a controlled server-side operation, not a direct browser fetch
  const { data, error } = await (supabase.rpc("test_webhook_endpoint", {
    p_endpoint_id: endpointId,
  } as any) as any);

  if (error) {
    redirect(`/app/modules/webhooks/${endpointId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/modules/webhooks");
  revalidatePath(`/app/modules/webhooks/${endpointId}`);
  
  const successMessage = (data as any)?.success 
    ? "Test webhook sent successfully" 
    : "Test webhook failed";
  
  redirect(`/app/modules/webhooks/${endpointId}?message=${encodeURIComponent(successMessage)}`);
}
