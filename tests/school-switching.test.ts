import { describe, expect, it } from "vitest";

import {
  maySelectSchool,
  readSchoolSelection,
  resolveActiveSchoolId,
} from "@/lib/auth/school-switching";

const SCHOOL_A = "11111111-1111-4111-8111-111111111111";
const SCHOOL_B = "22222222-2222-4222-8222-222222222222";

describe("school switching authorization", () => {
  it.each([undefined, ""])("rejects a missing selection safely", (value) => {
    const data = new FormData();
    if (value !== undefined) data.set("school_id", value);
    expect(readSchoolSelection(data, "__platform__")).toEqual({ kind: "missing" });
  });

  it("reads the selected UUID from the exact school_id field", () => {
    const data = new FormData();
    data.set("school_id", SCHOOL_A);
    expect(readSchoolSelection(data, "__platform__")).toEqual({
      kind: "school",
      schoolId: SCHOOL_A,
    });
  });

  it("allows an ordinary member only into their active school", () => {
    const memberships = [{ school_id: SCHOOL_A, status: "active" }];
    expect(maySelectSchool(false, memberships, SCHOOL_A)).toBe(true);
    expect(maySelectSchool(false, memberships, SCHOOL_B)).toBe(false);
  });

  it("allows a platform admin without a membership to select an active school", () => {
    expect(maySelectSchool(true, [], SCHOOL_A)).toBe(true);
  });

  it("preserves the cookie selection from the RPC active_school object", () => {
    expect(
      resolveActiveSchoolId(
        SCHOOL_A,
        { id: SCHOOL_A, status: "active", name: "Alpha" },
        false,
        [{ school_id: SCHOOL_A, status: "active" }],
      ),
    ).toBe(SCHOOL_A);
  });

  it("preserves platform-admin school scope without a membership", () => {
    expect(
      resolveActiveSchoolId(
        SCHOOL_A,
        { id: SCHOOL_A, status: "active" },
        true,
        [],
      ),
    ).toBe(SCHOOL_A);
  });

  it("rejects a persisted ordinary-user selection without membership", () => {
    expect(
      resolveActiveSchoolId(
        SCHOOL_B,
        { id: SCHOOL_B, status: "active" },
        false,
        [{ school_id: SCHOOL_A, status: "active" }],
      ),
    ).toBeNull();
  });

  it("clears platform scope when the platform sentinel is selected", () => {
    expect(resolveActiveSchoolId(null, null, true, [])).toBeNull();
  });
});
