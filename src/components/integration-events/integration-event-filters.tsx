"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import type { IntegrationEventFilters } from "@/lib/integration-events/types";

export function IntegrationEventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: IntegrationEventFilters = {
    search: searchParams.get("search") || undefined,
    connectionId: searchParams.get("connectionId") || undefined,
    provider: searchParams.get("provider") || undefined,
    eventType: searchParams.get("eventType") || undefined,
    direction: searchParams.get("direction") as IntegrationEventFilters["direction"] || undefined,
    status: searchParams.get("status") as IntegrationEventFilters["status"] || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    hasError: searchParams.get("hasError") as IntegrationEventFilters["hasError"] || undefined,
  };

  const updateFilters = (newFilters: Partial<IntegrationEventFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set("search", newFilters.search);
      } else {
        params.delete("search");
      }
    }
    if (newFilters.direction !== undefined) {
      if (newFilters.direction) {
        params.set("direction", newFilters.direction);
      } else {
        params.delete("direction");
      }
    }
    if (newFilters.status !== undefined) {
      if (newFilters.status) {
        params.set("status", newFilters.status);
      } else {
        params.delete("status");
      }
    }
    if (newFilters.hasError !== undefined) {
      if (newFilters.hasError) {
        params.set("hasError", newFilters.hasError);
      } else {
        params.delete("hasError");
      }
    }
    if (newFilters.startDate !== undefined) {
      if (newFilters.startDate) {
        params.set("startDate", newFilters.startDate);
      } else {
        params.delete("startDate");
      }
    }
    if (newFilters.endDate !== undefined) {
      if (newFilters.endDate) {
        params.set("endDate", newFilters.endDate);
      } else {
        params.delete("endDate");
      }
    }

    router.push(`/app/modules/integration-events?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search event type, provider event ID, or error..."
              className="w-full border rounded px-3 py-2 text-sm"
              value={filters.search || ""}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Direction */}
          <select
            className="border rounded px-3 py-2 text-sm"
            value={filters.direction || ""}
            onChange={(e) =>
              updateFilters({
                direction: e.target.value as IntegrationEventFilters["direction"] || undefined,
              })
            }
          >
            <option value="">All directions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>

          {/* Status */}
          <select
            className="border rounded px-3 py-2 text-sm"
            value={filters.status || ""}
            onChange={(e) =>
              updateFilters({
                status: e.target.value as IntegrationEventFilters["status"] || undefined,
              })
            }
          >
            <option value="">All statuses</option>
            <option value="received">Received</option>
            <option value="queued">Queued</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="ignored">Ignored</option>
            <option value="dead_letter">Dead Letter</option>
          </select>

          {/* Error filter */}
          <select
            className="border rounded px-3 py-2 text-sm"
            value={filters.hasError || ""}
            onChange={(e) =>
              updateFilters({
                hasError: e.target.value as IntegrationEventFilters["hasError"] || undefined,
              })
            }
          >
            <option value="">All</option>
            <option value="yes">Has error</option>
            <option value="no">No error</option>
            <option value="retry">Retry scheduled</option>
          </select>

          {/* Date range */}
          <div className="flex gap-2">
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={filters.startDate || ""}
              onChange={(e) =>
                updateFilters({ startDate: e.target.value })
              }
            />
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={filters.endDate || ""}
              onChange={(e) =>
                updateFilters({ endDate: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
