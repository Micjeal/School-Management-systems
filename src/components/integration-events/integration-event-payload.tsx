"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { redactPayload } from "@/lib/integration-events/redact-payload";

interface IntegrationEventPayloadProps {
  payload: unknown;
}

export function IntegrationEventPayload({
  payload,
}: IntegrationEventPayloadProps) {
  const [isVisible, setIsVisible] = useState(false);

  const redacted = redactPayload(payload);

  return (
    <div className="space-y-2">
      {!isVisible && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsVisible(true)}
        >
          View redacted payload
        </Button>
      )}
      {isVisible && (
        <div className="space-y-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            Hide payload
          </Button>
          <pre className="bg-slate-50 p-4 rounded text-xs overflow-auto max-h-96 border">
            {JSON.stringify(redacted, null, 2)}
          </pre>
          <p className="text-xs text-muted-foreground">
            Sensitive information has been redacted for security.
          </p>
        </div>
      )}
    </div>
  );
}
