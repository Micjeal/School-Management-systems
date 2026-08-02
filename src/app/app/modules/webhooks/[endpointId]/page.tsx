import { notFound, redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { WebhookStatusBadge } from "@/components/webhooks/webhook-status-badge";
import { WebhookDeliveries } from "@/components/webhooks/webhook-deliveries";
import { Button } from "@/components/ui/button";
import { WEBHOOK_EVENT_TYPES } from "@/lib/webhooks/event-types";
import {
  pauseWebhookEndpointAction,
  resumeWebhookEndpointAction,
  disableWebhookEndpointAction,
  deleteWebhookEndpointAction,
  testWebhookEndpointAction,
} from "../actions";

export default async function WebhookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ endpointId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const context = await requireUserContext("settings.manage");
  const { endpointId } = await params;
  const queryParams = await searchParams;
  const supabase = await createClient();

  // Load endpoint with RLS - will return null if user cannot access it
  const { data: endpoint, error } = await (supabase
    .from("webhook_endpoints")
    .select(`
      *,
      schools(name)
    `)
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (error || !endpoint) {
    notFound();
  }

  // Verify authorization matches RLS
  if ((endpoint as any)?.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if ((endpoint as any)?.school_id && (endpoint as any)?.school_id !== context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  // Load delivery history
  const { data: deliveries } = await (supabase
    .from("webhook_deliveries")
    .select(`
      *,
      outbox_events(event_type)
    `)
    .eq("webhook_endpoint_id", endpointId)
    .order("created_at", { ascending: false })
    .limit(50) as any);

  // Load schools for platform admin
  let schools: Array<{ id: string; name: string }> = [];
  if (context.is_platform_admin) {
    const { data: schoolsData } = await supabase
      .from("schools")
      .select("id, name")
      .eq("status", "active")
      .order("name");
    schools = schoolsData || [];
  }

  return (
    <div>
      <PageHeader
        title={endpoint.name}
        description="Webhook endpoint configuration and delivery history"
      />

      {queryParams.message && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          {queryParams.message}
        </div>
      )}

      {queryParams.error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {queryParams.error}
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => redirect(`/app/modules/webhooks/${endpointId}/edit`)}
        >
          Edit
        </Button>
        {endpoint.status === "active" && (
          <form action={pauseWebhookEndpointAction}>
            <input type="hidden" name="endpointId" value={endpointId} />
            <Button type="submit" variant="secondary">
              Pause
            </Button>
          </form>
        )}
        {endpoint.status === "paused" && (
          <form action={resumeWebhookEndpointAction}>
            <input type="hidden" name="endpointId" value={endpointId} />
            <Button type="submit" variant="secondary">
              Resume
            </Button>
          </form>
        )}
        {endpoint.status !== "disabled" && (
          <form action={disableWebhookEndpointAction}>
            <input type="hidden" name="endpointId" value={endpointId} />
            <Button type="submit" variant="danger">
              Disable
            </Button>
          </form>
        )}
        <form action={testWebhookEndpointAction}>
          <input type="hidden" name="endpointId" value={endpointId} />
          <Button type="submit" variant="secondary">
            Send test event
          </Button>
        </form>
        {context.is_platform_admin && (
          <form action={deleteWebhookEndpointAction}>
            <input type="hidden" name="endpointId" value={endpointId} />
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
        )}
      </div>

      {/* Configuration */}
      <Card className="mb-6 p-6">
        <h2 className="text-lg font-semibold mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Name</div>
            <div className="font-medium">{endpoint.name}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Scope</div>
            <div className="font-medium">
              {(endpoint as any)?.school_id === null ? (
                "Platform-wide"
              ) : (
                (endpoint as any)?.schools?.name || "Unknown School"
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">URL</div>
            <div className="font-medium font-mono text-sm">{endpoint.url}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Status</div>
            <div>
              <WebhookStatusBadge status={endpoint.status} />
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Failure Count</div>
            <div className={`font-medium ${endpoint.failure_count > 0 ? "text-red-600" : ""}`}>
              {endpoint.failure_count}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Last Success</div>
            <div className="font-medium">
              {endpoint.last_success_at
                ? new Date(endpoint.last_success_at).toLocaleString()
                : "Never"}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Last Failure</div>
            <div className="font-medium">
              {endpoint.last_failure_at
                ? new Date(endpoint.last_failure_at).toLocaleString()
                : "Never"}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Version</div>
            <div className="font-medium">{endpoint.version}</div>
          </div>
        </div>
      </Card>

      {/* Subscribed Events */}
      <Card className="mb-6 p-6">
        <h2 className="text-lg font-semibold mb-4">Subscribed Events</h2>
        <div className="flex flex-wrap gap-2">
          {endpoint.event_types.map((eventType) => {
            const eventInfo = WEBHOOK_EVENT_TYPES.find((e) => e.code === eventType);
            return (
              <span
                key={eventType}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
              >
                {eventInfo?.label || eventType}
                <span className="ml-2 text-xs text-blue-500">
                  ({eventInfo?.scope || "unknown"})
                </span>
              </span>
            );
          })}
        </div>
      </Card>

      {/* Delivery History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Delivery History</h2>
        <WebhookDeliveries
          deliveries={(deliveries || []).map((d: any) => ({
            ...d,
            event_type: d.outbox_events?.event_type,
          }))}
        />
      </Card>
    </div>
  );
}
