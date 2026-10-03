"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

type AuditLog = {
  id: string;
  actor_user_id: string | null;
  actor_membership_id: string | null;
  school_id: string | null;
  file_source: string;
  record_id: string;
  action: string;
  result: string;
  reason: string | null;
  request_id: string | null;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
  actor_name: string;
  school_name: string;
};

type SummaryCardData = {
  total: number;
  successful: number;
  denied: number;
  failed: number;
};

type AuditViewerProps = {
  logs: AuditLog[];
  count: number;
  currentPage: number;
  totalPages: number;
  summary: SummaryCardData;
  schoolOptions: Array<{ value: string; label: string }>;
  currentFilters: {
    school: string;
    source: string;
    action: string;
    result: string;
    requestId: string;
    startDate: string;
    endDate: string;
  };
  defaultFilters: {
    school: string;
    source: string;
    action: string;
    result: string;
    requestId: string;
    startDate: string;
    endDate: string;
  };
  isPlatformAdmin: boolean;
  activeSchoolId: string | null;
  schoolLabel: string;
  fileSourceOptions: ReadonlyArray<{ value: string; label: string }>;
  fileActionOptions: ReadonlyArray<{ value: string; label: string }>;
  fileResultOptions: ReadonlyArray<{ value: string; label: string }>;
};

const SOURCE_LABELS: Record<string, string> = {
  person_document: "Personal document",
  report_card: "Report card",
  payment_receipt: "Payment receipt",
  message_attachment: "Message attachment",
  application_document: "Application document",
  assessment_file: "Assessment file",
  import: "Import",
  export: "Export",
  school_branding: "School branding",
  storage_object: "Storage object"
};

const ACTION_LABELS: Record<string, string> = {
  preview: "Preview",
  download: "Download",
  generate_signed_url: "Generate signed URL",
  replace: "Replace",
  delete: "Delete",
  export: "Export",
  administrative_repair: "Administrative repair"
};

const RESULT_LABELS: Record<string, string> = {
  success: "Success",
  denied: "Denied",
  failure: "Failure"
};

