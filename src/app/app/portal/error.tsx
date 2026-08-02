"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { AlertTriangle } from "lucide-react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal error:", error);
  }, [error]);

  return (
    <PageContainer width="wide">
      <PageHeader
        title="My portal"
        description="Your personal records, tasks and school services."
      />
      <Card>
        <CardContent className="p-6">
          <PortalEmptyState
            icon={<AlertTriangle className="h-8 w-8" />}
            title="Could not load portal"
            description="We could not load part of your portal. Refresh the page or contact support if the problem continues."
            action={
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
