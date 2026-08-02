export type FileSource =
  | "person_document"
  | "report_card"
  | "payment_receipt"
  | "message_attachment";

export type FileCategory =
  | "Documents"
  | "Academic"
  | "Financial"
  | "Attachments";

export type FileStatus =
  | "verified"
  | "unverified"
  | "published"
  | "issued"
  | "voided"
  | "expiring"
  | "expired"
  | "available";

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

  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;

  canPreview: boolean;
  canDownload: boolean;
  canReplace: boolean;
  canDelete: boolean;
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
    issued: "Issued",
    voided: "Voided",
    expiring: "Expiring Soon",
    expired: "Expired",
    available: "Available",
  };
  
  return labels[status] || status;
}