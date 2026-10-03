import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("batches 3 through 7 completion safeguards", () => {
  it("keeps edits and financial transitions state-aware", () => {
    expect(read("src/app/app/assessments/actions.ts")).toContain('assessment.status !== "draft"');
    expect(read("src/app/app/finance/actions.ts")).toContain('invoice.status !== "draft"');
    expect(read("src/app/app/procurement/actions.ts")).toContain("allowedTransitions");
    expect(read("src/app/app/finance/refunds/actions.ts")).toContain('refund.status !== "approved"');
  });

  it("provides route-level loading and error recovery", () => {
    expect(read("src/app/app/students/loading.tsx")).toContain("RouteLoading");
    expect(read("src/app/app/finance/error.tsx")).toContain("RouteError");
    expect(read("src/components/layout/route-error.tsx")).toContain('"use client"');
  });

  it("does not expose generic destructive deletion", () => {
    expect(read("src/app/app/modules/actions.ts")).not.toContain("deleteModuleRecord");
    expect(read("src/app/app/modules/[moduleId]/page.tsx")).toContain("Read only");
  });

  it("restricts background workers and export projections", () => {
    for (const worker of ["notification-worker", "webhook-worker"]) {
      const source = read(`supabase/functions/${worker}/index.ts`);
      expect(source).toContain("token !== serviceKey");
      expect(source).not.toContain('.select("*")');
    }
    const report = read("supabase/functions/report-worker/index.ts");
    expect(report).toContain("EXPORTS");
    expect(report).toContain('eq("status", "queued")');
    expect(report).not.toContain('.select("*")');
  });
});
