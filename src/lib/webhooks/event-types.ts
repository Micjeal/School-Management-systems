export const WEBHOOK_EVENT_TYPES = [
  {
    code: "school.created",
    label: "School created",
    scope: "platform",
  },
  {
    code: "student.created",
    label: "Student created",
    scope: "school",
  },
  {
    code: "student.updated",
    label: "Student updated",
    scope: "school",
  },
  {
    code: "application.submitted",
    label: "Application submitted",
    scope: "school",
  },
  {
    code: "payment.posted",
    label: "Payment posted",
    scope: "school",
  },
  {
    code: "invoice.posted",
    label: "Invoice posted",
    scope: "school",
  },
  {
    code: "result.published",
    label: "Results published",
    scope: "school",
  },
  {
    code: "attendance.recorded",
    label: "Attendance recorded",
    scope: "school",
  },
] as const;

export type WebhookEventTypeCode = (typeof WEBHOOK_EVENT_TYPES)[number]["code"];

export function getEventTypeLabel(code: string): string {
  const eventType = WEBHOOK_EVENT_TYPES.find((t) => t.code === code);
  return eventType?.label || code;
}

export function getEventTypeScope(code: string): "platform" | "school" | null {
  const eventType = WEBHOOK_EVENT_TYPES.find((t) => t.code === code);
  return eventType?.scope || null;
}

export function isValidEventType(code: string): boolean {
  return WEBHOOK_EVENT_TYPES.some((t) => t.code === code);
}

export function getEventTypesForScope(scope: "platform" | "school") {
  return WEBHOOK_EVENT_TYPES.filter((t) => t.scope === scope);
}
