export class AccessScopeError extends Error {
  constructor(public readonly code: "ACTIVE_SCHOOL_REQUIRED" | "PERMISSION_REQUIRED") {
    super(code);
    this.name = "AccessScopeError";
  }
}

export const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
