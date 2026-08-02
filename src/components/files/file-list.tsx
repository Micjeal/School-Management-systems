import { FileCard } from "./file-card";
import type { MyFileItem } from "@/lib/files/file-types";

interface FileListProps {
  files: MyFileItem[];
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No files found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard key={`${file.source}-${file.id}`} file={file} />
      ))}
    </div>
  );
}
