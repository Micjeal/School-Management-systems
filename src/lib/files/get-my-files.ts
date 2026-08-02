import "server-only";

import { createClient } from "@/lib/supabase/server";

import type {
  FileSummary,
  MyFileFilters,
  MyFileItem,
} from "@/lib/files/file-types";

type SchoolRow = {
  name: string | null;
};

type PersonRow = {
  id: string;
};

type StudentRow = {
  id: string;
};

type GuardianRow = {
  id: string;
};

type GuardianRelationshipRow = {
  student_id: string;
  receives_academic_reports: boolean | null;
  receives_financial_notices: boolean | null;
  is_financially_responsible: boolean | null;
};

type PersonDocumentRow = {
  id: string;
  school_id: string;
  document_type: string;
  document_number: string | null;
  file_path: string;
  issued_on: string | null;
  expires_on: string | null;
  verified_at: string | null;
  created_at: string;
};

type ReportCardRow = {
  id: string;
  school_id: string;
  student_id: string;
  file_path: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  student_id: string | null;
};

type PaymentReceiptRow = {
  id: string;
  school_id: string;
  payment_id: string;
  receipt_number: string;
  issued_at: string;
  file_path: string | null;
  voided_at: string | null;
  created_at: string;
};

type MessageAttachmentRow = {
  id: string;
  school_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | string | null;
  created_at: string;
};

function safeRows<T>(value: unknown): T[] {
  return Array.isArray(value)
    ? (value as T[])
    : [];
}

function uniqueIds(
  values: Array<string | null | undefined>,
): string[] {
  return [
    ...new Set(
      values.filter(
        (value): value is string =>
          typeof value === "string" &&
          value.length > 0,
      ),
    ),
  ];
}

function getFileName(
  filePath: string | null | undefined,
): string | null {
  if (!filePath) {
    return null;
  }

  const parts = filePath
    .split("/")
    .filter(Boolean);

  return parts.at(-1) ?? null;
}

