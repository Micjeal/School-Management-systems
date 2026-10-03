import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { canManageIntegration } from "@/lib/integrations/scope";
import { IntegrationStatusBadge } from "@/components/integrations/integration-status-badge";
import { IntegrationEventsTable } from "@/components/integrations/integration-events-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  TestTube,
  RefreshCw,
  Settings,
  Power,
  PowerOff,
  RotateCcw,
  Trash2
} from "lucide-react";
import { getProviderByCode } from "@/lib/integrations/providers";
import { getScopeLabel } from "@/lib/integrations/scope";
import type { IntegrationConnection, IntegrationEvent } from "@/lib/integrations/types";
import { isUuid } from "@/lib/auth/access-errors";
import Link from "next/link";
import {
  activateIntegrationAction,
  disableIntegrationAction,
  deleteIntegrationAction,
  reconnectIntegrationAction,
  requestIntegrationSyncAction,
  testIntegrationAction
} from "@/app/app/modules/integrations/actions";

export default async function IntegrationDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ connectionId: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [{ connectionId }, query] = await Promise.all([params, searchParams]);
  const context = await requireUserContext("settings.manage");
  if (!isUuid(connectionId)) notFound();

  const supabase = await createClient();

  // Load the connection
  let connectionQuery = supabase
    .from("integration_connections")
    .select(
      `
      id,school_id,provider,integration_type,name,status,configuration,last_connected_at,last_error,created_at,updated_at,version,
      schools(name)
      `
    )
    .eq("id", connectionId);
  connectionQuery = context.active_school_id
    ? connectionQuery.eq("school_id", context.active_school_id)
    : connectionQuery.is("school_id", null);
  const { data: connection, error: connectionError } = await (connectionQuery.maybeSingle() as any);

  if (connectionError || !connection) {
    notFound();
  }

  if (!canManageIntegration(context, connection.school_id)) notFound();

  const provider = getProviderByCode(connection.provider);
  const scopeLabel = getScopeLabel(connection.school_id, connection.schools?.name);

  // Load recent events
  const { data: events } = await (supabase
    .from("integration_events")
    .select("*")
    .eq("integration_connection_id", connectionId)
    .order("received_at", { ascending: false })
    .limit(20) as any);

  const typeLabels: Record<string, string> = {
    payments: "Payments",
    accounting: "Accounting",
    messaging: "Messaging",
    identity: "Identity",
    learning: "Learning",
    storage: "Storage"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href="/app/modules/integrations"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
          <div>
            <h1 className="text-2xl font-bold">{connection.name}</h1>
            <p className="text-muted-foreground">{provider?.name || connection.provider}</p>
          </div>
        </div>
        <IntegrationStatusBadge status={connection.status} />
      </div>

      {/* Messages */}
      {query.message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded">
          {query.message}
        </div>
      )}
      {query.error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {query.error}
        </div>
      )}

      {/* Connection summary */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Provider: </span>
              {provider?.name || connection.provider}
            </div>
            <div>
              <span className="text-muted-foreground">Type: </span>
              {typeLabels[connection.integration_type] || connection.integration_type}
            </div>
            <div>
              <span className="text-muted-foreground">Scope: </span>
              {scopeLabel}
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              <IntegrationStatusBadge status={connection.status} />
            </div>
            <div>
              <span className="text-muted-foreground">Last connected: </span>
              {connection.last_connected_at
                ? new Date(connection.last_connected_at).toLocaleString()
                : "Never connected"}
            </div>
            <div>
              <span className="text-muted-foreground">Last error: </span>
              {connection.last_error ? (
                <span className="text-destructive">{connection.last_error}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {!provider?.implemented ? (
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              This provider is unavailable because no credential loader and processing adapter are
              implemented. Existing configuration may be inspected or disabled, but it cannot be
              activated, tested, reconnected, or synchronized.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {provider?.implemented && connection.status === "active" && (
              <form action={testIntegrationAction.bind(null, connectionId)}>
                <input type="hidden" name="connectionId" value={connectionId} />
                <Button type="submit" variant="secondary" size="sm">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test connection
                </Button>
              </form>
            )}
            {provider?.implemented &&
              connection.status === "active" &&
              provider.supportsOutbound && (
                <form action={requestIntegrationSyncAction}>
                  <input type="hidden" name="connectionId" value={connectionId} />
                  <Button type="submit" variant="secondary" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync now
                  </Button>
                </form>
              )}
            <Button variant="secondary" size="sm" asChild><Link href={`/app/modules/integrations/${connectionId}/edit`}><Settings className="h-4 w-4 mr-2" />Edit settings</Link></Button>
            {provider?.implemented && connection.status === "inactive" && (
              <form action={activateIntegrationAction}>
                <input type="hidden" name="connectionId" value={connectionId} />
                <Button type="submit" variant="secondary" size="sm">
                  <Power className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              </form>
            )}
            {connection.status === "active" && (
              <form action={disableIntegrationAction}>
                <input type="hidden" name="connectionId" value={connectionId} />
                <Button type="submit" variant="secondary" size="sm">
                  <PowerOff className="h-4 w-4 mr-2" />
                  Disable
                </Button>
              </form>
            )}
            {provider?.implemented && connection.status === "error" && (
              <form action={reconnectIntegrationAction}>
                <input type="hidden" name="connectionId" value={connectionId} />
                <Button type="submit" variant="secondary" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reconnect
                </Button>
              </form>
            )}
            {context.platform_roles.some((r) => r.code === "super_admin") && (
              <form action={deleteIntegrationAction}>
                <input type="hidden" name="connectionId" value={connectionId} />
                <Button type="submit" variant="danger" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-50 p-4 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(connection.configuration, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Recent events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationEventsTable events={events || []} />
        </CardContent>
      </Card>

      {/* Audit information */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created: </span>
              {new Date(connection.created_at).toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">Updated: </span>
              {new Date(connection.updated_at).toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">Version: </span>
              {connection.version}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
