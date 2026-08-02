import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { getFileBySourceAndId } from "@/lib/files/get-my-files";
import { getSecureDownloadUrl } from "@/lib/files/file-download";
import { parseFileSource, getFileSourceLabel } from "@/lib/files/file-paths";
import { FileStatusBadge } from "@/components/files/file-status-badge";
import { formatFileSize } from "@/lib/files/file-types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon, EyeIcon } from "lucide-react";
import Link from "next/link";

export default async function FileDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ fileId: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const context = await requireUserContext();
  const { fileId } = await params;
  const { source } = await searchParams;

  // Parse and validate source
  const fileSource = parseFileSource(source || null);
  if (!fileSource) {
    redirect("/app/files?error=Invalid file source");
  }

  // Fetch file details
  const file = await getFileBySourceAndId(fileSource, fileId);
  if (!file) {
    redirect("/app/files?error=File not found or access denied");
  }

  // Get download URL if available
  let downloadUrl: string | null = null;
  if (file.canDownload) {
    const result = await getSecureDownloadUrl(fileSource, fileId);
    if (result.success && result.url) {
      downloadUrl = result.url;
    }
  }

  const sourceLabel = getFileSourceLabel(fileSource);
  const size = formatFileSize(file.sizeBytes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/files">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to files
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{file.title}</h1>
          <p className="text-muted-foreground">{sourceLabel}</p>
        </div>
      </div>

      {/* File details */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <p className="text-sm">{file.category}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <FileStatusBadge status={file.status} />
            </div>
          </div>
          {file.schoolName && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">School</label>
              <p className="text-sm">{file.schoolName}</p>
            </div>
          )}
          {file.fileName && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">File Name</label>
              <p className="text-sm">{file.fileName}</p>
            </div>
          )}
          {file.mimeType && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">File Type</label>
              <p className="text-sm">{file.mimeType}</p>
            </div>
          )}
          {size !== "Unknown" && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Size</label>
              <p className="text-sm">{size}</p>
            </div>
          )}
          {file.issuedAt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Issued Date</label>
              <p className="text-sm">{new Date(file.issuedAt).toLocaleDateString()}</p>
            </div>
          )}
          {file.expiresAt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expires Date</label>
              <p className="text-sm">{new Date(file.expiresAt).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="text-sm">{new Date(file.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {file.canPreview && (
            <Button variant="ghost" disabled={!file.canPreview}>
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          {downloadUrl && (
            <Button variant="primary" asChild>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Preview placeholder */}
      {file.canPreview && (
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">Preview</h3>
          <div className="bg-muted rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              File preview will be displayed here for supported file types.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supported types: PDF, PNG, JPEG, WebP, Plain Text
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
