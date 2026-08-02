"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { MedicalConditionSummary } from "./medical-condition-summary";
import { MedicalConditionTabs } from "./medical-condition-tabs";
import { MedicalConditionFilters } from "./medical-condition-filters";
import { MedicalConditionTable } from "./medical-condition-table";
import { MedicalConditionForm } from "./medical-condition-form";
import { DeleteMedicalConditionDialog } from "./delete-medical-condition-dialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import type { UserContext } from "@/types/context";
import type { MedicalConditionWithUsage, MedicalConditionFilters as FilterType } from "@/lib/medical-conditions/types";
import { createMedicalConditionAction, updateMedicalConditionAction, deleteMedicalConditionAction, type MedicalConditionActionState } from "@/app/app/modules/medical-conditions/actions";

interface MedicalConditionsClientProps {
  initialContext: UserContext;
  initialConditions: MedicalConditionWithUsage[];
  schools: Array<{ id: string; name: string }>;
  isPlatformView: boolean;
}

export function MedicalConditionsClient({
  initialContext,
  initialConditions,
  schools,
  isPlatformView,
}: MedicalConditionsClientProps) {
  const router = useRouter();
  const [conditions, setConditions] = useState<MedicalConditionWithUsage[]>(initialConditions);
  const [currentTab, setCurrentTab] = useState(isPlatformView ? "global" : "available");
  const [filters, setFilters] = useState<FilterType>({});

  const [createState, createFormAction] = useActionState<MedicalConditionActionState, FormData>(
    createMedicalConditionAction,
    { success: false }
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCondition, setEditCondition] = useState<MedicalConditionWithUsage | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCondition, setDeleteCondition] = useState<MedicalConditionWithUsage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async (formData: FormData) => {
    if (!editCondition) return { error: "No condition selected" };

    const result = await updateMedicalConditionAction(editCondition.id, formData);

    if (result.success) {
      setIsFormOpen(false);
      setEditCondition(null);
      router.refresh();
    }
    
    return result;
  };

  const handleDelete = async () => {
    if (!deleteCondition) return;

    setIsDeleting(true);
    const result = await deleteMedicalConditionAction(deleteCondition.id);
    setIsDeleting(false);

    if (result.success) {
      setDeleteDialogOpen(false);
      setDeleteCondition(null);
      router.refresh();
    }
  };

  const openCreateForm = () => {
    setEditCondition(null);
    setIsFormOpen(true);
  };

  const openEditForm = (condition: MedicalConditionWithUsage) => {
    setEditCondition(condition);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (condition: MedicalConditionWithUsage) => {
    setDeleteCondition(condition);
    setDeleteDialogOpen(true);
  };

  const filteredConditions = conditions.filter((condition) => {
    if (filters.scope === "global" && condition.school_id !== null) return false;
    if (filters.scope === "school" && condition.school_id === null) return false;
    if (filters.type && filters.type !== "all" && condition.condition_type !== filters.type) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!condition.code.toLowerCase().includes(search) && !condition.name.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (filters.usage === "in_use" && condition.usage_count === 0) return false;
    if (filters.usage === "unused" && condition.usage_count > 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Conditions</h1>
          <p className="text-muted-foreground mt-1">
            Manage the standardized health-condition catalogue available across SchoolDB.
          </p>
          {isPlatformView && (
            <p className="text-sm text-muted-foreground mt-2">
              Global catalogue
            </p>
          )}
          {!isPlatformView && initialContext.active_school && (
            <p className="text-sm text-muted-foreground mt-2">
              Global and {initialContext.active_school.school_name} catalogue entries
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add condition
          </Button>
        </div>
      </div>

      <MedicalConditionSummary conditions={conditions} isPlatformView={isPlatformView} />

      <MedicalConditionTabs
        value={currentTab}
        onValueChange={setCurrentTab}
        isPlatformView={isPlatformView}
      />

      <MedicalConditionFilters
        filters={filters}
        onFiltersChange={setFilters}
        isPlatformView={isPlatformView}
      />

      <MedicalConditionTable
        conditions={filteredConditions}
        context={initialContext}
        isPlatformView={isPlatformView}
        onEdit={openEditForm}
        onDelete={openDeleteDialog}
      />

      {filteredConditions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isPlatformView
              ? "No global medical conditions. Create the standardized conditions that schools can use in student health records."
              : "No school-specific conditions. This school currently uses only the global medical-condition catalogue."}
          </p>
        </div>
      )}

      <MedicalConditionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        context={initialContext}
        schools={schools}
        action={createFormAction}
        state={createState}
        onEdit={handleEdit}
        editCondition={editCondition ? {
          id: editCondition.id,
          code: editCondition.code,
          name: editCondition.name,
          condition_type: editCondition.condition_type,
          description: editCondition.description,
          school_id: editCondition.school_id,
        } : null}
      />

      <DeleteMedicalConditionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        condition={deleteCondition}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