function humanizeIdentifier(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function inferMimeType(
  filePath: string | null,
): string | null {
  if (!filePath) {
    return null;
  }

  const normalized =
    filePath.toLowerCase();

  if (normalized.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (
    normalized.endsWith(".jpg") ||
    normalized.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  if (normalized.endsWith(".txt")) {
    return "text/plain";
  }

  if (normalized.endsWith(".doc")) {
    return "application/msword";
  }

  if (normalized.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (normalized.endsWith(".xls")) {
    return "application/vnd.ms-excel";
  }

  if (normalized.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return null;
}

function canPreviewMimeType(
  mimeType: string | null,
): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType === "image/png" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/webp"
  );
}

function parseSizeBytes(
  value: number | string | null,
): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return parsed;
}

function determineDocumentStatus(
  expiresOn: string | null,
  verifiedAt: string | null,
): MyFileItem["status"] {
  if (expiresOn) {
    const expiryDate = new Date(
      `${expiresOn}T23:59:59.999Z`,
    );

    if (
      !Number.isNaN(
        expiryDate.getTime(),
      )
    ) {
      const now = new Date();

      if (
        expiryDate.getTime() <
        now.getTime()
      ) {
        return "expired";
      }

      const thirtyDaysFromNow =
        new Date(now);

      thirtyDaysFromNow.setUTCDate(
        thirtyDaysFromNow.getUTCDate() +
          30,
      );

      if (
        expiryDate.getTime() <=
        thirtyDaysFromNow.getTime()
      ) {
        return "expiring";
      }
    }
  }

  return verifiedAt
    ? "verified"
    : "unverified";
}

function filterFiles(
  files: MyFileItem[],
  filters: MyFileFilters,
): MyFileItem[] {
  const category =
    filters.category
      ?.trim()
      .toLowerCase();

  const status =
    filters.status
      ?.trim()
      .toLowerCase();

  const search =
    filters.search
      ?.trim()
      .toLowerCase();

  return files.filter((file) => {
    if (
      category &&
      category !== "all"
    ) {
      const categoryMatches =
        file.category.toLowerCase() ===
          category ||
        file.source.toLowerCase() ===
          category ||
        (
          category === "documents" &&
          file.source ===
            "person_document"
        ) ||
        (
          category === "academic" &&
          file.source ===
            "report_card"
        ) ||
        (
          category === "financial" &&
          file.source ===
            "payment_receipt"
        ) ||
        (
          category === "attachments" &&
          file.source ===
            "message_attachment"
        );

      if (!categoryMatches) {
        return false;
      }
    }

    if (
      status &&
      status !== "all" &&
      file.status.toLowerCase() !==
        status
    ) {
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
        .filter(
          (
            value,
          ): value is string =>
            typeof value === "string",
        )
        .join(" ")
        .toLowerCase();

      if (
        !searchableText.includes(search)
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Loads only metadata authorized for the
 * signed-in user's personal Files page.
 *
 * Storage objects are not listed here.
 * Downloads still require a separate
 * server-side authorization action.
 */
export async function getMyFiles(
  schoolId: string | null,
  filters: MyFileFilters = {},
): Promise<{
  files: MyFileItem[];
}> {
  if (!schoolId) {
    return {
      files: [],
    };
  }

  const supabase =
    await createClient();

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (authError || !user) {
    return {
      files: [],
    };
  }

  const files: MyFileItem[] = [];

  /*
   * School name.
   *
   * Using safeRows avoids the generated
   * Supabase type becoming `never`.
   */
  const {
    data: rawSchoolData,
    error: schoolError,
  } = await supabase
    .from("schools")
    .select("name")
    .eq("id", schoolId)
    .limit(1);

  if (schoolError) {
    console.error(
      "Unable to load school:",
      schoolError,
    );
  }

  const schoolRows =
    safeRows<SchoolRow>(
      rawSchoolData,
    );

  const schoolName =
    schoolRows[0]?.name ?? null;

  /*
   * Current user's person record.
   */
  const {
    data: rawPersonData,
    error: personError,
  } = await supabase
    .from("people")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .limit(1);

  if (personError) {
    console.error(
      "Unable to load user person record:",
      personError,
    );
  }

  const personRows =
    safeRows<PersonRow>(
      rawPersonData,
    );

  const personId =
    personRows[0]?.id ?? null;

  /*
   * Student records directly owned by
   * the current user.
   */
  let ownStudentIds: string[] = [];

  if (personId) {
    const {
      data: rawStudentData,
      error: studentError,
    } = await supabase
      .from("students")
      .select("id")
      .eq("school_id", schoolId)
      .eq("person_id", personId);

    if (studentError) {
      console.error(
        "Unable to load own student records:",
        studentError,
      );
    }

    ownStudentIds = uniqueIds(
      safeRows<StudentRow>(
        rawStudentData,
      ).map(
        (student) => student.id,
      ),
    );
  }

  /*
   * Guardian-authorized student records.
   */
  let guardianAcademicStudentIds:
    string[] = [];

  let guardianFinancialStudentIds:
    string[] = [];

  if (personId) {
    const {
      data: rawGuardianData,
      error: guardianError,
    } = await supabase
      .from("guardians")
      .select("id")
      .eq("school_id", schoolId)
      .eq("person_id", personId)
      .eq("status", "active")
      .eq("portal_enabled", true);

    if (guardianError) {
      console.error(
        "Unable to load guardian record:",
        guardianError,
      );
    }

    const guardianIds = uniqueIds(
      safeRows<GuardianRow>(
        rawGuardianData,
      ).map(
        (guardian) => guardian.id,
      ),
    );

    if (guardianIds.length > 0) {
      const {
        data: rawRelationshipData,
        error: relationshipError,
      } = await supabase
        .from("student_guardians")
        .select(
          [
            "student_id",
            "receives_academic_reports",
            "receives_financial_notices",
            "is_financially_responsible",
          ].join(","),
        )
        .eq("school_id", schoolId)
        .in(
          "guardian_id",
          guardianIds,
        );

      if (relationshipError) {
        console.error(
          "Unable to load guardian relationships:",
          relationshipError,
        );
      }

      const relationships =
        safeRows<GuardianRelationshipRow>(
          rawRelationshipData,
        );

      const linkedStudentIds =
        uniqueIds(
          relationships.map(
            (relationship) =>
              relationship.student_id,
          ),
        );

      let activeStudentIds =
        new Set<string>();

      if (
        linkedStudentIds.length > 0
      ) {
        const {
          data: rawActiveStudentData,
          error: activeStudentError,
        } = await supabase
          .from("students")
          .select("id")
          .eq("school_id", schoolId)
          .eq("status", "active")
          .in(
            "id",
            linkedStudentIds,
          );

        if (activeStudentError) {
          console.error(
            "Unable to verify active students:",
            activeStudentError,
          );
        }

        activeStudentIds =
          new Set(
            safeRows<StudentRow>(
              rawActiveStudentData,
            ).map(
              (student) =>
                student.id,
            ),
          );
      }

      guardianAcademicStudentIds =
        uniqueIds(
          relationships
            .filter(
              (relationship) =>
                activeStudentIds.has(
                  relationship.student_id,
                ) &&
                relationship.receives_academic_reports ===
                  true,
            )
            .map(
              (relationship) =>
                relationship.student_id,
            ),
        );

      guardianFinancialStudentIds =
        uniqueIds(
          relationships
            .filter(
              (relationship) =>
                activeStudentIds.has(
                  relationship.student_id,
                ) &&
                (
                  relationship.receives_financial_notices ===
                    true ||
                  relationship.is_financially_responsible ===
                    true
                ),
            )
            .map(
              (relationship) =>
                relationship.student_id,
            ),
        );
    }
  }

  const academicStudentIds =
    uniqueIds([
      ...ownStudentIds,
      ...guardianAcademicStudentIds,
    ]);

  const financialStudentIds =
    uniqueIds([
      ...ownStudentIds,
      ...guardianFinancialStudentIds,
    ]);

  /*
   * Personal documents.
   */
  if (personId) {
    const {
      data: rawDocumentData,
      error: documentError,
    } = await supabase
      .from("person_documents")
      .select(
        [
          "id",
          "school_id",
          "document_type",
          "document_number",
          "file_path",
          "issued_on",
          "expires_on",
          "verified_at",
          "created_at",
        ].join(","),
      )
      .eq("school_id", schoolId)
      .eq("person_id", personId)
      .order("created_at", {
        ascending: false,
      });

    if (documentError) {
      console.error(
        "Unable to load personal documents:",
        documentError,
      );
    }

    const documents =
      safeRows<PersonDocumentRow>(
        rawDocumentData,
      );

    for (const document of documents) {
      const documentType =
        humanizeIdentifier(
          document.document_type,
        ) || "Personal Document";

      const mimeType =
        inferMimeType(
          document.file_path,
        );

      files.push({
        id: document.id,
        source: "person_document",

        schoolId:
          document.school_id,

        schoolName,

        title:
          document.document_number
            ? `${documentType} — ${document.document_number}`
            : documentType,

        category: "Documents",

        fileName: getFileName(
          document.file_path,
        ),

        mimeType,
        sizeBytes: null,

        status:
          determineDocumentStatus(
            document.expires_on,
            document.verified_at,
          ),

        issuedAt:
          document.issued_on,

        expiresAt:
          document.expires_on,

        createdAt:
          document.created_at,

        canPreview:
          canPreviewMimeType(
            mimeType,
          ),

        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }
  }

  /*
   * Published report cards.
   */
  if (
    academicStudentIds.length > 0
  ) {
    const {
      data: rawReportCardData,
      error: reportCardError,
    } = await supabase
      .from("report_cards")
      .select(
        [
          "id",
          "school_id",
          "student_id",
          "file_path",
          "status",
          "published_at",
          "created_at",
        ].join(","),
      )
      .eq("school_id", schoolId)
      .eq("status", "published")
      .not(
        "file_path",
        "is",
        null,
      )
      .in(
        "student_id",
        academicStudentIds,
      )
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      });

    if (reportCardError) {
      console.error(
        "Unable to load report cards:",
        reportCardError,
      );
    }

    const reportCards =
      safeRows<ReportCardRow>(
        rawReportCardData,
      );

    for (const card of reportCards) {
      files.push({
        id: card.id,
        source: "report_card",

        schoolId: card.school_id,
        schoolName,

        title: "Report Card",
        category: "Academic",

        fileName: getFileName(
          card.file_path,
        ),

        mimeType:
          "application/pdf",

        sizeBytes: null,
        status: "published",

        issuedAt:
          card.published_at,

        expiresAt: null,

        createdAt:
          card.published_at ??
          card.created_at,

        canPreview: true,
        canDownload: true,
        canReplace: false,
        canDelete: false,
      });
    }
  }

  /*
   * Payment receipts.
   */
  if (
    financialStudentIds.length > 0
  ) {
    const {
      data: rawPaymentData,
      error: paymentError,
    } = await supabase
      .from("payments")
      .select("id,student_id")
      .eq("school_id", schoolId)
      .in(
        "student_id",
        financialStudentIds,
      );

    if (paymentError) {
      console.error(
        "Unable to load authorized payments:",
        paymentError,
      );
    }

    const payments =
      safeRows<PaymentRow>(
        rawPaymentData,
      );

    const paymentIds =
      uniqueIds(
        payments.map(
          (payment) => payment.id,
        ),
      );

    if (paymentIds.length > 0) {
      const {
        data: rawReceiptData,
        error: receiptError,
      } = await supabase
        .from("payment_receipts")
        .select(
          [
            "id",
            "school_id",
            "payment_id",
            "receipt_number",
            "issued_at",
            "file_path",
            "voided_at",
            "created_at",
          ].join(","),
        )
        .eq("school_id", schoolId)
        .not(
          "file_path",
          "is",
          null,
        )
        .in(
          "payment_id",
          paymentIds,
        )
        .order("issued_at", {
          ascending: false,
        });

      if (receiptError) {
        console.error(
          "Unable to load payment receipts:",
          receiptError,
        );
      }

      const receipts =
        safeRows<PaymentReceiptRow>(
          rawReceiptData,
        );

      for (const receipt of receipts) {
        const mimeType =
          inferMimeType(
            receipt.file_path,
          );

        files.push({
          id: receipt.id,
          source:
            "payment_receipt",

          schoolId:
            receipt.school_id,

          schoolName,

          title:
            `Receipt ${receipt.receipt_number}`,

          category: "Financial",

          fileName: getFileName(
            receipt.file_path,
          ),

          mimeType,
          sizeBytes: null,

          status:
            receipt.voided_at
              ? "voided"
              : "issued",

          issuedAt:
            receipt.issued_at,

          expiresAt: null,

          createdAt:
            receipt.issued_at ??
            receipt.created_at,

          canPreview:
            canPreviewMimeType(
              mimeType,
            ),

          canDownload: true,
          canReplace: false,
          canDelete: false,
        });
      }
    }
  }

  /*
   * Message attachments.
   *
   * Existing RLS limits these records to
   * active conversation members.
   */
  const {
    data: rawAttachmentData,
    error: attachmentError,
  } = await supabase
    .from("message_attachments")
    .select(
      [
        "id",
        "school_id",
        "file_path",
        "file_name",
        "mime_type",
        "size_bytes",
        "created_at",
      ].join(","),
    )
    .eq("school_id", schoolId)
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (attachmentError) {
    console.error(
      "Unable to load message attachments:",
      attachmentError,
    );
  }

  const attachments =
    safeRows<MessageAttachmentRow>(
      rawAttachmentData,
    );

  for (const attachment of attachments) {
    const mimeType =
      attachment.mime_type ??
      inferMimeType(
        attachment.file_path,
      );

    files.push({
      id: attachment.id,
      source:
        "message_attachment",

      schoolId:
        attachment.school_id,

      schoolName,

      title:
        attachment.file_name ||
        "Message Attachment",

      category: "Attachments",

      fileName:
        attachment.file_name ||
        getFileName(
          attachment.file_path,
        ),

      mimeType,

      sizeBytes: parseSizeBytes(
        attachment.size_bytes,
      ),

      status: "available",

      issuedAt:
        attachment.created_at,

      expiresAt: null,

      createdAt:
        attachment.created_at,

      canPreview:
        canPreviewMimeType(
          mimeType,
        ),

      canDownload: true,
      canReplace: false,
      canDelete: false,
    });
  }

  files.sort((left, right) => {
    const leftTime = new Date(
      left.createdAt,
    ).getTime();

    const rightTime = new Date(
      right.createdAt,
    ).getTime();

    return (
      (Number.isNaN(rightTime)
        ? 0
        : rightTime) -
      (Number.isNaN(leftTime)
        ? 0
        : leftTime)
    );
  });

  return {
    files: filterFiles(
      files,
      filters,
    ),
  };
}

export function getFileSummary(
  files:
    | MyFileItem[]
    | null
    | undefined,
): FileSummary {
  const safeFiles =
    Array.isArray(files)
      ? files
      : [];

  const thirtyDaysAgo =
    new Date();

  thirtyDaysAgo.setUTCDate(
    thirtyDaysAgo.getUTCDate() - 30,
  );

  return {
    allFiles: safeFiles.length,

    verifiedDocuments:
      safeFiles.filter(
        (file) =>
          file.status === "verified",
      ).length,

    expiringSoon:
      safeFiles.filter(
        (file) =>
          file.status === "expiring",
      ).length,

    recentFiles:
      safeFiles.filter((file) => {
        const createdAt =
          new Date(file.createdAt);

        return (
          !Number.isNaN(
            createdAt.getTime(),
          ) &&
          createdAt.getTime() >=
            thirtyDaysAgo.getTime()
        );
      }).length,
  };
}