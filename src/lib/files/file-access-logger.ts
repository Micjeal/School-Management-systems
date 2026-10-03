import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type FileAccessSource =
  | "person_document"
  | "report_card"
  | "payment_receipt"
  | "message_attachment"
  | "application_document"
  | "assessment_file"
  | "import"
  | "export"
  | "school_branding"
  | "storage_object";

export type FileAccessAction =
  | "preview"
  | "download"
  | "replace"
  | "delete"
  | "generate_signed_url"
  | "export"
  | "administrative_repair";

export type FileAccessResult =
  | "success"
  | "failure"
  | "denied";

export type LogFileAccessInput = {
  actorUserId: string | null;
  actorMembershipId?: string | null;
  schoolId?: string | null;

  fileSource: FileAccessSource;
  recordId: string;

  action: FileAccessAction;
  result: FileAccessResult;

  reason?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;

  metadata?: Record<string, unknown>;
};

/**
 * Allowed metadata keys for audit logging
 * This strict allowlist prevents sensitive data from being stored
 */
const ALLOWED_METADATA_KEYS = new Set([
  "purpose",
  "mime_type",
  "size_bytes",
  "bucket_category",
  "source_workflow",
  "support_ticket_id",
  "metadata_deleted",
  "storage_deleted",
]);

/**
 * Forbidden metadata keys that must never be stored
 */
const FORBIDDEN_METADATA_KEYS = new Set([
  "signed_url",
  "signedUrl",
  "url",
  "storage_path",
  "service_role_key",
  "authorization",
  "cookie",
  "access_token",
  "refresh_token",
  "session",
  "file_contents",
  "message_content",
  "treatment_notes",
  "emergency_action",
  "payment_details",
  "student_name",
  "person_name",
]);

/**
 * Sanitized reason categories for audit logging
 */
const SANITIZED_REASONS = new Set([
  "metadata authorization failed",
  "school scope mismatch",
  "record not available",
  "conversation membership required",
  "health permission required",
  "academic relationship required",
  "financial relationship required",
  "unsupported file source",
  "unsupported action",
  "storage signing failed",
  "storage deletion failed",
  "metadata deletion failed",
  "removed orphaned object",
]);

/**
 * Sanitize audit metadata to only include allowed operational data
 */
function sanitizeFileAccessMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Check for forbidden keys first
    if (FORBIDDEN_METADATA_KEYS.has(key)) {
      continue;
    }

    // Only allow whitelisted keys
    if (ALLOWED_METADATA_KEYS.has(key)) {
      // Sanitize the value based on type
      if (typeof value === "string") {
        // Truncate long strings
        sanitized[key] = value.slice(0, 500);
      } else if (typeof value === "number") {
        sanitized[key] = value;
      } else if (typeof value === "boolean") {
        sanitized[key] = value;
      }
      // Objects and arrays are not stored to prevent nested sensitive data
    }
  }

  return sanitized;
}

/**
 * Sanitize reason to use safe categories
 */
function sanitizeReason(reason: string | null | undefined): string | null {
  if (!reason) return null;

  // If it's already a sanitized reason, use it
  if (SANITIZED_REASONS.has(reason)) {
    return reason;
  }

  // Otherwise, return a generic safe reason
  return "metadata authorization failed";
}

/**
 * Normalize IP address for logging
 */
function normalizeIpAddress(ipAddress: string | null | undefined): string | null {
  if (!ipAddress) return null;

  // Basic validation - only store if it looks like an IP
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ipRegex.test(ipAddress.trim())) {
    return ipAddress.trim();
  }

  return null;
}

/**
 * Log file access event to the audit table
 * 
 * This function uses the service-role client to insert into file_access_logs.
 * It silently fails if logging fails to avoid disrupting the primary operation.
 * All logging failures are written to server logs for monitoring.
 */
export async function logFileAccess(
  input: LogFileAccessInput,
): Promise<void> {
  try {
    const metadata = sanitizeFileAccessMetadata(input.metadata ?? {});
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("file_access_logs")
      .insert({
        actor_user_id: input.actorUserId,
        actor_membership_id: input.actorMembershipId ?? null,
        school_id: input.schoolId ?? null,
        file_source: input.fileSource,
        record_id: input.recordId,
        action: input.action,
        result: input.result,
        reason: sanitizeReason(input.reason),
        request_id: input.requestId ?? null,
        ip_address: normalizeIpAddress(input.ipAddress),
        user_agent: input.userAgent?.slice(0, 1000) ?? null,
        metadata,
      });

    if (error) {
      console.error("Unable to record file access event:", {
        code: error.code,
        message: error.message,
        input: {
          actorUserId: input.actorUserId,
          fileSource: input.fileSource,
          recordId: input.recordId,
          action: input.action,
          result: input.result,
        },
      });
    }
  } catch (error) {
    console.error("Unexpected file access logging failure:", error);
  }
}
