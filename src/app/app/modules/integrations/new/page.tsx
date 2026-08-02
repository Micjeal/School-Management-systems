import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { ProviderPicker } from "@/components/integrations/provider-picker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getProviderByCode } from "@/lib/integrations/providers";
import { createIntegrationAction } from "../actions";
import type { IntegrationProviderDefinition } from "@/lib/integrations/providers";

export default async function NewIntegrationPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; error?: string }>;
}) {
  const context = await requireUserContext("settings.manage");
  const params = await searchParams;

  // Platform admins need to select a school or be in platform view
  if (!context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  const supabase = await createClient();

  // Fetch schools for platform admin scope selector
  let schools: Array<{ id: string; name: string }> = [];
  if (context.is_platform_admin) {
    const { data: schoolsData } = await supabase
      .from("schools")
      .select("id, name")
      .eq("status", "active");
    schools = schoolsData || [];
  }

  const selectedProvider = params.provider ? getProviderByCode(params.provider) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/modules/integrations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Integration</h1>
          <p className="text-muted-foreground">
            Connect SchoolDB to an approved external service.
          </p>
        </div>
      </div>

      {/* Error message */}
      {params.error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {params.error}
        </div>
      )}

      {!selectedProvider ? (
        /* Provider selection step */
        <div>
          <h2 className="text-lg font-semibold mb-4">Select a provider</h2>
          <ProviderPicker selectedProvider={params.provider} />
        </div>
      ) : (
        /* Configuration form step */
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Configure {selectedProvider.name}
          </h2>

          <form action={createIntegrationAction}>
            <input type="hidden" name="provider" value={selectedProvider.code} />

            {/* Scope selector for platform admins */}
            {context.is_platform_admin && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Scope</label>
                <select
                  name="school_id"
                  className="border rounded px-3 py-2 w-full max-w-md"
                  defaultValue={context.active_school_id || "__platform__"}
                >
                  <option value="__platform__">Platform-wide</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Platform-wide integrations are available to all schools.
                </p>
              </div>
            )}

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Display name</label>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={100}
                className="border rounded px-3 py-2 w-full max-w-md"
                placeholder="e.g., Victoria School Mobile Money"
              />
              <p className="text-xs text-muted-foreground mt-1">
                A descriptive name for this integration (2-100 characters).
              </p>
            </div>

            {/* Provider-specific configuration */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Configuration</label>
              <textarea
                name="configuration"
                className="border rounded px-3 py-2 w-full max-w-md font-mono text-sm"
                rows={6}
                placeholder='{"environment": "sandbox", "currency": "UGX"}'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provider-specific configuration in JSON format. Do not include secrets or API keys.
              </p>
            </div>

            {/* Integration type (read-only, derived from provider) */}
            <input
              type="hidden"
              name="integration_type"
              value={selectedProvider.integrationType}
            />

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Create integration
              </Button>
              <Link href="/app/modules/integrations/new">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              The integration will be created as inactive. After creation, you will need to configure
              credentials securely and test the connection before activating it.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
