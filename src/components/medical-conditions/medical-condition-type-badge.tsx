import { Badge } from "@/components/ui/badge";
import { getConditionTypeLabel, getConditionTypeColor } from "@/lib/medical-conditions/types";
import type { ConditionType } from "@/lib/medical-conditions/types";

interface MedicalConditionTypeBadgeProps {
  type: ConditionType;
}

export function MedicalConditionTypeBadge({ type }: MedicalConditionTypeBadgeProps) {
  const label = getConditionTypeLabel(type);
  const color = getConditionTypeColor(type);

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    red: "bg-red-100 text-red-800 border-red-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    slate: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <Badge className={colorClasses[color] || colorClasses.slate}>
      {label}
    </Badge>
  );
}
