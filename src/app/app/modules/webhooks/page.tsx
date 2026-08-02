import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { WebhookTable } from "@/components/webhooks/webhook-table";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  pauseWebhookEndpointAction,
  resumeWebhookEndpointAction,
  disableWebhookEndpointAction,
  deleteWebhookEndpointAction,
} from "./actions";

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const context = await requireUserContext("settings.manage");
  const queryParams = await searchParams;
  const supabase = await createClient();

  // Get filter values from query params
  const search = queryParams.q || "";
  const statusFilter = queryParams.status || "";
  const scopeFilter = queryParams.scope || "";
  const healthFilter = queryParams.health || "";

  // Build query with filters
  let query = supabase
    .from("webhook_endpoints")
    .select(`
      *,
      schools(name)
    `);

  // Apply RLS-based filtering - non-platform admins only see their school's endpoints
  if (!context.is_platform_admin && context.active_school_id) {
    query = query.eq("school_id", context.active_school_id);
  }

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,url.ilike.%${search}%`);
  }

  // Apply status filter
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  // Apply scope filter
  if (scopeFilter === "platform") {
    query = query.is("school_id", null);
  } else if (scopeFilter === "school") {
    query = query.not("school_id", "is", null);
  }

  const { data: endpoints, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading webhook endpoints:", error);
  }

  // Calculate summary statistics
  const activeEndpoints = endpoints?.filter((e) => e.status === "active").length || 0;
  const pausedEndpoints = endpoints?.filter((e) => e.status === "paused").length || 0;

  // Load delivery statistics
  const { data: deliveries } = await supabase
    .from("webhook_deliveries")
    .select("status")
    .in(
      "webhook_endpoint_id",
      endpoints?.map((e) => e.id) || []
    );

  const failedDeliveries = deliveries?.filter((d) => d.status === "failed" || d.status === "dead_letter").length || 0;
  const totalDeliveries = deliveries?.length || 0;
  const successfulDeliveries = deliveries?.filter((d) => d.status === "delivered").length || 0;

  const successRate = totalDeliveries > 0
    ? Math.round((successfulDeliveries / totalDeliveries) * 100)
    : null;

  // Load schools for platform admin scope selector
  let schools: Array<{ id: string; name: string }> = [];
  if (context.is_platform_admin) {
    const { data: schoolsData } = await supabase
      .from("schools")
      .select("id, name")
      .eq("status", "active")
      .order("name");
    schools = schoolsData || [];
  }

  // Apply health filter client-side
  let filteredEndpoints = endpoints || [];
  if (healthFilter === "healthy") {
    filteredEndpoints = filteredEndpoints.filter((e) => e.failure_count === 0);
  } else if (healthFilter === "has_failures") {
    filteredEndpoints = filteredEndpoints.filter((e) => e.failure_count > 0);
  } else if (healthFilter === "never_delivered") {
    filteredEndpoints = filteredEndpoints.filter((e) => !e.last_success_at && !e.last_failure_at);
  }

  return (
    <div>
      <PageHeader
        title="Webhooks"
        description="Manage outbound event subscriptions and monitor delivery health."
        actionHref="/app/modules/webhooks/new"
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

      {/* Scope indicator for school users */}
      {!context.is_platform_admin && context.active_school && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <strong>{context.active_school.name}</strong> webhooks
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Active endpoints</div>
          <div className="text-2xl font-bold text-slate-900">{activeEndpoints}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Paused endpoints</div>
          <div className="text-2xl font-bold text-slate-900">{pausedEndpoints}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Failed deliveries</div>
          <div className="text-2xl font-bold text-red-600">{failedDeliveries}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Delivery success rate</div>
          <div className="text-2xl font-bold text-slate-900">
            {successRate !== null ? `${successRate}%` : "No activity"}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <form className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            name="q"
            defaultValue={search}
            placeholder="Name or URL"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={statusFilter}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="disabled">Disabled</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="scope">Scope</Label>
          <Select id="scope" name="scope" defaultValue={scopeFilter}>
            <option value="">All</option>
            <option value="platform">Platform</option>
            <option value="school">School</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="health">Health</Label>
          <Select id="health" name="health" defaultValue={healthFilter}>
            <option value="">All</option>
            <option value="healthy">Healthy</option>
            <option value="has_failures">Has failures</option>
            <option value="never_delivered">Never delivered</option>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Apply filters
          </Button>
        </div>
      </form>

      {/* Webhook Table */}
      <WebhookTable
        endpoints={filteredEndpoints.map((e) => ({
          ...e,
          school_name: e.schools?.name,
        }))}
        isPlatformAdmin={context.is_platform_admin}
      />
    </div>
  );
}
