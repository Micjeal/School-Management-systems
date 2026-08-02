import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MedicalConditionWithUsage } from "@/lib/medical-conditions/types";

interface DeleteMedicalConditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condition: MedicalConditionWithUsage | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteMedicalConditionDialog({
  open,
  onOpenChange,
  condition,
  onConfirm,
  isDeleting,
}: DeleteMedicalConditionDialogProps) {
  if (!condition) return null;

  const isInUse = condition.usage_count > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isInUse ? "Deletion unavailable" : `Delete "${condition.name}"?`}
          </DialogTitle>
          <DialogDescription>
            {isInUse ? (
              <>
                This condition is assigned to {condition.usage_count} student medical record
                {condition.usage_count > 1 ? "s" : ""}. Replace or migrate those references before
                deleting it.
              </>
            ) : (
              <>This removes the catalogue entry. It does not delete any student medical history.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          {!isInUse && (
            <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
