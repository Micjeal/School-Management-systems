"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, Globe, Search } from "lucide-react";
import type { ConditionType } from "@/lib/medical-conditions/types";
import type { UserContext } from "@/types/context";
import type { MedicalConditionActionState } from "@/app/app/modules/medical-conditions/actions";

interface MedicalConditionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: UserContext;
  schools: Array<{ id: string; name: string }>;
  action: (formData: FormData) => Promise<MedicalConditionActionState>;
  state: MedicalConditionActionState;
  onEdit?: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  editCondition?: {
    id: string;
    code: string;
    name: string;
    condition_type: ConditionType;
    description: string | null;
    school_id: string | null;
  } | null;
}

export function MedicalConditionForm({
  open,
  onOpenChange,
  context,
  schools,
  action,
  state,
  onEdit,
  editCondition,
}: MedicalConditionFormProps) {
  const isPlatformAdmin = context.is_platform_admin;
  const isEdit = !!editCondition;
  const hasActiveSchool = !!context.active_school_id && context.active_school_id !== "__platform__";

  const defaultScope = hasActiveSchool ? "current_school" : (isPlatformAdmin ? "global" : "current_school");

  const [scope, setScope] = useState<string>(state.values?.scope || defaultScope);
  const [targetSchoolId, setTargetSchoolId] = useState<string>(state.values?.target_school_id || "");
  const [code, setCode] = useState<string>(state.values?.code || editCondition?.code || "");
  const [name, setName] = useState<string>(state.values?.name || editCondition?.name || "");
  const [conditionType, setConditionType] = useState<string>(state.values?.condition_type || editCondition?.condition_type || "condition");
  const [description, setDescription] = useState<string>(state.values?.description || editCondition?.description || "");
  const [schoolSearch, setSchoolSearch] = useState<string>("");
  const [editError, setEditError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form when dialog opens/closes or editCondition changes
  useEffect(() => {
    if (open) {
      setScope(state.values?.scope || defaultScope);
      setTargetSchoolId(state.values?.target_school_id || "");
      setCode(state.values?.code || editCondition?.code || "");
      setName(state.values?.name || editCondition?.name || "");
      setConditionType(state.values?.condition_type || editCondition?.condition_type || "condition");
      setDescription(state.values?.description || editCondition?.description || "");
      setEditError("");
      setIsSubmitting(false);
    }
  }, [open, editCondition, state.values, defaultScope]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isEdit && onEdit && editCondition) {
      setIsSubmitting(true);
      setEditError("");
      
      const formData = new FormData();
      formData.append("code", code);
      formData.append("name", name);
      formData.append("condition_type", conditionType);
      formData.append("description", description);
      
      const result = await onEdit(formData);
      
      if (result.error) {
        setEditError(result.error);
        setIsSubmitting(false);
      }
    }
  };

  const canSelectScope = isPlatformAdmin && !isEdit;
  const canSelectSpecificSchool = isPlatformAdmin && scope === "specific_school" && !isEdit;

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const getDestinationText = () => {
    if (isEdit) {
      if (editCondition?.school_id === null) {
        return { title: "Global catalogue", subtitle: "Available to all schools", icon: Globe };
      }
      const school = schools.find(s => s.id === editCondition?.school_id);
      return { title: school?.name || "Unknown school", subtitle: "School-specific condition", icon: Building2 };
    }

    if (scope === "global") {
      return { title: "Global catalogue", subtitle: "This condition will be available to every school.", icon: Globe };
    }
    if (scope === "current_school") {
      return { title: context.active_school?.name || "Current school", subtitle: "This condition will only be available in this school.", icon: Building2 };
    }
    if (scope === "specific_school") {
      const school = schools.find(s => s.id === targetSchoolId);
      return { title: school?.name || "Select a school", subtitle: "This condition will only be available in the selected school.", icon: Building2 };
    }
    return { title: "Unknown", subtitle: "", icon: Building2 };
  };

  const destination = getDestinationText();
  const DestinationIcon = destination.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit condition" : "Add condition"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the medical condition catalogue entry."
              : "Create a new medical condition for the catalogue."}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DestinationIcon className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Adding to</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{destination.title}</p>
            <p className="text-xs text-slate-600">{destination.subtitle}</p>
          </div>
        )}

        <form action={isEdit ? undefined : action} onSubmit={isEdit ? handleSubmit : undefined} className="space-y-3">
          <input type="hidden" name="scope" value={scope} />
          <input type="hidden" name="target_school_id" value={targetSchoolId} />
          {isEdit && editCondition && (
            <input type="hidden" name="condition_id" value={editCondition.id} />
          )}
          {editError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
              {editError}
            </div>
          )}
          {state.message && !state.success && !isEdit && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
              {state.message}
            </div>
          )}

          {canSelectScope && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Catalogue scope</label>
              <Select
                value={scope}
                onValueChange={setScope}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hasActiveSchool && (
                    <SelectItem value="current_school">
                      Current school — {context.active_school?.name}
                    </SelectItem>
                  )}
                  <SelectItem value="global">Global catalogue</SelectItem>
                  <SelectItem value="specific_school">Another school</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isPlatformAdmin && !isEdit && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Catalogue scope:</span> Current school — {context.active_school?.name}
            </div>
          )}

          {canSelectSpecificSchool && (
            <div className="space-y-2">
              <label className="text-sm font-medium">School</label>
              <Select
                value={targetSchoolId}
                onValueChange={setTargetSchoolId}
                name="target_school_id"
                onOpenChange={(open) => {
                  if (!open) setSchoolSearch("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search schools..."
                        value={schoolSearch}
                        onChange={(e) => setSchoolSearch(e.target.value)}
                        className="pl-8 h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {filteredSchools.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No schools found
                    </div>
                  ) : (
                    filteredSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <Input
              placeholder="ASTHMA"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              name="code"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Asthma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              name="name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condition type</label>
            <Select
              value={conditionType}
              onValueChange={setConditionType}
              name="condition_type"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="condition">Medical condition</SelectItem>
                <SelectItem value="allergy">Allergy</SelectItem>
                <SelectItem value="disability">Disability or support need</SelectItem>
                <SelectItem value="dietary">Dietary requirement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea
              placeholder="Describe this condition for the catalogue..."
              className="resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              name="description"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || state.success}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || state.success}>
              {(isSubmitting || state.success) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
