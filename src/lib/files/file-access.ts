/**
 * File access control utilities
 */

import { createClient } from "@/lib/supabase/server";
import { FILE_SOURCE_BUCKETS } from "./file-types";
import type { FileSource } from "./file-types";

export interface FileAccessResult {
  allowed: boolean;
  bucket?: string;
  path?: string;
  fileName?: string;
  mimeType?: string;
  error?: string;
}

/**
 * Verify access to a file by source and ID
 * This performs server-side authorization checks before returning storage details
 * Uses correct live schema relationships and narrow authorization helpers
 */
export async function verifyFileAccess(
  source: FileSource,
  fileId: string
): Promise<FileAccessResult> {
  const supabase = await createClient();

  try {
    switch (source) {
      case "person_document": {
        // Use owner-only helper for personal files page
        const { data, error } = await supabase
          .rpc("private.can_access_my_person_document", { target_document_id: fileId } as any);
        
        if (error || !data) {
          return { allowed: false, error: "Access denied" };
        }

        // Fetch the document details to determine bucket from persona
        const { data: doc, error: docError } = await supabase
          .from("person_documents")
          .select(`
            file_path,
            document_type,
            person_id,
            people (
              persona
            )
          `)
          .eq("id", fileId)
          .maybeSingle() as any;

        if (docError || !doc) {
          return { allowed: false, error: "Document not found" };
        }

        // Determine bucket from persona
        const persona = doc.people?.persona || "student";
        const bucket = FILE_SOURCE_BUCKETS.person_document[persona as keyof typeof FILE_SOURCE_BUCKETS.person_document] || "student-documents";

        return {
          allowed: true,
          bucket,
          path: doc.file_path,
          fileName: doc.document_type,
        };
      }

      case "report_card": {
        const { data, error } = await supabase
          .rpc("private.can_access_report_card", { target_report_card_id: fileId } as any);
        
        if (error || !data) {
          return { allowed: false, error: "Access denied" };
        }

        const { data: card, error: cardError } = await supabase
          .from("report_cards")
          .select("file_path")
          .eq("id", fileId)
          .maybeSingle() as any;

        if (cardError || !card || !card.file_path) {
          return { allowed: false, error: "Report card not found or not available" };
        }

        return {
          allowed: true,
          bucket: FILE_SOURCE_BUCKETS.report_card,
          path: card.file_path,
          fileName: "Report Card",
          mimeType: "application/pdf",
        };
      }

      case "payment_receipt": {
        const { data, error } = await supabase
          .rpc("private.can_access_payment_receipt", { target_receipt_id: fileId } as any);
        
        if (error || !data) {
          return { allowed: false, error: "Access denied" };
        }

        const { data: receipt, error: receiptError } = await supabase
          .from("payment_receipts")
          .select("file_path, receipt_number")
          .eq("id", fileId)
          .maybeSingle() as any;

        if (receiptError || !receipt || !receipt.file_path) {
          return { allowed: false, error: "Receipt not found or not available" };
        }

        return {
          allowed: true,
          bucket: FILE_SOURCE_BUCKETS.payment_receipt,
          path: receipt.file_path,
          fileName: `Receipt ${receipt.receipt_number}`,
          mimeType: "application/pdf",
        };
      }

      case "message_attachment": {
        const { data, error } = await supabase
          .rpc("private.can_access_message_attachment", { target_attachment_id: fileId } as any);
        
        if (error || !data) {
          return { allowed: false, error: "Access denied" };
        }

        const { data: attachment, error: attachmentError } = await supabase
          .from("message_attachments")
          .select("file_path, file_name, mime_type")
          .eq("id", fileId)
          .maybeSingle() as any;

        if (attachmentError || !attachment) {
          return { allowed: false, error: "Attachment not found" };
        }

        return {
          allowed: true,
          bucket: FILE_SOURCE_BUCKETS.message_attachment,
          path: attachment.file_path,
          fileName: attachment.file_name,
          mimeType: attachment.mime_type,
        };
      }

      case "user_upload":
        // Not implemented in Phase 1
        return { allowed: false, error: "User uploads not yet supported" };

      default:
        return { allowed: false, error: "Invalid file source" };
    }
  } catch (error) {
    console.error("Error verifying file access:", error);
    return { allowed: false, error: "Failed to verify access" };
  }
}

/**
 * Create a signed URL for file download
 * Returns a short-lived signed URL (60-120 seconds)
 */
export async function createSignedDownloadUrl(
  bucket: string,
  path: string,
  expiresIn: number = 60
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return { url: null, error: "Failed to create download link" };
    }

    return { url: data.signedUrl, error: null };
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return { url: null, error: "Failed to create download link" };
  }
}
