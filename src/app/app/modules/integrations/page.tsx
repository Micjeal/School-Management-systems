import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { IntegrationHealthCard } from "@/components/integrations/integration-health-card";
import { IntegrationTable } from "@/components/integrations/integration-table";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import type { IntegrationConnection, IntegrationHealth } from "@/lib/integrations/types";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; health?: string }>;
}) {
  const context = await requireUserContext("settings.manage");
  const params = await searchParams;

  // Platform admins need to select a school or be in platform view
  if (!context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  const supabase = await createClient();

  // Determine scope based on user role and selection
  const scopeFilter = context.is_platform_admin && !context.active_school_id
    ? { school_id: null }
    : { school_id: context.active_school_id };

  // Build query
  let query = supabase
    .from("integration_connections")
    .select(`
      *,
      schools(name)
    `);

  // Apply scope filter
  if (scopeFilter.school_id === null) {
    query = query.is("school_id", null);
  } else if (scopeFilter.school_id) {
    query = query.eq("school_id", scopeFilter.school_id);
  }

  // Apply status filter
  if (params.status) {
    query = query.eq("status", params.status);
  }

  // Apply type filter
  if (params.type) {
    query = query.eq("integration_type", params.type);
  }

  // Fetch connections
  const { data: connections, error: connectionsError } = await (query as any);

  if (connectionsError) {
    console.error("Error fetching connections:", connectionsError);
  }

  // Fetch schools for platform admin scope selector
  let schools = [];
  if (context.is_platform_admin) {
    const { data: schoolsData } = await supabase
      .from("schools")
      .select("id, name")
      .eq("status", "active");
    schools = schoolsData || [];
  }

  // Calculate health metrics
  const health: IntegrationHealth = {
    activeConnections: (connections || []).filter((c: any) => c.status === "active").length,
    errorConnections: (connections || []).filter((c: any) => c.status === "error" || c.last_error).length,
    inboundEvents: 0, // Would need to fetch from integration_events
    failedEvents: 0, // Would need to fetch from integration_events
    hasActivity: false, // Would need to check if events exist
  };

  // Apply health filter if specified
  let filteredConnections = connections || [];
  if (params.health === "healthy") {
    filteredConnections = filteredConnections.filter((c: any) => c.status === "active" && !c.last_error);
  } else if (params.health === "errors") {
    filteredConnections = filteredConnections.filter((c: any) => c.status === "error" || c.last_error);
  } else if (params.health === "never_connected") {
    filteredConnections = filteredConnections.filter((c: any) => !c.last_connected_at);
  } else if (params.health === "disabled") {
    filteredConnections = filteredConnections.filter((c: any) => c.status === "disabled");
  }

  // Add school name to connections
  const connectionsWithSchoolNames = filteredConnections.map((c: any) => ({
    ...c,
    school_name: c.schools?.name,
  }));

  const scopeLabel = context.is_platform_admin && !context.active_school_id
    ? "Platform"
    : context.memberships.find((m) => m.school_id === context.active_school_id)?.school_name || "Unknown School";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect SchoolDB to approved external services and monitor synchronization health.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/app/modules/integrations/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add integration
            </Button>
          </Link>
        </div>
      </div>

      {/* Scope indicator */}
      <div className="text-sm text-muted-foreground">
        {scopeLabel} integrations
      </div>

      {/* Health summary */}
      <IntegrationHealthCard health={health} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          className="border rounded px-3 py-2 text-sm"
          defaultValue={params.status || ""}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
          <option value="disabled">Disabled</option>
        </select>
        <select
          className="border rounded px-3 py-2 text-sm"
          defaultValue={params.type || ""}
        >
          <option value="">All types</option>
          <option value="payments">Payments</option>
          <option value="accounting">Accounting</option>
          <option value="messaging">Messaging</option>
          <option value="identity">Identity</option>
          <option value="learning">Learning</option>
          <option value="storage">Storage</option>
        </select>
        <select
          className="border rounded px-3 py-2 text-sm"
          defaultValue={params.health || ""}
        >
          <option value="">All health</option>
          <option value="healthy">Healthy</option>
          <option value="never_connected">Never connected</option>
          <option value="errors">Has errors</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Connection list */}
      {connectionsWithSchoolNames.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="text-muted-foreground mb-4">
            No integrations configured
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Connect SchoolDB to an approved external service to exchange data securely.
          </p>
          <Link href="/app/modules/integrations/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add integration
            </Button>
          </Link>
        </div>
      ) : (
        <IntegrationTable connections={connectionsWithSchoolNames} />
      )}
    </div>
  );
}
