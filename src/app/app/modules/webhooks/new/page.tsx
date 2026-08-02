import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { WebhookForm } from "@/components/webhooks/webhook-form";

export default async function WebhookNewPage() {
  const context = await requireUserContext("settings.manage");
  const supabase = await createClient();

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
        title="Create Webhook Endpoint"
        description="Configure a new outbound webhook subscription"
      />
      <div className="max-w-2xl">
        <WebhookForm
          isPlatformAdmin={context.is_platform_admin}
          activeSchoolId={context.active_school_id}
          schools={schools}
        />
      </div>
    </div>
  );
}
