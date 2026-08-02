import { describe, expect, it } from "vitest";
import { MODULES, MODULE_GROUPS, moduleById } from "@/config/modules";

describe("module registry", () => {
  it("registers 139 unique module screens", () => {
    expect(MODULES).toHaveLength(139);
    expect(new Set(MODULES.map((module) => module.id)).size).toBe(MODULES.length);
  });

  it("references known groups and valid tables", () => {
    const groups = new Set<string>(MODULE_GROUPS.map((group) => group.id));
    for (const mod of MODULES) {
      expect(groups.has(mod.group)).toBe(true);
      expect(mod.table.length).toBeGreaterThan(1);
      expect(mod.columns.length).toBeGreaterThan(0);
    }
  });

  it("protects derived transactional tables from generic edits", () => {
    for (const id of ["student-attendance", "mark-entries", "subject-results", "report-cards", "invoice-lines", "journals", "journal-lines", "payment-allocations", "payment-receipts", "payroll-entries", "result-publications", "stock-balances"]) {
      expect(moduleById(id)?.readOnly).toBe(true);
    }
  });

  it("configures non-standard primary keys and ordering", () => {
    expect(moduleById("feature-flags")?.primaryKey).toEqual(["school_id", "feature_code"]);
    expect(moduleById("medical-profiles")?.primaryKey).toEqual(["student_id"]);
    expect(moduleById("stock-balances")?.primaryKey).toEqual(["inventory_item_id", "inventory_location_id"]);
    expect(moduleById("audit")?.orderBy).toBe("occurred_at");
    expect(moduleById("integration-events")?.orderBy).toBe("received_at");
  });

  it("resolves workflow-critical modules", () => {
    for (const id of ["students", "employees", "attendance-sessions", "assessments", "invoices", "payments", "payroll-runs", "library-loans", "stock-movements"]) {
      expect(moduleById(id)?.id).toBe(id);
    }
  });
});
