import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";
import type { PlatformFileSummary, SchoolFileSummary, StorageHealthIssue } from "@/lib/files/file-types";

/**
 * Get platform file administration data
 * For platform administrators with no school selected
 * Shows aggregate storage and metadata health across all schools
 */
export async function getPlatformFileAdministration(
  context: UserContext
): Promise<{
  summary: PlatformFileSummary;
  schools: SchoolFileSummary[];
  recentImports: Array<{ id: string; schoolId: string; schoolName: string | null; jobType: string; status: string; createdAt: string }>;
  recentExports: Array<{ id: string; schoolId: string; schoolName: string | null; exportType: string; status: string; createdAt: string }>;
  healthIssues: StorageHealthIssue[];
}> {
  if (!context.is_platform_admin) {
    return {
      summary: getEmptyPlatformSummary(),
      schools: [],
      recentImports: [],
      recentExports: [],
      healthIssues: [],
    };
  }

  const supabase = await createClient();

  // 1. Get aggregate storage summary
  const summary = await calculatePlatformSummary(supabase);

  // 2. Get per-school storage data
  const schools = await getSchoolFileSummaries(supabase);

  // 3. Get recent import jobs
  const { data: recentImports } = await supabase
    .from("import_batches")
    .select(`
      id,
      school_id,
      import_type,
      status,
      created_at,
      schools (name)
    `)
    .order("created_at", { ascending: false })
    .limit(20) as any;

  const formattedImports = (recentImports || []).map((imp: any) => ({
    id: imp.id,
    schoolId: imp.school_id,
    schoolName: imp.schools?.name || null,
    jobType: imp.import_type,
    status: imp.status,
    createdAt: imp.created_at,
  }));

  // 4. Get recent export jobs
  const { data: recentExports } = await supabase
    .from("export_jobs")
    .select(`
      id,
      school_id,
      export_type,
      status,
      created_at,
      schools (name)
    `)
    .order("created_at", { ascending: false })
    .limit(20) as any;

  const formattedExports = (recentExports || []).map((exp: any) => ({
    id: exp.id,
    schoolId: exp.school_id,
    schoolName: exp.schools?.name || null,
    exportType: exp.export_type,
    status: exp.status,
    createdAt: exp.created_at,
  }));

  // 5. Get storage health issues
  const healthIssues = await getStorageHealthIssues(supabase);

  return {
    summary,
    schools,
    recentImports: formattedImports,
    recentExports: formattedExports,
    healthIssues,
  };
}

/**
 * Get school file administration data
 * For platform administrators with a selected school
 * Shows operational files and storage health for the selected school
 */
export async function getSchoolFileAdministration(
  context: UserContext,
  schoolId: string
): Promise<{
  summary: SchoolFileSummary;
  imports: Array<{ id: string; jobType: string; status: string; createdAt: string }>;
  exports: Array<{ id: string; exportType: string; status: string; createdAt: string }>;
  healthIssues: StorageHealthIssue[];
  brandingAssets: Array<{ id: string; assetType: string; createdAt: string }>;
}> {
  if (!context.is_platform_admin) {
    return {
      summary: getEmptySchoolSummary(),
      imports: [],
      exports: [],
      healthIssues: [],
      brandingAssets: [],
    };
  }

  const supabase = await createClient();

  // 1. Get school-specific summary
  const summary = await calculateSchoolSummary(supabase, schoolId);

  // 2. Get school import jobs
  const { data: imports } = await supabase
    .from("import_batches")
    .select("id, import_type, status, created_at")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(50) as any;

  // 3. Get school export jobs
  const { data: exports } = await supabase
    .from("export_jobs")
    .select("id, export_type, status, created_at")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(50) as any;

  // 4. Get school storage health issues
  const healthIssues = await getSchoolStorageHealthIssues(supabase, schoolId);

  // 5. Get school branding assets
  const { data: school } = await supabase
    .from("schools")
    .select("id, logo_path, updated_at")
    .eq("id", schoolId)
    .maybeSingle();

  return {
    summary,
    imports: (imports || []).map((item: any) => ({ id: item.id, jobType: item.import_type, status: item.status, createdAt: item.created_at })),
    exports: exports || [],
    healthIssues,
    brandingAssets: school?.logo_path ? [{ id: school.id, assetType: "logo", createdAt: school.updated_at }] : [],
  };
}

// Helper functions

type SchoolIdRow = {
  school_id: string | null;
};

type SchoolRow = {
  id: string;
  name: string;
};

function extractSchoolIds(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      item === null ||
      typeof item !== "object"
    ) {
      return [];
    }

    const row =
      item as Record<string, unknown>;

    return typeof row.school_id ===
      "string" &&
      row.school_id.length > 0
      ? [row.school_id]
      : [];
  });
}

