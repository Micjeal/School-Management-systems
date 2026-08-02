/**
 * File validation utilities
 */

import { z } from "zod";

export const FILE_FILTERS_SCHEMA = z.object({
  category: z.enum(["all", "documents", "academic", "financial", "attachments"]).optional(),
  status: z.enum(["all", "verified", "unverified", "published", "issued", "voided", "expiring", "expired", "active"]).optional(),
  search: z.string().max(200).optional(),
  schoolId: z.string().uuid().nullable().optional(),
});

export const FILE_DOWNLOAD_SCHEMA = z.object({
  source: z.enum(["person_document", "report_card", "payment_receipt", "message_attachment", "user_upload"]),
  fileId: z.string().uuid(),
});

export const FILE_UPLOAD_SCHEMA = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().min(0).max(20 * 1024 * 1024), // 20MB max
  category: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
});

/**
 * Allowed MIME types for private user uploads
 */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

/**
 * Dangerous file extensions that should be rejected
 */
export const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".scr",
  ".pif",
  ".vbs",
  ".js",
  ".jar",
  ".app",
  ".deb",
  ".rpm",
  ".dmg",
  ".pkg",
  ".sh",
  ".ps1",
  ".vb",
  ".vbe",
  ".wsf",
  ".wsc",
  ".wsh",
  ".msi",
  ".msp",
] as const;

/**
 * Validate file extension
 */
export function validateFileExtension(fileName: string): { valid: boolean; error?: string } {
  const lowerName = fileName.toLowerCase();
  
  // Check for dangerous extensions
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      return { valid: false, error: "File type not allowed" };
    }
  }

  // Check for double extensions (e.g., document.pdf.exe)
  const parts = lowerName.split(".");
  if (parts.length > 2) {
    const lastExt = parts[parts.length - 1];
    const secondLastExt = parts[parts.length - 2];
    
    // If the last two parts are both dangerous or suspicious
    if (DANGEROUS_EXTENSIONS.includes(`.${lastExt}` as any) || 
        DANGEROUS_EXTENSIONS.includes(`.${secondLastExt}` as any)) {
      return { valid: false, error: "File type not allowed" };
    }
  }

  return { valid: true };
}

/**
 * Validate MIME type against allowlist
 */
export function validateMimeType(mimeType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType as any)) {
    return { valid: false, error: "MIME type not allowed" };
  }
  return { valid: true };
}

/**
 * Sanitize file name for storage
 * Removes dangerous characters and generates a safe display name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const sanitized = fileName
    .replace(/[\/\\]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/[<>:"|?*]/g, "_")
    .trim();

  // Limit length
  return sanitized.substring(0, 255);
}

/**
 * Generate a safe storage object path
 * Format: <user-id>/<file-id>/<random-uuid>.<extension>
 */
export function generateStoragePath(
  userId: string,
  fileId: string,
  originalFileName: string
): string {
  const ext = originalFileName.split(".").pop()?.toLowerCase() || "bin";
  const randomId = crypto.randomUUID();
  return `${userId}/${fileId}/${randomId}.${ext}`;
}

/**
 * Validate file size
 */
export function validateFileSize(sizeBytes: number, maxSize: number = 20 * 1024 * 1024): { valid: boolean; error?: string } {
  if (sizeBytes === 0) {
    return { valid: false, error: "File is empty" };
  }
  if (sizeBytes > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  return { valid: true };
}
