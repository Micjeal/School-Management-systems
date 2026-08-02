/**
 * File download utilities
 * Uses correct authorization helpers and secure signed URL generation
 */

import { createClient } from "@/lib/supabase/server";
import { verifyFileAccess, createSignedDownloadUrl } from "./file-access";
import type { FileSource } from "./file-types";

export interface DownloadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Generate a secure download URL for a file
 * This performs full authorization checks before creating a signed URL
 * Uses narrow authorization helpers for personal files page
 */
export async function getSecureDownloadUrl(
  source: FileSource,
  fileId: string,
  expiresIn: number = 60
): Promise<DownloadResult> {
  // Verify access using narrow helpers
  const accessResult = await verifyFileAccess(source, fileId);
  
  if (!accessResult.allowed) {
    return { 
      success: false, 
      error: accessResult.error || "You do not have access to this file" 
    };
  }

  if (!accessResult.bucket || !accessResult.path) {
    return { 
      success: false, 
      error: "File storage information not available" 
    };
  }

  // Create signed URL
  const { url, error } = await createSignedDownloadUrl(
    accessResult.bucket,
    accessResult.path,
    expiresIn
  );

  if (error || !url) {
    return { 
      success: false, 
      error: error || "Failed to create download link" 
    };
  }

  return { success: true, url };
}

/**
 * Log file download for audit purposes
 */
export async function logFileDownload(
  source: FileSource,
  fileId: string,
  schoolId: string | null
): Promise<void> {
  const supabase = await createClient();

  try {
    // This would insert into a file_access_logs table if implemented
    // For now, we'll just log to console
    console.log(`File download: ${source}/${fileId} for school ${schoolId}`);
  } catch (error) {
    console.error("Error logging file download:", error);
  }
}