function extractSchools(
  value: unknown,
): SchoolRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      item === null ||
      typeof item !== "object"
    ) {
      return [];
    }

    const row =
      item as Record<string, unknown>;

    if (
      typeof row.id !== "string" ||
      typeof row.name !== "string"
    ) {
      return [];
    }

    return [
      {
        id: row.id,
        name: row.name,
      },
    ];
  });
}

function getCount(
  result: {
    count: number | null;
    data: unknown;
  },
): number {
  if (
    typeof result.count === "number"
  ) {
    return result.count;
  }

  return Array.isArray(result.data)
    ? result.data.length
    : 0;
}

async function calculatePlatformSummary(supabase: any): Promise<PlatformFileSummary> {
  const [
    schoolsResult,
    personDocumentsResult,
    reportCardsResult,
    paymentReceiptsResult,
    messageAttachmentsResult,
    applicationDocumentsResult,
  ] = await Promise.all([
    supabase
      .from("schools")
      .select("id,name"),

    supabase
      .from("person_documents")
      .select("school_id", {
        count: "exact",
      }),

    supabase
      .from("report_cards")
      .select("school_id", {
        count: "exact",
      }),

    supabase
      .from("payment_receipts")
      .select("school_id", {
        count: "exact",
      }),

    supabase
      .from("message_attachments")
      .select("school_id", {
        count: "exact",
      }),

    supabase
      .from("application_documents")
      .select("school_id", {
        count: "exact",
      }),
  ]);

  const results = [
    {
      name: "schools",
      result: schoolsResult,
    },
    {
      name: "person_documents",
      result: personDocumentsResult,
    },
    {
      name: "report_cards",
      result: reportCardsResult,
    },
    {
      name: "payment_receipts",
      result: paymentReceiptsResult,
    },
    {
      name: "message_attachments",
      result: messageAttachmentsResult,
    },
    {
      name: "application_documents",
      result: applicationDocumentsResult,
    },
  ];

  for (const item of results) {
    if (item.result.error) {
      console.error(
        `Unable to calculate platform summary for ${item.name}:`,
        {
          code:
            item.result.error.code,
          message:
            item.result.error.message,
        },
      );
    }
  }

  const schools =
    extractSchools(
      schoolsResult.data,
    );

  const existingSchoolIds =
    new Set(
      schools.map(
        (school) => school.id,
      ),
    );

  const referencedSchoolIds =
    new Set<string>([
      ...extractSchoolIds(
        personDocumentsResult.data,
      ),

      ...extractSchoolIds(
        reportCardsResult.data,
      ),

      ...extractSchoolIds(
        paymentReceiptsResult.data,
      ),

      ...extractSchoolIds(
        messageAttachmentsResult.data,
      ),

      ...extractSchoolIds(
        applicationDocumentsResult.data,
      ),
    ]);

  const schoolsUsingStorage =
    Array.from(
      referencedSchoolIds,
    ).filter((schoolId) =>
      existingSchoolIds.has(schoolId),
    ).length;

  const personDocuments =
    getCount(
      personDocumentsResult,
    );

  const reportCards =
    getCount(
      reportCardsResult,
    );

  const paymentReceipts =
    getCount(
      paymentReceiptsResult,
    );

  const messageAttachments =
    getCount(
      messageAttachmentsResult,
    );

  const applicationDocuments =
    getCount(
      applicationDocumentsResult,
    );

  const totalStoredFiles =
    personDocuments +
    reportCards +
    paymentReceipts +
    messageAttachments +
    applicationDocuments;

  // Count failed imports/exports
  const { count: failedImports } = await supabase
    .from("import_batches")
    .select("id", { count: "exact", head: true })
    .eq("status", "failed");

  const { count: failedExports } = await supabase
    .from("export_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "failed");

  const failedOrMissingFiles = (failedImports || 0) + (failedExports || 0);

  // Get recent imports/exports counts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: recentImports } = await supabase
    .from("import_batches")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString());

  const { count: recentExports } = await supabase
    .from("export_jobs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString());

  // Storage health issues (placeholder - would need actual health check logic)
  const orphanedObjects = 0; // Would be calculated from storage health checks
  const securityWarnings = 0; // Would be calculated from security audits

  // Storage used (placeholder - would need actual storage metrics)
  const storageUsed = 0; // Would be calculated from storage metadata

  return {
    totalStoredFiles,
    storageUsed,
    schoolsUsingStorage,
    failedOrMissingFiles,
    recentImports: recentImports || 0,
    recentExports: recentExports || 0,
    orphanedObjects,
    securityWarnings,
  };
}

async function getSchoolFileSummaries(supabase: any): Promise<SchoolFileSummary[]> {
  // Get all schools
  const { data: schools } = await supabase
    .from("schools")
    .select("id, name")
    .order("name");

  if (!schools) return [];

  const summaries: SchoolFileSummary[] = [];

  for (const school of schools) {
    const summary = await calculateSchoolSummary(supabase, school.id);
    summaries.push({
      ...summary,
      schoolId: school.id,
      schoolName: school.name,
    });
  }

  return summaries;
}

async function calculateSchoolSummary(supabase: any, schoolId: string): Promise<SchoolFileSummary> {
  // Count files for this school
  const [
    { count: personDocCount },
    { count: reportCardCount },
    { count: receiptCount },
    { count: messageAttachmentCount },
    { count: applicationDocCount },
  ] = await Promise.all([
    supabase.from("person_documents").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    supabase.from("report_cards").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    supabase.from("payment_receipts").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    supabase.from("message_attachments").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    supabase.from("application_documents").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
  ]);

  const storedFileCount = (personDocCount || 0) + (reportCardCount || 0) + 
                        (receiptCount || 0) + (messageAttachmentCount || 0) +
                        (applicationDocCount || 0);

  // Count imports/exports
  const { count: imports } = await supabase
    .from("import_batches")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId);

  const { count: exports } = await supabase
    .from("export_jobs")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId);

  // Get last file activity
  const { data: lastActivity } = await supabase
    .from("person_documents")
    .select("created_at")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single() as any;

  // Storage health (placeholder)
  const missingObjects = 0;
  const orphanedObjects = 0;
  const storageUsed = 0;

  return {
    schoolId,
    schoolName: null,
    storedFileCount,
    storageUsed,
    imports: imports || 0,
    exports: exports || 0,
    missingObjects,
    orphanedObjects,
    lastFileActivity: lastActivity?.created_at || null,
  };
}

