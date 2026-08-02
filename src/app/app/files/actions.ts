"use server";

import { redirect } from "next/navigation";
import { getSecureDownloadUrl, logFileDownload } from "@/lib/files/file-download";
import { FILE_DOWNLOAD_SCHEMA } from "@/lib/files/file-validation";
import type { FileSource } from "@/lib/files/file-types";

export async function downloadMyFileAction(formData: FormData) {
  const source = formData.get("source") as string;
  const fileId = formData.get("fileId") as string;

  // Validate input
  const validation = FILE_DOWNLOAD_SCHEMA.safeParse({ source, fileId });
  if (!validation.success) {
    redirect("/app/files?error=Invalid file request");
  }

  const { data } = validation;

  // Get secure download URL
  const result = await getSecureDownloadUrl(data.source as FileSource, data.fileId);

  if (!result.success || !result.url) {
    redirect(`/app/files?error=${encodeURIComponent(result.error || "Failed to create download link")}`);
  }

  // Log the download
  await logFileDownload(data.source as FileSource, data.fileId, null);

  // Redirect to the signed URL
  redirect(result.url);
}
