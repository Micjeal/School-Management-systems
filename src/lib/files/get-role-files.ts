import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";
import type { MyFileItem, FileCategory, FileSource } from "@/lib/files/file-types";

type RoleFileFilters = {
  fileType?: string;
  department?: string;
  status?: string;
  search?: string;
};

/**
 * Get role-based files for the authenticated user
 * Files available because of the user's school role and permissions
 */
export async function getMyRoleFiles(
  context: UserContext,
  schoolId: string,
  filters: RoleFileFilters = {}
): Promise<{ files: MyFileItem[] }> {
  if (!schoolId) {
    return { files: [] };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { files: [] };
  }

  const files: MyFileItem[] = [];
  const permissions = context.permissions || [];

  // Get school name
  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("id", schoolId)
    .single();

  const schoolName = school?.name || null;

  // 1. Academic files - for teachers and academic staff
  if (permissions.includes("academics.manage") || permissions.includes("assessments.manage")) {
    // Get authorized report card exports
    if (permissions.includes("report_cards.manage")) {
      const { data: reportCardExports } = await supabase
        .from("export_jobs")
        .select(`
          id,
          file_path,
          export_type,
          status,
          created_at
        `)
        .eq("school_id", schoolId)
        .eq("export_type", "report_cards")
        .eq("status", "completed") as any;

      for (const export_ of reportCardExports || []) {
        files.push({
          id: export_.id,
          source: "export" as FileSource,
          schoolId,
          schoolName,
          title: `Report Card Export: ${export_.export_type}`,
          category: "Academic" as FileCategory,
          fileName: getFileName(export_.file_path),
          mimeType: null,
          sizeBytes: null,
          status: "completed",
          owner: "School export",
          context: "Academic",
          scope: "School",
          issuedAt: null,
          expiresAt: null,
          createdAt: export_.created_at,
          canPreview: false,
          canDownload: true,
          canReplace: false,
          canDelete: false,
        });
      }
    }
  }

  // 2. Finance files - for finance staff
  if (permissions.includes("finance.manage") || permissions.includes("payments.manage") || permissions.includes("receipts.manage")) {
    // Get finance exports
    const { data: financeExports } = await supabase
      .from("export_jobs")
      .select(`
        id,
        file_path,
        export_type,
        status,
        created_at
      `)
      .eq("school_id", schoolId)
      .in("export_type", ["payments", "receipts", "financial_reports"])
      .eq("status", "completed") as any;

    for (const export_ of financeExports || []) {
      files.push({
        id: export_.id,
        source: "export" as FileSource,
        schoolId,
        schoolName,
        title: `Finance Export: ${export_.export_type}`,
        category: "Financial" as FileCategory,
        fileName: getFileName(export_.file_path),
        mimeType: null,
        sizeBytes: null,
        status: "completed",
        owner: "School export",
        context: "Finance",
        scope: "School",
        issuedAt: null,
        expiresAt: null,
        createdAt: export_.created_at,
        canPreview: false,
        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }

    // Get authorized payment receipts (school-wide view for finance)
    if (permissions.includes("receipts.manage")) {
      const { data: receipts } = await supabase
        .from("payment_receipts")
        .select(`
          id,
          receipt_number,
          file_path,
          issued_at,
          voided_at,
          created_at
        `)
        .eq("school_id", schoolId) as any;

      for (const receipt of receipts || []) {
        files.push({
          id: receipt.id,
          source: "payment_receipt" as FileSource,
          schoolId,
          schoolName,
          title: `Receipt ${receipt.receipt_number}`,
          category: "Financial" as FileCategory,
          fileName: getFileName(receipt.file_path),
          mimeType: "application/pdf",
          sizeBytes: null,
          status: receipt.voided_at ? "voided" : "issued",
          owner: "School financial",
          context: "Finance",
          scope: "School",
          issuedAt: receipt.issued_at,
          expiresAt: null,
          createdAt: receipt.created_at,
          canPreview: true,
          canDownload: true,
          canReplace: false,
          canDelete: false,
        });
      }
    }
  }

  // 3. Health files - for health officers
  if (permissions.includes("health.manage")) {
    // Note: Medical documents would be in a medical_documents table
    // For now, we'll add placeholder for health exports
    const { data: healthExports } = await supabase
      .from("export_jobs")
      .select(`
        id,
        file_path,
        export_type,
        status,
        created_at
      `)
      .eq("school_id", schoolId)
      .eq("export_type", "health_records")
      .eq("status", "completed") as any;

    for (const export_ of healthExports || []) {
      files.push({
        id: export_.id,
        source: "export" as FileSource,
        schoolId,
        schoolName,
        title: `Health Export: ${export_.export_type}`,
        category: "Medical" as FileCategory,
        fileName: getFileName(export_.file_path),
        mimeType: null,
        sizeBytes: null,
        status: "completed",
        owner: "School export",
        context: "Health",
        scope: "School",
        issuedAt: null,
        expiresAt: null,
        createdAt: export_.created_at,
        canPreview: false,
        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }
  }

  // 4. Admissions files - for admissions staff
  if (permissions.includes("admissions.manage") || permissions.includes("applications.manage")) {
    // Get application documents for authorized applications
    const { data: applicationDocs } = await supabase
      .from("application_documents")
      .select(`
        id,
        document_type,
        file_path,
        created_at
      `)
      .eq("school_id", schoolId) as any;

    for (const doc of applicationDocs || []) {
      files.push({
        id: doc.id,
        source: "application_document" as FileSource,
        schoolId,
        schoolName,
        title: doc.document_type,
        category: "Admissions" as FileCategory,
        fileName: getFileName(doc.file_path),
        mimeType: inferMimeType(doc.file_path),
        sizeBytes: null,
        status: "available",
        owner: "Application",
        context: "Admissions",
        scope: "School",
        issuedAt: null,
        expiresAt: null,
        createdAt: doc.created_at,
        canPreview: canPreviewMimeType(inferMimeType(doc.file_path)),
        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }

    // Get admissions imports
    const { data: admissionsImports } = await supabase
      .from("import_batches")
      .select(`
        id,
        file_path,
        import_type,
        status,
        created_at
      `)
      .eq("school_id", schoolId)
      .eq("import_type", "students")
      .in("status", ["completed", "failed"]) as any;

    for (const import_ of admissionsImports || []) {
      files.push({
        id: import_.id,
        source: "import" as FileSource,
        schoolId,
        schoolName,
        title: `Admissions Import`,
        category: "Imports" as FileCategory,
        fileName: getFileName(import_.file_path),
        mimeType: null,
        sizeBytes: null,
        status: import_.status as MyFileItem["status"],
        owner: "School import",
        context: "Admissions",
        scope: "School",
        issuedAt: null,
        expiresAt: null,
        createdAt: import_.created_at,
        canPreview: false,
        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }
  }

  // 5. HR files - for HR administrators
  if (permissions.includes("staff.manage") || permissions.includes("hr.manage")) {
    // Get HR exports
    const { data: hrExports } = await supabase
      .from("export_jobs")
      .select(`
        id,
        file_path,
        export_type,
        status,
        created_at
      `)
      .eq("school_id", schoolId)
      .in("export_type", ["staff", "hr_reports"])
      .eq("status", "completed") as any;

    for (const export_ of hrExports || []) {
      files.push({
        id: export_.id,
        source: "export" as FileSource,
        schoolId,
        schoolName,
        title: `HR Export: ${export_.export_type}`,
        category: "Documents" as FileCategory,
        fileName: getFileName(export_.file_path),
        mimeType: null,
        sizeBytes: null,
        status: "completed",
        owner: "School export",
        context: "HR",
        scope: "School",
        issuedAt: null,
        expiresAt: null,
        createdAt: export_.created_at,
        canPreview: false,
        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }

    // Get HR imports
    const { data: hrImports } = await supabase
      .from("import_batches")
      .select(`
        id,
        file_path,
        import_type,
        status,
        created_at
      `)
      .eq("school_id", schoolId)
      .eq("import_type", "employees")
      .in("status", ["completed", "failed"]) as any;

    for (const import_ of hrImports || []) {
      files.push({
        id: import_.id,
        source: "import" as FileSource,
        schoolId,
        schoolName,
        title: `HR Import`,
        category: "Imports" as FileCategory,
        fileName: getFileName(import_.file_path),
        mimeType: null,
        sizeBytes: null,
        status: import_.status as MyFileItem["status"],
        owner: "School import",
        context: "HR",
        scope: "School",
        issuedAt: null,
        expiresAt: null,
        createdAt: import_.created_at,
        canPreview: false,
        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }
  }

  // Branding uses schools.logo_path and is presented by the owning settings workflow.

  // Apply filters
  const filteredFiles = filterFiles(files, filters);

  return { files: filteredFiles };
}

// Helper functions
function getFileName(filePath: string | null | undefined): string | null {
  if (!filePath) return null;
  const parts = filePath.split("/").filter(Boolean);
  return parts.at(-1) ?? null;
}

function inferMimeType(filePath: string | null): string | null {
  if (!filePath) return null;
  const normalized = filePath.toLowerCase();

  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".txt")) return "text/plain";
  if (normalized.endsWith(".doc")) return "application/msword";
  if (normalized.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (normalized.endsWith(".xls")) return "application/vnd.ms-excel";
  if (normalized.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return null;
}

function canPreviewMimeType(mimeType: string | null): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType === "image/png" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/webp"
  );
}

function parseSizeBytes(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function filterFiles(files: MyFileItem[], filters: RoleFileFilters): MyFileItem[] {
  const fileType = filters.fileType?.trim().toLowerCase();
  const department = filters.department?.trim().toLowerCase();
  const status = filters.status?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();

  return files.filter((file) => {
    if (fileType && fileType !== "all") {
      if (file.source.toLowerCase() !== fileType && file.category.toLowerCase() !== fileType) {
        return false;
      }
    }

    if (department && department !== "all") {
      if (file.context?.toLowerCase() !== department) {
        return false;
      }
    }

    if (status && status !== "all" && file.status.toLowerCase() !== status) {
      return false;
    }

    if (search) {
      const searchableText = [
        file.title,
        file.fileName,
        file.category,
        file.context,
        file.status,
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) return false;
    }

    return true;
  });
}
