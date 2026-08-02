"use client";

import { WebhookStatusBadge } from "./webhook-status-badge";
import { Button } from "@/components/ui/button";
import { getEventTypeLabel } from "@/lib/webhooks/event-types";
import {
  pauseWebhookEndpointAction,
  resumeWebhookEndpointAction,
  disableWebhookEndpointAction,
  deleteWebhookEndpointAction,
} from "@/app/app/modules/webhooks/actions";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  event_types: string[];
  status: string;
  failure_count: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  created_at: string;
  school_id: string | null;
  school_name?: string;
}

interface WebhookTableProps {
  endpoints: WebhookEndpoint[];
  isPlatformAdmin: boolean;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateUrl(url: string, maxLength = 40): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
}

export function WebhookTable({
  endpoints,
  isPlatformAdmin,
}: WebhookTableProps) {
  if (endpoints.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">No webhook endpoints</p>
        <p className="text-sm text-slate-400">
          Connect SchoolDB to an external system by creating an endpoint and selecting the events it should receive.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Scope</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">URL</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Events</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Failures</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Last Success</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Last Failure</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((endpoint) => (
            <tr key={endpoint.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-slate-900">{endpoint.name}</div>
                  <div className="text-xs text-slate-500">{formatDate(endpoint.created_at)}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-slate-700">
                {endpoint.school_id === null ? (
                  <span className="text-slate-900 font-medium">Platform</span>
                ) : (
                  endpoint.school_name || "Unknown School"
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {truncateUrl(endpoint.url)}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(endpoint.url)}
                    className="text-slate-400 hover:text-slate-600"
                    title="Copy URL"
                  >
                    📋
                  </button>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {endpoint.event_types.slice(0, 2).map((eventType) => (
                    <span
                      key={eventType}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                    >
                      {eventType}
                    </span>
                  ))}
                  {endpoint.event_types.length > 2 && (
                    <span className="text-xs text-slate-500">
                      +{endpoint.event_types.length - 2} more
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <WebhookStatusBadge status={endpoint.status} />
              </td>
              <td className="py-3 px-4 text-sm">
                <span className={endpoint.failure_count > 0 ? "text-red-600 font-medium" : "text-slate-700"}>
                  {endpoint.failure_count}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-slate-700">
                {formatDate(endpoint.last_success_at)}
              </td>
              <td className="py-3 px-4 text-sm text-slate-700">
                {formatDate(endpoint.last_failure_at)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <a
                    href={`/app/modules/webhooks/${endpoint.id}`}
                    className="text-slate-600 hover:text-slate-900"
                    title="Edit"
                  >
                    ✏️
                  </a>
                  {endpoint.status === "active" && (
                    <form action={pauseWebhookEndpointAction}>
                      <input type="hidden" name="endpointId" value={endpoint.id} />
                      <button
                        type="submit"
                        className="text-slate-600 hover:text-slate-900"
                        title="Pause"
                      >
                        ⏸️
                      </button>
                    </form>
                  )}
                  {endpoint.status === "paused" && (
                    <form action={resumeWebhookEndpointAction}>
                      <input type="hidden" name="endpointId" value={endpoint.id} />
                      <button
                        type="submit"
                        className="text-slate-600 hover:text-slate-900"
                        title="Resume"
                      >
                        ▶️
                      </button>
                    </form>
                  )}
                  {endpoint.status !== "disabled" && (
                    <form action={disableWebhookEndpointAction}>
                      <input type="hidden" name="endpointId" value={endpoint.id} />
                      <button
                        type="submit"
                        className="text-slate-600 hover:text-slate-900"
                        title="Disable"
                      >
                        🚫
                      </button>
                    </form>
                  )}
                  {isPlatformAdmin && (
                    <form action={deleteWebhookEndpointAction}>
                      <input type="hidden" name="endpointId" value={endpoint.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
