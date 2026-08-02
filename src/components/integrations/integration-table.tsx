"use client";

import Link from "next/link";
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

interface IntegrationTableProps {
  connections: Array<IntegrationConnection & { school_name?: string }>;
}

export function IntegrationTable({
  connections,
}: IntegrationTableProps) {
  const typeLabels: Record<string, string> = {
    payments: "Payments",
    accounting: "Accounting",
    messaging: "Messaging",
    identity: "Identity",
    learning: "Learning",
    storage: "Storage",
  };

  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No integrations found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => {
        const provider = getProviderByCode(connection.provider);
        const lastConnected = connection.last_connected_at
          ? formatDistanceToNow(new Date(connection.last_connected_at))
          : "Never connected";
        const scopeLabel = getScopeLabel(connection.school_id, connection.school_name);

        return (
          <div key={connection.id} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-sm">
              <div className="font-medium">{connection.name}</div>
              <div>{provider?.name || connection.provider}</div>
              <div>{typeLabels[connection.integration_type] || connection.integration_type}</div>
              <div>{scopeLabel}</div>
              <div>
                <IntegrationStatusBadge status={connection.status} />
              </div>
              <div>{lastConnected}</div>
              <div className="max-w-[200px] truncate">
                {connection.last_error ? (
                  <span className="text-destructive">{connection.last_error}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/app/modules/integrations/${connection.id}`}>
                <Button variant="secondary" size="sm">
                  View details
                </Button>
              </Link>
              <Link href={`/app/modules/integrations/${connection.id}/edit`}>
                <Button variant="secondary" size="sm">
                  Edit settings
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
