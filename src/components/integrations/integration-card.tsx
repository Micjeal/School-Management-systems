"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntegrationStatusBadge } from "./integration-status-badge";
import { getProviderByCode } from "@/lib/integrations/providers";
import { getScopeLabel } from "@/lib/integrations/scope";
import type { IntegrationConnection } from "@/lib/integrations/types";

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

interface IntegrationCardProps {
  connection: IntegrationConnection;
  schoolName?: string;
}

export function IntegrationCard({
  connection,
  schoolName,
}: IntegrationCardProps) {
  const provider = getProviderByCode(connection.provider);
  const ProviderIcon = provider?.icon;

  const lastConnected = connection.last_connected_at
    ? formatDistanceToNow(new Date(connection.last_connected_at))
    : "Never connected";

  const scopeLabel = getScopeLabel(connection.school_id, schoolName);

  const typeLabels: Record<string, string> = {
    payments: "Payments",
    accounting: "Accounting",
    messaging: "Messaging",
    identity: "Identity",
    learning: "Learning",
    storage: "Storage",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {ProviderIcon && <ProviderIcon className="h-5 w-5 text-muted-foreground" />}
          <div>
            <CardTitle className="text-base">{connection.name}</CardTitle>
            <CardDescription className="text-xs">
              {provider?.name || connection.provider}
            </CardDescription>
          </div>
        </div>
        <IntegrationStatusBadge status={connection.status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{typeLabels[connection.integration_type] || connection.integration_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scope</span>
            <span>{scopeLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last connected</span>
            <span>{lastConnected}</span>
          </div>
          {connection.last_error && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last error</span>
              <span className="text-destructive">{connection.last_error}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/app/modules/integrations/${connection.id}`}>
            <Button variant="secondary" size="sm">
              View details
            </Button>
          </Link>
          <Link href={`/app/modules/integrations/${connection.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
