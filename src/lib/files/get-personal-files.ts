import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";
import type { MyFileItem, FileCategory, FileSource } from "@/lib/files/file-types";

type PersonalFileFilters = {
  category?: string;
  status?: string;
  search?: string;
};

/**
 * Get personal files for the authenticated user
 * Files the user has direct access to based on their identity and relationships
 */
export async function getMyPersonalFiles(
  context: UserContext,
  schoolId: string,
  filters: PersonalFileFilters = {}
): Promise<{ files: MyFileItem[] }> {
  if (!schoolId) {
    return { files: [] };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { files: [] };
  }

  const files: MyFileItem[] = [];

  // Get school name
  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("id", schoolId)
    .single();

  const schoolName = school?.name || null;

  // 1. Get user's person record and persona
  const { data: person } = await supabase
    .from("people")
    .select("id, persona")
    .eq("user_id", user.id)
    .eq("school_id", schoolId)
    .maybeSingle() as any;

  const personId = person?.id;
  const persona = person?.persona || "student";

  // 2. Get person's own documents
  if (personId) {
    const { data: personDocs } = await supabase
      .from("person_documents")
      .select(`
        id,
        document_type,
        file_path,
        issued_on,
        expires_on,
        verified_at,
        created_at
      `)
      .eq("person_id", personId)
      .eq("school_id", schoolId) as any;

    for (const doc of personDocs || []) {
      files.push({
        id: doc.id,
        source: "person_document" as FileSource,
        schoolId,
        schoolName,
        title: doc.document_type,
        category: "Documents" as FileCategory,
        fileName: getFileName(doc.file_path),
        mimeType: inferMimeType(doc.file_path),
        sizeBytes: null,
        status: determineDocumentStatus(doc.expires_on, doc.verified_at),
        owner: "Your document",
        context: "Personal",
        scope: "Personal",
        issuedAt: doc.issued_on,
        expiresAt: doc.expires_on,
        createdAt: doc.created_at,
        canPreview: canPreviewMimeType(inferMimeType(doc.file_path)),
        canDownload: true,
        canReplace: true,
        canDelete: true,
      });
    }
  }

  // 3. If student, get published report cards
  if (persona === "student" && personId) {
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("person_id", personId)
      .eq("school_id", schoolId)
      .maybeSingle() as any;

    if (student) {
      const { data: reportCards } = await supabase
        .from("report_cards")
        .select(`
          id,
          file_path,
          status,
          published_at,
          created_at
        `)
        .eq("student_id", student.id)
        .eq("school_id", schoolId)
        .eq("status", "published") as any;

      for (const card of reportCards || []) {
        files.push({
          id: card.id,
          source: "report_card" as FileSource,
          schoolId,
          schoolName,
          title: "Report Card",
          category: "Academic" as FileCategory,
          fileName: getFileName(card.file_path),
          mimeType: "application/pdf",
          sizeBytes: null,
          status: "published",
          owner: "Your academic record",
          context: "Academic",
          scope: "Personal",
          issuedAt: card.published_at,
          expiresAt: null,
          createdAt: card.created_at,
          canPreview: true,
          canDownload: true,
          canReplace: false,
          canDelete: false,
        });
      }
    }
  }

  // 4. If guardian, get authorized children's files
  if (persona === "guardian" && personId) {
    const { data: guardian } = await supabase
      .from("guardians")
      .select("id")
      .eq("person_id", personId)
      .eq("school_id", schoolId)
      .eq("status", "active")
      .maybeSingle() as any;

    if (guardian) {
      // Get guardian relationships with academic access
      const { data: relationships } = await supabase
        .from("student_guardians")
        .select(`
          student_id,
          receives_academic_reports,
          receives_financial_notices,
          is_financially_responsible
        `)
        .eq("guardian_id", guardian.id)
        .eq("school_id", schoolId) as any;

      for (const rel of relationships || []) {
        // Academic files
        if (rel.receives_academic_reports) {
          const { data: reportCards } = await supabase
            .from("report_cards")
            .select(`
              id,
              file_path,
              status,
              published_at,
              created_at
            `)
            .eq("student_id", rel.student_id)
            .eq("school_id", schoolId)
            .eq("status", "published") as any;

          for (const card of reportCards || []) {
            files.push({
              id: card.id,
              source: "report_card" as FileSource,
              schoolId,
              schoolName,
              title: "Report Card",
              category: "Academic" as FileCategory,
              fileName: getFileName(card.file_path),
              mimeType: "application/pdf",
              sizeBytes: null,
              status: "published",
              owner: "Child academic",
              context: "Academic",
              scope: "Child academic",
              issuedAt: card.published_at,
              expiresAt: null,
              createdAt: card.created_at,
              canPreview: true,
              canDownload: true,
              canReplace: false,
              canDelete: false,
            });
          }
        }

        // Financial files
        if (rel.receives_financial_notices || rel.is_financially_responsible) {
          const { data: receipts } = await supabase
            .from("payment_receipts")
            .select(`
              id,
              receipt_number,
              file_path,
              issued_at,
              voided_at,
              created_at
            `)
            .eq("school_id", schoolId)
            .in("payment_id", (
              supabase
                .from("payments")
                .select("id")
                .eq("student_id", rel.student_id)
                .eq("school_id", schoolId) as any
            )) as any;

          for (const receipt of receipts || []) {
            files.push({
              id: receipt.id,
              source: "payment_receipt" as FileSource,
              schoolId,
              schoolName,
              title: `Receipt ${receipt.receipt_number}`,
              category: "Financial" as FileCategory,
              fileName: getFileName(receipt.file_path),
              mimeType: "application/pdf",
              sizeBytes: null,
              status: receipt.voided_at ? "voided" : "issued",
              owner: "Child financial",
              context: "Financial",
              scope: "Child financial",
              issuedAt: receipt.issued_at,
              expiresAt: null,
              createdAt: receipt.created_at,
              canPreview: true,
              canDownload: true,
              canReplace: false,
              canDelete: false,
            });
          }
        }
      }
    }
  }

  // 5. Get message attachments from user's conversations
  const { data: messageAttachments } = await supabase
    .from("message_attachments")
    .select(`
      id,
      file_path,
      file_name,
      mime_type,
      size_bytes,
      created_at
    `)
    .in("message_id", (
      (supabase as any)
        .from("messages")
        .select("id")
        .in("conversation_id", (
          (supabase as any)
            .from("conversation_participants" as any)
            .select("conversation_id")
            .eq("user_id", user.id)
            .eq("school_id", schoolId)
        ))
    ))
    .eq("school_id", schoolId) as any;

  for (const attachment of messageAttachments || []) {
    files.push({
      id: attachment.id,
      source: "message_attachment" as FileSource,
      schoolId,
      schoolName,
      title: attachment.file_name,
      category: "Attachments" as FileCategory,
      fileName: attachment.file_name,
      mimeType: attachment.mime_type,
      sizeBytes: parseSizeBytes(attachment.size_bytes),
      status: "available",
      owner: "Conversation",
      context: "Message",
      scope: "Personal",
      issuedAt: null,
      expiresAt: null,
      createdAt: attachment.created_at,
      canPreview: canPreviewMimeType(attachment.mime_type),
      canDownload: true,
      canReplace: false,
      canDelete: false,
    });
  }

  // 6. If employee, get employment documents
  if (persona === "employee" && personId) {
    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("person_id", personId)
      .eq("school_id", schoolId)
      .maybeSingle() as any;

    if (employee) {
      // Employee documents are already included in person_documents above
      // But we could add specific employment-related files here
    }
  }

  // Apply filters
  const filteredFiles = filterFiles(files, filters);

  return { files: filteredFiles };
}

