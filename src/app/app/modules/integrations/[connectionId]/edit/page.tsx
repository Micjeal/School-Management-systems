import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { canManageIntegration } from "@/lib/integrations/scope";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getProviderByCode } from "@/lib/integrations/providers";

export default async function EditIntegrationPage({
  params,
  searchParams,
}: {
  params: { connectionId: string };
  searchParams: { message?: string; error?: string };
}) {
  const context = await requireUserContext("settings.manage");

  const supabase = await createClient();

  // Load the connection
  const { data: connection, error: connectionError } = await (supabase
    .from("integration_connections")
    .select("*")
    .eq("id", params.connectionId)
    .maybeSingle() as any);

  if (connectionError || !connection) {
    notFound();
  }

  // Verify authorization
  if (!canManageIntegration(context, connection.school_id)) {
    redirect("/access-denied");
  }

  const provider = getProviderByCode(connection.provider);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" href={`/app/modules/integrations/${params.connectionId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Integration</h1>
          <p className="text-muted-foreground">
            {connection.name}
          </p>
        </div>
      </div>

      {/* Messages */}
      {searchParams.message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded">
          {searchParams.message}
        </div>
      )}
      {searchParams.error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {searchParams.error}
        </div>
      )}

      {/* Edit form */}
      <form action="/app/modules/integrations/actions" method="POST">
        <input type="hidden" name="connectionId" value={params.connectionId} />
        <input type="hidden" name="version" value={connection.version} />

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Display name</label>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={connection.name}
            className="border rounded px-3 py-2 w-full max-w-md"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A descriptive name for this integration (2-100 characters).
          </p>
        </div>

        {/* Provider (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Provider</label>
          <input
            type="text"
            value={provider?.name || connection.provider}
            disabled
            className="border rounded px-3 py-2 w-full max-w-md bg-slate-50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provider cannot be changed after creation.
          </p>
        </div>

        {/* Integration type (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Type</label>
          <input
            type="text"
            value={connection.integration_type}
            disabled
            className="border rounded px-3 py-2 w-full max-w-md bg-slate-50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Integration type is derived from the provider.
          </p>
        </div>

        {/* Configuration */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Configuration</label>
          <textarea
            name="configuration"
            defaultValue={JSON.stringify(connection.configuration, null, 2)}
            className="border rounded px-3 py-2 w-full max-w-md font-mono text-sm"
            rows={8}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provider-specific configuration in JSON format. Do not include secrets or API keys.
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Save changes
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => redirect(`/app/modules/integrations/${params.connectionId}`)}
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Changes will be applied with optimistic concurrency control. If another administrator
          modifies this integration simultaneously, you will be asked to refresh and try again.
        </p>
      </form>
    </div>
  );
}
