import Link from "next/link";
import { FileIcon, DownloadIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileStatusBadge } from "./file-status-badge";
import { getFileIcon, formatFileSize } from "@/lib/files/file-types";
import { getFileDetailPath, getFileSourceLabel } from "@/lib/files/file-paths";
import type { MyFileItem } from "@/lib/files/file-types";

interface FileCardProps {
  file: MyFileItem;
}

export function FileCard({ file }: FileCardProps) {
  const icon = getFileIcon(file.mimeType);
  const size = formatFileSize(file.sizeBytes);
  const sourceLabel = getFileSourceLabel(file.source);

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

      <div className="flex gap-2">
        <Link href={getFileDetailPath(file.source, file.id)} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            <EyeIcon className="h-4 w-4 mr-2" />
            View
          </Button>
        </Link>
        {file.canDownload && (
          <form action="/app/files/actions/download" method="POST">
            <input type="hidden" name="source" value={file.source} />
            <input type="hidden" name="fileId" value={file.id} />
            <Button variant="primary" size="sm" type="submit">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
