"use client";

import { useState } from "react";
import { FileIcon, DownloadIcon, EyeIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileStatusBadge } from "./file-status-badge";
import { getFileIcon, formatFileSize } from "@/lib/files/file-types";
import { getFileSourceLabel } from "@/lib/files/file-paths";
import { getAuthorizedFileUrlAction } from "@/app/app/files/authorized-actions";
import type { MyFileItem } from "@/lib/files/file-types";

interface FileCardProps {
  file: MyFileItem;
}

export function FileCard({ file }: FileCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const icon = getFileIcon(file.mimeType);
  const size = formatFileSize(file.sizeBytes);
  const sourceLabel = getFileSourceLabel(file.source);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const result = await getAuthorizedFileUrlAction({
        source: file.source,
        id: file.id,
        action: "download",
      });

      if (result.success && result.url) {
        // Open the signed URL in a new tab
        window.open(result.url, "_blank");
      } else {
        setDownloadError(result.error || "Failed to download file");
      }
    } catch (error) {
      setDownloadError("An error occurred while downloading");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const result = await getAuthorizedFileUrlAction({
        source: file.source,
        id: file.id,
        action: "preview",
      });

      if (result.success && result.url) {
        // Open the signed URL in a new tab
        window.open(result.url, "_blank");
      } else {
        setDownloadError(result.error || "Failed to preview file");
      }
    } catch (error) {
      setDownloadError("An error occurred while previewing");
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded">
            <FileIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-sm line-clamp-1">{file.title}</h3>
            <p className="text-xs text-muted-foreground">{sourceLabel}</p>
          </div>
        </div>
        <FileStatusBadge status={file.status} />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground mb-3">
        <div className="flex justify-between">
          <span>Category:</span>
          <span className="font-medium">{file.category}</span>
        </div>
        {file.owner && (
          <div className="flex justify-between">
            <span>Owner:</span>
            <span className="font-medium">{file.owner}</span>
          </div>
        )}
        {file.context && (
          <div className="flex justify-between">
            <span>Context:</span>
            <span className="font-medium">{file.context}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Scope:</span>
          <span className="font-medium">{file.scope}</span>
        </div>
        {file.schoolName && (
          <div className="flex justify-between">
            <span>School:</span>
            <span className="font-medium">{file.schoolName}</span>
          </div>
        )}
        {size !== "Unknown" && (
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="font-medium">{size}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="font-medium">
            {new Date(file.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {downloadError && (
        <div className="mb-3 text-xs text-destructive">
          {downloadError}
        </div>
      )}

      <div className="flex gap-2">
        {file.canPreview && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handlePreview}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
        {file.canDownload && (
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
