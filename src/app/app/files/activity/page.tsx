import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuditViewer } from "@/components/files/audit-viewer";

type ActivityPageSearchParams = {
  school?: string;
  source?: string;
  action?: string;
  result?: string;
  request_id?: string;
  requestId?: string;
  start?: string;
  startDate?: string;
  end?: string;
  endDate?: string;
  page?: string;
};

type FileActivitySchoolOption = {
  value: string;
  label: string;
};

type FileActivityPageData = {
  logs: FileAccessLogItem[];
  total: number;
  summary: {
    total: number;
    successful: number;
    denied: number;
    failed: number;
  };
  schoolOptions: FileActivitySchoolOption[];
  error: string | null;
};

type FileAccessLogItem = {
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
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
  actor_name: string;
  school_name: string;
};

const FILE_SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "person_document", label: "Personal document" },
  { value: "report_card", label: "Report card" },
  { value: "payment_receipt", label: "Payment receipt" },
  { value: "message_attachment", label: "Message attachment" },
  { value: "application_document", label: "Application document" },
  { value: "assessment_file", label: "Assessment file" },
  { value: "import", label: "Import" },
  { value: "export", label: "Export" },
  { value: "school_branding", label: "School branding" },
  { value: "storage_object", label: "Storage object" }
] as const;

const FILE_ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "preview", label: "Preview" },
  { value: "download", label: "Download" },
  { value: "generate_signed_url", label: "Generate signed URL" },
  { value: "replace", label: "Replace" },
  { value: "delete", label: "Delete" },
  { value: "export", label: "Export" },
  { value: "administrative_repair", label: "Administrative repair" }
] as const;

const FILE_RESULT_OPTIONS = [
  { value: "all", label: "All results" },
  { value: "success", label: "Success" },
  { value: "denied", label: "Denied" },
  { value: "failure", label: "Failure" }
] as const;

function getNextUtcDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString();
}

function normalizeSchoolFilter(value: string | undefined, activeSchoolId: string | null) {
  if (!value || value === "all") {
    return undefined;
  }

  if (value === "platform") {
    return "__platform__";
  }

  if (activeSchoolId && value === activeSchoolId) {
    return activeSchoolId;
  }

  return value;
}

