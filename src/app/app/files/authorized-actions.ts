"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { FILE_SOURCE_BUCKETS } from "@/lib/files/file-types";
import { logFileAccess, type FileAccessSource } from "@/lib/files/file-access-logger";
import type { FileSource } from "@/lib/files/file-types";
import { privateRpcClient } from "@/lib/supabase/private-rpc";

type AuthorizedFileUrlRequest = {
  source: FileSource;
  id: string;
  action: "preview" | "download";
};

type AuthorizedFileUrlResponse = {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  mimeType?: string;
};

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get authorized file URL with proper security checks
 * 
 * This server action:
 * 1. Authenticates the user
 * 2. Loads trusted user context
 * 3. Loads the metadata row using the supplied ID
 * 4. Confirms the row's school and owner context
 * 5. Runs the exact source-specific authorization check
 * 6. Determines the bucket and path server-side
 * 7. Creates a short-lived signed URL
 * 8. Writes an audit event
 * 9. Returns the URL only when authorization succeeds
 * 
 * Does NOT accept bucket, file_path, school_id, person_id, or student_id from the client
 * Does NOT sign arbitrary paths submitted by the browser
 */
export async function getAuthorizedFileUrlAction(
  request: AuthorizedFileUrlRequest
): Promise<AuthorizedFileUrlResponse> {
  const requestId = generateRequestId();
  
  try {
    // 1. Authenticate the user and load context
    const context = await requireUserContext();
    const supabase = await createClient();

    // Get active membership ID for audit logging
    const activeMembership = context.memberships.find(
      m => m.school_id === context.active_school_id
    );
    const membershipId = activeMembership?.membership_id || null;

    // 2. Validate the source type
    if (!FILE_SOURCE_BUCKETS[request.source]) {
      await logFileAccess({
        actorUserId: context.user_id,
        actorMembershipId: membershipId,
        schoolId: context.active_school_id,
        fileSource: request.source as FileAccessSource,
        recordId: request.id,
        action: "generate_signed_url",
        result: "denied",
        reason: "unsupported file source",
        requestId,
      });
      
      return {
        success: false,
        error: "Invalid file source type",
      };
    }

    // 3. Load the metadata row and run authorization based on source
    let bucket: string;
    let path: string | null;
    let fileName: string;
    let mimeType: string | null;
    let schoolId: string | null;
    let authorized: boolean;

    switch (request.source) {
      case "person_document": {
        // Load person document with authorization check
        const { data: authCheck } = await privateRpcClient(supabase)
          .rpc("can_access_my_person_document", { 
            target_document_id: request.id 
          } as any);

        if (!authCheck) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "person_document",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "metadata authorization failed",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to document",
          };
        }

        const { data: doc, error: docError } = await supabase
          .from("person_documents")
          .select(`
            file_path,
            document_type,
            school_id,
            people (
              persona
            )
          `)
          .eq("id", request.id)
          .maybeSingle() as any;

        if (docError || !doc) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "person_document",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Document not found",
          };
        }

        const persona = doc.people?.persona || "student";
        const bucketMapping = FILE_SOURCE_BUCKETS.person_document as Record<string, string>;
        bucket = bucketMapping[persona] || "student-documents";
        path = doc.file_path;
        fileName = doc.document_type;
        mimeType = null;
        schoolId = doc.school_id;
        authorized = true;
        break;
      }

      case "report_card": {
        const { data: authCheck } = await privateRpcClient(supabase)
          .rpc("can_access_report_card", { 
            target_report_card_id: request.id 
          } as any);

        if (!authCheck) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "report_card",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "metadata authorization failed",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to report card",
          };
        }

        const { data: card, error: cardError } = await supabase
          .from("report_cards")
          .select("file_path, school_id")
          .eq("id", request.id)
          .maybeSingle() as any;

        if (cardError || !card || !card.file_path) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "report_card",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Report card not found or not available",
          };
        }

        bucket = FILE_SOURCE_BUCKETS.report_card as string;
        path = card.file_path;
        fileName = "Report Card";
        mimeType = "application/pdf";
        schoolId = card.school_id;
        authorized = true;
        break;
      }

      case "payment_receipt": {
        const { data: authCheck } = await privateRpcClient(supabase)
          .rpc("can_access_payment_receipt", { 
            target_receipt_id: request.id 
          } as any);

        if (!authCheck) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "payment_receipt",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "metadata authorization failed",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to receipt",
          };
        }

        const { data: receipt, error: receiptError } = await supabase
          .from("payment_receipts")
          .select("file_path, receipt_number, school_id")
          .eq("id", request.id)
          .maybeSingle() as any;

        if (receiptError || !receipt || !receipt.file_path) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "payment_receipt",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Receipt not found or not available",
          };
        }

        bucket = FILE_SOURCE_BUCKETS.payment_receipt as string;
        path = receipt.file_path;
        fileName = `Receipt ${receipt.receipt_number}`;
        mimeType = "application/pdf";
        schoolId = receipt.school_id;
        authorized = true;
        break;
      }

      case "message_attachment": {
        const { data: authCheck } = await privateRpcClient(supabase)
          .rpc("can_access_message_attachment", { 
            target_attachment_id: request.id 
          } as any);

        if (!authCheck) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "message_attachment",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "conversation membership required",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to attachment",
          };
        }

        const { data: attachment, error: attachmentError } = await supabase
          .from("message_attachments")
          .select("file_path, file_name, mime_type, school_id")
          .eq("id", request.id)
          .maybeSingle() as any;

        if (attachmentError || !attachment) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "message_attachment",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Attachment not found",
          };
        }

        bucket = FILE_SOURCE_BUCKETS.message_attachment as string;
        path = attachment.file_path;
        fileName = attachment.file_name;
        mimeType = attachment.mime_type;
        schoolId = attachment.school_id;
        authorized = true;
        break;
      }

      case "application_document": {
        // For admissions documents, check admissions authorization
        const hasAdmissionsAccess = context.permissions.includes("admissions.manage") ||
                                     context.permissions.includes("applications.manage");

        if (!hasAdmissionsAccess) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "application_document",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "metadata authorization failed",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to application document",
          };
        }

        const { data: doc, error: docError } = await supabase
          .from("application_documents")
          .select("file_path, document_type, school_id")
          .eq("id", request.id)
          .maybeSingle() as any;

        if (docError || !doc) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "application_document",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Application document not found",
          };
        }

        bucket = FILE_SOURCE_BUCKETS.application_document as string;
        path = doc.file_path;
        fileName = doc.document_type;
        mimeType = null;
        schoolId = doc.school_id;
        authorized = true;
        break;
      }

      case "assessment_file": {
        return { success: false, error: "Assessment files are unavailable" };
      }

      case "import": {
        // For imports, only platform admins or users with import permissions
        const hasImportAccess = context.is_platform_admin ||
                                context.permissions.includes("imports.process");

        if (!hasImportAccess) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "import",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "metadata authorization failed",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to import file",
          };
        }

        const { data: file, error: fileError } = await supabase
          .from("import_batches")
          .select("file_path, import_type, school_id")
          .eq("id", request.id)
          .maybeSingle() as any;

        if (fileError || !file) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "import",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Import file not found",
          };
        }

        bucket = FILE_SOURCE_BUCKETS.import as string;
        path = file.file_path;
        fileName = `Import: ${file.import_type}`;
        mimeType = null;
        schoolId = file.school_id;
        authorized = true;
        break;
      }

      case "export": {
        // For exports, only platform admins or users with export permissions
        const hasExportAccess = context.is_platform_admin ||
                                context.permissions.includes("reports.export") ||
                                context.permissions.includes("audit.read");

        if (!hasExportAccess) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "export",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "metadata authorization failed",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to export file",
          };
        }

        const { data: file, error: fileError } = await supabase
          .from("export_jobs")
          .select("file_path, export_type, school_id")
          .eq("id", request.id)
          .maybeSingle() as any;

        if (fileError || !file) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "export",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Export file not found",
          };
        }

        bucket = FILE_SOURCE_BUCKETS.export as string;
        path = file.file_path;
        fileName = `Export: ${file.export_type}`;
        mimeType = null;
        schoolId = file.school_id;
        authorized = true;
        break;
      }

      case "school_branding": {
        // The record ID is the school ID; schools.logo_path is the metadata contract.
        const hasBrandingAccess = context.is_platform_admin ||
                                  context.active_school_id === request.id;

        if (!hasBrandingAccess) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "school_branding",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "metadata authorization failed",
            requestId,
          });
          
          return {
            success: false,
            error: "Access denied to branding file",
          };
        }

        const { data: file, error: fileError } = await supabase
          .from("schools")
          .select("id, logo_path")
          .eq("id", request.id)
          .maybeSingle();

        if (fileError || !file) {
          await logFileAccess({
            actorUserId: context.user_id,
            actorMembershipId: membershipId,
            schoolId: context.active_school_id,
            fileSource: "school_branding",
            recordId: request.id,
            action: "generate_signed_url",
            result: "denied",
            reason: "record not available",
            requestId,
          });
          
          return {
            success: false,
            error: "Branding file not found",
          };
        }

        bucket = FILE_SOURCE_BUCKETS.school_branding as string;
        if (!file.logo_path) return { success: false, error: "Branding file not found" };
        path = file.logo_path;
        fileName = "School logo";
        mimeType = null;
        schoolId = file.id;
        authorized = true;
        break;
      }

      default: {
        await logFileAccess({
          actorUserId: context.user_id,
          actorMembershipId: membershipId,
          schoolId: context.active_school_id,
          fileSource: request.source as FileAccessSource,
          recordId: request.id,
          action: "generate_signed_url",
          result: "denied",
          reason: "unsupported file source",
          requestId,
        });
        
        return {
          success: false,
          error: "Unsupported file source",
        };
      }
    }

    // 4. Additional school context check
    if (schoolId && context.active_school_id && schoolId !== context.active_school_id) {
      // Platform admins can access files across schools
      if (!context.is_platform_admin) {
        await logFileAccess({
          actorUserId: context.user_id,
          actorMembershipId: membershipId,
          schoolId: context.active_school_id,
          fileSource: request.source as FileAccessSource,
          recordId: request.id,
          action: "generate_signed_url",
          result: "denied",
          reason: "school scope mismatch",
          requestId,
        });
        
        return {
          success: false,
          error: "File belongs to a different school",
        };
      }
    }

    // 5. Create short-lived signed URL
    if (!path) {
      await logFileAccess({
        actorUserId: context.user_id,
        actorMembershipId: membershipId,
        schoolId: schoolId,
        fileSource: request.source as FileAccessSource,
        recordId: request.id,
        action: "generate_signed_url",
        result: "denied",
        reason: "record not available",
        requestId,
      });
      
      return {
        success: false,
        error: "File path not available",
      };
    }

    const expiresIn = request.action === "preview" ? 120 : 60; // 2 minutes for preview, 1 minute for download
    
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (signedUrlError || !signedUrlData) {
      console.error("Failed to create signed URL:", signedUrlError);
      
      await logFileAccess({
        actorUserId: context.user_id,
        actorMembershipId: membershipId,
        schoolId: schoolId,
        fileSource: request.source as FileAccessSource,
        recordId: request.id,
        action: "generate_signed_url",
        result: "failure",
        reason: "storage signing failed",
        requestId,
      });
      
      return {
        success: false,
        error: "Failed to create download link",
      };
    }

    // 6. Log successful signed URL generation
    await logFileAccess({
      actorUserId: context.user_id,
      actorMembershipId: membershipId,
      schoolId: schoolId,
      fileSource: request.source as FileAccessSource,
      recordId: request.id,
      action: "generate_signed_url",
      result: "success",
      requestId,
      metadata: {
        purpose: request.action,
        mime_type: mimeType,
      },
    });

    return {
      success: true,
      url: signedUrlData.signedUrl,
      fileName,
      mimeType: mimeType ?? undefined,
    };

  } catch (error) {
    console.error("Error in getAuthorizedFileUrlAction:", error);
    
    // Log the unexpected failure
    try {
      const context = await requireUserContext();
      const activeMembership = context.memberships.find(
        m => m.school_id === context.active_school_id
      );
      
      await logFileAccess({
        actorUserId: context.user_id,
        actorMembershipId: activeMembership?.membership_id || null,
        schoolId: context.active_school_id,
        fileSource: request.source as FileAccessSource,
        recordId: request.id,
        action: "generate_signed_url",
        result: "failure",
        reason: "storage signing failed",
        requestId,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
    return {
      success: false,
      error: "An error occurred while processing your request",
    };
  }
}
