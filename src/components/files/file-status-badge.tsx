import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/files/file-types";
import type { FileStatus } from "@/lib/files/file-types";

interface FileStatusBadgeProps {
  status: FileStatus;
}

export function FileStatusBadge({ status }: FileStatusBadgeProps) {
  const label = getStatusLabel(status);

  return <Badge>{label}</Badge>;
}
