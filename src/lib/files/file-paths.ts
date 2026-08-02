/**
 * File path utilities for routing and navigation
 */

import type { FileSource } from "./file-types";

/**
 * Generate the detail page path for a file
 */
export function getFileDetailPath(source: FileSource, fileId: string): string {
  return `/app/files/${fileId}?source=${source}`;
}

/**
 * Generate the download action path
 */
export function getFileDownloadActionPath(): string {
  return "/app/files/actions/download";
}

/**
 * Parse file source from query parameter
 */
export function parseFileSource(source: string | null): FileSource | null {
  if (!source) return null;
  
  const validSources: FileSource[] = [
    "person_document",
    "report_card",
    "payment_receipt",
    "message_attachment",
    "user_upload",
  ];

  if (validSources.includes(source as FileSource)) {
    return source as FileSource;
  }

  return null;
}

/**
 * Get the human-readable label for a file source
 */
export function getFileSourceLabel(source: FileSource): string {
  const labels: Record<FileSource, string> = {
    person_document: "Personal Document",
    report_card: "Report Card",
    payment_receipt: "Payment Receipt",
    message_attachment: "Message Attachment",
    user_upload: "Your Upload",
  };
  return labels[source];
}

/**
 * Get the category filter label
 */
export function getCategoryFilterLabel(category: string): string {
  const labels: Record<string, string> = {
    all: "All Files",
    documents: "My Documents",
    academic: "Academic",
    financial: "Financial",
    attachments: "Attachments",
  };
  return labels[category] || category;
}

/**
 * Get the status filter label
 */
export function getStatusFilterLabel(status: string): string {
  const labels: Record<string, string> = {
    all: "All Statuses",
    verified: "Verified",
    unverified: "Unverified",
    published: "Issued",
    issued: "Issued",
    voided: "Voided",
    expiring: "Expiring Soon",
    expired: "Expired",
    active: "Active",
  };
  return labels[status] || status;
}
