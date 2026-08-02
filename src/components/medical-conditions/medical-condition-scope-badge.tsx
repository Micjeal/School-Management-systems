import { Badge } from "@/components/ui/badge";
import { Globe, Building2 } from "lucide-react";

interface MedicalConditionScopeBadgeProps {
  scope: "global" | "school";
  schoolName?: string | null;
}

export function MedicalConditionScopeBadge({ scope, schoolName }: MedicalConditionScopeBadgeProps) {
  if (scope === "global") {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Globe className="h-3 w-3" />
        Global
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1.5">
      <Building2 className="h-3 w-3" />
      School-specific
    </Badge>
  );
}
