"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { Search, X } from "lucide-react";

type PermissionItem = {
  id: string;
  code: string;
  module: string;
  name: string;
  description: string | null;
  risk_level: string;
};

type PermissionMatrixProps = {
  roleId: string;
  permissions: PermissionItem[];
  initialPermissionIds: string[];
  disabled: boolean;
  action: (formData: FormData) => Promise<void>;
};

function setsAreEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

function getRiskBadgeColor(risk: string): string {
  const riskLower = risk?.toLowerCase() || "normal";
  switch (riskLower) {
    case "low":
      return "bg-emerald-100 text-emerald-700";
    case "normal":
      return "bg-slate-100 text-slate-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "critical":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function PermissionMatrix({
  roleId,
  permissions,
  initialPermissionIds,
  disabled,
  action,
}: PermissionMatrixProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialPermissionIds),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "selected" | "unselected">("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const dirty = !setsAreEqual(selected, new Set(initialPermissionIds));

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    permissions.forEach((perm) => {
      if (!groups[perm.module]) {
        groups[perm.module] = [];
      }
      groups[perm.module]?.push(perm);
    });
    return groups;
  }, [permissions]);

  // Filter permissions
  const filteredGroups = useMemo(() => {
    const result: Record<string, PermissionItem[]> = {};
    
    Object.entries(groupedPermissions).forEach(([module, perms]) => {
      const filtered = perms.filter((perm) => {
        const matchesSearch = 
          searchQuery === "" ||
          perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          perm.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          perm.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
          filter === "all" ||
          (filter === "selected" && selected.has(perm.id)) ||
          (filter === "unselected" && !selected.has(perm.id));
        
        const matchesRisk = 
          riskFilter === "all" ||
          perm.risk_level.toLowerCase() === riskFilter.toLowerCase();
        
        return matchesSearch && matchesFilter && matchesRisk;
      });

      if (filtered.length > 0) {
        result[module] = filtered;
      }
    });

    return result;
  }, [groupedPermissions, searchQuery, filter, riskFilter, selected]);

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelected(newSelected);
  };

  const selectModule = (modulePermissions: PermissionItem[]) => {
    const newSelected = new Set(selected);
    modulePermissions.forEach((perm) => {
      newSelected.add(perm.id);
    });
    setSelected(newSelected);
  };

  const clearModule = (modulePermissions: PermissionItem[]) => {
    const newSelected = new Set(selected);
    modulePermissions.forEach((perm) => {
      newSelected.delete(perm.id);
    });
    setSelected(newSelected);
  };

  const reset = () => {
    setSelected(new Set(initialPermissionIds));
  };

  const totalSelected = selected.size;
  const totalPermissions = permissions.length;

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="w-40"
        >
          <option value="all">Show all</option>
          <option value="selected">Selected only</option>
          <option value="unselected">Unselected only</option>
        </Select>
        <Select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="w-40"
        >
          <option value="all">All risks</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
      </div>

      {/* Permission groups */}
      <form action={action} className="space-y-6">
        <input type="hidden" name="role_id" value={roleId} />
        
        {Object.entries(filteredGroups).map(([module, modulePermissions]) => {
          const moduleSelected = modulePermissions.filter((p) => selected.has(p.id)).length;
          const moduleTotal = modulePermissions.length;

          return (
            <div key={module} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{module}</h3>
                  <p className="text-sm text-slate-500">
                    {moduleSelected} of {moduleTotal} selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => selectModule(modulePermissions)}
                    disabled={disabled}
                  >
                    Select module
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => clearModule(modulePermissions)}
                    disabled={disabled}
                  >
                    Clear module
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {modulePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      name="permission_ids"
                      value={permission.id}
                      id={`perm-${permission.id}`}
                      checked={selected.has(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      disabled={disabled}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`perm-${permission.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span className="font-medium">{permission.name}</span>
                        <Badge className={getRiskBadgeColor(permission.risk_level)}>
                          {permission.risk_level}
                        </Badge>
                      </label>
                      <p className="text-sm text-slate-500 font-mono">
                        {permission.code}
                      </p>
                      {permission.description && (
                        <p className="text-sm text-slate-600 mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <span className="font-semibold">{totalSelected}</span> of{" "}
            <span className="font-semibold">{totalPermissions}</span> permissions
            selected
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={reset}
              disabled={!dirty || disabled}
            >
              Reset
            </Button>
            <Button type="submit" disabled={!dirty || disabled}>
              Save permissions
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
