import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-next-path";

describe("safeNextPath", () => {
  it("allows application-relative paths", () => {
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
    expect(safeNextPath("/app/messages?unread=true")).toBe("/app/messages?unread=true");
  });

  it("rejects absolute and protocol-relative redirects", () => {
    expect(safeNextPath("https://example.com/steal")).toBe("/app");
    expect(safeNextPath("//example.com/steal")).toBe("/app");
    expect(safeNextPath(null)).toBe("/app");
  });

  it("preserves a validated module destination after login", () => {
    expect(safeNextPath("/app/modules/notification-templates")).toBe(
      "/app/modules/notification-templates",
    );
  });
});