export default async function FileActivityPage({
  searchParams
}: {
  searchParams: Promise<ActivityPageSearchParams>;
}) {
  const context = await requireUserContext();
  const params = await searchParams;

  const isPlatformAdmin = context.is_platform_admin;
  const hasAuditRead = context.permissions.includes("audit.read");

  if (!isPlatformAdmin && !hasAuditRead) {
    redirect("/access-denied");
  }

  if (!isPlatformAdmin && hasAuditRead && !context.active_school_id) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-semibold">Select a school</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a school first to view file activity.
        </p>
      </div>
    );
  }

  const page = Number.parseInt(params.page || "1", 10);
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();

  const schoolOptionsResult = await supabase
    .from("schools")
    .select("id,name,status")
    .neq("status", "archived")
    .order("name");

  if (schoolOptionsResult.error) {
    console.error("Error fetching school options:", schoolOptionsResult.error);
  }

  const schoolOptions = [
    { value: "all", label: "All schools" },
    { value: "platform", label: "Platform events" },
    ...(Array.isArray(schoolOptionsResult.data)
      ? schoolOptionsResult.data
          .filter(
            (school) => school && typeof school.id === "string" && typeof school.name === "string"
          )
          .map((school) => ({
            value: school.id,
            label: school.name
          }))
      : [])
  ];

  const schoolFilter = normalizeSchoolFilter(params.school, context.active_school_id);

  let effectiveSchoolScope = schoolFilter;
  if (!isPlatformAdmin && hasAuditRead && context.active_school_id) {
    effectiveSchoolScope = context.active_school_id;
  }

  if (isPlatformAdmin && context.active_school_id && !params.school) {
    effectiveSchoolScope = context.active_school_id;
  }

  const startValue = params.start || params.startDate || "";
  const endValue = params.end || params.endDate || "";
  const requestId = (params.request_id || params.requestId || "").trim();
  const sourceFilter = params.source || "all";
  const actionFilter = params.action || "all";
  const resultFilter = params.result || "all";

  const hasInvalidDateRange = Boolean(startValue && endValue && startValue > endValue);
  if (hasInvalidDateRange) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">File Activity</h1>
          <p className="mt-1 text-muted-foreground">
            Review security and operational events for file access.
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <Link href="/app/files" className="underline underline-offset-4">
              Back to Files
            </Link>
          </div>
        </header>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Start date must be on or before the end date.
        </div>
      </div>
    );
  }

  const baseQuery = () => {
    let query = supabase
      .from("file_access_logs")
      .select(
        "id, actor_user_id, actor_membership_id, school_id, file_source, record_id, action, result, reason, request_id, ip_address, user_agent, occurred_at, metadata",
        {
          count: "exact"
        }
      );

    if (effectiveSchoolScope === "__platform__") {
      query = query.is("school_id", null);
    } else if (effectiveSchoolScope) {
      query = query.eq("school_id", effectiveSchoolScope);
    }

    if (sourceFilter && sourceFilter !== "all") {
      query = query.eq("file_source", sourceFilter);
    }

    if (actionFilter && actionFilter !== "all") {
      query = query.eq("action", actionFilter);
    }

    if (resultFilter && resultFilter !== "all") {
      query = query.eq("result", resultFilter);
    }

    if (requestId) {
      query = query.ilike("request_id", `%${requestId}%`);
    }

    if (startValue) {
      query = query.gte("occurred_at", `${startValue}T00:00:00.000Z`);
    }

    if (endValue) {
      const exclusiveEnd = getNextUtcDate(endValue);
      query = query.lt("occurred_at", exclusiveEnd);
    }

    return query;
  };

  const activityQuery = baseQuery()
    .order("occurred_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const summaryQuery = baseQuery().select("result");

  const [activityResult, summaryResult] = await Promise.all([activityQuery, summaryQuery]);

  const {
    data: rawLogs,
    error,
    count
  } = activityResult as {
    data: unknown[] | null;
    error: { message?: string } | null;
    count: number | null;
  };

  const summaryError = summaryResult.error;

  if (error || summaryError) {
    console.error("Error fetching file activity:", error || summaryError);
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-semibold text-destructive">
          File activity could not be loaded
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Refresh the page or try again.</p>
      </div>
    );
  }

  const logs = Array.isArray(rawLogs)
    ? rawLogs.filter(
        (item): item is FileAccessLogItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string"
      )
    : [];

  const actorUserIds = Array.from(
    new Set(logs.map((log) => log.actor_user_id).filter((value): value is string => Boolean(value)))
  );
  const schoolIds = Array.from(
    new Set(logs.map((log) => log.school_id).filter((value): value is string => Boolean(value)))
  );

  const [schoolLookupResult, profileLookupResult] = await Promise.all([
    schoolIds.length > 0
      ? supabase.from("schools").select("id,name").in("id", schoolIds)
      : Promise.resolve({ data: [], error: null }),
    actorUserIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, display_name, first_name, last_name")
          .in("id", actorUserIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  const schoolLookup = Array.isArray(schoolLookupResult.data)
    ? schoolLookupResult.data.filter(
        (item): item is { id: string; name: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string" &&
          typeof (item as { name?: unknown }).name === "string"
      )
    : [];

  const profileLookup = Array.isArray(profileLookupResult.data)
    ? profileLookupResult.data.filter(
        (
          item
        ): item is {
          id: string;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
        } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string"
      )
    : [];

  const schoolNameById = new Map(schoolLookup.map((school) => [school.id, school.name]));
  const actorNameById = new Map(
    profileLookup.map((profile) => {
      const fallbackName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
      return [profile.id, profile.display_name || fallbackName || "Deleted or unavailable user"];
    })
  );

  const enrichedLogs = logs.map((log) => ({
    ...log,
    actor_name: log.actor_user_id
      ? actorNameById.get(log.actor_user_id) || "Deleted or unavailable user"
      : "System",
    school_name: log.school_id
      ? schoolNameById.get(log.school_id) || "Deleted or unavailable school"
      : "Platform"
  }));

  const summaryRows = Array.isArray(summaryResult.data) ? summaryResult.data : [];
  const summary = {
    total: count || 0,
    successful: summaryRows.filter((row) => row.result === "success").length,
    denied: summaryRows.filter((row) => row.result === "denied").length,
    failed: summaryRows.filter((row) => row.result === "failure").length
  };

  const totalPages = Math.max(1, count ? Math.ceil(count / pageSize) : 1);

  const pageData: FileActivityPageData = {
    logs: enrichedLogs,
    total: count || 0,
    summary,
    schoolOptions,
    error: null
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">File Activity</h1>
            <p className="mt-1 text-muted-foreground">
              Review security and operational events for file access.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {isPlatformAdmin ? "Platform administration" : "School auditor"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPlatformAdmin
                ? "Audit file activity across all schools and platform operations."
                : `File activity for ${context.active_school?.name || "Selected School"}.`}
            </p>
          </div>
          <Link href="/app/files" className="text-sm underline underline-offset-4">
            Back to Files
          </Link>
        </div>
      </header>

      <AuditViewer
        logs={pageData.logs}
        count={pageData.total}
        currentPage={page}
        totalPages={totalPages}
        summary={pageData.summary}
        schoolOptions={pageData.schoolOptions}
        currentFilters={{
          school: effectiveSchoolScope ? String(effectiveSchoolScope) : "all",
          source: sourceFilter,
          action: actionFilter,
          result: resultFilter,
          requestId,
          startDate: startValue,
          endDate: endValue
        }}
        defaultFilters={{
          school: isPlatformAdmin ? "all" : context.active_school_id || "all",
          source: "all",
          action: "all",
          result: "all",
          requestId: "",
          startDate: "",
          endDate: ""
        }}
        isPlatformAdmin={isPlatformAdmin}
        activeSchoolId={context.active_school_id}
        schoolLabel={
          isPlatformAdmin
            ? "Platform administration"
            : `${context.active_school?.name || "Selected School"}`
        }
        fileSourceOptions={FILE_SOURCE_OPTIONS}
        fileActionOptions={FILE_ACTION_OPTIONS}
        fileResultOptions={FILE_RESULT_OPTIONS}
      />
    </div>
  );
}
