import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MedicalConditionScopeBadge } from "./medical-condition-scope-badge";
import { MedicalConditionTypeBadge } from "./medical-condition-type-badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { MedicalConditionWithUsage } from "@/lib/medical-conditions/types";
import type { UserContext } from "@/types/context";
import { canEditCondition, canDeleteCondition } from "@/lib/medical-conditions/permissions";

interface MedicalConditionTableProps {
  conditions: MedicalConditionWithUsage[];
  context: UserContext;
  isPlatformView: boolean;
  onEdit: (condition: MedicalConditionWithUsage) => void;
  onDelete: (condition: MedicalConditionWithUsage) => void;
}

export function MedicalConditionTable({
  conditions,
  context,
  isPlatformView,
  onEdit,
  onDelete,
}: MedicalConditionTableProps) {
  if (conditions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No conditions match these filters.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conditions.map((condition) => {
            const canEdit = canEditCondition(context, condition);
            const canDelete = canDeleteCondition(context, condition);
            const isGlobal = condition.school_id === null;

            return (
              <TableRow key={condition.id}>
                <TableCell className="font-mono text-sm">{condition.code}</TableCell>
                <TableCell className="font-medium">{condition.name}</TableCell>
                <TableCell>
                  <MedicalConditionTypeBadge type={condition.condition_type} />
                </TableCell>
                <TableCell>
                  <MedicalConditionScopeBadge
                    scope={isGlobal ? "global" : "school"}
                    schoolName={condition.school_name}
                  />
                </TableCell>
                <TableCell>
                  {isGlobal ? (
                    <span className="text-muted-foreground">All schools</span>
                  ) : (
                    condition.school_name || "Unknown"
                  )}
                </TableCell>
                <TableCell>
                  {condition.usage_count === 0 ? (
                    <span className="text-muted-foreground">Not in use</span>
                  ) : condition.usage_count === 1 ? (
                    "1 student record"
                  ) : (
                    `${condition.usage_count} student records`
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(condition.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/app/modules/medical-conditions/${condition.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(condition)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && condition.usage_count === 0 && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(condition)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
