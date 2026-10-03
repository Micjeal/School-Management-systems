import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("staff creation route", () => {
  it("does not treat the static new route as an employee identifier", () => {
    const proxy = readFileSync("src/proxy.ts", "utf8");
    expect(proxy).toContain('staff|admissions|approvals|assessments|attendance)\\/((?!new');
  });
});
