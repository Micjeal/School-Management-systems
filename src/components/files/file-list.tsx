import { FileCard } from "./file-card";
import type { MyFileItem } from "@/lib/files/file-types";

interface FileListProps {
  files: MyFileItem[];
  showTable?: boolean;
}

export function FileList({ files, showTable = false }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No files found</p>
      </div>
    );
  }

  if (showTable) {
    return <FileTable files={files} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard key={`${file.source}-${file.id}`} file={file} />
      ))}
    </div>
  );
}

function FileTable({ files }: { files: MyFileItem[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">File</th>
            <th className="text-left p-3 font-medium">Category</th>
            <th className="text-left p-3 font-medium">Owner/Context</th>
            <th className="text-left p-3 font-medium">Scope</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Created</th>
            <th className="text-right p-3 font-medium">Size</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={`${file.source}-${file.id}`} className="border-t hover:bg-muted/50">
              <td className="p-3">
                <div className="font-medium">{file.title}</div>
                {file.fileName && (
                  <div className="text-xs text-muted-foreground">{file.fileName}</div>
                )}
              </td>
              <td className="p-3">{file.category}</td>
              <td className="p-3">
                {file.owner || file.context || "-"}
              </td>
              <td className="p-3">{file.scope}</td>
              <td className="p-3">
                <FileStatusBadge status={file.status} />
              </td>
              <td className="p-3">
                {new Date(file.createdAt).toLocaleDateString()}
              </td>
              <td className="p-3 text-right">
                {formatFileSize(file.sizeBytes)}
              </td>
              <td className="p-3 text-right">
                <FileActions file={file} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileStatusBadge({ status }: { status: MyFileItem["status"] }) {
  const variants: Record<MyFileItem["status"], "default" | "secondary" | "destructive" | "outline"> = {
    verified: "default",
    unverified: "secondary",
    published: "default",
    draft: "secondary",
    issued: "default",
    voided: "destructive",
    expiring: "secondary",
    expired: "destructive",
    available: "default",
    processing: "secondary",
    completed: "default",
    failed: "destructive",
    missing: "destructive",
    orphaned: "destructive",
    healthy: "default",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      variants[status] === "default" ? "bg-green-100 text-green-800" :
      variants[status] === "secondary" ? "bg-gray-100 text-gray-800" :
      variants[status] === "destructive" ? "bg-red-100 text-red-800" :
      "bg-gray-100 text-gray-800"
    }`}>
      {status}
    </span>
  );
}

function FileActions({ file }: { file: MyFileItem }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {file.canPreview && (
        <button className="text-xs text-blue-600 hover:text-blue-800">
          Preview
        </button>
      )}
      {file.canDownload && (
        <button className="text-xs text-blue-600 hover:text-blue-800">
          Download
        </button>
      )}
      {file.canReplace && (
        <button className="text-xs text-gray-600 hover:text-gray-800">
          Replace
        </button>
      )}
      {file.canDelete && (
        <button className="text-xs text-red-600 hover:text-red-800">
          Delete
        </button>
      )}
    </div>
  );
}

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "-";
  
  const units = ["B", "KB", "MB", "GB"];
  const size = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = bytes / Math.pow(1024, size);
  
  return `${formattedSize.toFixed(1)} ${units[size]}`;
}
