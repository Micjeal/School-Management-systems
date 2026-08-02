import { notFound, redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { WebhookForm } from "@/components/webhooks/webhook-form";

export default async function WebhookEditPage({
  params,
}: {
  params: Promise<{ endpointId: string }>;
}) {
  const context = await requireUserContext("settings.manage");
  const { endpointId } = await params;
  const supabase = await createClient();

  // Load endpoint with RLS
  const { data: endpoint, error } = await (supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", endpointId)
    .maybeSingle() as any);

  if (error || !endpoint) {
    notFound();
  }

  // Verify authorization
  if ((endpoint as any)?.school_id === null && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  if ((endpoint as any)?.school_id && (endpoint as any)?.school_id !== context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

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
        title={`Edit ${endpoint.name}`}
        description="Update webhook endpoint configuration"
      />
      <div className="max-w-2xl">
        <WebhookForm
          endpoint={endpoint}
          isPlatformAdmin={context.is_platform_admin}
          activeSchoolId={context.active_school_id}
          schools={schools}
        />
      </div>
    </div>
  );
}
