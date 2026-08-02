import { describe, expect, it } from "vitest";
import { normalizeFormData } from "@/lib/validation/form-data";
import type { FieldConfig } from "@/config/modules";

const fields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "amount", label: "Amount", type: "number" },
  { name: "active", label: "Active", type: "checkbox" },
  { name: "metadata", label: "Metadata", type: "json", optional: true },
  { name: "tags", label: "Tags", type: "array", optional: true },
];

describe("normalizeFormData", () => {
  it("normalizes supported field types", () => {
    const data = new FormData();
    data.set("name", "  SchoolDB  ");
    data.set("amount", "1250");
    data.set("active", "on");
    data.set("metadata", '{"source":"test"}');
    data.set("tags", "finance, urgent\nreviewed");
    expect(normalizeFormData(fields, data)).toEqual({ name: "SchoolDB", amount: 1250, active: true, metadata: { source: "test" }, tags: ["finance", "urgent", "reviewed"] });
  });

  it("rejects invalid numbers and JSON", () => {
    const badNumber = new FormData();
    badNumber.set("amount", "x");
    expect(() => normalizeFormData(fields, badNumber)).toThrow("Amount must be a number");
    const badJson = new FormData();
    badJson.set("metadata", "{");
    expect(() => normalizeFormData(fields, badJson)).toThrow("Metadata must contain valid JSON");
  });
});
