export type FileSource =
  | "person_document"
  | "report_card"
  | "payment_receipt"
  | "message_attachment"
  | "application_document"
  | "assessment_file"
  | "import"
  | "export"
  | "school_branding";

export type FileCategory =
  | "Documents"
  | "Academic"
  | "Financial"
  | "Attachments"
  | "Medical"
  | "Admissions"
  | "Imports"
  | "Exports"
  | "Branding";

export type FileStatus =
  | "verified"
  | "unverified"
  | "published"
  | "draft"
  | "issued"
  | "voided"
  | "expiring"
  | "expired"
  | "available"
  | "processing"
  | "completed"
  | "failed"
  | "missing"
  | "orphaned"
  | "healthy";

export type MyFileItem = {
  id: string;
  source: FileSource;

  schoolId: string;
  schoolName: string | null;

  title: string;
  category: FileCategory;

  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;

  status: FileStatus;

  owner: string | null;
  context: string | null;
  scope: string;

  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;

  canPreview: boolean;
  canDownload: boolean;
  canReplace: boolean;
  canDelete: boolean;
};

export type PlatformFileSummary = {
  totalStoredFiles: number;
  storageUsed: number;
  schoolsUsingStorage: number;
  failedOrMissingFiles: number;
  recentImports: number;
  recentExports: number;
  orphanedObjects: number;
  securityWarnings: number;
};

export type SchoolFileSummary = {
  schoolId: string;
  schoolName: string | null;
  storedFileCount: number;
  storageUsed: number;
  imports: number;
  exports: number;
  missingObjects: number;
  orphanedObjects: number;
  lastFileActivity: string | null;
};

export type StorageHealthIssue = {
  id: string;
  schoolId: string;
  schoolName: string | null;
  issueType: "missing_object" | "orphaned_object" | "invalid_path" | "wrong_school_prefix" | "duplicate_path" | "oversized_object" | "failed_cleanup";
  source: FileSource | null;
  metadataId: string | null;
  storagePath: string | null;
  detectedAt: string;
  severity: "low" | "medium" | "high" | "critical";
};

export const FILE_SOURCE_BUCKETS: Record<FileSource, string | Record<string, string>> = {
  person_document: {
    student: "student-documents",
    employee: "staff-documents",
    guardian: "student-documents",
  },
  report_card: "report-cards",
  payment_receipt: "receipts",
  message_attachment: "message-attachments",
  application_document: "student-documents",
  assessment_file: "assessment-files",
  import: "imports",
  export: "exports",
  school_branding: "school-branding",
};

export type MyFileFilters = {
  category?: string;
  status?: string;
  search?: string;
};

export type FileSummary = {
  allFiles: number;
  verifiedDocuments: number;
  expiringSoon: number;
  recentFiles: number;
};

export function getFileIcon(mimeType: string | null): string {
  if (!mimeType) return "file";
  
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "music";
  if (mimeType.includes("pdf")) return "file-text";
  if (mimeType.includes("word") || mimeType.includes("document")) return "file-text";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "table";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "presentation";
  
  return "file";
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "Unknown";
  
  const units = ["B", "KB", "MB", "GB"];
  const size = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = bytes / Math.pow(1024, size);
  
  return `${formattedSize.toFixed(1)} ${units[size]}`;
}

export function getStatusLabel(status: FileStatus): string {
  const labels: Record<FileStatus, string> = {
    verified: "Verified",
    unverified: "Unverified",
    published: "Published",
    draft: "Draft",
    issued: "Issued",
    voided: "Voided",
    expiring: "Expiring Soon",
    expired: "Expired",
    available: "Available",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    missing: "Missing",
    orphaned: "Orphaned",
    healthy: "Healthy",
  };
  
  return labels[status] || status;
}