// Helper functions
function getFileName(filePath: string | null | undefined): string | null {
  if (!filePath) return null;
  const parts = filePath.split("/").filter(Boolean);
  return parts.at(-1) ?? null;
}

function inferMimeType(filePath: string | null): string | null {
  if (!filePath) return null;
  const normalized = filePath.toLowerCase();

  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".txt")) return "text/plain";
  if (normalized.endsWith(".doc")) return "application/msword";
  if (normalized.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (normalized.endsWith(".xls")) return "application/vnd.ms-excel";
  if (normalized.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return null;
}

function canPreviewMimeType(mimeType: string | null): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType === "image/png" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/webp"
  );
}

function parseSizeBytes(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function determineDocumentStatus(
  expiresOn: string | null,
  verifiedAt: string | null
): MyFileItem["status"] {
  if (expiresOn) {
    const expiryDate = new Date(`${expiresOn}T23:59:59.999Z`);
    if (!Number.isNaN(expiryDate.getTime())) {
      const now = new Date();
      if (expiryDate.getTime() < now.getTime()) {
        return "expired";
      }
      const thirtyDaysFromNow = new Date(now);
      thirtyDaysFromNow.setUTCDate(thirtyDaysFromNow.getUTCDate() + 30);
      if (expiryDate.getTime() <= thirtyDaysFromNow.getTime()) {
        return "expiring";
      }
    }
  }
  return verifiedAt ? "verified" : "unverified";
}

function filterFiles(files: MyFileItem[], filters: PersonalFileFilters): MyFileItem[] {
  const category = filters.category?.trim().toLowerCase();
  const status = filters.status?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();

  return files.filter((file) => {
    if (category && category !== "all") {
      const categoryMatches =
        file.category.toLowerCase() === category ||
        file.source.toLowerCase() === category ||
        (category === "documents" && file.source === "person_document") ||
        (category === "academic" && file.source === "report_card") ||
        (category === "financial" && file.source === "payment_receipt") ||
        (category === "attachments" && file.source === "message_attachment");

      if (!categoryMatches) return false;
    }

    if (status && status !== "all" && file.status.toLowerCase() !== status) {
      return false;
    }

    if (search) {
      const searchableText = [
        file.title,
        file.fileName,
        file.category,
        file.schoolName,
        file.status,
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) return false;
    }

    return true;
  });
}
