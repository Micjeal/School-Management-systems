import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntegrationHealth } from "@/lib/integrations/types";

interface IntegrationHealthCardProps {
  health: IntegrationHealth;
}

export function IntegrationHealthCard({ health }: IntegrationHealthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Active connections</p>
            <p className="text-2xl font-bold">{health.activeConnections}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Connections with errors</p>
            <p className="text-2xl font-bold text-destructive">{health.errorConnections}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Inbound events</p>
            <p className="text-2xl font-bold">{health.inboundEvents}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Failed events</p>
            <p className="text-2xl font-bold text-destructive">{health.failedEvents}</p>
          </div>
        </div>
        {!health.hasActivity && (
          <p className="mt-4 text-sm text-muted-foreground">
            No integration activity yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