export function AuditViewer({
  logs,
  count,
  currentPage,
  totalPages,
  summary,
  schoolOptions,
  currentFilters,
  defaultFilters,
  isPlatformAdmin,
  activeSchoolId,
  schoolLabel,
  fileSourceOptions,
  fileActionOptions,
  fileResultOptions
}: AuditViewerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [draft, setDraft] = useState(currentFilters);

  useEffect(() => {
    // The URL is the external source of truth for this editable filter draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(currentFilters);
  }, [currentFilters]);

  const formatTimestamp = (value: string) =>
    new Date(value).toLocaleString("en", {
      dateStyle: "medium",
      timeStyle: "short"
    });

  const formatShortId = (value: string | null) => {
    if (!value) return "—";
    return `${value.slice(0, 8)}…`;
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case "success":
        return "default";
      case "denied":
        return "secondary";
      case "failure":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getResultLabel = (result: string) => RESULT_LABELS[result] || result;
  const getSourceLabel = (source: string) => SOURCE_LABELS[source] || source;
  const getActionLabel = (action: string) => ACTION_LABELS[action] || action;

  const activeFilterCount = useMemo(() => {
    return [
      draft.school && draft.school !== defaultFilters.school ? 1 : 0,
      draft.source && draft.source !== defaultFilters.source ? 1 : 0,
      draft.action && draft.action !== defaultFilters.action ? 1 : 0,
      draft.result && draft.result !== defaultFilters.result ? 1 : 0,
      draft.requestId ? 1 : 0,
      draft.startDate ? 1 : 0,
      draft.endDate ? 1 : 0
    ].reduce((sum, value) => sum + value, 0);
  }, [draft, defaultFilters]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    const filterMap = {
      school: draft.school,
      source: draft.source,
      action: draft.action,
      result: draft.result,
      request_id: draft.requestId,
      start: draft.startDate,
      end: draft.endDate
    };

    Object.entries(filterMap).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete("page");
    router.push(`/app/files/activity?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/app/files/activity");
  };

  const updateDraft = (key: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const firstVisible = count === 0 ? 0 : (currentPage - 1) * 50 + 1;
  const lastVisible = Math.min(currentPage * 50, count);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total events" value={summary.total} accent="default" />
        <SummaryCard label="Successful" value={summary.successful} accent="success" />
        <SummaryCard label="Denied" value={summary.denied} accent="warning" />
        <SummaryCard label="Failed" value={summary.failed} accent="danger" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                {isPlatformAdmin
                  ? "Audit file activity across all schools and platform operations."
                  : `File activity for ${schoolLabel}.`}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Filters ({activeFilterCount} active)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isPlatformAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">School</label>
                <Select
                  value={draft.school}
                  onValueChange={(value) => updateDraft("school", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All schools" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">File Source</label>
              <Select value={draft.source} onValueChange={(value) => updateDraft("source", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  {fileSourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={draft.action} onValueChange={(value) => updateDraft("action", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  {fileActionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Result</label>
              <Select value={draft.result} onValueChange={(value) => updateDraft("result", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All results" />
                </SelectTrigger>
                <SelectContent>
                  {fileResultOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Request ID</label>
              <Input
                value={draft.requestId}
                maxLength={200}
                placeholder="Search by request ID"
                onChange={(event) => updateDraft("requestId", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={draft.startDate}
                onChange={(event) => updateDraft("startDate", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={draft.endDate}
                onChange={(event) => updateDraft("endDate", event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-4 xl:flex-row xl:items-end xl:justify-end">
              <Button variant="default" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {draft.school && draft.school !== defaultFilters.school && (
            <FilterChip
              label={`School: ${schoolOptions.find((option) => option.value === draft.school)?.label || draft.school}`}
            />
          )}
          {draft.source && draft.source !== defaultFilters.source && (
            <FilterChip label={`Source: ${getSourceLabel(draft.source)}`} />
          )}
          {draft.action && draft.action !== defaultFilters.action && (
            <FilterChip label={`Action: ${getActionLabel(draft.action)}`} />
          )}
          {draft.result && draft.result !== defaultFilters.result && (
            <FilterChip label={`Result: ${getResultLabel(draft.result)}`} />
          )}
          {draft.requestId && <FilterChip label={`Request ID: ${draft.requestId}`} />}
          {draft.startDate && <FilterChip label={`Start: ${draft.startDate}`} />}
          {draft.endDate && <FilterChip label={`End: ${draft.endDate}`} />}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Showing {count === 0 ? 0 : firstVisible}-{lastVisible} of {count} events
        </p>
        {count > 0 && (
          <p>
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold">No activity matches these filters</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Change or clear one or more filters to view additional events.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/app/files/activity?school=${defaultFilters.school}`)}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Occurred</th>
                    <th className="text-left p-3 font-medium">Actor</th>
                    <th className="text-left p-3 font-medium">School</th>
                    <th className="text-left p-3 font-medium">File source</th>
                    <th className="text-left p-3 font-medium">Record</th>
                    <th className="text-left p-3 font-medium">Action</th>
                    <th className="text-left p-3 font-medium">Result</th>
                    <th className="text-left p-3 font-medium">Reason</th>
                    <th className="text-left p-3 font-medium">Request ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 whitespace-nowrap">{formatTimestamp(log.occurred_at)}</td>
                      <td className="p-3">{log.actor_name}</td>
                      <td className="p-3">{log.school_name}</td>
                      <td className="p-3">{getSourceLabel(log.file_source)}</td>
                      <td className="p-3 font-mono text-xs">{formatShortId(log.record_id)}</td>
                      <td className="p-3">{getActionLabel(log.action)}</td>
                      <td className="p-3">
                        <Badge variant={getResultBadgeVariant(log.result)}>
                          {getResultLabel(log.result)}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{log.reason || "—"}</td>
                      <td className="p-3 font-mono text-xs">{formatShortId(log.request_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              let pageNum = index + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => changePage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  function changePage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`/app/files/activity?${params.toString()}`);
  }
}

function SummaryCard({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent: "default" | "success" | "warning" | "danger";
}) {
  const accentStyles = {
    default: "border-muted bg-card",
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    danger: "border-rose-500/30 bg-rose-500/5"
  };

  return (
    <Card className={accentStyles[accent]}>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  );
}
