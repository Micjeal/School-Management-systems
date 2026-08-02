import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WebhookDelivery {
  id: string;
  status: string;
  response_status: number | null;
  response_body: string | null;
  attempt_count: number;
  delivered_at: string | null;
  next_attempt_at: string | null;
  error_message: string | null;
  created_at: string;
  event_type?: string;
}

interface WebhookDeliveriesProps {
  deliveries: WebhookDelivery[];
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

function getDeliveryStatusColor(status: string): string {
  const colors: Record<string, string> = {
    queued: "bg-slate-100 text-slate-700",
    processing: "bg-blue-50 text-blue-700",
    delivered: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
    dead_letter: "bg-red-100 text-red-900",
  };
  return colors[status] || "bg-slate-100 text-slate-700";
}

function getHttpStatusClass(status: number | null): string {
  if (!status) return "text-slate-500";
  if (status >= 200 && status < 300) return "text-emerald-600";
  if (status >= 300 && status < 400) return "text-blue-600";
  if (status >= 400 && status < 500) return "text-amber-600";
  if (status >= 500) return "text-red-600";
  return "text-slate-600";
}

function truncateResponse(body: string | null, maxLength = 100): string {
  if (!body) return "No response";
  if (body.length <= maxLength) return body;
  return body.substring(0, maxLength) + "...";
}

export function WebhookDeliveries({ deliveries }: WebhookDeliveriesProps) {
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">No deliveries yet</p>
        <p className="text-sm text-slate-400">
          Delivery activity will appear after a subscribed event is created.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Event</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">HTTP Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Attempts</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Delivered At</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Next Attempt</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Error</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Response</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-700">
                  {formatDate(delivery.created_at)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {delivery.event_type || "—"}
                </td>
                <td className="py-3 px-4">
                  <Badge className={getDeliveryStatusColor(delivery.status)}>
                    {delivery.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm">
                  {delivery.response_status ? (
                    <span className={getHttpStatusClass(delivery.response_status)}>
                      {delivery.response_status}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {delivery.attempt_count}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {formatDate(delivery.delivered_at)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {formatDate(delivery.next_attempt_at)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700 max-w-xs truncate">
                  {delivery.error_message || "—"}
                </td>
                <td className="py-3 px-4">
                  {delivery.response_body ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        {truncateResponse(delivery.response_body)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedDelivery(
                          expandedDelivery === delivery.id ? null : delivery.id
                        )}
                      >
                        {expandedDelivery === delivery.id ? "Hide" : "View response"}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expandedDelivery && (
        <div className="mt-4 border rounded-md p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Response Body</h4>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
            {deliveries.find((d) => d.id === expandedDelivery)?.response_body || "No response body"}
          </pre>
        </div>
      )}
    </div>
  );
}