async function getStorageHealthIssues(supabase: any): Promise<StorageHealthIssue[]> {
  // Placeholder for storage health checks
  // In production, this would compare metadata records against storage objects
  const issues: StorageHealthIssue[] = [];

  // Example: Find report cards with missing file paths
  const { data: reportCardsMissingFiles } = await supabase
    .from("report_cards")
    .select("id, school_id, schools (name)")
    .is("file_path", null)
    .eq("status", "published")
    .limit(100) as any;

  for (const card of reportCardsMissingFiles || []) {
    issues.push({
      id: card.id,
      schoolId: card.school_id,
      schoolName: card.schools?.name || null,
      issueType: "missing_object",
      source: "report_card",
      metadataId: card.id,
      storagePath: null,
      detectedAt: new Date().toISOString(),
      severity: "high",
    });
  }

  // Example: Find payment receipts with missing file paths
  const { data: receiptsMissingFiles } = await supabase
    .from("payment_receipts")
    .select("id, school_id, schools (name)")
    .is("file_path", null)
    .not("voided_at", "is", null)
    .limit(100) as any;

  for (const receipt of receiptsMissingFiles || []) {
    issues.push({
      id: receipt.id,
      schoolId: receipt.school_id,
      schoolName: receipt.schools?.name || null,
      issueType: "missing_object",
      source: "payment_receipt",
      metadataId: receipt.id,
      storagePath: null,
      detectedAt: new Date().toISOString(),
      severity: "medium",
    });
  }

  return issues;
}

async function getSchoolStorageHealthIssues(supabase: any, schoolId: string): Promise<StorageHealthIssue[]> {
  const [{ data: cards }, { data: receipts }] = await Promise.all([
    supabase.from("report_cards").select("id,school_id,schools(name)").eq("school_id", schoolId).is("file_path", null).eq("status", "published").limit(50),
    supabase.from("payment_receipts").select("id,school_id,schools(name)").eq("school_id", schoolId).is("file_path", null).not("voided_at", "is", null).limit(50),
  ]);
  return [
    ...(cards ?? []).map((row: any) => ({ id: row.id, schoolId, schoolName: row.schools?.name ?? null, issueType: "missing_object" as const, source: "report_card", metadataId: row.id, storagePath: null, detectedAt: new Date().toISOString(), severity: "high" as const })),
    ...(receipts ?? []).map((row: any) => ({ id: row.id, schoolId, schoolName: row.schools?.name ?? null, issueType: "missing_object" as const, source: "payment_receipt", metadataId: row.id, storagePath: null, detectedAt: new Date().toISOString(), severity: "medium" as const })),
  ];
}

function getEmptyPlatformSummary(): PlatformFileSummary {
  return {
    totalStoredFiles: 0,
    storageUsed: 0,
    schoolsUsingStorage: 0,
    failedOrMissingFiles: 0,
    recentImports: 0,
    recentExports: 0,
    orphanedObjects: 0,
    securityWarnings: 0,
  };
}

function getEmptySchoolSummary(): SchoolFileSummary {
  return {
    schoolId: "",
    schoolName: null,
    storedFileCount: 0,
    storageUsed: 0,
    imports: 0,
    exports: 0,
    missingObjects: 0,
    orphanedObjects: 0,
    lastFileActivity: null,
  };
}
