import { describe, expect, it } from "vitest";
import { normalizeCountryCode } from "@/lib/validation/country-code";
import { moduleById } from "@/config/modules";

describe("campus country code", () => {
  it("shows Uganda while submitting UG", () => {
    const field = moduleById("campuses")?.fields?.find((item) => item.name === "country_code");
    expect(field?.defaultValue).toBe("UG");
    expect(field?.options).toContainEqual({ value: "UG", label: "Uganda" });
  });
  it("normalizes lowercase codes and defaults an omitted campus country to Uganda", () => {
    expect(normalizeCountryCode(" ug ")).toBe("UG");
    expect(normalizeCountryCode("")).toBe("UG");
  });
  it("rejects names and non-two-character codes before database access", () => {
    expect(() => normalizeCountryCode("Uganda")).toThrow(
      "Country must use a 2-letter country code."
    );
    expect(() => normalizeCountryCode("UGA")).toThrow("Country must use a 2-letter country code.");
  });
});
