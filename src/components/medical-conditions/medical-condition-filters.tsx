import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { MedicalConditionFilters, ConditionType } from "@/lib/medical-conditions/types";

interface MedicalConditionFiltersProps {
  filters: MedicalConditionFilters;
  onFiltersChange: (filters: MedicalConditionFilters) => void;
  isPlatformView: boolean;
}

export function MedicalConditionFilters({ filters, onFiltersChange, isPlatformView }: MedicalConditionFiltersProps) {
  const conditionTypes: { value: ConditionType | "all"; label: string }[] = [
    { value: "all", label: "All types" },
    { value: "condition", label: "Medical condition" },
    { value: "allergy", label: "Allergy" },
    { value: "disability", label: "Disability or support need" },
    { value: "dietary", label: "Dietary requirement" },
    { value: "other", label: "Other" },
  ];

  const scopeOptions = isPlatformView
    ? [
        { value: "all", label: "All scopes" },
        { value: "global", label: "Global" },
        { value: "school", label: "School-specific" },
      ]
    : [
        { value: "all", label: "All scopes" },
        { value: "global", label: "Global" },
        { value: "school", label: "School-specific" },
      ];

  const usageOptions = [
    { value: "all", label: "All usage" },
    { value: "in_use", label: "In use" },
    { value: "unused", label: "Unused" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by code or name..."
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.type || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, type: value as ConditionType | "all" })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {conditionTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.scope || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, scope: value as "all" | "global" | "school" })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Scope" />
        </SelectTrigger>
        <SelectContent>
          {scopeOptions.map((scope) => (
            <SelectItem key={scope.value} value={scope.value}>
              {scope.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.usage || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, usage: value as "all" | "in_use" | "unused" })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Usage" />
        </SelectTrigger>
        <SelectContent>
          {usageOptions.map((usage) => (
            <SelectItem key={usage.value} value={usage.value}>
              {usage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
