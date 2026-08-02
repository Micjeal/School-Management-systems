/**
 * Validation schemas for integration events
 */

import { z } from "zod";

export const EVENT_ID_SCHEMA = z
  .string()
  .transform((val) => {
    const num = BigInt(val);
    if (num <= 0n) {
      throw new Error("Event ID must be a positive integer");
    }
    return num;
  });

export const DIRECTION_SCHEMA = z.enum(["inbound", "outbound"]);

export const STATUS_SCHEMA = z.enum([
  "received",
  "queued",
  "processing",
  "completed",
  "failed",
  "ignored",
  "dead_letter",
]);

export const FILTERS_SCHEMA = z.object({
  search: z.string().optional(),
  connectionId: z.string().uuid().optional(),
  provider: z.string().optional(),
  eventType: z.string().optional(),
  direction: DIRECTION_SCHEMA.optional(),
  status: STATUS_SCHEMA.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  hasError: z.enum(["all", "yes", "no", "retry"]).optional(),
});

export const RETRY_SCHEMA = z.object({
  eventId: EVENT_ID_SCHEMA,
});

/**
 * Validates an event ID from a string
 */
export function validateEventId(eventId: string): bigint {
  try {
    const num = BigInt(eventId);
    if (num <= 0n) {
      throw new Error("Invalid event ID");
    }
    return num;
  } catch {
    throw new Error("Invalid event ID format");
  }
}

/**
 * Validates filter parameters
 */
export function validateFilters(params: Record<string, unknown>) {
  return FILTERS_SCHEMA.parse(params);
}
